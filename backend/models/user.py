from datetime import datetime, timezone
from database.db import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.String(30), nullable=False, default='STUDENT') # ADMIN, COORDINATOR, GUIDE, STUDENT
    student_id = db.Column(db.String(50), unique=True, nullable=True, index=True) # Also used for Faculty ID / Admin ID
    full_name = db.Column(db.String(100), nullable=False)
    usn = db.Column(db.String(50), unique=True, nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    phone = db.Column(db.String(20), nullable=True)

    # Relationships to Institution & Department
    institution_id = db.Column(db.Integer, db.ForeignKey('institutions.id'), nullable=True)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=True)

    college = db.Column(db.String(150), nullable=False, default='Guru Nanak Dev Engineering College, Bidar')
    department = db.Column(db.String(150), nullable=False, default='Computer Science & Engineering')
    semester = db.Column(db.String(20), nullable=True, default='7th Semester')
    section = db.Column(db.String(10), nullable=True, default='A')

    # Faculty Specific Attributes
    designation = db.Column(db.String(100), nullable=True)
    specialization = db.Column(db.String(150), nullable=True)
    max_team_capacity = db.Column(db.Integer, nullable=True, default=6)

    status = db.Column(db.String(20), nullable=False, default='Active')
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'role': self.role,
            'student_id': self.student_id,
            'full_name': self.full_name,
            'usn': self.usn,
            'email': self.email,
            'phone': self.phone,
            'institution_id': self.institution_id,
            'department_id': self.department_id,
            'college': self.college,
            'department': self.department,
            'semester': self.semester,
            'section': self.section,
            'designation': self.designation,
            'specialization': self.specialization,
            'max_team_capacity': self.max_team_capacity,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
