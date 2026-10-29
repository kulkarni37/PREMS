from database.db import db

class GuideSpecialization(db.Model):
    __tablename__ = 'guide_specializations'

    id = db.Column(db.Integer, primary_key=True)
    guide_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    domain_name = db.Column(db.String(150), nullable=False)
    preference_order = db.Column(db.Integer, nullable=False)  # 1, 2, or 3

    __table_args__ = (
        db.UniqueConstraint('guide_id', 'preference_order', name='uq_guide_pref_order'),
        db.UniqueConstraint('guide_id', 'domain_name', name='uq_guide_pref_domain'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'guide_id': self.guide_id,
            'domain_name': self.domain_name,
            'preference_order': self.preference_order
        }
