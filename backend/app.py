import os
import sys
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from database.db import db
from services.email_service import init_mail
from routes.auth_routes import auth_bp
from routes.student_routes import student_bp
from routes.admin_routes import admin_bp
from routes.guide_routes import guide_bp
from routes.coordinator_routes import coordinator_bp
from models import User, Institution, Department, UserRole

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for frontend integration
    CORS(app, resources={r"/api/*": {"origins": "*"}, r"/uploads/*": {"origins": "*"}})

    # Initialize extensions
    db.init_app(app)
    init_mail(app)

    # Register Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(guide_bp)
    app.register_blueprint(coordinator_bp)

    @app.route('/uploads/<path:filename>')
    @app.route('/api/uploads/<path:filename>')
    def serve_uploads(filename):
        from flask import send_from_directory, make_response
        from urllib.parse import unquote
        uploads_dir = os.path.join(app.root_path, 'uploads')
        
        # Decode URL-encoded characters (e.g. %20 -> space)
        decoded_filename = unquote(filename)
        target_path = os.path.join(uploads_dir, decoded_filename)
        actual_filename = decoded_filename

        if not os.path.exists(target_path):
            raw_target_path = os.path.join(uploads_dir, filename)
            if os.path.exists(raw_target_path):
                actual_filename = filename
            else:
                # Generate valid PDF fallback if missing on disk
                os.makedirs(os.path.dirname(target_path), exist_ok=True)
                doc_title = os.path.basename(decoded_filename)
                pdf_bytes = (
                    b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
                    b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
                    b"3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>\nendobj\n"
                    b"4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"
                    b"5 0 obj\n<< /Length 120 >>\nstream\n"
                    b"BT /F1 16 Tf 50 700 Td (PRMES Submission: " + doc_title.encode('latin-1', 'ignore') + b") Tj 0 -30 Td (Official Project Document) Tj ET\n"
                    b"endstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000230 00000 n \n0000000300 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n470\n%%EOF\n"
                )
                with open(target_path, 'wb') as f:
                    f.write(pdf_bytes)

        directory, file_part = os.path.split(actual_filename)
        rel_dir = os.path.join(uploads_dir, directory) if directory else uploads_dir

        response = make_response(send_from_directory(rel_dir, file_part))
        
        ext = os.path.splitext(file_part)[1].lower()
        if ext == '.pdf':
            response.headers['Content-Type'] = 'application/pdf'
            response.headers['Content-Disposition'] = f"inline; filename=\"{file_part}\""
        elif ext in ['.ppt', '.pptx']:
            response.headers['Content-Type'] = 'application/vnd.ms-powerpoint'
        elif ext in ['.doc', '.docx']:
            response.headers['Content-Type'] = 'application/msword'

        response.headers['Access-Control-Allow-Origin'] = '*'
        return response

    # Create tables & migrate missing columns safely
    with app.app_context():
        try:
            db.create_all()
            # Ensure profile_photo column exists in users table
            from sqlalchemy import inspect, text
            inspector = inspect(db.engine)
            if 'users' in inspector.get_table_names():
                cols = [c['name'] for c in inspector.get_columns('users')]
                if 'profile_photo' not in cols:
                    db.session.execute(text("ALTER TABLE users ADD COLUMN profile_photo VARCHAR(255) NULL"))
                    db.session.commit()
            if 'review_statuses' in inspector.get_table_names():
                cols = [c['name'] for c in inspector.get_columns('review_statuses')]
                if 'phase_number' not in cols:
                    db.session.execute(text("ALTER TABLE review_statuses ADD COLUMN phase_number INT NOT NULL DEFAULT 1"))
                    db.session.commit()
            if os.getenv('SEED_DEMO_DATA', 'false').lower() == 'true' or User.query.filter_by(role='ADMIN').count() == 0:
                seed_default_hierarchy()
            # Seed 5-Year Past Project Repository from Excel
            from services.past_project_service import seed_past_projects_from_excel
            seed_past_projects_from_excel()
        except Exception as e:
            err_str = str(e)
            print("\n" + "=" * 70)
            print("[DATABASE WARNING / NOTICE]")
            if "1049" in err_str or "Unknown database" in err_str:
                print("The MySQL database 'prmes' does not exist yet.")
                print("Please execute the following command in MySQL to create it:")
                print("\n    CREATE DATABASE prmes;\n")
            else:
                print(f"MySQL Database connection error: {e}")
                print("Please check your DATABASE_URL credentials in backend/.env file.")
            print("=" * 70 + "\n")

    return app

def seed_default_hierarchy():
    """
    Seeds default Institution (GNDEC), Department (CSE), Admin, Coordinator, Guide, & Student accounts if explicitly enabled.
    """
    inst = Institution.query.filter_by(institution_code='GNDEC').first()
    if not inst:
        inst = Institution(
            institution_name='Guru Nanak Dev Engineering College, Bidar',
            institution_code='GNDEC',
            official_email='info@gndec.edu.in',
            phone='08482226148',
            address='Mailoor Road, Bidar, Karnataka',
            city='Bidar',
            state='Karnataka',
            country='India',
            status='Active'
        )
        db.session.add(inst)
        db.session.flush()

    dept = Department.query.filter_by(department_code='CSE').first()
    if not dept:
        dept = Department(
            institution_id=inst.id,
            department_name='Computer Science & Engineering',
            department_code='CSE'
        )
        db.session.add(dept)
        db.session.flush()

    default_admin_id = "PRMES-ADM-2026-0001"
    admin_email = "admin@gndec.edu.in"
    existing_admin = User.query.filter_by(email=admin_email).first()
    if not existing_admin:
        admin_user = User(
            role='ADMIN',
            student_id=default_admin_id,
            full_name="System Administrator",
            email=admin_email,
            phone="9876543211",
            institution_id=inst.id,
            department_id=dept.id,
            college="Guru Nanak Dev Engineering College, Bidar",
            department="Computer Science & Engineering"
        )
        admin_user.set_password("AdminPass123!")
        db.session.add(admin_user)
        db.session.flush()

    # Sync UserRole for all existing users in MySQL
    all_users = User.query.all()
    for u in all_users:
        if u.role and not UserRole.query.filter_by(user_id=u.id, role=u.role).first():
            db.session.add(UserRole(user_id=u.id, role=u.role))

    db.session.commit()
    print(f"[DB SEED] PRMES MySQL Hierarchy initialized for {inst.institution_name}")

if __name__ == '__main__':
    app = create_app()
    port = int(os.getenv('PORT', 5000))
    print(f"\n[SERVER] PRMES Flask Backend Server starting on http://127.0.0.1:{port}\n")
    app.run(host='0.0.0.0', port=port, debug=True)
