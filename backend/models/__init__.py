from models.user import User
from models.institution import Institution
from models.department import Department
from models.otp import OTP
from models.team import Team, TeamMember
from models.project import DocumentSubmission, ReviewStatus, Notification, DailyDiary, StudentReviewMark
from models.guide_specialization import GuideSpecialization
from models.guide_allocation import GuideAllocation
from models.user_role import UserRole
from models.past_project import PastProject

__all__ = [
    'User',
    'Institution',
    'Department',
    'OTP',
    'Team',
    'TeamMember',
    'DocumentSubmission',
    'ReviewStatus',
    'Notification',
    'DailyDiary',
    'StudentReviewMark',
    'GuideSpecialization',
    'GuideAllocation',
    'UserRole',
    'PastProject'
]
