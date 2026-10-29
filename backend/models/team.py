from datetime import datetime, timezone
from database.db import db

class Team(db.Model):
    __tablename__ = 'teams'

    id = db.Column(db.Integer, primary_key=True)
    team_id = db.Column(db.String(50), unique=True, nullable=False, index=True)
    title = db.Column(db.String(255), nullable=True)
    domain = db.Column(db.String(150), nullable=True)
    leader_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    guide_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    status = db.Column(db.String(50), nullable=False, default='Active')
    current_stage = db.Column(db.String(50), nullable=False, default='Team Registration')
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    members = db.relationship('TeamMember', backref='team_obj', lazy=True, cascade="all, delete-orphan")
    documents = db.relationship('DocumentSubmission', backref='team_obj', lazy=True, cascade="all, delete-orphan")
    reviews = db.relationship('ReviewStatus', backref='team_obj', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'team_id': self.team_id,
            'title': self.title or 'Untitled Project Team',
            'domain': self.domain,
            'leader_id': self.leader_id,
            'guide_id': self.guide_id,
            'status': self.status,
            'current_stage': self.current_stage,
            'members': [m.to_dict() for m in self.members],
            'documents': [d.to_dict() for d in self.documents],
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class TeamMember(db.Model):
    __tablename__ = 'team_members'

    id = db.Column(db.Integer, primary_key=True)
    team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    role_in_team = db.Column(db.String(20), nullable=False, default='MEMBER') # LEADER or MEMBER
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationship to user
    user = db.relationship('User', backref='team_membership', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'team_id': self.team_id,
            'user_id': self.user_id,
            'role_in_team': self.role_in_team,
            'student': self.user.to_dict() if self.user else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
