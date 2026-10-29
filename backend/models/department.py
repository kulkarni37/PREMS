from datetime import datetime, timezone
from database.db import db

class Department(db.Model):
    __tablename__ = 'departments'

    id = db.Column(db.Integer, primary_key=True)
    institution_id = db.Column(db.Integer, db.ForeignKey('institutions.id'), nullable=False, index=True)
    department_name = db.Column(db.String(150), nullable=False)
    department_code = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='Active')
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    users = db.relationship('User', foreign_keys='User.department_id', backref='department_obj', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'institution_id': self.institution_id,
            'department_name': self.department_name,
            'department_code': self.department_code,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
