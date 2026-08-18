from flask import Blueprint, request, jsonify
from database.db import db
from models.user import User
from models.institution import Institution
from models.department import Department
from services.otp_service import OTPService
from services.email_service import EmailService

auth_bp = Blueprint('auth', __name__, url_prefix='/api')

@auth_bp.route('/system/organization-status', methods=['GET'])
def get_organization_status():
    """
    GET /api/system/organization-status
    Checks whether at least one ACTIVE organization/institution exists in MySQL database.
    """
    count = Institution.query.filter_by(status='Active').count()
    return jsonify({
        'success': True,
        'organization_exists': count > 0,
        'count': count
    }), 200

@auth_bp.route('/institutions', methods=['GET'])
@auth_bp.route('/organizations', methods=['GET'])
def get_institutions():
    """GET /api/organizations or /api/institutions - Public list of active institutions"""
    institutions = Institution.query.filter_by(status='Active').all()
    return jsonify({
        'success': True,
        'institutions': [inst.to_dict() for inst in institutions],
        'organizations': [inst.to_dict() for inst in institutions]
    }), 200

@auth_bp.route('/departments', methods=['GET'])
def get_departments():
    """GET /api/departments?institution_id=X - Public list of departments"""
    inst_id = request.args.get('institution_id') or request.args.get('organization_id')
    query = Department.query.filter_by(status='Active')
    if inst_id:
        query = query.filter_by(institution_id=inst_id)
    departments = query.all()
    return jsonify({
        'success': True,
        'departments': [dept.to_dict() for dept in departments]
    }), 200

@auth_bp.route('/organizations/register', methods=['POST'])
@auth_bp.route('/auth/institution-register', methods=['POST'])
def register_organization():
    """
    POST /api/organizations/register
    POST /api/auth/institution-register
    Phase 1: Organization Registration & Provisioning of Primary Admin Account.
    Enforces a single database transaction with rollback if any step fails.
    """
    data = request.get_json() or {}

    org_name = (data.get('organizationName') or data.get('institutionName') or '').strip()
    org_code = (data.get('organizationCode') or data.get('institutionCode') or '').strip().upper()
    official_email = (data.get('officialEmail') or '').strip().lower()
    phone = (data.get('phone') or '').strip()
    address = (data.get('address') or '').strip()
    city = (data.get('city') or '').strip()
    state = (data.get('state') or '').strip()
    country = (data.get('country') or 'India').strip()

    admin_name = (data.get('adminName') or '').strip()
    admin_email = (data.get('adminEmail') or '').strip().lower()
    admin_password = data.get('adminPassword') or ''
    confirm_password = data.get('confirmPassword') or ''

    # Field validations
    if not org_name:
        return jsonify({'success': False, 'message': 'Organization Name is required.'}), 400
    if not org_code:
        return jsonify({'success': False, 'message': 'Organization Code is required.'}), 400
    if not official_email:
        return jsonify({'success': False, 'message': 'Official Organization Email is required.'}), 400
    if not phone:
        return jsonify({'success': False, 'message': 'Phone Number is required.'}), 400
    if not address:
        return jsonify({'success': False, 'message': 'Address is required.'}), 400
    if not city:
        return jsonify({'success': False, 'message': 'City is required.'}), 400
    if not state:
        return jsonify({'success': False, 'message': 'State is required.'}), 400
    if not country:
        return jsonify({'success': False, 'message': 'Country is required.'}), 400

    if not admin_name:
        return jsonify({'success': False, 'message': 'Admin Name is required.'}), 400
    if not admin_email:
        return jsonify({'success': False, 'message': 'Admin Email is required.'}), 400
    if not admin_password:
        return jsonify({'success': False, 'message': 'Admin Password is required.'}), 400

    if admin_password != confirm_password:
        return jsonify({'success': False, 'message': 'Admin Password and Confirm Password do not match.'}), 400

    if len(admin_password) < 6:
        return jsonify({'success': False, 'message': 'Password must be at least 6 characters long.'}), 400

    # Duplicate checks with explicit user error messages
    if Institution.query.filter_by(institution_code=org_code).first():
        return jsonify({'success': False, 'message': 'Organization code already exists.'}), 400

    if Institution.query.filter_by(official_email=official_email).first():
        return jsonify({'success': False, 'message': 'Organization email already exists.'}), 400

    if User.query.filter_by(email=admin_email).first():
        return jsonify({'success': False, 'message': 'Administrator email already exists.'}), 400

    # DB Transaction Block
    try:
        inst = Institution(
            institution_name=org_name,
            institution_code=org_code,
            official_email=official_email,
            phone=phone,
            address=address,
            city=city,
            state=state,
            country=country,
            contact_person=admin_name,
            status='Active'
        )
        db.session.add(inst)
        db.session.flush() # Generates inst.id

        admin_user = User(
            role='ADMIN',
            student_id=f"PRMES-ADM-2026-{inst.id:03d}",
            full_name=admin_name,
            email=admin_email,
            phone=phone,
            institution_id=inst.id,
            department_id=None, # Department initially NULL in Phase 1
            college=org_name,
            department=None, # NULL
            semester=None,
            section=None,
            status='Active'
        )
        admin_user.set_password(admin_password)
        db.session.add(admin_user)

        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Organization registration failed: {str(e)}'}), 500

    return jsonify({
        'success': True,
        'message': 'Organization Registered Successfully. Administrator account created successfully.',
        'organization': inst.to_dict(),
        'admin': admin_user.to_dict()
    }), 201

@auth_bp.route('/auth/register', methods=['POST'])
def register():
    """
    POST /api/auth/register
    Public registration endpoint. Allows TEAM_LEADER or STUDENT registration.
    Dynamically maps institution_id and department_id from database.
    Rejects ADMIN public registration.
    """
    data = request.get_json() or {}
    role = data.get('role', 'STUDENT').strip().upper()
    full_name = data.get('fullName', '').strip()
    usn = data.get('usn', '').strip().upper()
    email = data.get('email', '').strip().lower()
    phone = data.get('phone', '').strip()
    password = data.get('password', '')

    inst_id_req = data.get('institution_id') or data.get('institutionId')
    dept_id_req = data.get('department_id') or data.get('departmentId')

    college = data.get('college', '').strip()
    department = data.get('department', '').strip()
    semester = data.get('semester', '7th Semester')
    section = data.get('section', 'A')

    if role in ['ADMIN', 'COORDINATOR', 'GUIDE']:
        return jsonify({
            'success': False,
            'message': 'Security Notice: Admin, Coordinator, and Guide accounts cannot be created via public registration. Contact Organization Administrator.'
        }), 403

    if role not in ['TEAM_LEADER', 'STUDENT']:
        role = 'STUDENT'

    if not full_name or not usn or not email or not password:
        return jsonify({'success': False, 'message': 'Full Name, USN, Email, and Password are required.'}), 400

    if User.query.filter((User.email == email) | (User.usn == usn)).first():
        return jsonify({'success': False, 'message': 'An account with this Email or USN already exists.'}), 400

    prefix = "PRMES-TL-2026" if role == 'TEAM_LEADER' else "PRMES-STU-2026"
    count = User.query.filter_by(role=role).count() + 1
    student_id = f"{prefix}-{count:04d}"

    # Resolve Institution dynamically
    inst = None
    if inst_id_req:
        inst = Institution.query.get(inst_id_req)
    if not inst:
        inst = Institution.query.filter_by(status='Active').first()

    # Resolve Department dynamically
    dept = None
    if dept_id_req:
        dept = Department.query.get(dept_id_req)
    if not dept and inst:
        dept = Department.query.filter_by(institution_id=inst.id, status='Active').first()

    user = User(
        role=role,
        student_id=student_id,
        full_name=full_name,
        usn=usn,
        email=email,
        phone=phone,
        institution_id=inst.id if inst else None,
        department_id=dept.id if dept else None,
        college=inst.institution_name if inst else (college or 'PRMES Partner Institution'),
        department=dept.department_name if dept else (department or 'Computer Science & Engineering'),
        semester=semester,
        section=section
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    EmailService.send_welcome_email(email, full_name, student_id, role=role)

    role_message = "Your Team Leader account has been created successfully." if role == 'TEAM_LEADER' else "Your student account has been created successfully."

    return jsonify({
        'success': True,
        'message': role_message,
        'role': role,
        'student_id': student_id,
        'user': user.to_dict()
    }), 201

@auth_bp.route('/auth/login', methods=['POST'])
def login():
    """
    POST /api/auth/login
    Common login endpoint for ALL user roles (TEAM_LEADER, STUDENT, GUIDE, COORDINATOR, ADMIN).
    """
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'success': False, 'message': 'Email/ID and Password are required.'}), 400

    user = User.query.filter((User.email == email) | (User.student_id == email.upper())).first()
    if not user or not user.check_password(password):
        return jsonify({'success': False, 'message': 'Invalid email/ID or password.'}), 401

    return jsonify({
        'success': True,
        'message': 'Login successful!',
        'user': user.to_dict()
    }), 200

@auth_bp.route('/auth/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    student_id = data.get('student_id', '').strip()

    if not email or not student_id:
        return jsonify({'success': False, 'message': 'Both Email Address and Student ID are required.'}), 400

    user = User.query.filter_by(student_id=student_id).first()
    if not user:
        return jsonify({'success': False, 'message': 'Student ID not found in PRMES system.'}), 404

    if user.email.lower() != email:
        return jsonify({'success': False, 'message': 'The provided email address does not match.'}), 400

    if OTPService.is_rate_limited(email, student_id):
        return jsonify({'success': False, 'message': 'Too many OTP requests. Please wait 5 minutes.'}), 429

    otp_record = OTPService.create_otp(student_id, email)
    email_sent = EmailService.send_otp_email(user.email, otp_record.otp)

    return jsonify({
        'success': True,
        'message': 'A verification code has been sent to your email address.',
        'email_sent': email_sent
    }), 200

@auth_bp.route('/auth/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json() or {}
    student_id = data.get('student_id', '').strip()
    email = data.get('email', '').strip().lower()
    otp = data.get('otp', '').strip()

    if not student_id or not email or not otp:
        return jsonify({'success': False, 'message': 'Student ID, Email, and OTP code are required.'}), 400

    is_valid, message = OTPService.verify_otp(student_id, email, otp)
    if not is_valid:
        return jsonify({'success': False, 'message': message}), 400

    return jsonify({'success': True, 'message': message}), 200

@auth_bp.route('/auth/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json() or {}
    student_id = data.get('student_id', '').strip()
    email = data.get('email', '').strip().lower()
    otp = data.get('otp', '').strip()
    new_password = data.get('new_password', '')

    if not student_id or not email or not new_password:
        return jsonify({'success': False, 'message': 'All fields are required.'}), 400

    if len(new_password) < 6:
        return jsonify({'success': False, 'message': 'Password must be at least 6 characters long.'}), 400

    if not OTPService.is_otp_verified(student_id, email, otp):
        return jsonify({'success': False, 'message': 'OTP verification required before resetting password.'}), 400

    user = User.query.filter_by(student_id=student_id).first()
    if not user or user.email.lower() != email:
        return jsonify({'success': False, 'message': 'User record not found.'}), 404

    user.set_password(new_password)
    db.session.commit()
    OTPService.delete_otps_for_user(student_id, email)

    return jsonify({'success': True, 'message': 'Password has been updated successfully! You can now log in.'}), 200
