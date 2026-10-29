import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'prmes_secret_key_2026_gndec_cse')

    # Database Configuration (MySQL with PyMySQL driver)
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        'mysql+pymysql://root:root@localhost:3306/prmes'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Flask-Mail SMTP Configuration (Dedicated PRMES Gmail Account)
    MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'True').lower() in ['true', 'on', '1']
    MAIL_USE_SSL = os.getenv('MAIL_USE_SSL', 'False').lower() in ['true', 'on', '1']
    MAIL_USERNAME = os.getenv('MAIL_USERNAME', '')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD', '')
    MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER', f"PRMES Team <{os.getenv('MAIL_USERNAME', 'prmes.gndec@gmail.com')}>")

    # Guide & Coordinator Self-Registration Security Secret Codes
    GUIDE_REGISTRATION_CODE = os.getenv('GUIDE_REGISTRATION_CODE', 'PRMES_GUIDE_SECRET_2026')
    COORDINATOR_REGISTRATION_CODE = os.getenv('COORDINATOR_REGISTRATION_CODE', 'PRMES_COORDINATOR_SECRET_2026')

