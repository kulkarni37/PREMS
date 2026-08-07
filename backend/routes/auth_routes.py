from flask import Blueprint, request, jsonify
from database.db import db
from models.user import User
from services.otp_service import OTPService
from services.email_service import EmailService

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """
    POST /api/auth/forgot-password
    Expects: { "email": "you@gndec.edu.in", "student_id": "PRMES-STU-2026-0001" }
    """
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    student_id = data.get('student_id', '').strip()

    if not email or not student_id:
        return jsonify({
            'success': False,
            'message': 'Both College Email Address and Student ID are required.'
        }), 400

    # 1. Verify Student ID exists
    user = User.query.filter_by(student_id=student_id).first()
    if not user:
        return jsonify({
            'success': False,
            'message': 'Student ID not found in PRMES system.'
        }), 404

    # 2. Verify email belongs to that Student ID
    if user.email.lower() != email:
        return jsonify({
            'success': False,
            'message': 'The provided email address does not match the registered email for this Student ID.'
        }), 400

    # 3. Rate limiting check
    if OTPService.is_rate_limited(email, student_id):
        return jsonify({
            'success': False,
            'message': 'Too many OTP requests. Please wait 5 minutes before requesting another code.'
        }), 429

    # 4. Generate & store 6-digit OTP
    otp_record = OTPService.create_otp(student_id, email)

    # 5. Dispatch email via EmailService
    email_sent = EmailService.send_otp_email(user.email, otp_record.otp)

    return jsonify({
        'success': True,
        'message': 'A verification code has been sent to your registered college email address.',
        'email_sent': email_sent
    }), 200

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    """
    POST /api/auth/verify-otp
    Expects: { "student_id": "PRMES-STU-2026-0001", "email": "you@gndec.edu.in", "otp": "123456" }
    """
    data = request.get_json() or {}
    student_id = data.get('student_id', '').strip()
    email = data.get('email', '').strip().lower()
    otp = data.get('otp', '').strip()

    if not student_id or not email or not otp:
        return jsonify({
            'success': False,
            'message': 'Student ID, Email, and OTP code are required.'
        }), 400

    # Verify OTP logic
    is_valid, message = OTPService.verify_otp(student_id, email, otp)
    if not is_valid:
        return jsonify({
            'success': False,
            'message': message
        }), 400

    return jsonify({
        'success': True,
        'message': message
    }), 200

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """
    POST /api/auth/reset-password
    Expects: { "student_id": "...", "email": "...", "otp": "...", "new_password": "..." }
    """
    data = request.get_json() or {}
    student_id = data.get('student_id', '').strip()
    email = data.get('email', '').strip().lower()
    otp = data.get('otp', '').strip()
    new_password = data.get('new_password', '')

    if not student_id or not email or not new_password:
        return jsonify({
            'success': False,
            'message': 'All fields are required.'
        }), 400

    if len(new_password) < 6:
        return jsonify({
            'success': False,
            'message': 'Password must be at least 6 characters long.'
        }), 400

    # Verify that an OTP was verified for this user
    if not OTPService.is_otp_verified(student_id, email, otp):
        return jsonify({
            'success': False,
            'message': 'OTP verification required before resetting password.'
        }), 400

    # Find user and update password
    user = User.query.filter_by(student_id=student_id).first()
    if not user or user.email.lower() != email:
        return jsonify({
            'success': False,
            'message': 'User record not found.'
        }), 404

    # Hash new password using Werkzeug
    user.set_password(new_password)
    db.session.commit()

    # Delete OTP records after successful reset
    OTPService.delete_otps_for_user(student_id, email)

    return jsonify({
        'success': True,
        'message': 'Password has been updated successfully! You can now log in.'
    }), 200

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    POST /api/auth/register
    Creates a new student user in the database and sends a welcome email.
    """
    data = request.get_json() or {}
    full_name = data.get('fullName', '').strip()
    usn = data.get('usn', '').strip().upper()
    email = data.get('email', '').strip().lower()
    phone = data.get('phone', '').strip()
    password = data.get('password', '')
    college = data.get('college', 'Guru Nanak Dev Engineering College, Bidar')
    department = data.get('department', 'Computer Science & Engineering')
    semester = data.get('semester', '7th Semester')
    section = data.get('section', 'A')

    if not full_name or not usn or not email or not password:
        return jsonify({'success': False, 'message': 'Full Name, USN, Email, and Password are required.'}), 400

    if User.query.filter((User.email == email) | (User.usn == usn)).first():
        return jsonify({'success': False, 'message': 'An account with this Email or USN already exists.'}), 400

    # Auto-generate Student ID format: PRMES-STU-2026-XXXX
    count = User.query.count() + 1
    student_id = f"PRMES-STU-2026-{count:04d}"

    user = User(
        student_id=student_id,
        full_name=full_name,
        usn=usn,
        email=email,
        phone=phone,
        college=college,
        department=department,
        semester=semester,
        section=section
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    # Send Welcome Email
    EmailService.send_welcome_email(email, full_name, student_id)

    return jsonify({
        'success': True,
        'message': 'Student account created successfully!',
        'student_id': student_id,
        'user': user.to_dict()
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    POST /api/auth/login
    Authenticates a student by email and password.
    """
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and Password are required.'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'success': False, 'message': 'Invalid email or password.'}), 401

    return jsonify({
        'success': True,
        'message': 'Login successful!',
        'user': user.to_dict()
    }), 200
