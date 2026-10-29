from flask import Blueprint, request, jsonify
from database.db import db
from models import User, Team, TeamMember, DocumentSubmission, ReviewStatus, Notification, DailyDiary, Institution, Department, GuideAllocation
from services.guide_allocation_service import allocate_guide_for_team
from datetime import datetime, date as date_cls, timezone
import os
from constants.domains import FIXED_PROJECT_DOMAINS

student_bp = Blueprint('student', __name__, url_prefix='/api/student')

@student_bp.route('/check-similarity', methods=['POST'])
def check_similarity():
    """
    POST /api/student/check-similarity
    Analyzes proposed project title against 5-year Past Project Repository in MySQL DB.
    """
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    threshold = float(data.get('threshold', 40.0))

    if not title:
        return jsonify({'success': False, 'message': 'Project title is required for similarity analysis.'}), 400

    from services.past_project_service import check_project_similarity
    result = check_project_similarity(title, threshold=threshold)

    return jsonify({
        'success': True,
        'proposed_title': title,
        'is_similar': result['is_similar'],
        'threshold': result['threshold'],
        'count': len(result['matches']),
        'matches': result['matches'],
        'message': (
            "Your proposed project appears similar to one or more projects in the previous project repository. Please consider a different project idea or a substantially different approach."
            if result['is_similar']
            else "No sufficiently similar project was found in the available 5-year project repository."
        )
    }), 200

def verify_team_leader_ownership(identifier):
    """
    Verifies that the user specified by identifier (email, student_id, or usn)
    is authenticated and owns the team as Team Leader.
    Returns (leader_user, team_obj, error_tuple)
    """
    if not identifier:
        return None, None, (jsonify({'success': False, 'message': 'Leader identification required.'}), 400)

    ident_str = str(identifier).strip().lower()
    leader = User.query.filter(
        (User.email == ident_str) |
        (User.student_id == ident_str.upper()) |
        (User.usn == ident_str.upper())
    ).first()

    if not leader:
        return None, None, (jsonify({'success': False, 'message': f"Leader user '{identifier}' not found in PRMES database."}), 404)

    # Check 1: Find team where user is leader_id
    team = Team.query.filter_by(leader_id=leader.id).first()

    # Check 2: Check TeamMember relationship
    lead_membership = TeamMember.query.filter_by(user_id=leader.id).first()
    if not team and lead_membership:
        team = lead_membership.team_obj

    if not team:
        return None, None, (jsonify({'success': False, 'message': 'No project team associated with your account. Please register your project team first.'}), 404)

    # Authorized if team.leader_id == leader.id OR leader.role in ['TEAM_LEADER', 'ADMIN'] OR lead_membership is LEADER
    is_authorized = (
        team.leader_id == leader.id or
        leader.role in ['TEAM_LEADER', 'ADMIN'] or
        (lead_membership and lead_membership.role_in_team == 'LEADER')
    )

    if not is_authorized:
        return None, None, (jsonify({'success': False, 'message': 'You are not authorized to perform Team Leader actions on this team.'}), 403)

    # Sync role to TEAM_LEADER in DB if user is the team leader
    if leader.role == 'STUDENT' and (team.leader_id == leader.id or (lead_membership and lead_membership.role_in_team == 'LEADER')):
        leader.role = 'TEAM_LEADER'
        db.session.commit()

    return leader, team, None

ALLOWED_DOC_TYPES = {
    'Synopsis': (1, 1),
    'Phase1_Report': (1, 2),
    'Review1_Report': (1, 2),
    'Project_Report': (1, 2),
    'Phase1_PPT': (1, 2),
    'Review1_PPT': (1, 2),
    'Project_PPT': (1, 2),
    'Phase2_Review1_PPT': (2, 1),
    'Phase2_PPT': (2, 1),
    'Final_Project_Report': (2, 2),
    'Phase2_Final_Report': (2, 2),
    'Final_Report': (2, 2),
    'Final_Project_PPT': (2, 2),
    'Phase2_Final_PPT': (2, 2),
    'Final_PPT': (2, 2)
}

def get_team_review_statuses(team_id):
    """
    Ensures exactly 4 review status records exist for the team in MySQL DB:
    - Phase 1 Review 1 (P1R1): OPEN initially
    - Phase 1 Review 2 (P1R2): LOCKED initially
    - Phase 2 Review 1 (P2R1): LOCKED initially
    - Phase 2 Review 2 (P2R2): LOCKED initially

    Enforces locking progression:
    - P1R2 unlocks ONLY when P1R1 status is 'COMPLETED' or 'APPROVED'.
    - P2R1 unlocks ONLY when P1R2 status is 'COMPLETED' or 'APPROVED'.
    - P2R2 unlocks ONLY when P2R1 status is 'COMPLETED' or 'APPROVED'.
    """
    reviews = ReviewStatus.query.filter_by(team_id=team_id).all()
    review_map = {}
    for r in reviews:
        p = getattr(r, 'phase_number', 1) or 1
        num = r.review_number
        review_map[(p, num)] = r

    needed = [(1, 1), (1, 2), (2, 1), (2, 2)]
    created_any = False
    for p, num in needed:
        if (p, num) not in review_map:
            init_status = 'OPEN' if (p == 1 and num == 1) else 'LOCKED'
            r_new = ReviewStatus(
                team_id=team_id,
                phase_number=p,
                review_number=num,
                status=init_status,
                current_attempt=1
            )
            db.session.add(r_new)
            review_map[(p, num)] = r_new
            created_any = True

    if created_any:
        db.session.commit()

    # Dynamic unlock synchronization
    p1r1 = review_map.get((1, 1))
    p1r2 = review_map.get((1, 2))
    p2r1 = review_map.get((2, 1))
    p2r2 = review_map.get((2, 2))

    changed = False

    if p1r1 and p1r1.status in ['COMPLETED', 'APPROVED'] and p1r2 and p1r2.status == 'LOCKED':
        p1r2.status = 'OPEN'
        changed = True

    if p1r2 and p1r2.status in ['COMPLETED', 'APPROVED'] and p2r1 and p2r1.status == 'LOCKED':
        p2r1.status = 'OPEN'
        changed = True

    if p2r1 and p2r1.status in ['COMPLETED', 'APPROVED'] and p2r2 and p2r2.status == 'LOCKED':
        p2r2.status = 'OPEN'
        changed = True

    if changed:
        db.session.commit()

    return review_map

@student_bp.route('/dashboard', methods=['GET'])
def get_dashboard():
    """
    GET /api/student/dashboard?email=... or user_id=...
    Retrieves dynamic student dashboard details from the database.
    """
    email = request.args.get('email', '').strip().lower()
    student_id = request.args.get('student_id', '').strip()

    user = None
    if email:
        user = User.query.filter((User.email == email) | (User.student_id == email.upper())).first()
    elif student_id:
        user = User.query.filter_by(student_id=student_id).first()

    if not user:
        user = User.query.filter_by(role='STUDENT').first()

    if not user:
        return jsonify({'success': False, 'message': 'Student record not found.'}), 404

    membership = TeamMember.query.filter_by(user_id=user.id).first()
    team = membership.team_obj if membership else None

    # Clean up duplicate TeamMember rows if any exist in DB (Bug Fix #9)
    if team:
        seen_uids = set()
        clean_members = []
        for m in team.members:
            if m.user_id not in seen_uids:
                seen_uids.add(m.user_id)
                clean_members.append(m)
            else:
                db.session.delete(m)
        if len(clean_members) != len(team.members):
            db.session.commit()

        # If user is the leader of team, ensure role is TEAM_LEADER
        if team.leader_id == user.id and user.role == 'STUDENT':
            user.role = 'TEAM_LEADER'
            db.session.commit()

    guide = None
    allocation = None
    if team:
        alloc_obj = GuideAllocation.query.filter_by(team_id=team.id).first()
        if alloc_obj:
            allocation = alloc_obj.to_dict()

    if team and team.guide_id:
        guide_user = User.query.get(team.guide_id)
        if guide_user:
            guide = guide_user.to_dict()
            if allocation and allocation.get('matched_preference'):
                guide['matched_preference'] = allocation['matched_preference']

    documents = []
    if team:
        docs = DocumentSubmission.query.filter_by(team_id=team.id).all()
        documents = [d.to_dict() for d in docs]

    from models import StudentReviewMark

    review_map = get_team_review_statuses(team.id) if team else {}
    user_marks = {}
    if team:
        st_marks = StudentReviewMark.query.filter_by(student_id=user.id, team_id=team.id).all()
        for sm in st_marks:
            user_marks[(sm.phase_number, sm.review_number)] = {
                'marks_obtained': sm.marks_obtained,
                'max_marks': sm.max_marks
            }

    reviews_data = {}
    key_map = {(1, 1): 'p1r1', (1, 2): 'p1r2', (2, 1): 'p2r1', (2, 2): 'p2r2'}
    for k, label in key_map.items():
        if k in review_map and review_map[k]:
            r_dict = review_map[k].to_dict()
            if k in user_marks:
                r_dict['marks'] = user_marks[k]['marks_obtained']
                r_dict['marks_obtained'] = user_marks[k]['marks_obtained']
                r_dict['max_marks'] = user_marks[k]['max_marks']
            reviews_data[label] = r_dict
        else:
            reviews_data[label] = None

    notifications = Notification.query.filter_by(user_id=user.id).order_by(Notification.created_at.desc()).all()

    today_str = datetime.now().strftime('%Y-%m-%d')
    today_diary = DailyDiary.query.filter_by(student_id=user.id, date=today_str).order_by(DailyDiary.created_at.desc()).first()

    stage_index = 0
    if team:
        if not team.domain:
            stage_index = 1
        elif not team.guide_id:
            stage_index = 2
        else:
            p1r1 = review_map.get((1, 1))
            p1r2 = review_map.get((1, 2))
            p2r1 = review_map.get((2, 1))
            p2r2 = review_map.get((2, 2))

            if not p1r1 or p1r1.status not in ['COMPLETED', 'APPROVED']:
                stage_index = 3
            elif not p1r2 or p1r2.status not in ['COMPLETED', 'APPROVED']:
                stage_index = 4
            elif not p2r1 or p2r1.status not in ['COMPLETED', 'APPROVED']:
                stage_index = 5
            elif not p2r2 or p2r2.status not in ['COMPLETED', 'APPROVED']:
                stage_index = 6
            else:
                stage_index = 7

    return jsonify({
        'success': True,
        'user': user.to_dict(),
        'team': team.to_dict() if team else None,
        'domain': team.domain if team else None,
        'guide': guide,
        'allocation': allocation,
        'documents': documents,
        'reviews': reviews_data,
        'review1': reviews_data['p1r1'],
        'review2': reviews_data['p1r2'],
        'review2_1': reviews_data['p2r1'],
        'review2_2': reviews_data['p2r2'],
        'stage_index': stage_index,
        'notifications': [n.to_dict() for n in notifications],
        'today_diary': today_diary.to_dict() if today_diary else None
    }), 200

@student_bp.route('/eligible-members', methods=['GET'])
def get_eligible_members():
    """
    GET /api/student/eligible-members?q=...&leader_email=...
    Searches registered students who do NOT belong to any project team.
    """
    q = request.args.get('q', '').strip().lower()
    leader_email = request.args.get('leader_email', '').strip()

    leader = None
    if leader_email:
        leader = User.query.filter(
            (User.email == leader_email.lower()) |
            (User.student_id == leader_email.upper()) |
            (User.usn == leader_email.upper())
        ).first()

    query = User.query.filter(User.role.in_(['STUDENT', 'TEAM_LEADER']))
    if leader and leader.institution_id:
        query = query.filter_by(institution_id=leader.institution_id)

    if q:
        query = query.filter(
            (User.full_name.ilike(f"%{q}%")) |
            (User.usn.ilike(f"%{q}%")) |
            (User.email.ilike(f"%{q}%")) |
            (User.student_id.ilike(f"%{q}%"))
        )

    all_students = query.all()

    eligible = []
    for s in all_students:
        if leader and s.id == leader.id:
            continue
        in_team = TeamMember.query.filter_by(user_id=s.id).first()
        if not in_team:
            eligible.append(s.to_dict())

    return jsonify({'success': True, 'students': eligible}), 200

@student_bp.route('/team', methods=['POST'])
def register_team():
    """
    POST /api/student/team
    Registers a new project team with EXACTLY 4 MEMBERS (1 Leader + 3 Members).
    """
    data = request.get_json() or {}
    leader_email = data.get('leaderEmail', '').strip()
    title = data.get('title', '').strip()
    member_emails = data.get('memberEmails', [])

    if not leader_email:
        return jsonify({'success': False, 'message': 'Team leader identification required.'}), 400

    leader = User.query.filter(
        (User.email == leader_email.lower()) |
        (User.student_id == leader_email.upper()) |
        (User.usn == leader_email.upper())
    ).first()

    if not leader:
        return jsonify({'success': False, 'message': 'Team leader user account not found.'}), 404

    existing_lead_member = TeamMember.query.filter_by(user_id=leader.id).first()
    if existing_lead_member:
        return jsonify({'success': False, 'message': 'You are already a member of an existing project team.'}), 400

    clean_members = [m.strip().lower() for m in member_emails if m.strip()]
    if len(clean_members) != 3:
        return jsonify({'success': False, 'message': 'A team must have EXACTLY 4 members (1 Team Leader + 3 Team Members).'}), 400

    resolved_users = []
    seen_ids = {leader.id}

    for identifier in clean_members:
        member_user = User.query.filter(
            (User.email == identifier) |
            (User.usn == identifier.upper()) |
            (User.student_id == identifier.upper())
        ).first()

        if not member_user:
            return jsonify({'success': False, 'message': f"Student '{identifier}' is not a registered student on PRMES."}), 400
        
        if member_user.id in seen_ids:
            return jsonify({'success': False, 'message': f"Duplicate member '{member_user.full_name}' ({member_user.usn}) cannot be added twice."}), 400
        seen_ids.add(member_user.id)

        in_team = TeamMember.query.filter_by(user_id=member_user.id).first()
        if in_team:
            return jsonify({'success': False, 'message': f"Student {member_user.full_name} ({member_user.usn}) is already registered in another project team."}), 400

        resolved_users.append(member_user)

    count = Team.query.count() + 1
    team_id = f"PRMES-TEAM-2026-{count:03d}"

    # Sync leader role to TEAM_LEADER
    leader.role = 'TEAM_LEADER'

    team = Team(
        team_id=team_id,
        title=title or 'Final Year Major Project',
        leader_id=leader.id,
        status='Active',
        current_stage='Domain Selection'
    )
    db.session.add(team)
    db.session.flush()

    leader_member = TeamMember(team_id=team.id, user_id=leader.id, role_in_team='LEADER')
    db.session.add(leader_member)

    for member_user in resolved_users:
        tm = TeamMember(team_id=team.id, user_id=member_user.id, role_in_team='MEMBER')
        db.session.add(tm)

    r1_1 = ReviewStatus(team_id=team.id, phase_number=1, review_number=1, status='OPEN', current_attempt=1)
    r1_2 = ReviewStatus(team_id=team.id, phase_number=1, review_number=2, status='LOCKED', current_attempt=1)
    r2_1 = ReviewStatus(team_id=team.id, phase_number=2, review_number=1, status='LOCKED', current_attempt=1)
    r2_2 = ReviewStatus(team_id=team.id, phase_number=2, review_number=2, status='LOCKED', current_attempt=1)
    db.session.add_all([r1_1, r1_2, r2_1, r2_2])

    for user_obj in [leader] + resolved_users:
        notif = Notification(
            user_id=user_obj.id,
            team_id=team.id,
            title="Team Registration Completed",
            message=f"Your team {team_id} (4 / 4 Members) has been registered successfully."
        )
        db.session.add(notif)

    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Team registered successfully with 4 members!',
        'team': team.to_dict()
    }), 201

@student_bp.route('/team', methods=['PUT'])
def edit_team():
    """
    PUT /api/student/team
    Team Leader edits project title / domain.
    """
    data = request.get_json() or {}
    leader_email = data.get('leaderEmail', '').strip()
    title = data.get('title', '').strip()
    domain = data.get('domain', '').strip()

    leader, team, err = verify_team_leader_ownership(leader_email)
    if err:
        return err[0], err[1]

    if title:
        team.title = title

    if domain:
        if domain not in FIXED_PROJECT_DOMAINS:
            return jsonify({
                'success': False,
                'message': f"Invalid domain '{domain}'. Please select one of the predefined project domains."
            }), 400
        if team.guide_id:
            return jsonify({
                'success': False,
                'message': 'This information is locked after guide allocation. Contact the Coordinator for changes.'
            }), 403
        team.domain = domain

    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Team information updated successfully.',
        'team': team.to_dict()
    }), 200

@student_bp.route('/team/remove-member', methods=['POST'])
def remove_team_member():
    """
    POST /api/student/team/remove-member
    Removes a team member relationship (does NOT delete student user account).
    """
    data = request.get_json() or {}
    leader_email = data.get('leaderEmail', '').strip()
    member_user_id = data.get('memberUserId')

    if not leader_email or not member_user_id:
        return jsonify({'success': False, 'message': 'Leader identification and member user ID required.'}), 400

    leader, team, err = verify_team_leader_ownership(leader_email)
    if err:
        return err[0], err[1]

    if team.guide_id:
        return jsonify({
            'success': False,
            'message': 'Team changes are locked after guide allocation. Please contact the Coordinator.'
        }), 403

    target_memberships = TeamMember.query.filter_by(team_id=team.id, user_id=member_user_id).all()
    if not target_memberships:
        return jsonify({'success': False, 'message': 'Target student does not belong to your team.'}), 404

    target_membership = target_memberships[0]

    if target_membership.role_in_team == 'LEADER' or member_user_id == leader.id or member_user_id == team.leader_id:
        return jsonify({'success': False, 'message': 'Team Leader cannot remove themselves from the team.'}), 400

    target_user = target_membership.user

    for tm in target_memberships:
        db.session.delete(tm)

    notif_student = Notification(
        user_id=target_user.id,
        team_id=team.id,
        title="Removed from Project Team",
        message=f"You have been removed from Team {team.team_id}."
    )
    db.session.add(notif_student)

    notif_leader = Notification(
        user_id=leader.id,
        team_id=team.id,
        title="Team Member Removed",
        message=f"Student {target_user.full_name} ({target_user.usn}) was removed from your project team."
    )
    db.session.add(notif_leader)

    db.session.commit()

    remaining_members = TeamMember.query.filter_by(team_id=team.id).all()

    return jsonify({
        'success': True,
        'message': 'Team member removed successfully.',
        'team_size': len(remaining_members),
        'team': team.to_dict()
    }), 200

@student_bp.route('/team/add-member', methods=['POST'])
def add_team_member():
    """
    POST /api/student/team/add-member
    Adds an eligible student to an incomplete team (< 4 members).
    """
    data = request.get_json() or {}
    leader_email = data.get('leaderEmail', '').strip()
    member_identifier = data.get('memberEmailOrUsn', '').strip()

    if not leader_email or not member_identifier:
        return jsonify({'success': False, 'message': 'Leader identification and new member identifier required.'}), 400

    leader, team, err = verify_team_leader_ownership(leader_email)
    if err:
        return err[0], err[1]

    if team.guide_id:
        return jsonify({
            'success': False,
            'message': 'Team changes are locked after guide allocation. Please contact the Coordinator.'
        }), 403

    existing_members = TeamMember.query.filter_by(team_id=team.id).all()
    unique_existing_uids = {m.user_id for m in existing_members}

    if len(unique_existing_uids) >= 4:
        return jsonify({'success': False, 'message': 'Team is already full. Maximum 4 members allowed.'}), 400

    new_user = User.query.filter(
        (User.email == member_identifier.lower()) |
        (User.usn == member_identifier.upper()) |
        (User.student_id == member_identifier.upper())
    ).first()

    if not new_user:
        return jsonify({'success': False, 'message': f"Student '{member_identifier}' is not a registered student on PRMES."}), 404

    # Bug Fix #9: Prevent adding student who is ALREADY in this team
    if new_user.id in unique_existing_uids or new_user.id == leader.id:
        return jsonify({'success': False, 'message': f"Student {new_user.full_name} ({new_user.usn}) is already a member of this project team."}), 400

    # Bug Fix #9: Prevent adding student who already belongs to another team
    in_team = TeamMember.query.filter_by(user_id=new_user.id).first()
    if in_team:
        return jsonify({'success': False, 'message': f"Student {new_user.full_name} ({new_user.usn}) is already registered in another project team."}), 400

    new_membership = TeamMember(team_id=team.id, user_id=new_user.id, role_in_team='MEMBER')
    db.session.add(new_membership)

    from services.email_service import EmailService

    notif = Notification(
        user_id=new_user.id,
        team_id=team.id,
        title="You Have Been Added to a Project Team",
        message=f"You have been added to Team {team.team_id} by {leader.full_name}."
    )
    db.session.add(notif)

    # Send Email Notification to the added student
    EmailService.send_team_added_email(
        to_email=new_user.email,
        student_name=new_user.full_name,
        team_id=team.team_id,
        project_title=team.title or 'Final Year Major Project',
        leader_name=leader.full_name,
        department=new_user.department or 'Computer Science & Engineering',
        college=new_user.college or 'Guru Nanak Dev Engineering College'
    )

    db.session.commit()

    return jsonify({
        'success': True,
        'message': f"Student {new_user.full_name} added to team successfully.",
        'team': team.to_dict()
    }), 200

@student_bp.route('/domain', methods=['POST'])
def select_domain():
    data = request.get_json() or {}
    team_id_str = data.get('teamId', '')
    domain_name = data.get('domain', '').strip()
    leader_email = data.get('leaderEmail', '').strip() or data.get('email', '').strip() or data.get('student_id', '').strip()
    user_id = data.get('user_id')

    if not domain_name:
        return jsonify({'success': False, 'message': 'Domain name is required.'}), 400

    if domain_name not in FIXED_PROJECT_DOMAINS:
        return jsonify({
            'success': False,
            'message': f"Invalid domain '{domain_name}'. Please select one of the predefined project domains."
        }), 400

    leader = None
    team = None

    if leader_email or user_id:
        leader, team, err = verify_team_leader_ownership(leader_email or user_id)
        if err:
            return err[0], err[1]
    elif team_id_str:
        team = Team.query.filter_by(team_id=team_id_str).first()
        if not team:
            return jsonify({'success': False, 'message': 'Team record not found.'}), 404
        return jsonify({'success': False, 'message': 'Team Leader identification required to select project domain.'}), 403
    else:
        return jsonify({'success': False, 'message': 'Team Leader identification required.'}), 400

    if not team:
        return jsonify({'success': False, 'message': 'Team record not found.'}), 404

    # Save domain selection
    team.domain = domain_name

    # Trigger Server-Side Automatic Guide Allocation System
    alloc_res = allocate_guide_for_team(team, domain_name)

    db.session.commit()

    return jsonify({
        'success': True,
        'message': alloc_res.get('message', f"Domain '{domain_name}' selected successfully!"),
        'team': team.to_dict(),
        'allocated': alloc_res.get('allocated', False),
        'guide': alloc_res.get('guide'),
        'matched_preference': alloc_res.get('matched_preference')
    }), 200

@student_bp.route('/documents/upload', methods=['POST'])
def upload_document():
    doc_type = request.form.get('doc_type', '').strip()
    team_id_str = request.form.get('team_id', '')
    student_id = request.form.get('student_id', '')
    user_email = (request.form.get('user_email') or request.form.get('email') or request.form.get('leaderEmail') or '').strip().lower()

    file = request.files.get('file')

    if not file or not doc_type:
        return jsonify({'success': False, 'message': 'File and Document Type are required.'}), 400

    # 1. Strict doc_type validation
    if doc_type not in ALLOWED_DOC_TYPES:
        return jsonify({
            'success': False,
            'message': f"Invalid document type '{doc_type}'. The ONLY allowed submissions are: Phase 1 Review 1 (Synopsis), Phase 1 Review 2 (Project Report, Project PPT), Phase 2 Review 1 (Project PPT), Phase 2 Review 2 (Final Project Report, Final Project PPT)."
        }), 400

    # 2. Security: Verify calling user is Team Leader using verify_team_leader_ownership
    user_identifier = user_email or student_id
    if not user_identifier:
        return jsonify({'success': False, 'message': 'Team Leader identification required for document uploads.'}), 400

    leader, team, err = verify_team_leader_ownership(user_identifier)
    if err:
        return err[0], err[1]

    if not team:
        return jsonify({'success': False, 'message': 'Project team record not found.'}), 404

    # 3. Stage Locking Validation
    phase_num, review_num = ALLOWED_DOC_TYPES[doc_type]
    review_map = get_team_review_statuses(team.id)
    target_review = review_map.get((phase_num, review_num))

    if not target_review or target_review.status == 'LOCKED':
        return jsonify({
            'success': False,
            'message': f"Phase {phase_num} Review {review_num} is LOCKED. You cannot upload documents for this review until the previous review stage is completed and approved by your Guide."
        }), 403

    # 4. File extension validation
    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()

    if 'PPT' in doc_type or doc_type.endswith('_PPT'):
        if ext not in ['.ppt', '.pptx']:
            return jsonify({'success': False, 'message': 'PPT documents must be in .ppt or .pptx format.'}), 400
    else:
        if ext not in ['.pdf', '.doc', '.docx']:
            return jsonify({'success': False, 'message': 'Report documents must be in .pdf, .doc, or .docx format.'}), 400

    # 5. Attempts check (max 2 attempts)
    existing_attempts = DocumentSubmission.query.filter_by(
        team_id=team.id,
        doc_type=doc_type
    ).order_by(DocumentSubmission.attempt_number.desc()).all()

    attempt_num = 1
    if existing_attempts:
        last_attempt = existing_attempts[0]
        if last_attempt.status == 'CHANGES_REQUESTED':
            attempt_num = last_attempt.attempt_number + 1
        elif last_attempt.status in ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'COMPLETED']:
            attempt_num = last_attempt.attempt_number

    if attempt_num > 2:
        return jsonify({
            'success': False,
            'message': 'Maximum of 2 attempts reached for this review. Submission rejected.'
        }), 400

    # Save physical uploaded file to backend/uploads/<team_id>/<filename>
    from flask import current_app
    upload_dir = os.path.join(current_app.root_path, 'uploads', team.team_id)
    os.makedirs(upload_dir, exist_ok=True)
    dest_path = os.path.join(upload_dir, filename)
    file.save(dest_path)

    doc_sub = DocumentSubmission(
        team_id=team.id,
        doc_type=doc_type,
        review_number=review_num,
        attempt_number=attempt_num,
        file_name=filename,
        file_path=f"/uploads/{team.team_id}/{filename}",
        status='SUBMITTED',
        submitted_by=team.leader_id
    )
    db.session.add(doc_sub)

    # Update target review status to SUBMITTED if OPEN
    if target_review and target_review.status in ['OPEN', 'CHANGES_REQUESTED']:
        target_review.status = 'SUBMITTED'
        target_review.current_attempt = attempt_num

    db.session.commit()

    return jsonify({
        'success': True,
        'message': f"Document '{filename}' (Attempt {attempt_num} of 2) uploaded successfully for Phase {phase_num} Review {review_num}!",
        'document': doc_sub.to_dict()
    }), 201

# ===================================================================
# DAILY DIARY API ENDPOINTS
# ===================================================================

# DAILY DIARY API ENDPOINTS
# ===================================================================

@student_bp.route('/diary', methods=['GET'])
def get_student_diary():
    email = request.args.get('email', '').strip().lower()
    user_id = request.args.get('user_id')

    user = None
    if email:
        user = User.query.filter((User.email == email) | (User.student_id == email.upper())).first()
    elif user_id:
        user = User.query.get(user_id)

    if not user:
        user = User.query.filter_by(role='STUDENT').first()

    if not user:
        return jsonify({'success': False, 'message': 'Student record not found.'}), 404

    # Get user's project team
    membership = TeamMember.query.filter_by(user_id=user.id).first()
    team = membership.team_obj if membership else None
    if not team:
        team = Team.query.filter_by(leader_id=user.id).first()

    if team:
        # Self-repair any unlinked legacy diary entries for team members
        member_ids = [m.user_id for m in team.members]
        if member_ids:
            unlinked = DailyDiary.query.filter(DailyDiary.student_id.in_(member_ids), (DailyDiary.team_id == None) | (DailyDiary.team_id == 0)).all()
            if unlinked:
                for un in unlinked:
                    un.team_id = team.id
                db.session.commit()

        entries = DailyDiary.query.filter_by(team_id=team.id).order_by(DailyDiary.date.desc(), DailyDiary.created_at.desc()).all()
    else:
        entries = DailyDiary.query.filter_by(student_id=user.id).order_by(DailyDiary.date.desc(), DailyDiary.created_at.desc()).all()

    return jsonify({
        'success': True,
        'team_id': team.team_id if team else None,
        'entries': [e.to_dict() for e in entries]
    }), 200

@student_bp.route('/diary', methods=['POST'])
def create_diary_entry():
    data = request.get_json() or {}
    email = (data.get('user_email') or data.get('email') or '').strip().lower()
    student_id_param = data.get('user_id') or data.get('student_id')
    
    user = None
    if email:
        user = User.query.filter((User.email == email) | (User.student_id == email.upper())).first()
    elif student_id_param:
        user = User.query.filter((User.id == student_id_param) | (User.student_id == str(student_id_param).upper())).first()

    if not user:
        return jsonify({'success': False, 'message': 'Authenticated student not found.'}), 404

    membership = TeamMember.query.filter_by(user_id=user.id).first()
    team = membership.team_obj if membership else None
    if not team:
        team = Team.query.filter_by(leader_id=user.id).first()

    if not team:
        return jsonify({'success': False, 'message': 'You must belong to a project team to post daily diary entries.'}), 400

    entry_date = data.get('date') or datetime.now().strftime('%Y-%m-%d')
    work_category = data.get('work_category', 'Other').strip()
    work_description = data.get('work_description', '').strip()
    hours_worked = float(data.get('hours_worked', 1.0))
    challenges = data.get('challenges', '').strip()
    tomorrow_plan = data.get('tomorrow_plan', '').strip()
    status = data.get('status', 'Completed').strip()

    if not work_description:
        return jsonify({'success': False, 'message': "Today's work description is required."}), 400

    diary = DailyDiary(
        student_id=user.id,
        team_id=team.id,
        date=entry_date,
        work_category=work_category,
        work_description=work_description,
        hours_worked=hours_worked,
        challenges=challenges,
        tomorrow_plan=tomorrow_plan,
        status=status
    )
    db.session.add(diary)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Daily diary entry saved successfully!',
        'entry': diary.to_dict()
    }), 201

@student_bp.route('/diary/<int:entry_id>', methods=['PUT'])
def update_diary_entry(entry_id):
    data = request.get_json() or {}
    email = (data.get('user_email') or data.get('email') or '').strip().lower()
    user_id = data.get('user_id')

    user = None
    if email:
        user = User.query.filter((User.email == email) | (User.student_id == email.upper())).first()
    elif user_id:
        user = User.query.get(user_id)

    if not user:
        return jsonify({'success': False, 'message': 'Authenticated user not found.'}), 404

    diary = DailyDiary.query.get(entry_id)
    if not diary:
        return jsonify({'success': False, 'message': 'Diary entry not found.'}), 404

    if diary.student_id != user.id:
        return jsonify({'success': False, 'message': 'Security Error: You are not authorized to edit another student\'s diary entry.'}), 403

    if 'work_category' in data: diary.work_category = data['work_category']
    if 'work_description' in data: diary.work_description = data['work_description']
    if 'hours_worked' in data: diary.hours_worked = float(data['hours_worked'])
    if 'challenges' in data: diary.challenges = data['challenges']
    if 'tomorrow_plan' in data: diary.tomorrow_plan = data['tomorrow_plan']
    if 'status' in data: diary.status = data['status']
    if 'date' in data: diary.date = data['date']

    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Diary entry updated successfully!',
        'entry': diary.to_dict()
    }), 200

@student_bp.route('/diary/<int:entry_id>', methods=['DELETE'])
def delete_diary_entry(entry_id):
    email = (request.args.get('user_email') or request.args.get('email') or '').strip().lower()
    user_id = request.args.get('user_id')

    user = None
    if email:
        user = User.query.filter((User.email == email) | (User.student_id == email.upper())).first()
    elif user_id:
        user = User.query.get(user_id)

    if not user:
        return jsonify({'success': False, 'message': 'Authenticated user not found.'}), 404

    diary = DailyDiary.query.get(entry_id)
    if not diary:
        return jsonify({'success': False, 'message': 'Diary entry not found.'}), 404

    if diary.student_id != user.id:
        return jsonify({'success': False, 'message': 'Security Error: You are not authorized to delete another student\'s diary entry.'}), 403

    db.session.delete(diary)
    db.session.commit()

    return jsonify({'success': True, 'message': 'Diary entry deleted successfully.'}), 200

@student_bp.route('/team-diary', methods=['GET'])
def get_team_diary():
    team_id_param = request.args.get('team_id')
    user_email = request.args.get('email', '').strip().lower()
    user_id = request.args.get('user_id')

    user = None
    if user_email:
        user = User.query.filter((User.email == user_email) | (User.student_id == user_email.upper())).first()
    elif user_id:
        user = User.query.get(user_id)

    team = None
    if team_id_param:
        team = Team.query.filter((Team.team_id == team_id_param) | (Team.id == team_id_param)).first()

    if not team and user:
        membership = TeamMember.query.filter_by(user_id=user.id).first()
        if membership:
            team = membership.team_obj
        if not team:
            team = Team.query.filter_by(leader_id=user.id).first()

    if not team:
        return jsonify({'success': False, 'message': 'Project team not found.'}), 404

    if user:
        user_memberships = TeamMember.query.filter_by(user_id=user.id, team_id=team.id).first()
        is_leader = (team.leader_id == user.id)
        if not user_memberships and not is_leader and user.role not in ['ADMIN', 'GUIDE', 'COORDINATOR']:
            return jsonify({'success': False, 'message': 'Security Error: You are not authorized to view another team\'s diary entries.'}), 403

    entries = DailyDiary.query.filter_by(team_id=team.id).order_by(DailyDiary.date.desc(), DailyDiary.created_at.desc()).all()
    return jsonify({
        'success': True,
        'team_id': team.team_id,
        'entries': [e.to_dict() for e in entries]
    }), 200

@student_bp.route('/marks-card-pdf', methods=['GET'])
def download_student_marks_card():
    """
    GET /api/student/marks-card-pdf?phase=1&review=1&email=...
    Generates and downloads the student's own individual CIE marks card matching GNDEC standard.
    """
    from services.pdf_template import build_review1_pdf
    from flask import send_file

    email = (request.args.get('email') or request.args.get('user_email') or '').strip().lower()
    user_id = request.args.get('user_id')
    user = None

    if email:
        user = User.query.filter((User.email == email) | (User.student_id == email.upper())).first()
    elif user_id:
        user = User.query.get(user_id)

    if not user:
        user = User.query.filter(User.role.in_(['STUDENT', 'TEAM_LEADER'])).first() or User.query.first()

    if not user:
        return jsonify({'success': False, 'message': 'Student record not found.'}), 404

    try:
        phase = int(request.args.get('phase', 1))
        review = int(request.args.get('review', 1))
    except (ValueError, TypeError):
        phase, review = 1, 1

    membership = TeamMember.query.filter_by(user_id=user.id).first()
    team = membership.team_obj if membership else None
    if not team:
        team = Team.query.filter_by(leader_id=user.id).first()

    mark = None
    if team:
        from models import StudentReviewMark
        mark = StudentReviewMark.query.filter_by(
            student_id=user.id,
            team_id=team.id,
            phase_number=phase,
            review_number=review
        ).first()

    if not mark:
        class BlankEvaluation:
            phase_number = phase
            review_number = review
            criteria1 = 0
            criteria2 = 0
            criteria3 = 0
            criteria4 = 0
            guide_criteria1 = 0
            guide_criteria2 = 0
            guide_criteria3 = 0
            guide_criteria4 = 0
            member1_criteria1 = 0
            member1_criteria2 = 0
            member1_criteria3 = 0
            member1_criteria4 = 0
            member2_criteria1 = 0
            member2_criteria2 = 0
            member2_criteria3 = 0
            member2_criteria4 = 0
            marks_obtained = 0
        mark = BlankEvaluation()

    user.project_title = team.title if team else "Final Year Major Project"
    user.group_no = team.team_id if team else "N/A"
    user.seat_no = user.usn or user.student_id or ""

    pdf_buffer = build_review1_pdf(user, mark, phase=phase, review=review)
    clean_usn = (user.usn or user.student_id or f"student_{user.id}").replace('/', '_')
    return send_file(
        pdf_buffer,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f"CIE_Marks_Card_Phase{phase}_Review{review}_{clean_usn}.pdf"
    )

