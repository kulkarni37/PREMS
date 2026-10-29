from datetime import datetime, timezone
from database.db import db

class PastProject(db.Model):
    __tablename__ = 'past_projects'

    id = db.Column(db.Integer, primary_key=True)
    project_title = db.Column(db.Text, nullable=False)
    source_period = db.Column(db.String(50), nullable=False) # e.g. '2018-22', '2019-23', '2020-24', '2021-25', '2022-25'
    group_no = db.Column(db.String(50), nullable=True) # e.g. 'G1', 'G2'
    guide_name = db.Column(db.String(255), nullable=True) # e.g. 'Prof. Suresh C'
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'project_title': self.project_title,
            'source_period': self.source_period,
            'group_no': self.group_no,
            'guide_name': self.guide_name,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
