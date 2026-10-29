import os
import sys

# Ensure backend path is in sys.path
sys.path.insert(0, os.path.abspath('backend'))

from app import create_app
from database.db import db
from models import User, Team, TeamMember, GuideSpecialization, GuideAllocation, Notification, DailyDiary, DocumentSubmission, ReviewStatus
from services.guide_allocation_service import allocate_guide_for_team, HARD_MAX_GUIDE_CAPACITY, PENDING_CAPACITY_MESSAGE

def run_tests():
    app = create_app()
    with app.app_context():
        print("=== RUNNING STRICT 3-TEAM GUIDE CAPACITY AUTOMATED TEST SUITE ===")

        def clean_test_data():
            db.session.query(Notification).delete()
            db.session.query(GuideAllocation).delete()
            db.session.query(DailyDiary).delete()
            db.session.query(DocumentSubmission).delete()
            db.session.query(ReviewStatus).delete()
            db.session.query(TeamMember).delete()
            db.session.query(Team).delete()
            db.session.query(GuideSpecialization).delete()
            db.session.query(User).filter(User.email.like('%test_%@gndec.edu.in')).delete()
            db.session.commit()

        # Clean existing test objects safely
        clean_test_data()

        # Create Test Users
        # 1. Guide Alpha (Pref 1: Web Development, Pref 2: Cyber Security)
        guide_alpha = User(
            full_name="Prof. Guide Alpha",
            email="test_alpha@gndec.edu.in",
            role="GUIDE",
            password_hash="test",
            status="Active",
            max_team_capacity=3
        )
        # 2. Guide Beta (Pref 1: Artificial Intelligence, Pref 2: Web Development)
        guide_beta = User(
            full_name="Prof. Guide Beta",
            email="test_beta@gndec.edu.in",
            role="GUIDE",
            password_hash="test",
            status="Active",
            max_team_capacity=3
        )
        # 3. Guide Gamma (Pref 1: Web Development, Pref 2: Data Science)
        guide_gamma = User(
            full_name="Prof. Guide Gamma",
            email="test_gamma@gndec.edu.in",
            role="GUIDE",
            password_hash="test",
            status="Active",
            max_team_capacity=3
        )
        # Team Leaders
        leaders = [
            User(full_name=f"Leader {i}", email=f"test_leader{i}@gndec.edu.in", role="TEAM_LEADER", password_hash="test", status="Active")
            for i in range(1, 12)
        ]

        db.session.add_all([guide_alpha, guide_beta, guide_gamma] + leaders)
        db.session.commit()

        # Setup Specializations
        # Alpha: 1 = Web Development, 2 = Cyber Security
        db.session.add(GuideSpecialization(guide_id=guide_alpha.id, domain_name="Web Development", preference_order=1))
        db.session.add(GuideSpecialization(guide_id=guide_alpha.id, domain_name="Cyber Security", preference_order=2))

        # Beta: 1 = Artificial Intelligence & Machine Learning, 2 = Web Development
        db.session.add(GuideSpecialization(guide_id=guide_beta.id, domain_name="Artificial Intelligence & Machine Learning", preference_order=1))
        db.session.add(GuideSpecialization(guide_id=guide_beta.id, domain_name="Web Development", preference_order=2))

        # Gamma: 1 = Web Development, 2 = Data Science
        db.session.add(GuideSpecialization(guide_id=guide_gamma.id, domain_name="Web Development", preference_order=1))
        db.session.add(GuideSpecialization(guide_id=guide_gamma.id, domain_name="Data Science", preference_order=2))
        db.session.commit()

        # TEST 1: Preference Ordering (Web Development matches Alpha & Gamma at Pref 1, Beta at Pref 2)
        team1 = Team(team_id="TEST-TEAM-01", title="Test Project 1", leader_id=leaders[0].id, status="Active")
        db.session.add(team1)
        db.session.commit()

        res1 = allocate_guide_for_team(team1, "Web Development")
        assert res1['allocated'] == True, "Test 1 Failed: Allocation should succeed."
        assert res1['matched_preference'] == 1, "Test 1 Failed: Matched preference should be Tier 1."
        assert res1['guide_id'] in [guide_alpha.id, guide_gamma.id], "Test 1 Failed: Guide should be Alpha or Gamma (Pref 1)."
        print("[PASS] Test 1 Passed: Domain matching preference priority 1 selected correctly.")

        # TEST 2: Workload Tie-breaker
        # Give Guide Alpha 1 active team (team1 is active with guide_alpha)
        # Now create team2 and allocate for "Web Development". Alpha has 1 active team, Gamma has 0 active teams.
        # Gamma should be selected because Gamma has lower active workload (0 vs 1)!
        team2 = Team(team_id="TEST-TEAM-02", title="Test Project 2", leader_id=leaders[1].id, status="Active")
        db.session.add(team2)
        db.session.commit()

        res2 = allocate_guide_for_team(team2, "Web Development")
        assert res2['allocated'] == True, "Test 2 Failed: Allocation should succeed."
        assert res2['guide_id'] == guide_gamma.id, f"Test 2 Failed: Gamma (workload 0) should beat Alpha (workload 1). Got {res2['guide_id']}"
        print("[PASS] Test 2 Passed: Workload tie-breaker selected guide with lowest active assigned teams.")

        # TEST 3: Allocation up to 3 teams per guide
        # Allocate team3 (Alpha gets team 2), team4 (Gamma gets team 2), team5 (Alpha gets team 3), team6 (Gamma gets team 3)
        team3 = Team(team_id="TEST-TEAM-03", title="Test Project 3", leader_id=leaders[2].id, status="Active")
        team4 = Team(team_id="TEST-TEAM-04", title="Test Project 4", leader_id=leaders[3].id, status="Active")
        team5 = Team(team_id="TEST-TEAM-05", title="Test Project 5", leader_id=leaders[4].id, status="Active")
        team6 = Team(team_id="TEST-TEAM-06", title="Test Project 6", leader_id=leaders[5].id, status="Active")
        db.session.add_all([team3, team4, team5, team6])
        db.session.commit()

        allocate_guide_for_team(team3, "Web Development")
        allocate_guide_for_team(team4, "Web Development")
        allocate_guide_for_team(team5, "Web Development")
        allocate_guide_for_team(team6, "Web Development")

        alpha_teams = Team.query.filter_by(guide_id=guide_alpha.id, status="Active").count()
        gamma_teams = Team.query.filter_by(guide_id=guide_gamma.id, status="Active").count()
        assert alpha_teams == 3, f"Alpha active teams should be exactly 3, got {alpha_teams}"
        assert gamma_teams == 3, f"Gamma active teams should be exactly 3, got {gamma_teams}"
        print("[PASS] Test 3 Passed: Alpha and Gamma reached exactly 3 active teams (hard capacity limit).")

        # TEST 4: Exclusion of guides with 3 teams (Alpha & Gamma are FULL with 3 teams each).
        # Next team for Web Development must NOT assign Alpha or Gamma (would be 4th team).
        # It must fall back to Beta (Pref 2, 0 teams).
        team7 = Team(team_id="TEST-TEAM-07", title="Test Project 7", leader_id=leaders[6].id, status="Active")
        db.session.add(team7)
        db.session.commit()

        res7 = allocate_guide_for_team(team7, "Web Development")
        assert res7['allocated'] == True, "Test 4 Failed: Allocation should fall back to Beta."
        assert res7['guide_id'] == guide_beta.id, f"Test 4 Failed: Expected Beta (Pref 2). Got {res7['guide_id']}"
        print("[PASS] Test 4 Passed: Guides with 3 active teams excluded from 4th allocation; fallback to Pref 2 succeeded.")

        # TEST 5: Strict Capacity Enforcement - All matching guides reached 3 teams -> PENDING
        # Fill Beta capacity (team 8 and team 9 allocated to Beta -> Beta has 3 teams).
        team8 = Team(team_id="TEST-TEAM-08", title="Test Project 8", leader_id=leaders[7].id, status="Active")
        team9 = Team(team_id="TEST-TEAM-09", title="Test Project 9", leader_id=leaders[8].id, status="Active")
        db.session.add_all([team8, team9])
        db.session.commit()
        allocate_guide_for_team(team8, "Web Development")
        allocate_guide_for_team(team9, "Web Development")

        beta_teams = Team.query.filter_by(guide_id=guide_beta.id, status="Active").count()
        assert beta_teams == 3, f"Beta active teams should be exactly 3, got {beta_teams}"

        # Now Alpha (3/3), Gamma (3/3), and Beta (3/3) are ALL FULL (3 active teams each).
        # Team 10 submitting "Web Development" MUST NOT be allocated to any guide.
        team10 = Team(team_id="TEST-TEAM-10", title="Test Project 10", leader_id=leaders[9].id, status="Active")
        db.session.add(team10)
        db.session.commit()

        res10 = allocate_guide_for_team(team10, "Web Development")
        assert res10['allocated'] == False, "Test 5 Failed: Allocated must be False when all guides have 3 teams."
        assert team10.guide_id is None, "Test 5 Failed: team.guide_id MUST remain None."
        assert res10['message'] == PENDING_CAPACITY_MESSAGE, f"Test 5 Failed: Message incorrect. Got '{res10['message']}'"
        
        alloc10 = GuideAllocation.query.filter_by(team_id=team10.id).first()
        assert alloc10 is not None and alloc10.status == 'PENDING', "Test 5 Failed: GuideAllocation status must be PENDING."
        print("[PASS] Test 5 Passed: All matching guides at 3 teams results in PENDING status with exact required message.")

        # TEST 6: Hard System Rule Verification - No Guide Ever Exceeds 3 Active Teams
        all_guides = [guide_alpha, guide_beta, guide_gamma]
        for g in all_guides:
            c = Team.query.filter_by(guide_id=g.id, status="Active").count()
            assert c <= 3, f"HARD RULE VIOLATED: Guide {g.full_name} has {c} active teams (> 3)!"
        print("[PASS] Test 6 Passed: System invariant active_teams_for_guide <= 3 verified for all guides.")

        # TEST 7: Stability & Immutability
        res_stable = allocate_guide_for_team(team1, "Web Development")
        assert res_stable['guide_id'] == team1.guide_id, "Test 7 Failed: Allocation changed for already assigned team."
        print("[PASS] Test 7 Passed: Guide allocation is permanent and stable.")

        # Clean up test data
        clean_test_data()

        print("\n==================================================================")
        print(" ALL 7 STRICT 3-TEAM CAPACITY BACKEND ALLOCATION TESTS PASSED 100% ")
        print("==================================================================")

if __name__ == '__main__':
    run_tests()
