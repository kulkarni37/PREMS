from flask_mail import Mail, Message
from flask import current_app
import logging

mail = Mail()

def init_mail(app):
    mail.init_app(app)

class EmailService:
    @staticmethod
    def send_email(to_email, subject, body_text, body_html=None):
        """
        Base helper method to send an email using Flask-Mail.
        Gracefully handles errors and logs execution details.
        """
        try:
            sender = current_app.config.get('MAIL_DEFAULT_SENDER')
            msg = Message(
                subject=subject,
                recipients=[to_email],
                body=body_text,
                html=body_html,
                sender=sender
            )
            mail.send(msg)
            logging.info(f"Email successfully sent to {to_email} with subject '{subject}'")
            return True
        except Exception as e:
            logging.error(f"Failed to send email to {to_email}: {str(e)}")
            print(f"\n[EMAIL DISPATCH FAILURE / MOCK FALLBACK]\nTo: {to_email}\nSubject: {subject}\nBody:\n{body_text}\nError: {e}\n")
            return False

    @staticmethod
    def send_otp_email(to_email, otp):
        """
        Send Password Reset OTP verification email to student.
        """
        subject = "PRMES Password Reset Verification"
        body = (
            f"Hello,\n\n"
            f"A request was received to reset the password for your PRMES account.\n\n"
            f"Your One-Time Password (OTP) is:\n\n"
            f"{otp}\n\n"
            f"This OTP is valid for 5 minutes.\n\n"
            f"If you did not request this password reset, please ignore this email.\n\n"
            f"Regards,\n\n"
            f"PRMES Team\n\n"
            f"Guru Nanak Dev Engineering College\n"
            f"Department of Computer Science & Engineering"
        )

        html = f"""
        <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 30px; border-radius: 12px; background-color: #0e1728; color: #eef3f9; border: 1px solid rgba(45, 212, 232, 0.2);">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid rgba(148, 178, 209, 0.15);">
            <h2 style="color: #2dd4e8; margin: 0; font-size: 24px; letter-spacing: 1px;">PRMES</h2>
            <p style="color: #9fb0c6; margin-top: 5px; font-size: 13px;">Project Review Management &amp; Evaluation System</p>
          </div>
          <div style="padding: 24px 0;">
            <p style="font-size: 15px; line-height: 1.6; color: #eef3f9;">Hello,</p>
            <p style="font-size: 15px; line-height: 1.6; color: #9fb0c6;">A request was received to reset the password for your PRMES account.</p>
            <div style="margin: 28px 0; text-align: center;">
              <span style="display: inline-block; font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #06171d; background: linear-gradient(120deg, #2dd4e8, #7ce9f5); padding: 14px 32px; border-radius: 8px; box-shadow: 0 0 20px rgba(45, 212, 232, 0.3);">
                {otp}
              </span>
            </div>
            <p style="font-size: 14px; color: #f2a93b; text-align: center; font-weight: 500;">
              ⏱️ This OTP is valid for 5 minutes only.
            </p>
            <p style="font-size: 14px; line-height: 1.6; color: #6b7c93; margin-top: 20px;">
              If you did not request this password reset, please ignore this email or contact your department admin immediately.
            </p>
          </div>
          <div style="padding-top: 20px; border-top: 1px solid rgba(148, 178, 209, 0.15); text-align: center; font-size: 13px; color: #6b7c93;">
            <p style="margin: 0; font-weight: 600; color: #9fb0c6;">Regards, PRMES Team</p>
            <p style="margin: 4px 0 0;">Guru Nanak Dev Engineering College</p>
            <p style="margin: 2px 0 0;">Department of Computer Science &amp; Engineering</p>
          </div>
        </div>
        """
        return EmailService.send_email(to_email, subject, body, html)

    @staticmethod
    def send_welcome_email(to_email, full_name, student_id, role='STUDENT'):
        """
        Reusable email: Send Welcome Email after successful registration.
        """
        role_title = "Team Leader" if role == 'TEAM_LEADER' else "Student"
        subject = f"Welcome to PRMES - {role_title} Account Created"
        body = (
            f"Dear {full_name},\n\n"
            f"Welcome to PRMES (Project Review Management & Evaluation System)!\n"
            f"Your {role_title} account has been successfully registered.\n\n"
            f"Account ID: {student_id}\n\n"
            f"You can now sign in to PRMES to access your account.\n\n"
            f"Regards,\nPRMES Team\nGNDEC, Bidar"
        )
        return EmailService.send_email(to_email, subject, body)

    @staticmethod
    def send_team_added_email(to_email, student_name, team_id, project_title, leader_name, department, college):
        """
        Email sent when a Team Leader adds a student to a project team.
        Subject: PRMES — You Have Been Added to a Project Team
        """
        subject = "PRMES — You Have Been Added to a Project Team"
        body = (
            f"Dear {student_name},\n\n"
            f"You have been added to a project team on PRMES by {leader_name}.\n\n"
            f"Team ID: {team_id}\n"
            f"Project Title: {project_title}\n"
            f"Team Leader: {leader_name}\n"
            f"Department: {department}\n"
            f"Institution: {college}\n\n"
            f"You can now log in to PRMES to view your team, project workflow, review schedules, and daily diary.\n\n"
            f"Regards,\nPRMES Team\n{college}\n{department}"
        )
        html = f"""
        <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 30px; border-radius: 12px; background-color: #0e1728; color: #eef3f9; border: 1px solid rgba(45, 212, 232, 0.2);">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid rgba(148, 178, 209, 0.15);">
            <h2 style="color: #2dd4e8; margin: 0; font-size: 24px; letter-spacing: 1px;">PRMES</h2>
            <p style="color: #9fb0c6; margin-top: 5px; font-size: 13px;">Project Review Management &amp; Evaluation System</p>
          </div>
          <div style="padding: 24px 0;">
            <p style="font-size: 15px; line-height: 1.6; color: #eef3f9;">Dear {student_name},</p>
            <p style="font-size: 15px; line-height: 1.6; color: #9fb0c6;">You have been added to a project team on PRMES by <strong>{leader_name}</strong>.</p>
            <div style="margin: 20px 0; padding: 16px; background: rgba(45, 212, 232, 0.08); border-radius: 8px; border: 1px solid rgba(45, 212, 232, 0.2);">
              <p style="margin: 4px 0; font-size: 14px;"><strong>Team ID:</strong> <span style="color: #2dd4e8;">{team_id}</span></p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Project Title:</strong> {project_title}</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Team Leader:</strong> {leader_name}</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Department:</strong> {department}</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Institution:</strong> {college}</p>
            </div>
            <p style="font-size: 14px; line-height: 1.6; color: #9fb0c6;">
              Log in to your PRMES account to access your complete project dashboard, review schedules, and daily diary.
            </p>
          </div>
          <div style="padding-top: 20px; border-top: 1px solid rgba(148, 178, 209, 0.15); text-align: center; font-size: 13px; color: #6b7c93;">
            <p style="margin: 0; font-weight: 600; color: #9fb0c6;">Regards, PRMES Team</p>
            <p style="margin: 4px 0 0;">{college}</p>
            <p style="margin: 2px 0 0;">{department}</p>
          </div>
        </div>
        """
        return EmailService.send_email(to_email, subject, body, html)

    @staticmethod
    def send_guide_allocation_email(to_email, student_name, guide_name, project_title):
        subject = "PRMES - Guide Allocation Update"
        body = (
            f"Dear {student_name},\n\n"
            f"Your project guide for '{project_title}' has been assigned.\n\n"
            f"Guide Name: {guide_name}\n\n"
            f"Please coordinate with your assigned guide for upcoming review submissions.\n\n"
            f"Regards,\nPRMES Team\nGNDEC, Bidar"
        )
        return EmailService.send_email(to_email, subject, body)

    @staticmethod
    def send_review_schedule_email(to_email, student_name, review_name, date_time, room):
        subject = f"PRMES - {review_name} Schedule Announcement"
        body = (
            f"Dear {student_name},\n\n"
            f"The schedule for {review_name} has been published.\n\n"
            f"Date & Time: {date_time}\n"
            f"Venue / Room: {room}\n\n"
            f"Please ensure all required project documentation and presentations are ready.\n\n"
            f"Regards,\nPRMES Team\nGNDEC, Bidar"
        )
        return EmailService.send_email(to_email, subject, body)

    @staticmethod
    def send_marks_published_email(to_email, student_name, review_name, score, max_score):
        subject = f"PRMES - Evaluation Marks Published ({review_name})"
        body = (
            f"Dear {student_name},\n\n"
            f"Your evaluation marks for {review_name} have been published.\n\n"
            f"Score: {score} / {max_score}\n\n"
            f"Log in to PRMES to view detailed panel feedback.\n\n"
            f"Regards,\nPRMES Team\nGNDEC, Bidar"
        )
        return EmailService.send_email(to_email, subject, body)

    @staticmethod
    def send_announcement_email(to_email, title, message):
        subject = f"PRMES Announcement: {title}"
        body = (
            f"Dear Student,\n\n"
            f"{message}\n\n"
            f"Regards,\nPRMES Team\nGNDEC, Bidar"
        )
        return EmailService.send_email(to_email, subject, body)
