from datetime import datetime, timezone
from database.db import db

class GuideAllocation(db.Model):
    __tablename__ = 'guide_allocations'

    id = db.Column(db.Integer, primary_key=True)
    team_id = db.Column(db.Integer, db.ForeignKey('teams.id', ondelete='CASCADE'), nullable=False, unique=True, index=True)
    guide_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=True, index=True)
    domain = db.Column(db.String(150), nullable=False)
    matched_preference = db.Column(db.Integer, nullable=True)  # 1, 2, or 3
    status = db.Column(db.String(50), nullable=False, default='ALLOCATED')  # ALLOCATED or PENDING
    allocated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    team = db.relationship('Team', backref=db.backref('allocation', uselist=False), lazy=True)
    guide = db.relationship('User', backref='allocations', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'team_id': self.team_id,
            'guide_id': self.guide_id,
            'domain': self.domain,
            'matched_preference': self.matched_preference,
            'status': self.status,
            'allocated_at': self.allocated_at.isoformat() if self.allocated_at else None
        }
