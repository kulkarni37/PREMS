from datetime import datetime, timezone
from database.db import db

class DocumentSubmission(db.Model):
    __tablename__ = 'document_submissions'

    id = db.Column(db.Integer, primary_key=True)
    team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=False, index=True)
    doc_type = db.Column(db.String(50), nullable=False) # 'Proposal', 'Synopsis', 'Review1_Report', 'Review1_PPT', 'Review2_Report', 'Review2_PPT'
    review_number = db.Column(db.Integer, nullable=False, default=0) # 0 for proposal/synopsis, 1 for Review 1, 2 for Review 2
    attempt_number = db.Column(db.Integer, nullable=False, default=1) # 1 or 2
    file_name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    status = db.Column(db.String(50), nullable=False, default='SUBMITTED') # SUBMITTED, UNDER_REVIEW, CHANGES_REQUESTED, APPROVED, COMPLETED
    feedback = db.Column(db.Text, nullable=True)
    submitted_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'team_id': self.team_id,
            'doc_type': self.doc_type,
            'review_number': self.review_number,
            'attempt_number': self.attempt_number,
            'file_name': self.file_name,
            'file_path': self.file_path,
            'status': self.status,
            'feedback': self.feedback,
            'submitted_by': self.submitted_by,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class ReviewStatus(db.Model):
    __tablename__ = 'review_statuses'

    id = db.Column(db.Integer, primary_key=True)
    team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=False, index=True)
    review_number = db.Column(db.Integer, nullable=False) # 1 or 2
    status = db.Column(db.String(50), nullable=False, default='LOCKED') # LOCKED, OPEN, SUBMITTED, UNDER_REVIEW, CHANGES_REQUESTED, COMPLETED
    current_attempt = db.Column(db.Integer, nullable=False, default=1) # 1 or 2
    guide_feedback = db.Column(db.Text, nullable=True)
    marks = db.Column(db.Float, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'team_id': self.team_id,
            'review_number': self.review_number,
            'status': self.status,
            'current_attempt': self.current_attempt,
            'guide_feedback': self.guide_feedback,
            'marks': self.marks,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=True)
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'team_id': self.team_id,
            'title': self.title,
            'message': self.message,
            'read': self.read,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class DailyDiary(db.Model):
    __tablename__ = 'daily_diaries'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=False, index=True)
    date = db.Column(db.String(20), nullable=False)
    work_category = db.Column(db.String(100), nullable=False)
    work_description = db.Column(db.Text, nullable=False)
    hours_worked = db.Column(db.Float, nullable=False, default=1.0)
    challenges = db.Column(db.Text, nullable=True)
    tomorrow_plan = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), nullable=False, default='Completed')
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    student = db.relationship('User', backref='diary_entries', lazy=True)
    team = db.relationship('Team', backref='diary_entries', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'student_name': self.student.full_name if self.student else 'Student',
            'student_usn': self.student.usn if self.student else '',
            'team_id': self.team_id,
            'date': self.date,
            'work_category': self.work_category,
            'work_description': self.work_description,
            'hours_worked': self.hours_worked,
            'challenges': self.challenges,
            'tomorrow_plan': self.tomorrow_plan,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
