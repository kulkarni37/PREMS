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
from models import User, Institution, Department

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for frontend integration
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize extensions
    db.init_app(app)
    init_mail(app)

    # Register Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(admin_bp)

    @app.route('/')
    def root():
        return jsonify({
            'status': 'online',
            'system': 'PRMES API Backend (MySQL Engine)',
            'version': '2.1.0',
            'database': 'MySQL'
        })

    # Create tables
    with app.app_context():
        try:
            db.create_all()
            if os.getenv('SEED_DEMO_DATA', 'false').lower() == 'true':
                seed_default_hierarchy()
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
            phone='08482-226148',
            address='Mailoor Road, Bidar, Karnataka',
            state='Karnataka',
            contact_person='Principal Office'
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

    db.session.commit()
    print(f"[DB SEED] PRMES MySQL Hierarchy initialized for {inst.institution_name}")

if __name__ == '__main__':
    app = create_app()
    port = int(os.getenv('PORT', 5000))
    print(f"\n[SERVER] PRMES Flask Backend Server starting on http://127.0.0.1:{port}\n")
    app.run(host='0.0.0.0', port=port, debug=True)
