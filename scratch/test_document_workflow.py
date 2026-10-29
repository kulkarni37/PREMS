import os
import sys

sys.path.insert(0, os.path.abspath('backend'))

from app import create_app
from database.db import db
from models import User, Team, TeamMember, ReviewStatus, DocumentSubmission, Notification, StudentReviewMark, DailyDiary
from routes.student_routes import get_team_review_statuses

def run_workflow_tests():
    app = create_app()
    with app.app_context():
        print("=== RUNNING DOCUMENT & REVIEW WORKFLOW AUTOMATED TEST SUITE ===")

        def clean_test_data():
            db.session.query(Notification).delete()
            db.session.query(DailyDiary).delete()
            db.session.query(StudentReviewMark).delete()
            db.session.query(DocumentSubmission).delete()
            db.session.query(ReviewStatus).delete()
            db.session.query(TeamMember).delete()
            db.session.query(Team).delete()
            db.session.query(User).filter(User.email.like('%test_wf_%@gndec.edu.in')).delete()
            db.session.commit()

        clean_test_data()

        # Create Guide, Leader, Member
        guide = User(full_name="Guide WF", email="test_wf_guide@gndec.edu.in", role="GUIDE", password_hash="test", status="Active")
        leader = User(full_name="Leader WF", email="test_wf_leader@gndec.edu.in", role="TEAM_LEADER", password_hash="test", status="Active")
        member = User(full_name="Member WF", email="test_wf_member@gndec.edu.in", role="STUDENT", password_hash="test", status="Active")
        db.session.add_all([guide, leader, member])
        db.session.commit()

        # Create Team
        team = Team(team_id="TEST-WF-01", title="Workflow Test Team", leader_id=leader.id, guide_id=guide.id, domain="Web Development", status="Active")
        db.session.add(team)
        db.session.flush()

        db.session.add(TeamMember(team_id=team.id, user_id=leader.id, role_in_team="LEADER"))
        db.session.add(TeamMember(team_id=team.id, user_id=member.id, role_in_team="MEMBER"))
        db.session.commit()

        # TEST 1: Initial State - 4 Review Status Records Created
        r_map = get_team_review_statuses(team.id)
        assert (1, 1) in r_map and r_map[(1, 1)].status == 'OPEN', "Test 1 Failed: Phase 1 Review 1 must be OPEN."
        assert (1, 2) in r_map and r_map[(1, 2)].status == 'LOCKED', "Test 1 Failed: Phase 1 Review 2 must be LOCKED."
        assert (2, 1) in r_map and r_map[(2, 1)].status == 'LOCKED', "Test 1 Failed: Phase 2 Review 1 must be LOCKED."
        assert (2, 2) in r_map and r_map[(2, 2)].status == 'LOCKED', "Test 1 Failed: Phase 2 Review 2 must be LOCKED."
        print("[PASS] Test 1 Passed: Initial state correctly initialized (P1R1 OPEN, P1R2/P2R1/P2R2 LOCKED).")

        # TEST 2: Locked Stage API Upload Prevention
        with app.test_client() as client:
            # Uploading for Phase 1 Review 2 (Phase1_Report) when P1R1 is not completed MUST fail with 403
            res_locked = client.post('/api/student/documents/upload', data={
                'doc_type': 'Phase1_Report',
                'team_id': team.team_id,
                'leaderEmail': leader.email,
                'file': (open('scratch/test_document_workflow.py', 'rb'), 'report.pdf')
            })
            assert res_locked.status_code == 403, f"Test 2 Failed: Expected 403 for locked stage upload, got {res_locked.status_code}"
            assert "LOCKED" in res_locked.get_json()['message'], "Test 2 Failed: Expected locked message."
            print("[PASS] Test 2 Passed: Backend API blocked document upload for locked review stage.")

            # TEST 3: Unallowed Document Type Prevention
            res_invalid = client.post('/api/student/documents/upload', data={
                'doc_type': 'Proposal', # Proposal is NOT part of the workflow!
                'team_id': team.team_id,
                'leaderEmail': leader.email,
                'file': (open('scratch/test_document_workflow.py', 'rb'), 'prop.pdf')
            })
            assert res_invalid.status_code == 400, f"Test 3 Failed: Expected 400 for unallowed document type, got {res_invalid.status_code}"
            assert "Invalid document type" in res_invalid.get_json()['message'], "Test 3 Failed: Expected invalid document type message."
            print("[PASS] Test 3 Passed: Backend API rejected unallowed document type 'Proposal'.")

            # TEST 4: Successful Upload for OPEN Stage (Synopsis in P1R1)
            res_open = client.post('/api/student/documents/upload', data={
                'doc_type': 'Synopsis',
                'team_id': team.team_id,
                'leaderEmail': leader.email,
                'file': (open('scratch/test_document_workflow.py', 'rb'), 'synopsis.pdf')
            })
            assert res_open.status_code in [200, 201], f"Test 4 Failed: Synopsis upload failed with {res_open.status_code}"
            print("[PASS] Test 4 Passed: Team Leader successfully uploaded Synopsis for Phase 1 Review 1.")

            # TEST 5: Guide Evaluation & Lock Progression (Approve P1R1 -> Unlocks P1R2)
            res_eval1 = client.post('/api/guide/evaluations', json={
                'email': guide.email,
                'team_id': team.id,
                'phase_number': 1,
                'review_number': 1,
                'marks': 45,
                'feedback': 'Synopsis approved.',
                'action': 'APPROVED'
            })
            assert res_eval1.status_code == 200, f"Test 5 Failed: Evaluation failed with {res_eval1.status_code}"
            
            # Verify P1R2 is now UNLOCKED (OPEN)
            r_map = get_team_review_statuses(team.id)
            assert r_map[(1, 1)].status == 'COMPLETED', "Test 5 Failed: P1R1 status must be COMPLETED."
            assert r_map[(1, 2)].status == 'OPEN', "Test 5 Failed: P1R2 must be UNLOCKED (OPEN) after P1R1 approval."
            print("[PASS] Test 5 Passed: Guide approval of P1R1 automatically unlocked Phase 1 Review 2.")

            # TEST 6: Upload for P1R2 (Phase1_Report & Phase1_PPT)
            res_p1r2_report = client.post('/api/student/documents/upload', data={
                'doc_type': 'Phase1_Report',
                'team_id': team.team_id,
                'leaderEmail': leader.email,
                'file': (open('scratch/test_document_workflow.py', 'rb'), 'report.pdf')
            })
            assert res_p1r2_report.status_code in [200, 201], f"Test 6 Failed: Phase1_Report upload failed with {res_p1r2_report.status_code}"
            print("[PASS] Test 6 Passed: Upload for newly unlocked Phase 1 Review 2 succeeded.")

            # TEST 7: Complete P1R2 -> Unlocks Phase 2 Review 1
            client.post('/api/guide/evaluations', json={
                'email': guide.email,
                'team_id': team.id,
                'phase_number': 1,
                'review_number': 2,
                'marks': 48,
                'feedback': 'Phase 1 completed.',
                'action': 'APPROVED'
            })
            r_map = get_team_review_statuses(team.id)
            assert r_map[(2, 1)].status == 'OPEN', "Test 7 Failed: P2R1 must be UNLOCKED (OPEN) after Phase 1 completion."
            print("[PASS] Test 7 Passed: Guide approval of Phase 1 Review 2 unlocked Phase 2 Review 1.")

            # TEST 8: Complete P2R1 -> Unlocks Phase 2 Review 2
            client.post('/api/guide/evaluations', json={
                'email': guide.email,
                'team_id': team.id,
                'phase_number': 2,
                'review_number': 1,
                'marks': 46,
                'feedback': 'Phase 2 Review 1 approved.',
                'action': 'APPROVED'
            })
            r_map = get_team_review_statuses(team.id)
            assert r_map[(2, 2)].status == 'OPEN', "Test 8 Failed: P2R2 must be UNLOCKED (OPEN) after P2R1 completion."
            print("[PASS] Test 8 Passed: Guide approval of Phase 2 Review 1 unlocked Phase 2 Review 2.")

            # TEST 9: Complete P2R2 -> Marks Project Status = COMPLETED
            client.post('/api/guide/evaluations', json={
                'email': guide.email,
                'team_id': team.id,
                'phase_number': 2,
                'review_number': 2,
                'marks': 50,
                'feedback': 'Final defense completed with distinction.',
                'action': 'APPROVED'
            })
            team_updated = Team.query.get(team.id)
            assert team_updated.status == 'Completed', f"Test 9 Failed: Expected team status 'Completed', got '{team_updated.status}'"
            print("[PASS] Test 9 Passed: Approval of Phase 2 Review 2 updated overall Project Status to COMPLETED.")

        clean_test_data()
        print("\n==================================================================")
        print(" ALL 9 WORKFLOW & LOCKING AUTOMATED BACKEND TESTS PASSED 100% ")
        print("==================================================================")

if __name__ == '__main__':
    run_workflow_tests()
