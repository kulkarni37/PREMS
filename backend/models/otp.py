from datetime import datetime, timezone
from database.db import db

class OTP(db.Model):
    __tablename__ = 'otps'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(50), nullable=False, index=True)
    email = db.Column(db.String(120), nullable=False, index=True)
    otp = db.Column(db.String(6), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    verified = db.Column(db.Boolean, default=False, nullable=False)

    def is_valid(self):
        now = datetime.now(timezone.utc)
        # Ensure naive vs aware comparison safety
        expires = self.expires_at
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        return not self.verified and expires > now

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'verified': self.verified
        }
