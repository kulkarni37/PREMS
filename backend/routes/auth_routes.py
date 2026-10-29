from flask import Blueprint, request, jsonify, current_app
import os
from database.db import db
from models.user import User
from models.institution import Institution
from models.department import Department
from models.guide_specialization import GuideSpecialization
from models.user_role import UserRole
from services.otp_service import OTPService
from services.email_service import EmailService

from constants.domains import FIXED_PROJECT_DOMAINS

auth_bp = Blueprint('auth', __name__, url_prefix='/api')

AVAILABLE_DOMAINS = FIXED_PROJECT_DOMAINS

@auth_bp.route('/domains', methods=['GET'])
def get_domains():
    """
    GET /api/domains
    Public endpoint returning 15 fixed predefined project domains.
    """
    return jsonify({
        'success': True,
        'domains': FIXED_PROJECT_DOMAINS
    }), 200

@auth_bp.route('/system/organization-status', methods=['GET'])
def get_organization_status():
    """
    GET /api/system/organization-status
    PRMES is a single-college application for Guru Nanak Dev Engineering College, Bidar (GNDEC).
    """
    count = 1
    try:
        count = Institution.query.filter_by(status='Active').count()
    except Exception:
        count = 1
    return jsonify({
        'success': True,
        'organization_exists': True,
        'count': max(1, count)
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
    Public self-registration endpoint for COORDINATOR, GUIDE, TEAM_LEADER, or STUDENT.
    Rejects ADMIN registration attempt with HTTP 403 Forbidden.
    Requires valid Guide Secret Code when role == GUIDE.
    """
    data = request.get_json() or {}
    role = data.get('role', 'STUDENT').strip().upper()
    full_name = (data.get('fullName') or data.get('full_name') or '').strip()
    
    # ID can come as usn, employee_id, or student_id
    id_val = (data.get('usn') or data.get('employee_id') or data.get('employeeId') or data.get('student_id') or '').strip().upper()
    email = data.get('email', '').strip().lower()
    phone = data.get('phone', '').strip()
    password = data.get('password', '')

    designation = (data.get('designation') or '').strip()
    specialization = (data.get('specialization') or '').strip()
    guide_secret_code = (data.get('guide_secret_code') or data.get('guideSecretCode') or '').strip()

    inst_id_req = data.get('institution_id') or data.get('institutionId')
    dept_id_req = data.get('department_id') or data.get('departmentId')

    college = data.get('college', '').strip()
    department = data.get('department', '').strip()
    semester = data.get('semester', '7th Semester')
    section = data.get('section', 'A')

    # Security check: ADMIN accounts can NEVER be created via public registration
    if role == 'ADMIN':
        return jsonify({
            'success': False,
            'message': 'Security Notice: Administrator accounts cannot be created via public registration. Contact System Administrator.'
        }), 403

    # Allowed public self-registration roles
    if role not in ['COORDINATOR', 'GUIDE', 'TEAM_LEADER', 'STUDENT']:
        role = 'STUDENT'

    # Coordinator Secret Code Verification for COORDINATOR role ONLY
    if role == 'COORDINATOR':
        coordinator_secret_code = (
            data.get('coordinator_secret_code') or 
            data.get('coordinatorSecretCode') or 
            data.get('secret_code') or 
            data.get('secretCode') or 
            ''
        ).strip()

        if not coordinator_secret_code:
            return jsonify({
                'success': False,
                'message': 'Coordinator Secret Code is required for Coordinator registration.'
            }), 400

        expected_coord_code = current_app.config.get('COORDINATOR_REGISTRATION_CODE') or os.getenv('COORDINATOR_REGISTRATION_CODE', 'PRMES_COORDINATOR_SECRET_2026')
        if coordinator_secret_code != expected_coord_code:
            return jsonify({
                'success': False,
                'message': 'Invalid Coordinator Secret Code'
            }), 403

    # Guide Secret Code & 3-Level Specialization Preferences Verification for GUIDE role ONLY
    if role == 'GUIDE':
        if not guide_secret_code:
            return jsonify({
                'success': False,
                'message': 'Guide Secret Code is required for Faculty Guide registration.'
            }), 400

        expected_code = current_app.config.get('GUIDE_REGISTRATION_CODE') or os.getenv('GUIDE_REGISTRATION_CODE', 'PRMES_GUIDE_SECRET_2026')
        if guide_secret_code != expected_code:
            return jsonify({
                'success': False,
                'message': 'Invalid guide registration code.'
            }), 403

        # Extract 3-level preferences
        pref1 = (data.get('preference_1') or data.get('preference1') or '').strip()
        pref2 = (data.get('preference_2') or data.get('preference2') or '').strip()
        pref3 = (data.get('preference_3') or data.get('preference3') or '').strip()

        if not pref1 or not pref2 or not pref3:
            prefs_arr = data.get('specialization_preferences') or data.get('specializationPreferences') or []
            if isinstance(prefs_arr, list) and len(prefs_arr) >= 3:
                pref1 = str(prefs_arr[0]).strip()
                pref2 = str(prefs_arr[1]).strip()
                pref3 = str(prefs_arr[2]).strip()

        if not pref1 or not pref2 or not pref3:
            return jsonify({
                'success': False,
                'message': 'Please select all three specialization preferences.'
            }), 400

        if len({pref1, pref2, pref3}) < 3:
            return jsonify({
                'success': False,
                'message': 'Please select three different specialization preferences.'
            }), 400

        for p in [pref1, pref2, pref3]:
            if p not in AVAILABLE_DOMAINS:
                return jsonify({
                    'success': False,
                    'message': f'Invalid specialization preference selected: {p}.'
                }), 400

    if not full_name or not id_val or not email or not password:
        id_label = "USN / Student ID" if role in ['STUDENT', 'TEAM_LEADER'] else "Faculty / Employee ID"
        return jsonify({'success': False, 'message': f'Full Name, {id_label}, Email, and Password are required.'}), 400

    # Duplicate check on email, usn, or student_id
    existing_user = User.query.filter(
        (User.email == email) | 
        (User.usn == id_val) | 
        (User.student_id == id_val)
    ).first()
    
    if existing_user:
        return jsonify({'success': False, 'message': 'An account with this Email, USN, or Employee ID already exists.'}), 400

    # Role-based prefix and default attributes
    if role == 'GUIDE':
        prefix = "PRMES-GDE-2026"
        default_desig = designation or "Assistant Professor"
    elif role == 'COORDINATOR':
        prefix = "PRMES-CRD-2026"
        default_desig = designation or "Project Coordinator"
    elif role == 'TEAM_LEADER':
        prefix = "PRMES-TL-2026"
        default_desig = "Student Team Leader"
    else:
        prefix = "PRMES-STU-2026"
        default_desig = "Student"

    count = User.query.filter_by(role=role).count() + 1
    generated_id = f"{prefix}-{count:04d}"
    student_id_to_store = id_val if id_val else generated_id

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

    if not dept:
        dept = Department.query.first()

    if not dept:
        return jsonify({
            'success': False,
            'message': 'Registration Error: Selected department was not found.'
        }), 400

    user = User(
        role=role,
        student_id=student_id_to_store,
        full_name=full_name,
        usn=id_val if role in ['STUDENT', 'TEAM_LEADER'] else None,
        email=email,
        phone=phone,
        institution_id=inst.id if inst else None,
        department_id=dept.id,
        college=inst.institution_name if inst else (college or 'Guru Nanak Dev Engineering College, Bidar'),
        department=dept.department_name if dept else (department or 'Computer Science & Engineering'),
        semester=semester if role in ['STUDENT', 'TEAM_LEADER'] else None,
        section=section if role in ['STUDENT', 'TEAM_LEADER'] else None,
        designation=default_desig,
        specialization=pref1 if role == 'GUIDE' else (specialization if role == 'COORDINATOR' else None),
        status='Active'
    )
    user.set_password(password)
    db.session.add(user)
    db.session.flush()

    # Record primary role in user_roles
    if not UserRole.query.filter_by(user_id=user.id, role=role).first():
        db.session.add(UserRole(user_id=user.id, role=role))

    if role == 'GUIDE':
        spec1 = GuideSpecialization(guide_id=user.id, domain_name=pref1, preference_order=1)
        spec2 = GuideSpecialization(guide_id=user.id, domain_name=pref2, preference_order=2)
        spec3 = GuideSpecialization(guide_id=user.id, domain_name=pref3, preference_order=3)
        db.session.add_all([spec1, spec2, spec3])

    db.session.commit()

    user_dict = user.to_dict()

    EmailService.send_welcome_email(email, full_name, student_id_to_store, role=role)

    role_messages = {
        'COORDINATOR': "Your Coordinator account has been created successfully.",
        'GUIDE': "Your Faculty Guide account has been created successfully.",
        'TEAM_LEADER': "Your Team Leader account has been created successfully.",
        'STUDENT': "Your Student account has been created successfully."
    }

    return jsonify({
        'success': True,
        'message': role_messages.get(role, "Account created successfully."),
        'role': role,
        'student_id': student_id_to_store,
        'user': user_dict
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

    return jsonify({'success': True, 'message': 'Password reset successful. You can now log in.'}), 200

@auth_bp.route('/admin/users/<int:user_id>/roles', methods=['POST', 'PATCH'])
def update_user_roles(user_id):
    """
    POST /api/admin/users/<id>/roles
    Assigns or updates additional responsibilities for a user account without creating duplicate users.
    Payload: { "roles": ["COORDINATOR", "GUIDE"], "email": "admin@gndec.edu.in" }
    """
    from models.user import VALID_ROLES
    data = request.get_json() or {}
    email = data.get('email', '').strip()

    admin_user = User.query.filter_by(email=email).first() if email else None
    if not admin_user or not admin_user.has_role('ADMIN'):
        return jsonify({'success': False, 'message': 'Unauthorized: Administrator access required.'}), 403

    u = User.query.get(user_id)
    if not u:
        return jsonify({'success': False, 'message': 'User record not found.'}), 404

    new_roles = data.get('roles') or []
    if isinstance(new_roles, str):
        new_roles = [new_roles]

    roles_to_add = [r.strip().upper() for r in new_roles if r.strip().upper() in VALID_ROLES]

    # Ensure primary role remains
    if u.role not in roles_to_add:
        roles_to_add.append(u.role)

    # Sync UserRole entries
    UserRole.query.filter_by(user_id=u.id).delete(synchronize_session=False)
    for r in roles_to_add:
        db.session.add(UserRole(user_id=u.id, role=r))

    db.session.commit()

    return jsonify({
        'success': True,
        'message': f"Responsibilities for {u.full_name} updated successfully.",
        'user_id': u.id,
        'roles': u.get_roles()
    }), 200

@auth_bp.route('/profile', methods=['GET'])
def get_user_profile():
    """
    GET /api/profile
    Retrieves the authenticated user's profile.
    Query params: email or identifier (usn / student_id)
    """
    email = request.args.get('email', '').strip().lower()
    student_id = request.args.get('student_id', '').strip().upper()
    usn = request.args.get('usn', '').strip().upper()

    user = None
    if email:
        user = User.query.filter(User.email.ilike(email)).first()
    elif student_id:
        user = User.query.filter_by(student_id=student_id).first()
    elif usn:
        user = User.query.filter_by(usn=usn).first()

    if not user:
        return jsonify({'success': False, 'message': 'User profile not found.'}), 404

    return jsonify({
        'success': True,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/profile', methods=['PUT'])
def update_user_profile():
    """
    PUT /api/profile
    Updates the authenticated user's own profile (full_name, phone, password, profile_photo).
    Does NOT allow changing role, department_id, email, usn, or id.
    """
    data = request.get_json() or {}
    requester_email = (data.get('requester_email') or data.get('auth_email') or '').strip().lower()
    requester_id = data.get('requester_id')
    email = (data.get('email') or '').strip().lower()
    student_id = (data.get('student_id') or '').strip().upper()

    user = None
    if email:
        user = User.query.filter(User.email.ilike(email)).first()
    elif student_id:
        user = User.query.filter_by(student_id=student_id).first()

    if not user:
        return jsonify({'success': False, 'message': 'Authenticated user record not found.'}), 404

    # Security Check: Ensure caller cannot modify another user's profile unless ADMIN
    if requester_email and requester_email != user.email.lower():
        req_user = User.query.filter(User.email.ilike(requester_email)).first()
        if not req_user or req_user.role != 'ADMIN':
            return jsonify({'success': False, 'message': "You are not authorized to modify another user's profile."}), 403

    if requester_id and int(requester_id) != user.id:
        req_user = User.query.get(requester_id)
        if not req_user or req_user.role != 'ADMIN':
            return jsonify({'success': False, 'message': "You are not authorized to modify another user's profile."}), 403

    # 1. Full Name Update
    full_name = data.get('full_name') or data.get('fullName')
    if full_name and str(full_name).strip():
        user.full_name = str(full_name).strip()

    # 2. Phone / Mobile Number Update (Must be 10-digit Indian mobile number)
    phone = data.get('phone') or data.get('mobileNumber')
    if phone is not None and str(phone).strip():
        clean_phone = str(phone).strip()
        if clean_phone.startswith('+91'):
            clean_phone = clean_phone[3:].strip()
        elif clean_phone.startswith('91') and len(clean_phone) == 12:
            clean_phone = clean_phone[2:].strip()

        if not clean_phone.isdigit() or len(clean_phone) != 10:
            return jsonify({
                'success': False,
                'message': 'Please enter a valid 10-digit Indian mobile number.'
            }), 400
        user.phone = clean_phone

    # 3. Password Update (Secure Check & Update)
    current_password = data.get('current_password') or data.get('currentPassword')
    new_password = data.get('new_password') or data.get('newPassword')
    confirm_password = data.get('confirm_password') or data.get('confirmPassword')

    if new_password or current_password or confirm_password:
        if not current_password:
            return jsonify({
                'success': False,
                'message': 'Please enter your current password to change password.'
            }), 400

        if not user.check_password(current_password):
            return jsonify({
                'success': False,
                'message': 'Current password is incorrect.'
            }), 400

        if not new_password:
            return jsonify({
                'success': False,
                'message': 'Please enter your new password.'
            }), 400

        if new_password != confirm_password:
            return jsonify({
                'success': False,
                'message': 'New password and confirmation password do not match.'
            }), 400

        if len(new_password) < 6:
            return jsonify({
                'success': False,
                'message': 'New password must be at least 6 characters long.'
            }), 400

        user.set_password(new_password)

    # 4. Profile Photo Base64 / Path Update
    photo_data = data.get('profile_photo') or data.get('profilePhoto')
    if photo_data and str(photo_data).startswith('data:image'):
        import base64
        import time
        try:
            format_part, img_str = photo_data.split(';base64,')
            ext = format_part.split('/')[-1]
            if ext == 'jpeg':
                ext = 'jpg'
            filename = f"avatar_{user.id}_{int(time.time())}.{ext}"
            uploads_dir = os.path.join(current_app.root_path, 'uploads', 'avatars')
            os.makedirs(uploads_dir, exist_ok=True)
            filepath = os.path.join(uploads_dir, filename)
            with open(filepath, 'wb') as f:
                f.write(base64.b64decode(img_str))
            user.profile_photo = f"/uploads/avatars/{filename}"
        except Exception as e:
            print("Failed to save base64 profile photo:", e)
    elif photo_data and isinstance(photo_data, str) and photo_data.startswith('/uploads/'):
        user.profile_photo = photo_data

    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Profile updated successfully.',
        'user': user.to_dict()
    }), 200

@auth_bp.route('/profile/photo', methods=['POST'])
def upload_profile_photo():
    """
    POST /api/profile/photo
    Multipart photo upload endpoint for authenticated user profile.
    """
    import time
    from werkzeug.utils import secure_filename

    email = request.form.get('email', '').strip().lower()
    student_id = request.form.get('student_id', '').strip().upper()
    requester_email = (request.form.get('requester_email') or request.form.get('auth_email') or '').strip().lower()
    requester_id = request.form.get('requester_id')

    user = None
    if email:
        user = User.query.filter(User.email.ilike(email)).first()
    elif student_id:
        user = User.query.filter_by(student_id=student_id).first()

    if not user:
        return jsonify({'success': False, 'message': 'Authenticated user record not found.'}), 404

    # Security Check: Ensure caller cannot upload photo for another user's profile unless ADMIN
    if requester_email and requester_email != user.email.lower():
        req_user = User.query.filter(User.email.ilike(requester_email)).first()
        if not req_user or req_user.role != 'ADMIN':
            return jsonify({'success': False, 'message': "You are not authorized to modify another user's profile photo."}), 403

    if requester_id and int(requester_id) != user.id:
        req_user = User.query.get(requester_id)
        if not req_user or req_user.role != 'ADMIN':
            return jsonify({'success': False, 'message': "You are not authorized to modify another user's profile photo."}), 403

    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'No file uploaded.'}), 400

    file = request.files['file']
    if not file or file.filename == '':
        return jsonify({'success': False, 'message': 'No file selected.'}), 400

    filename = secure_filename(file.filename)
    ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
    if ext not in ['jpg', 'jpeg', 'png', 'webp']:
        return jsonify({'success': False, 'message': 'Unsupported image format. Allowed formats: JPG, JPEG, PNG, WEBP.'}), 400

    new_filename = f"avatar_{user.id}_{int(time.time())}.{ext}"
    uploads_dir = os.path.join(current_app.root_path, 'uploads', 'avatars')
    os.makedirs(uploads_dir, exist_ok=True)
    filepath = os.path.join(uploads_dir, new_filename)
    file.save(filepath)

    user.profile_photo = f"/uploads/avatars/{new_filename}"
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Profile photo uploaded successfully.',
        'profile_photo': user.profile_photo,
        'user': user.to_dict()
    }), 200
