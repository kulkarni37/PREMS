from datetime import datetime, timezone
from database.db import db
from werkzeug.security import generate_password_hash, check_password_hash

# Original PRMES Application Roles
VALID_ROLES = ['ADMIN', 'COORDINATOR', 'GUIDE', 'TEAM_LEADER', 'STUDENT']

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.String(30), nullable=False, default='STUDENT') # ADMIN, COORDINATOR, GUIDE, TEAM_LEADER, STUDENT
    student_id = db.Column(db.String(50), unique=True, nullable=True, index=True) # Also used for Faculty ID / Admin ID
    full_name = db.Column(db.String(100), nullable=False)
    usn = db.Column(db.String(50), unique=True, nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    phone = db.Column(db.String(20), nullable=True)
    profile_photo = db.Column(db.String(255), nullable=True)

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
    max_team_capacity = db.Column(db.Integer, nullable=True, default=3)

    # 3-Level Guide Specialization Preferences
    specialization_preferences = db.relationship(
        'GuideSpecialization',
        backref='guide',
        cascade='all, delete-orphan',
        lazy='select',
        order_by='GuideSpecialization.preference_order'
    )

    # Additional Roles & Responsibilities Relationship
    assigned_roles = db.relationship(
        'UserRole',
        backref='user',
        cascade='all, delete-orphan',
        lazy='select'
    )

    status = db.Column(db.String(20), nullable=False, default='Active')
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def get_roles(self):
        roles = []
        if self.role:
            roles.append(self.role.strip().upper())
        if self.assigned_roles:
            for r in self.assigned_roles:
                r_str = r.role.strip().upper()
                if r_str not in roles:
                    roles.append(r_str)
        return roles

    def has_role(self, role_name):
        if not role_name:
            return False
        return role_name.strip().upper() in self.get_roles()

    @property
    def is_admin(self):
        return self.has_role('ADMIN')

    @property
    def is_coordinator(self):
        return self.has_role('COORDINATOR')

    @property
    def is_guide(self):
        return self.has_role('GUIDE')

    @property
    def is_team_leader(self):
        return self.has_role('TEAM_LEADER')

    @property
    def is_student(self):
        return self.has_role('STUDENT')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def get_specialization_preferences(self):
        if not self.specialization_preferences:
            return []
        prefs = sorted(self.specialization_preferences, key=lambda x: x.preference_order)
        return [p.domain_name for p in prefs]

    def to_dict(self):
        prefs = self.get_specialization_preferences()
        all_roles = self.get_roles()
        return {
            'id': self.id,
            'role': self.role,
            'roles': all_roles,
            'student_id': self.student_id,
            'full_name': self.full_name,
            'usn': self.usn,
            'email': self.email,
            'phone': self.phone,
            'profile_photo': self.profile_photo,
            'institution_id': self.institution_id,
            'department_id': None if self.role == 'ADMIN' else self.department_id,
            'college': self.college,
            'department': None if self.role == 'ADMIN' else self.department,
            'semester': self.semester,
            'section': self.section,
            'designation': self.designation,
            'specialization': self.specialization,
            'specialization_preferences': prefs,
            'preference_1': prefs[0] if len(prefs) > 0 else (self.specialization or None),
            'preference_2': prefs[1] if len(prefs) > 1 else None,
            'preference_3': prefs[2] if len(prefs) > 2 else None,
            'max_team_capacity': min(3, self.max_team_capacity) if self.max_team_capacity is not None else 3,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
