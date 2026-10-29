import os
import sys

sys.path.insert(0, os.path.abspath('backend'))

from app import create_app
from database.db import db
from models import User, Team, TeamMember, ReviewStatus, DocumentSubmission, Notification, StudentReviewMark, DailyDiary
from routes.student_routes import get_team_review_statuses

def test_individual_student_marks():
    app = create_app()
    with app.app_context():
        print("=== TESTING INDIVIDUAL STUDENT MARKS WORKFLOW ===")

        # Cleanup test data
        db.session.query(Notification).delete()
        db.session.query(DailyDiary).delete()
        db.session.query(StudentReviewMark).delete()
        db.session.query(DocumentSubmission).delete()
        db.session.query(ReviewStatus).delete()
        db.session.query(TeamMember).delete()
        db.session.query(Team).delete()
        db.session.query(User).filter(User.email.like('%test_marks_%@gndec.edu.in')).delete()
        db.session.commit()

        # Create Guide and 3 Students
        guide = User(full_name="Prof. Marks Guide", email="test_marks_guide@gndec.edu.in", role="GUIDE", password_hash="test", status="Active")
        leader = User(full_name="Sakshi Leader", email="test_marks_leader@gndec.edu.in", usn="3TM23CS083", role="TEAM_LEADER", password_hash="test", status="Active")
        member1 = User(full_name="Sneha Member", email="test_marks_m1@gndec.edu.in", usn="3TM23CS097", role="STUDENT", password_hash="test", status="Active")
        member2 = User(full_name="Rachita Member", email="test_marks_m2@gndec.edu.in", usn="3TM23CS070", role="STUDENT", password_hash="test", status="Active")

        db.session.add_all([guide, leader, member1, member2])
        db.session.commit()

        # Create Team
        team = Team(
            team_id="PRMES-TEAM-2026-TEST",
            title="Individual Marks Test Project",
            domain="AI/ML",
            leader_id=leader.id,
            guide_id=guide.id,
            status="Active",
            current_stage="Phase 1 Review 1"
        )
        db.session.add(team)
        db.session.commit()

        tm_lead = TeamMember(team_id=team.id, user_id=leader.id, role_in_team="LEADER")
        tm_m1 = TeamMember(team_id=team.id, user_id=member1.id, role_in_team="MEMBER")
        tm_m2 = TeamMember(team_id=team.id, user_id=member2.id, role_in_team="MEMBER")
        db.session.add_all([tm_lead, tm_m1, tm_m2])
        db.session.commit()

        # Initialize review statuses
        get_team_review_statuses(team.id)

        # Test GET /api/guide/review-marks
        from routes.guide_routes import get_review_student_marks, process_student_marks, evaluate_review
        from flask import Flask

        # Test retrieving initial blank marks
        with app.test_request_context(f'/api/guide/review-marks?team_id={team.team_id}&phase_number=1&review_number=1&email={guide.email}'):
            res, code = get_review_student_marks()
            data = res.get_json()
            assert code == 200, f"Expected 200, got {code}"
            assert data['success'] == True
            assert len(data['members']) == 3, f"Expected 3 members, got {len(data['members'])}"
            print("[PASS] Initial review marks query returned 3 real team members successfully.")

        # Save distinct marks for each student for Phase 1 Review 1
        eval_payload = {
            "email": guide.email,
            "team_id": team.team_id,
            "phase_number": 1,
            "review_number": 1,
            "action": "APPROVED",
            "feedback": "Phase 1 Review 1 approved with individual marks.",
            "student_marks": [
                {"student_id": leader.id, "marks_obtained": 8.5},
                {"student_id": member1.id, "marks_obtained": 9.0},
                {"student_id": member2.id, "marks_obtained": 7.5}
            ]
        }

        with app.test_request_context('/api/guide/evaluations', method='POST', json=eval_payload):
            res, code = evaluate_review()
            data = res.get_json()
            assert code == 200, f"Expected 200, got {code}: {data}"
            assert data['success'] == True
            print("[PASS] Submitted evaluation with individual student marks (8.5, 9.0, 7.5).")

        # Verify saved marks in DB
        saved_marks = StudentReviewMark.query.filter_by(team_id=team.id, phase_number=1, review_number=1).all()
        assert len(saved_marks) == 3, f"Expected 3 saved mark records, got {len(saved_marks)}"
        mark_dict = {m.student_id: m.marks_obtained for m in saved_marks}
        assert mark_dict[leader.id] == 8.5
        assert mark_dict[member1.id] == 9.0
        assert mark_dict[member2.id] == 7.5
        print(f"[PASS] Persisted distinct marks in MySQL: Leader={mark_dict[leader.id]}, M1={mark_dict[member1.id]}, M2={mark_dict[member2.id]}.")

        # Test querying saved marks again
        with app.test_request_context(f'/api/guide/review-marks?team_id={team.team_id}&phase_number=1&review_number=1&email={guide.email}'):
            res, code = get_review_student_marks()
            data = res.get_json()
            assert code == 200
            retrieved_dict = {m['student_id']: m['marks_obtained'] for m in data['members']}
            assert retrieved_dict[leader.id] == 8.5
            assert retrieved_dict[member1.id] == 9.0
            assert retrieved_dict[member2.id] == 7.5
            print("[PASS] Querying saved marks returned exact persisted values for each student.")

        print("\n==================================================================")
        print(" ALL INDIVIDUAL STUDENT MARKS BACKEND PERSISTENCE TESTS PASSED! ")
        print("==================================================================")

if __name__ == '__main__':
    test_individual_student_marks()
