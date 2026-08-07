import secrets
from datetime import datetime, timedelta, timezone
from database.db import db
from models.otp import OTP

class OTPService:
    @staticmethod
    def generate_otp():
        """
        Generate a cryptographically secure 6-digit numeric OTP.
        """
        return f"{secrets.randbelow(1000000):06d}"

    @staticmethod
    def is_rate_limited(email, student_id):
        """
        Rate limiting check: Prevents spamming by checking if more than 3 active
        OTPs were requested for this email/student_id within the last 5 minutes.
        """
        now = datetime.now(timezone.utc)
        five_mins_ago = now - timedelta(minutes=5)

        recent_count = OTP.query.filter(
            (OTP.email == email) | (OTP.student_id == student_id),
            OTP.created_at >= five_mins_ago
        ).count()

        return recent_count >= 3

    @staticmethod
    def create_otp(student_id, email):
        """
        Create and store a new 6-digit OTP record with 5 minutes expiration.
        Invalidates any prior unverified OTPs for the same student/email.
        """
        # Invalidate previous unverified OTPs
        previous_otps = OTP.query.filter_by(student_id=student_id, email=email, verified=False).all()
        for old_otp in previous_otps:
            old_otp.verified = True # mark as invalidated

        otp_code = OTPService.generate_otp()
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(minutes=5)

        new_otp = OTP(
            student_id=student_id,
            email=email.lower().strip(),
            otp=otp_code,
            created_at=now,
            expires_at=expires_at,
            verified=False
        )

        db.session.add(new_otp)
        db.session.commit()
        return new_otp

    @staticmethod
    def verify_otp(student_id, email, otp_code):
        """
        Verify the provided 6-digit OTP code against the database.
        Checks:
        1. Matching student_id and email
        2. Matching 6-digit OTP code
        3. Not previously verified/used
        4. Not expired (within 5 mins)
        If valid, marks as verified and returns (True, message).
        """
        email_clean = email.lower().strip()
        otp_clean = str(otp_code).strip()
        student_id_clean = student_id.strip()

        # Find latest unverified OTP record
        record = OTP.query.filter_by(
            student_id=student_id_clean,
            email=email_clean,
            otp=otp_clean,
            verified=False
        ).order_by(OTP.created_at.desc()).first()

        if not record:
            return False, "Invalid OTP verification code. Please check and try again."

        now = datetime.now(timezone.utc)
        expires_at = record.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        if now > expires_at:
            return False, "OTP has expired. Please request a new verification code."

        # Mark OTP as verified
        record.verified = True
        db.session.commit()
        return True, "OTP verified successfully."

    @staticmethod
    def is_otp_verified(student_id, email, otp_code=None):
        """
        Check if an OTP was successfully verified for this student/email within the last 15 minutes.
        Used to authorize password resets.
        """
        email_clean = email.lower().strip()
        student_id_clean = student_id.strip()
        fifteen_mins_ago = datetime.now(timezone.utc) - timedelta(minutes=15)

        query = OTP.query.filter_by(
            student_id=student_id_clean,
            email=email_clean,
            verified=True
        )

        if otp_code:
            query = query.filter_by(otp=str(otp_code).strip())

        record = query.order_by(OTP.created_at.desc()).first()
        if not record:
            return False

        created_at = record.created_at
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)

        return created_at >= fifteen_mins_ago

    @staticmethod
    def delete_otps_for_user(student_id, email):
        """
        Permanently delete OTP records after a successful password reset.
        """
        email_clean = email.lower().strip()
        student_id_clean = student_id.strip()

        OTP.query.filter_by(student_id=student_id_clean, email=email_clean).delete()
        db.session.commit()
