import os
import sys
from dotenv import load_dotenv

load_dotenv('backend/.env')
sys.path.insert(0, os.path.abspath('backend'))

from app import create_app
from models import Team, User
from routes.guide_routes import get_review_student_marks

app = create_app()
with app.app_context():
    team = Team.query.get(32)
    print(f"Team id=32, team_id={team.team_id}")
    guide = User.query.get(team.guide_id)
    print(f"Guide: {guide.email}")

    with app.test_request_context(f'/api/guide/review-marks?team_id={team.team_id}&email={guide.email}'):
        res, code = get_review_student_marks()
        print(f"Response Code: {code}")
        print(f"JSON Response: {res.get_json()}")
