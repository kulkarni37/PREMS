from flask import Blueprint, request, jsonify
from database.db import db
from models import User, Team, TeamMember, DocumentSubmission, ReviewStatus, Notification, DailyDiary, Institution, Department
from datetime import datetime, date as date_cls, timezone
import os

student_bp = Blueprint('student', __name__, url_prefix='/api/student')

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
        return None, None, (jsonify({'success': False, 'message': 'No project team associated with your account.'}), 404)

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
    if team and team.guide_id:
        guide_user = User.query.get(team.guide_id)
        if guide_user:
            guide = guide_user.to_dict()

    documents = []
    if team:
        docs = DocumentSubmission.query.filter_by(team_id=team.id).all()
        documents = [d.to_dict() for d in docs]

    review1 = None
    review2 = None
    if team:
        r1 = ReviewStatus.query.filter_by(team_id=team.id, review_number=1).first()
        r2 = ReviewStatus.query.filter_by(team_id=team.id, review_number=2).first()
        if r1: review1 = r1.to_dict()
        if r2: review2 = r2.to_dict()

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
            proposal_doc = next((d for d in documents if d['doc_type'] == 'Proposal'), None)
            synopsis_doc = next((d for d in documents if d['doc_type'] == 'Synopsis'), None)
            if not proposal_doc:
                stage_index = 3
            elif not synopsis_doc:
                stage_index = 4
            else:
                if not review1 or review1['status'] != 'COMPLETED':
                    stage_index = 5
                elif not review2 or review2['status'] != 'COMPLETED':
                    stage_index = 6
                elif review2 and review2['status'] == 'COMPLETED':
                    stage_index = 7

    return jsonify({
        'success': True,
        'user': user.to_dict(),
        'team': team.to_dict() if team else None,
        'domain': team.domain if team else None,
        'guide': guide,
        'documents': documents,
        'review1': review1,
        'review2': review2,
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

    r1 = ReviewStatus(team_id=team.id, review_number=1, status='OPEN', current_attempt=1)
    r2 = ReviewStatus(team_id=team.id, review_number=2, status='LOCKED', current_attempt=1)
    db.session.add(r1)
    db.session.add(r2)

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

    if not team_id_str or not domain_name:
        return jsonify({'success': False, 'message': 'Team ID and Domain name are required.'}), 400

    team = Team.query.filter_by(team_id=team_id_str).first()
    if not team:
        return jsonify({'success': False, 'message': 'Team record not found.'}), 404

    team.domain = domain_name
    team.current_stage = 'Guide Allocation'

    for member in team.members:
        notif = Notification(
            user_id=member.user_id,
            team_id=team.id,
            title="Project Domain Selected",
            message=f"Project domain set to '{domain_name}'. Guide allocation is now pending."
        )
        db.session.add(notif)

    db.session.commit()

    return jsonify({
        'success': True,
        'message': f"Domain '{domain_name}' selected successfully!",
        'team': team.to_dict()
    }), 200

@student_bp.route('/documents/upload', methods=['POST'])
def upload_document():
    doc_type = request.form.get('doc_type', '')
    team_id_str = request.form.get('team_id', '')
    student_id = request.form.get('student_id', '')

    file = request.files.get('file')

    if not file or not doc_type or not team_id_str:
        return jsonify({'success': False, 'message': 'File, Document Type, and Team ID are required.'}), 400

    team = Team.query.filter_by(team_id=team_id_str).first()
    if not team:
        return jsonify({'success': False, 'message': 'Team not found.'}), 404

    review_num = 0
    if 'Review1' in doc_type:
        review_num = 1
    elif 'Review2' in doc_type:
        review_num = 2

    if review_num == 2:
        r1 = ReviewStatus.query.filter_by(team_id=team.id, review_number=1).first()
        if not r1 or r1.status != 'COMPLETED':
            return jsonify({
                'success': False,
                'message': 'Review 2 is LOCKED. You cannot upload Review 2 documents until Review 1 is officially COMPLETED.'
            }), 403

    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()

    if 'PPT' in doc_type:
        if ext not in ['.ppt', '.pptx']:
            return jsonify({'success': False, 'message': 'PPT documents must be in .ppt or .pptx format.'}), 400
    else:
        if ext not in ['.pdf', '.doc', '.docx']:
            return jsonify({'success': False, 'message': 'Report documents must be in .pdf, .doc, or .docx format.'}), 400

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

    doc_sub = DocumentSubmission(
        team_id=team.id,
        doc_type=doc_type,
        review_number=review_num,
        attempt_number=attempt_num,
        file_name=filename,
        file_path=f"/uploads/{team_id_str}/{filename}",
        status='SUBMITTED',
        submitted_by=team.leader_id
    )
    db.session.add(doc_sub)

    if review_num in [1, 2]:
        rev = ReviewStatus.query.filter_by(team_id=team.id, review_number=review_num).first()
        if rev:
            rev.status = 'SUBMITTED'
            rev.current_attempt = attempt_num

    db.session.commit()

    return jsonify({
        'success': True,
        'message': f"Document '{filename}' (Attempt {attempt_num} of 2) uploaded successfully!",
        'document': doc_sub.to_dict()
    }), 201

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

    entries = DailyDiary.query.filter_by(student_id=user.id).order_by(DailyDiary.date.desc(), DailyDiary.created_at.desc()).all()
    return jsonify({
        'success': True,
        'entries': [e.to_dict() for e in entries]
    }), 200

@student_bp.route('/diary', methods=['POST'])
def create_diary_entry():
    data = request.get_json() or {}
    email = data.get('user_email', '').strip().lower()
    
    user = User.query.filter((User.email == email) | (User.student_id == email.upper())).first() if email else None
    if not user:
        user = User.query.filter_by(role='STUDENT').first()

    if not user:
        return jsonify({'success': False, 'message': 'Authenticated student not found.'}), 404

    membership = TeamMember.query.filter_by(user_id=user.id).first()
    if not membership:
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
        team_id=membership.team_id,
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
    email = data.get('user_email', '').strip().lower()

    user = User.query.filter((User.email == email) | (User.student_id == email.upper())).first() if email else None
    if not user:
        user = User.query.filter_by(role='STUDENT').first()

    diary = DailyDiary.query.get(entry_id)
    if not diary:
        return jsonify({'success': False, 'message': 'Diary entry not found.'}), 404

    if user and diary.student_id != user.id:
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
    email = request.args.get('user_email', '').strip().lower()
    user = User.query.filter((User.email == email) | (User.student_id == email.upper())).first() if email else None
    if not user:
        user = User.query.filter_by(role='STUDENT').first()

    diary = DailyDiary.query.get(entry_id)
    if not diary:
        return jsonify({'success': False, 'message': 'Diary entry not found.'}), 404

    if user and diary.student_id != user.id:
        return jsonify({'success': False, 'message': 'Security Error: You are not authorized to delete another student\'s diary entry.'}), 403

    db.session.delete(diary)
    db.session.commit()

    return jsonify({'success': True, 'message': 'Diary entry deleted successfully.'}), 200

@student_bp.route('/team-diary', methods=['GET'])
def get_team_diary():
    team_id = request.args.get('team_id')
    if not team_id:
        return jsonify({'success': False, 'message': 'Team ID required.'}), 400

    entries = DailyDiary.query.filter_by(team_id=team_id).order_by(DailyDiary.date.desc(), DailyDiary.created_at.desc()).all()
    return jsonify({
        'success': True,
        'entries': [e.to_dict() for e in entries]
    }), 200
