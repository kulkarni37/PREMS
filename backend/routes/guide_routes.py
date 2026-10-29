from flask import Blueprint, request, jsonify
from database.db import db
from models import User, Team, TeamMember, DocumentSubmission, ReviewStatus, Notification, DailyDiary, GuideSpecialization, StudentReviewMark

guide_bp = Blueprint('guide', __name__, url_prefix='/api')

def get_current_user_from_req():
    email = request.args.get('email')
    if not email and request.is_json:
        data = request.get_json() or {}
        email = data.get('email')
    if not email:
        return None
    return User.query.filter_by(email=email.strip().lower()).first()

@guide_bp.route('/guide/dashboard', methods=['GET'])
def get_guide_dashboard():
    """
    GET /api/guide/dashboard
    Returns real authenticated Guide profile, saved 3-level specialization preferences,
    assigned teams, document submissions, reviews, health counts, and notifications from MySQL.
    """
    user = get_current_user_from_req()
    if not user:
        return jsonify({'success': False, 'message': 'Authentication required. Please log in.'}), 401

    if not user.is_guide:
        return jsonify({'success': False, 'message': 'Access denied: Guide role required.'}), 403

    # 1. Specialization preferences from MySQL
    prefs = user.get_specialization_preferences()
    pref_1 = prefs[0] if len(prefs) > 0 else (user.specialization or None)
    pref_2 = prefs[1] if len(prefs) > 1 else None
    pref_3 = prefs[2] if len(prefs) > 2 else None

    # 2. Assigned Teams
    assigned_teams = Team.query.filter_by(guide_id=user.id).order_by(Team.created_at.desc()).all()
    assigned_team_ids = [t.id for t in assigned_teams]

    # 3. Documents to Review (SUBMITTED or UNDER_REVIEW)
    documents_query = DocumentSubmission.query.filter(
        DocumentSubmission.team_id.in_(assigned_team_ids)
    ).order_by(DocumentSubmission.created_at.desc()).all() if assigned_team_ids else []

    docs_to_review_count = len([d for d in documents_query if d.status in ['SUBMITTED', 'UNDER_REVIEW']])

    # 4. Reviews & Evaluations
    reviews_query = ReviewStatus.query.filter(
        ReviewStatus.team_id.in_(assigned_team_ids)
    ).order_by(ReviewStatus.created_at.desc()).all() if assigned_team_ids else []

    pending_reviews_count = len([r for r in reviews_query if r.status in ['SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED']])
    upcoming_evaluations_count = len([r for r in reviews_query if r.status == 'OPEN'])
    completed_evaluations_count = len([r for r in reviews_query if r.status == 'COMPLETED'])

    # 5. Project Health Breakdown
    health = {
        'ontrack': 0,
        'attention': 0,
        'atrisk': 0,
        'completed': 0
    }

    for t in assigned_teams:
        if t.status == 'Completed' or t.current_stage == 'Completed':
            health['completed'] += 1
        elif t.status == 'Inactive':
            health['atrisk'] += 1
        else:
            has_changes = any(d.status == 'CHANGES_REQUESTED' for d in t.documents)
            if has_changes:
                health['attention'] += 1
            else:
                health['ontrack'] += 1

    # 6. Real Notifications & Unread Count from MySQL
    notifications_query = Notification.query.filter_by(user_id=user.id).order_by(Notification.created_at.desc()).all()
    unread_notif_count = Notification.query.filter_by(user_id=user.id, read=False).count()

    # Structure response teams, documents, and evaluations dicts
    teams_data = []
    for t in assigned_teams:
        leader_user = User.query.get(t.leader_id) if t.leader_id else None
        members_count = len(t.members) if t.members else 0
        teams_data.append({
            'id': str(t.id),
            'team_id': t.team_id,
            'title': t.title or 'Untitled Project Team',
            'domain': t.domain or 'Unspecified Domain',
            'leader': leader_user.full_name if leader_user else 'Team Leader',
            'membersCount': members_count,
            'stage': t.current_stage or 'Team Registration',
            'progress': 100 if t.current_stage == 'Completed' else (60 if t.current_stage == 'Review 2' else (40 if t.current_stage == 'Review 1' else 20)),
            'deadline': 'Upcoming Stage',
            'status': 'Completed' if t.status == 'Completed' or t.current_stage == 'Completed' else ('At Risk' if t.status == 'Inactive' else 'On Track'),
            'members': [m.to_dict() for m in t.members],
            'documents': [d.to_dict() for d in t.documents]
        })

    docs_data = []
    for d in documents_query:
        if d.status in ['SUBMITTED', 'UNDER_REVIEW']:
            team_obj = next((t for t in assigned_teams if t.id == d.team_id), None)
            docs_data.append({
                'id': d.id,
                'teamId': team_obj.team_id if team_obj else f"TEAM-{d.team_id}",
                'teamTitle': team_obj.title if team_obj else 'Project Team',
                'docTitle': d.doc_type,
                'submittedDate': d.created_at.strftime('%d %b %Y') if d.created_at else 'Recent',
                'status': d.status,
                'fileName': d.file_name,
                'filePath': d.file_path,
                'review_number': d.review_number,
                'feedback': d.feedback
            })

    evals_data = []
    for r in reviews_query:
        team_obj = next((t for t in assigned_teams if t.id == r.team_id), None)
        evals_data.append({
            'id': r.id,
            'teamId': team_obj.team_id if team_obj else f"TEAM-{r.team_id}",
            'teamTitle': team_obj.title if team_obj else 'Project Team',
            'title': f"Review {r.review_number} Evaluation",
            'date': r.created_at.strftime('%d %b %Y') if r.created_at else 'Scheduled',
            'status': r.status,
            'marks': r.marks,
            'maxMarks': 50,
            'feedback': r.guide_feedback
        })

    return jsonify({
        'success': True,
        'user': {
            'id': user.id,
            'full_name': user.full_name,
            'email': user.email,
            'phone': user.phone,
            'profile_photo': user.profile_photo,
            'role': user.role,
            'roles': user.get_roles(),
            'status': user.status or 'Active',
            'designation': user.designation or 'Assistant Professor',
            'department': user.department or 'Computer Science & Engineering',
            'guide_id': user.student_id or f"PRMES-GDE-{user.id:03d}",
            'specialization': user.specialization or (pref_1 if pref_1 else 'Computer Science & Engineering'),
            'preference_1': pref_1,
            'preference_2': pref_2,
            'preference_3': pref_3,
            'specialization_preferences': prefs
        },
        'specializations': {
            'preference_1': pref_1,
            'preference_2': pref_2,
            'preference_3': pref_3
        },
        'stats': {
            'assigned_teams': len(assigned_teams),
            'max_team_capacity': user.max_team_capacity or 6,
            'pending_reviews': pending_reviews_count,
            'documents_to_review': docs_to_review_count,
            'upcoming_evaluations': upcoming_evaluations_count,
            'completed_evaluations': completed_evaluations_count
        },
        'project_health': health,
        'teams': teams_data,
        'documents': docs_data,
        'evaluations': evals_data,
        'notifications': [n.to_dict() for n in notifications_query],
        'unread_notification_count': unread_notif_count
    }), 200

@guide_bp.route('/notifications/<int:notif_id>/read', methods=['PATCH', 'POST'])
def mark_notification_read(notif_id):
    """
    PATCH /api/notifications/<id>/read
    Marks a single notification as read in MySQL database and recalculates unread count.
    """
    user = get_current_user_from_req()
    notif = Notification.query.get(notif_id)
    if not notif:
        return jsonify({'success': False, 'message': 'Notification not found.'}), 404

    if user and notif.user_id != user.id:
        return jsonify({'success': False, 'message': 'Unauthorized.'}), 403

    notif.read = True
    db.session.commit()

    target_user_id = user.id if user else notif.user_id
    unread_count = Notification.query.filter_by(user_id=target_user_id, read=False).count()

    return jsonify({
        'success': True,
        'message': 'Notification marked as read.',
        'notif_id': notif_id,
        'read': True,
        'unread_count': unread_count
    }), 200

@guide_bp.route('/notifications/mark-all-read', methods=['POST'])
def mark_all_notifications_read():
    """
    POST /api/notifications/mark-all-read
    Marks all notifications for the authenticated user as read in MySQL database.
    """
    user = get_current_user_from_req()
    if not user:
        return jsonify({'success': False, 'message': 'Authentication required.'}), 401

    Notification.query.filter_by(user_id=user.id, read=False).update({'read': True})
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'All notifications marked as read in database.',
        'unread_count': 0
    }), 200

STAGE_MAX_MARKS = {
    (1, 1): 50.0,
    (1, 2): 50.0,
    (2, 1): 50.0,
    (2, 2): 50.0
}

@guide_bp.route('/guide/review-marks', methods=['GET'])
def get_review_student_marks():
    """
    GET /api/guide/review-marks?team_id=...&phase_number=...&review_number=...&doc_id=...&review_id=...
    Retrieves real MySQL team members and any previously saved individual student marks for a review stage.
    """
    from routes.student_routes import ALLOWED_DOC_TYPES
    try:
        from constants.review_config import get_review_config
    except ImportError:
        from review_config import get_review_config

    user = get_current_user_from_req()

    team_id_raw = request.args.get('team_id') or request.args.get('teamId')
    doc_id_raw = request.args.get('doc_id') or request.args.get('docId')
    review_id_raw = request.args.get('review_id') or request.args.get('eval_id')
    p_num = int(request.args.get('phase_number') or 1)
    r_num = int(request.args.get('review_number') or 1)

    team = None
    if doc_id_raw and str(doc_id_raw).isdigit():
        doc_sub = DocumentSubmission.query.get(int(doc_id_raw))
        if doc_sub:
            team = Team.query.get(doc_sub.team_id)
            p_num, r_num = ALLOWED_DOC_TYPES.get(doc_sub.doc_type, (1, doc_sub.review_number))

    if not team and review_id_raw and str(review_id_raw).isdigit():
        rev = ReviewStatus.query.get(int(review_id_raw))
        if rev:
            team = Team.query.get(rev.team_id)
            p_num = getattr(rev, 'phase_number', 1) or 1
            r_num = rev.review_number

    if not team and team_id_raw:
        if str(team_id_raw).isdigit():
            team = Team.query.get(int(team_id_raw))
        else:
            team = Team.query.filter_by(team_id=str(team_id_raw)).first()

    if not team:
        return jsonify({'success': False, 'message': 'Project team record not found.'}), 404

    max_marks = STAGE_MAX_MARKS.get((p_num, r_num), 50.0)
    rev_cfg = get_review_config(p_num, r_num)
    criteria_list = rev_cfg.get('criteria', []) if rev_cfg else []

    # Retrieve real MySQL team members for this exact team
    member_user_ids = []
    if team.members:
        for tm in team.members:
            if tm.user_id and tm.user_id not in member_user_ids:
                member_user_ids.append(tm.user_id)

    if team.leader_id and team.leader_id not in member_user_ids:
        member_user_ids.insert(0, team.leader_id)

    members_data = []
    for u_id in member_user_ids:
        st_user = User.query.get(u_id)
        if not st_user:
            continue

        is_leader = (st_user.id == team.leader_id) or (st_user.role == 'TEAM_LEADER')
        role_label = 'TEAM LEADER' if is_leader else 'TEAM MEMBER'

        # Fetch previously saved individual mark for this student, team, phase, review
        mark_rec = StudentReviewMark.query.filter_by(
            student_id=st_user.id,
            team_id=team.id,
            phase_number=p_num,
            review_number=r_num
        ).first()

        saved_mark = mark_rec.marks_obtained if mark_rec else None

        members_data.append({
            'student_id': st_user.id,
            'full_name': st_user.full_name or 'Student',
            'usn': st_user.usn or st_user.student_id or 'USN Not Set',
            'email': st_user.email or '',
            'role': role_label,
            'is_leader': is_leader,
            'marks_obtained': saved_mark,
            'max_marks': max_marks,
            'criteria1': mark_rec.criteria1 if mark_rec else None,
            'criteria2': mark_rec.criteria2 if mark_rec else None,
            'criteria3': mark_rec.criteria3 if mark_rec else None,
            'criteria4': mark_rec.criteria4 if mark_rec else None,
            'feedback': mark_rec.feedback if mark_rec else ''
        })

    # Sort leader first, then members
    members_data.sort(key=lambda m: 0 if m['is_leader'] else 1)

    return jsonify({
        'success': True,
        'team_id': team.team_id,
        'team_num_id': team.id,
        'phase_number': p_num,
        'review_number': r_num,
        'max_marks': max_marks,
        'criteria': criteria_list,
        'members': members_data
    }), 200

STAGE_REQUIRED_DOCS = {
    (1, 1): [['Synopsis']],
    (1, 2): [['Phase1_Report', 'Review1_Report', 'Project_Report'], ['Phase1_PPT', 'Review1_PPT', 'Project_PPT']],
    (2, 1): [['Phase2_Review1_PPT', 'Phase2_PPT', 'Project_PPT']],
    (2, 2): [['Final_Project_Report', 'Phase2_Final_Report', 'Final_Report'], ['Final_Project_PPT', 'Phase2_Final_PPT', 'Final_PPT']]
}

def process_student_marks(team_id, p_num, r_num, student_marks_input, review_status_id=None, feedback=None, evaluator_id=None):
    from services.evaluation_utils import reverse_engineer_components
    try:
        from constants.review_config import get_review_config
    except ImportError:
        from review_config import get_review_config

    max_marks_cfg = STAGE_MAX_MARKS.get((p_num, r_num), 50.0)
    if not student_marks_input or not isinstance(student_marks_input, list):
        return None, None

    cfg = get_review_config(p_num, r_num)
    max_c = [c['max_marks'] for c in cfg['criteria']] if cfg else [20, 10, 10, 10]

    valid_marks = []
    for sm in student_marks_input:
        if not isinstance(sm, dict):
            continue
        s_id = sm.get('student_id') or sm.get('studentId')
        if s_id is None:
            continue

        c1 = sm.get('criteria1')
        c2 = sm.get('criteria2')
        c3 = sm.get('criteria3')
        c4 = sm.get('criteria4')

        m_val = sm.get('marks_obtained') if 'marks_obtained' in sm else sm.get('marks')

        # Check if individual criteria provided
        if any(c is not None and str(c).strip() != '' for c in [c1, c2, c3, c4]):
            try:
                c1_f = float(c1 or 0)
                c2_f = float(c2 or 0)
                c3_f = float(c3 or 0)
                c4_f = float(c4 or 0)
                if c1_f > max_c[0] or c2_f > max_c[1] or c3_f > max_c[2] or c4_f > max_c[3] or any(x < 0 for x in [c1_f, c2_f, c3_f, c4_f]):
                    return None, f"Criteria marks exceed maximum allowed ({max_c[0]}, {max_c[1]}, {max_c[2]}, {max_c[3]})."
                m_float = c1_f + c2_f + c3_f + c4_f
            except (ValueError, TypeError):
                return None, "Invalid criteria marks format."
        elif m_val is not None:
            try:
                m_float = float(m_val)
                if m_float < 0 or m_float > max_marks_cfg:
                    return None, f"Marks must be between 0 and {max_marks_cfg} for each student."
                comps = reverse_engineer_components(int(round(m_float)), p_num, r_num)
                c1_f = float(comps.get('criteria1', 0))
                c2_f = float(comps.get('criteria2', 0))
                c3_f = float(comps.get('criteria3', 0))
                c4_f = float(comps.get('criteria4', 0))
            except (ValueError, TypeError):
                continue
        else:
            continue

        m_rec = StudentReviewMark.query.filter_by(
            student_id=int(s_id),
            team_id=team_id,
            phase_number=p_num,
            review_number=r_num
        ).first()

        if not m_rec:
            m_rec = StudentReviewMark(
                student_id=int(s_id),
                team_id=team_id,
                review_status_id=review_status_id,
                phase_number=p_num,
                review_number=r_num,
                marks_obtained=m_float,
                max_marks=max_marks_cfg,
                criteria1=c1_f,
                criteria2=c2_f,
                criteria3=c3_f,
                criteria4=c4_f,
                guide_criteria1=c1_f,
                guide_criteria2=c2_f,
                guide_criteria3=c3_f,
                guide_criteria4=c4_f,
                evaluator_id=evaluator_id,
                feedback=feedback
            )
            db.session.add(m_rec)
        else:
            m_rec.marks_obtained = m_float
            m_rec.max_marks = max_marks_cfg
            m_rec.criteria1 = c1_f
            m_rec.criteria2 = c2_f
            m_rec.criteria3 = c3_f
            m_rec.criteria4 = c4_f
            m_rec.guide_criteria1 = c1_f
            m_rec.guide_criteria2 = c2_f
            m_rec.guide_criteria3 = c3_f
            m_rec.guide_criteria4 = c4_f
            if evaluator_id:
                m_rec.evaluator_id = evaluator_id
            if review_status_id:
                m_rec.review_status_id = review_status_id
            if feedback:
                m_rec.feedback = feedback

        valid_marks.append(m_float)

    if valid_marks:
        avg_mark = sum(valid_marks) / len(valid_marks)
        return avg_mark, None
    return None, None

def check_all_stage_docs_approved(team_id, phase_number, review_number):
    required_groups = STAGE_REQUIRED_DOCS.get((phase_number, review_number), [])
    if not required_groups:
        return True
    
    approved_docs = DocumentSubmission.query.filter_by(
        team_id=team_id,
        review_number=review_number,
        status='APPROVED'
    ).all()
    approved_types = {d.doc_type for d in approved_docs}

    for group in required_groups:
        if not any(t in approved_types for t in group):
            return False
    return True

@guide_bp.route('/guide/evaluations', methods=['POST'])
@guide_bp.route('/guide/reviews/<int:review_id>/evaluate', methods=['POST'])
@guide_bp.route('/guide/documents/<int:doc_id>/review', methods=['POST'])
def evaluate_review(review_id=None, doc_id=None):
    """
    POST /api/guide/evaluations or /api/guide/documents/<doc_id>/review
    Faculty Guide evaluates/approves or rejects a document submission / review stage.
    Updates DocumentSubmission status ('APPROVED' or 'REJECTED') and ReviewStatus.
    Unlocks next stage when all required stage documents are approved.
    """
    from datetime import datetime, timezone
    from routes.student_routes import get_team_review_statuses, ALLOWED_DOC_TYPES

    user = get_current_user_from_req()
    if not user:
        return jsonify({'success': False, 'message': 'Authentication required. Please log in.'}), 401

    if not user.is_guide:
        return jsonify({'success': False, 'message': 'Access denied: Guide role required.'}), 403

    data = request.get_json() or {}
    req_doc_id = doc_id or data.get('doc_id') or data.get('docId')
    req_review_id = review_id or data.get('review_id') or data.get('eval_id')
    team_id_raw = data.get('team_id') or data.get('teamId')
    marks = data.get('marks') or data.get('total_score')
    feedback = (data.get('feedback') or data.get('guide_feedback') or '').strip()
    raw_action = str(data.get('action', 'APPROVED')).upper()

    is_reject = raw_action in ['REJECT', 'REJECTED', 'CHANGES_REQUESTED']
    action = 'REJECTED' if is_reject else 'APPROVED'

    if is_reject and not feedback:
        return jsonify({'success': False, 'message': 'Rejection reason / feedback is required when rejecting a document or review.'}), 400

    doc_sub = None
    if req_doc_id and str(req_doc_id).isdigit():
        doc_sub = DocumentSubmission.query.get(int(req_doc_id))

    if doc_sub:
        team = Team.query.get(doc_sub.team_id)
        if not team or team.guide_id != user.id:
            return jsonify({'success': False, 'message': 'Unauthorized: You are not the assigned guide for this team.'}), 403

        p_num, r_num = ALLOWED_DOC_TYPES.get(doc_sub.doc_type, (1, doc_sub.review_number))
        r_map = get_team_review_statuses(team.id)
        target_review = r_map.get((p_num, r_num))

        if not target_review or target_review.status == 'LOCKED':
            return jsonify({'success': False, 'message': f"Phase {p_num} Review {r_num} is LOCKED. You cannot evaluate a document for a locked review stage."}), 403

        student_marks_input = data.get('student_marks') or data.get('studentMarks')
        if student_marks_input:
            avg_m, err_msg = process_student_marks(
                team.id,
                p_num,
                r_num,
                student_marks_input,
                review_status_id=target_review.id if target_review else None,
                feedback=feedback,
                evaluator_id=user.id
            )
            if err_msg:
                return jsonify({'success': False, 'message': err_msg}), 400
            if avg_m is not None and target_review:
                target_review.marks = avg_m

        if is_reject:
            doc_sub.status = 'REJECTED'
            doc_sub.feedback = feedback
            if target_review:
                target_review.status = 'CHANGES_REQUESTED'
                target_review.guide_feedback = feedback

            for member in team.members:
                notif = Notification(
                    user_id=member.user_id,
                    team_id=team.id,
                    title=f"Document Rejected: {doc_sub.doc_type}",
                    message=f"Prof. {user.full_name} rejected your submitted {doc_sub.doc_type} for Team {team.team_id}. Reason: {feedback}"
                )
                db.session.add(notif)

            db.session.commit()
            return jsonify({
                'success': True,
                'message': f"Document '{doc_sub.doc_type}' rejected. Rejection reason sent to team.",
                'document': doc_sub.to_dict(),
                'review': target_review.to_dict() if target_review else None
            }), 200
        else:
            doc_sub.status = 'APPROVED'
            doc_sub.feedback = feedback

            all_stage_approved = check_all_stage_docs_approved(team.id, p_num, r_num)
            if all_stage_approved and target_review:
                target_review.status = 'COMPLETED'
                target_review.marks = float(marks) if marks is not None else 50.0
                target_review.guide_feedback = feedback
                target_review.completed_at = datetime.now(timezone.utc)

                # Unlock next review stage
                get_team_review_statuses(team.id)

                if p_num == 2 and r_num == 2:
                    team.status = 'Completed'
                    team.current_stage = 'Completed'
                elif p_num == 1 and r_num == 1:
                    team.current_stage = 'Phase 1 Review 2'
                elif p_num == 1 and r_num == 2:
                    team.current_stage = 'Phase 2 Review 1'
                elif p_num == 2 and r_num == 1:
                    team.current_stage = 'Phase 2 Review 2'

                for member in team.members:
                    notif = Notification(
                        user_id=member.user_id,
                        team_id=team.id,
                        title=f"Phase {p_num} Review {r_num} Approved",
                        message=f"Prof. {user.full_name} has approved Phase {p_num} Review {r_num} ({doc_sub.doc_type})."
                    )
                    db.session.add(notif)
            else:
                for member in team.members:
                    notif = Notification(
                        user_id=member.user_id,
                        team_id=team.id,
                        title=f"Document Approved: {doc_sub.doc_type}",
                        message=f"Prof. {user.full_name} has approved your {doc_sub.doc_type} submission."
                    )
                    db.session.add(notif)

            db.session.commit()
            return jsonify({
                'success': True,
                'message': f"Document '{doc_sub.doc_type}' approved successfully!",
                'document': doc_sub.to_dict(),
                'review': target_review.to_dict() if target_review else None,
                'stage_completed': all_stage_approved
            }), 200

    # Fallback for stage review evaluation without a specific doc_id
    rev = None
    if req_review_id and str(req_review_id).isdigit():
        rev = ReviewStatus.query.get(int(req_review_id))

    if not rev and team_id_raw:
        team_obj = None
        if str(team_id_raw).isdigit():
            team_obj = Team.query.get(int(team_id_raw))
        else:
            team_obj = Team.query.filter_by(team_id=str(team_id_raw)).first()

        if team_obj:
            p_num = data.get('phase_number', 1)
            r_num = data.get('review_number', 1)
            r_map = get_team_review_statuses(team_obj.id)
            rev = r_map.get((p_num, r_num))

    if not rev:
        return jsonify({'success': False, 'message': 'Review status record or document submission not found.'}), 404

    team = Team.query.get(rev.team_id)
    if not team or team.guide_id != user.id:
        return jsonify({'success': False, 'message': 'Unauthorized: You are not the assigned guide for this team.'}), 403

    p_num = getattr(rev, 'phase_number', 1) or 1
    r_num = rev.review_number

    student_marks_input = data.get('student_marks') or data.get('studentMarks')
    if student_marks_input:
        avg_m, err_msg = process_student_marks(
            team.id,
            p_num,
            r_num,
            student_marks_input,
            review_status_id=rev.id if rev else None,
            feedback=feedback,
            evaluator_id=user.id
        )
        if err_msg:
            return jsonify({'success': False, 'message': err_msg}), 400
        if avg_m is not None and rev:
            rev.marks = avg_m

    if is_reject:
        rev.status = 'CHANGES_REQUESTED'
        rev.guide_feedback = feedback

        doc_subs = DocumentSubmission.query.filter_by(team_id=team.id, review_number=r_num).all()
        for ds in doc_subs:
            ds.status = 'REJECTED'
            ds.feedback = feedback

        for member in team.members:
            notif = Notification(
                user_id=member.user_id,
                team_id=team.id,
                title=f"Changes Requested - Phase {p_num} Review {r_num}",
                message=f"Prof. {user.full_name} requested changes for Phase {p_num} Review {r_num}: {feedback}"
            )
            db.session.add(notif)
    else:
        rev.status = 'COMPLETED'
        rev.marks = float(marks) if marks is not None else 50.0
        rev.guide_feedback = feedback
        rev.completed_at = datetime.now(timezone.utc)

        get_team_review_statuses(team.id)

        doc_subs = DocumentSubmission.query.filter_by(team_id=team.id, review_number=r_num).all()
        for ds in doc_subs:
            ds.status = 'APPROVED'
            ds.feedback = feedback

        if p_num == 2 and r_num == 2:
            team.status = 'Completed'
            team.current_stage = 'Completed'
        elif p_num == 1 and r_num == 1:
            team.current_stage = 'Phase 1 Review 2'
        elif p_num == 1 and r_num == 2:
            team.current_stage = 'Phase 2 Review 1'
        elif p_num == 2 and r_num == 1:
            team.current_stage = 'Phase 2 Review 2'

        for member in team.members:
            notif = Notification(
                user_id=member.user_id,
                team_id=team.id,
                title=f"Phase {p_num} Review {r_num} Approved",
                message=f"Prof. {user.full_name} has approved Phase {p_num} Review {r_num}."
            )
            db.session.add(notif)

    db.session.commit()

    return jsonify({
        'success': True,
        'message': f"Phase {p_num} Review {r_num} evaluation saved successfully.",
        'review': rev.to_dict(),
        'team': team.to_dict()
    }), 200

