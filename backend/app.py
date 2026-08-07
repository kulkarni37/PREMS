import os
import sys
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from database.db import db
from services.email_service import init_mail
from routes.auth_routes import auth_bp
from models.user import User

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

    @app.route('/')
    def root():
        return jsonify({
            'status': 'online',
            'system': 'PRMES API Backend',
            'version': '1.0.0',
            'institution': 'Guru Nanak Dev Engineering College, Bidar'
        })

    # Create tables & seed default test student if database is fresh
    with app.app_context():
        db.create_all()
        seed_default_user()

    return app

def seed_default_user():
    """
    Seeds a default student account for instant testing if database is empty.
    """
    default_student_id = "PRMES-STU-2026-0001"
    default_email = "you@gndec.edu.in"

    existing = User.query.filter_by(student_id=default_student_id).first()
    if not existing:
        student = User(
            student_id=default_student_id,
            full_name="PRMES Student User",
            usn="3GN22CS045",
            email=default_email,
            phone="9876543210",
            college="Guru Nanak Dev Engineering College, Bidar",
            department="Computer Science & Engineering",
            semester="7th Semester",
            section="A"
        )
        student.set_password("Password123!")
        db.session.add(student)
        db.session.commit()
        print(f"[DB SEED] Sample student initialized: {default_student_id} ({default_email})")

if __name__ == '__main__':
    app = create_app()
    port = int(os.getenv('PORT', 5000))
    print(f"\n[SERVER] PRMES Flask Backend Server starting on http://127.0.0.1:{port}\n")
    app.run(host='0.0.0.0', port=port, debug=True)
