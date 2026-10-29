from functools import wraps
from flask import request, jsonify
from models.user import User, VALID_ROLES

def check_department_access(user, target_department_id):
    """
    Verifies if a user is authorized to access data for target_department_id.
    - ADMIN: Returns True (organization-wide access).
    - COORDINATOR, GUIDE, TEAM_LEADER, STUDENT: Returns True ONLY if user.department_id matches target_department_id.
    """
    if not user:
        return False

    if getattr(user, 'is_admin', False) or user.role == 'ADMIN':
        return True

    if user.department_id is None or target_department_id is None:
        return False

    return str(user.department_id) == str(target_department_id)

def get_user_department_id(user):
    """
    Returns the department_id to filter by for backend queries.
    - ADMIN: Returns None (unrestricted organization-wide access).
    - COORDINATOR, GUIDE, TEAM_LEADER, STUDENT: Returns user.department_id.
    """
    if not user or getattr(user, 'is_admin', False) or user.role == 'ADMIN':
        return None
    return user.department_id

def validate_role(role_name):
    """
    Checks if a role string is one of the valid PRMES roles.
    """
    if not role_name:
        return False
    return role_name.strip().upper() in VALID_ROLES

def admin_required(f):
    """
    Decorator to protect Admin-only endpoints.
    Rejects Students, Guides, Coordinators with 403 Forbidden.
    Rejects unauthenticated callers with 401 Unauthorized.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        email = request.headers.get('X-User-Email') or request.args.get('email')
        admin_id = request.headers.get('X-Admin-ID') or request.args.get('admin_id')
        if not email and request.is_json:
            data = request.get_json(silent=True) or {}
            email = data.get('email')
            admin_id = data.get('admin_id')

        ident = str(email or admin_id or '').strip().lower()
        if ident:
            user = User.query.filter(
                (User.email == ident) |
                (User.student_id == ident.upper())
            ).first()
            if user:
                if user.has_role('ADMIN') or user.role == 'ADMIN':
                    return f(*args, **kwargs)
                return jsonify({
                    'success': False,
                    'message': 'Forbidden: Admin authorization required. Your role does not have administrative privileges.'
                }), 403

        # Fallback for local dev/initialization if no specific email provided
        admin_user = User.query.filter_by(role='ADMIN').first()
        if not admin_user:
            return f(*args, **kwargs)

        # If email was given and not found
        if ident:
            return jsonify({
                'success': False,
                'message': 'Forbidden: Administrator account not found.'
            }), 403

        return jsonify({
            'success': False,
            'message': 'Authentication Required: Please provide valid Administrator credentials.'
        }), 401

    return decorated_function

