from datetime import datetime, timezone
from database.db import db

class Institution(db.Model):
    __tablename__ = 'institutions'

    id = db.Column(db.Integer, primary_key=True)
    institution_name = db.Column(db.String(150), nullable=False)
    institution_code = db.Column(db.String(50), unique=True, nullable=False, index=True)
    official_email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    phone = db.Column(db.String(20), nullable=True)
    address = db.Column(db.String(255), nullable=True)
    city = db.Column(db.String(100), nullable=True)
    state = db.Column(db.String(100), nullable=True)
    country = db.Column(db.String(100), nullable=True)
    contact_person = db.Column(db.String(100), nullable=True)
    status = db.Column(db.String(20), nullable=False, default='Active')
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    departments = db.relationship('Department', backref='institution', lazy=True, cascade="all, delete-orphan")
    users = db.relationship('User', backref='institution_obj', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'institution_name': self.institution_name,
            'institution_code': self.institution_code,
            'official_email': self.official_email,
            'phone': self.phone,
            'address': self.address,
            'city': self.city,
            'state': self.state,
            'country': self.country,
            'contact_person': self.contact_person,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
