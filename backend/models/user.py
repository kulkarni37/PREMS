from datetime import datetime, timezone
from database.db import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(50), unique=True, nullable=False, index=True)
    full_name = db.Column(db.String(100), nullable=False)
    usn = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    phone = db.Column(db.String(20), nullable=True)
    college = db.Column(db.String(150), nullable=False, default='Guru Nanak Dev Engineering College, Bidar')
    department = db.Column(db.String(150), nullable=False, default='Computer Science & Engineering')
    semester = db.Column(db.String(20), nullable=True, default='7th Semester')
    section = db.Column(db.String(10), nullable=True, default='A')
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'full_name': self.full_name,
            'usn': self.usn,
            'email': self.email,
            'phone': self.phone,
            'college': self.college,
            'department': self.department,
            'semester': self.semester,
            'section': self.section,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
