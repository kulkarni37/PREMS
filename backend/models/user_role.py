from database.db import db

class UserRole(db.Model):
    __tablename__ = 'user_roles'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    role = db.Column(db.String(30), nullable=False)  # ADMIN, COORDINATOR, GUIDE, TEAM_LEADER, STUDENT

    __table_args__ = (
        db.UniqueConstraint('user_id', 'role', name='uq_user_id_role'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'role': self.role
        }
