from datetime import datetime, timezone
from database.db import db
from models.user import User
from models.team import Team
from models.guide_specialization import GuideSpecialization
from models.guide_allocation import GuideAllocation
from models.project import Notification

HARD_MAX_GUIDE_CAPACITY = 3
PENDING_CAPACITY_MESSAGE = "Guide allocation is pending because all eligible guides have reached their maximum capacity of 3 teams."

def allocate_guide_for_team(team, domain_name):
    """
    Automated, Preference-Matched, Workload-Balanced Guide Allocation Algorithm.

    STRICT CAPACITY SYSTEM RULE:
    - Maximum 3 active project teams per faculty guide.
    - 0, 1, 2 active teams -> ELIGIBLE.
    - 3 active teams -> FULL / NOT ELIGIBLE.
    - The system MUST NEVER assign a 4th active team to a guide.

    RACE CONDITION PROTECTION:
    - Queries actual live database count immediately before allocation.
    - Verifies active_teams_for_guide < 3 before saving allocation.
    """
    if not team or not domain_name:
        return {'success': False, 'message': 'Invalid team or domain.'}

    # 1. Stability Check: If guide is already allocated, do not re-allocate
    if team.guide_id:
        alloc = GuideAllocation.query.filter_by(team_id=team.id).first()
        guide_user = User.query.get(team.guide_id)
        matched_pref = alloc.matched_preference if alloc else 1
        return {
            'success': True,
            'allocated': True,
            'guide': guide_user.to_dict() if guide_user else None,
            'guide_id': team.guide_id,
            'matched_preference': matched_pref,
            'message': 'Team already has a permanently assigned guide.'
        }

    clean_domain = domain_name.strip()

    # 2. Find eligible active guide accounts
    all_users = User.query.filter_by(status='Active').all()
    guides = [u for u in all_users if u.has_role('GUIDE')]

    # Filter by leader institution/department if available
    if team.leader_id:
        leader = User.query.get(team.leader_id)
        if leader:
            if leader.institution_id:
                inst_guides = [g for g in guides if g.institution_id == leader.institution_id or g.institution_id is None]
                if inst_guides:
                    guides = inst_guides
            if leader.department_id:
                dept_guides = [g for g in guides if g.department_id == leader.department_id or g.department == leader.department or g.department_id is None]
                if dept_guides:
                    guides = dept_guides

    candidate_pool = []

    for g in guides:
        # Check active workload against strict limit of 3
        active_count = Team.query.filter_by(guide_id=g.id, status='Active').count()

        # Strict rule: Capacity is min(3, max_team_capacity or 3) -> hard capped at 3
        if active_count >= HARD_MAX_GUIDE_CAPACITY:
            # Exclude full guide (>= 3 active teams)
            continue

        # Evaluate preference tier for clean_domain
        matched_tier = None
        specs = GuideSpecialization.query.filter_by(guide_id=g.id).all()
        if specs:
            for s in specs:
                if s.domain_name.strip().lower() == clean_domain.lower():
                    matched_tier = s.preference_order
                    break
        else:
            # Fallback to g.specialization or preferences array if present
            prefs = g.get_specialization_preferences()
            for idx, p_domain in enumerate(prefs):
                if p_domain.strip().lower() == clean_domain.lower():
                    matched_tier = idx + 1
                    break
            if matched_tier is None and g.specialization and g.specialization.strip().lower() == clean_domain.lower():
                matched_tier = 1

        if matched_tier in [1, 2, 3]:
            # tuple: (matched_tier, active_workload, guide_id, guide_object)
            candidate_pool.append((matched_tier, active_count, g.id, g))

    # Sort candidate pool:
    # 1. Priority 1 (matched_tier: 1 < 2 < 3)
    # 2. Workload (active_count ASC)
    # 3. Deterministic Guide ID (g.id ASC)
    if candidate_pool:
        candidate_pool.sort(key=lambda item: (item[0], item[1], item[2]))

        allocated_guide = None
        allocated_tier = None

        # Pre-Commit Final Live Validation & Race Condition Lock
        for matched_tier, _, g_id, guide_obj in candidate_pool:
            # Re-query actual live number of active teams directly from DB
            live_active_teams = db.session.query(Team).filter(
                Team.guide_id == guide_obj.id,
                Team.status == 'Active'
            ).count()

            # Strict backend check: MUST be < 3
            if live_active_teams < HARD_MAX_GUIDE_CAPACITY:
                allocated_guide = guide_obj
                allocated_tier = matched_tier
                break

        if allocated_guide:
            team.guide_id = allocated_guide.id
            team.current_stage = 'Proposal Submission'

            # Record GuideAllocation in database
            alloc = GuideAllocation.query.filter_by(team_id=team.id).first()
            if not alloc:
                alloc = GuideAllocation(team_id=team.id)
                db.session.add(alloc)

            alloc.guide_id = allocated_guide.id
            alloc.domain = clean_domain
            alloc.matched_preference = allocated_tier
            alloc.status = 'ALLOCATED'
            alloc.allocated_at = datetime.now(timezone.utc)

            # In-App Notifications
            # 1. Team Leader
            notif_leader = Notification(
                user_id=team.leader_id,
                team_id=team.id,
                title="Guide Assigned",
                message=f"Prof. {allocated_guide.full_name} has been automatically assigned to your team '{team.title or team.team_id}' for domain '{clean_domain}'."
            )
            db.session.add(notif_leader)

            # 2. Guide
            notif_guide = Notification(
                user_id=allocated_guide.id,
                team_id=team.id,
                title="New Team Assigned",
                message=f"Team '{team.title or team.team_id}' ({team.team_id}) has been assigned to you for domain '{clean_domain}'."
            )
            db.session.add(notif_guide)

            # 3. Team Members
            for member in team.members:
                if member.user_id != team.leader_id:
                    notif_member = Notification(
                        user_id=member.user_id,
                        team_id=team.id,
                        title="Guide Allocated",
                        message=f"Prof. {allocated_guide.full_name} has been assigned as your project guide for domain '{clean_domain}'."
                    )
                    db.session.add(notif_member)

            return {
                'success': True,
                'allocated': True,
                'guide': allocated_guide.to_dict(),
                'guide_id': allocated_guide.id,
                'matched_preference': allocated_tier,
                'message': f"Prof. {allocated_guide.full_name} automatically assigned (Matched via Preference {allocated_tier})."
            }

    # If no candidate pool or all candidates reached 3 active teams:
    team.guide_id = None
    team.current_stage = 'Guide Allocation'

    alloc = GuideAllocation.query.filter_by(team_id=team.id).first()
    if not alloc:
        alloc = GuideAllocation(team_id=team.id)
        db.session.add(alloc)

    alloc.guide_id = None
    alloc.domain = clean_domain
    alloc.matched_preference = None
    alloc.status = 'PENDING'
    alloc.allocated_at = datetime.now(timezone.utc)

    notif_leader = Notification(
        user_id=team.leader_id,
        team_id=team.id,
        title="Guide Allocation Pending",
        message=PENDING_CAPACITY_MESSAGE
    )
    db.session.add(notif_leader)

    return {
        'success': True,
        'allocated': False,
        'guide': None,
        'guide_id': None,
        'matched_preference': None,
        'message': PENDING_CAPACITY_MESSAGE
    }
