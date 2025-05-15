import os
from dotenv import load_dotenv
import smtplib

load_dotenv()

SMTP_SERVER = os.getenv("SMTP_SERVER", "email-smtp.us-east-1.amazonaws.com")
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "default_smtp_api_key")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "default_smtp_password")

def send_email(recipients, message, subject="Notification"):
    """
    Sends an email to the specified recipients with the given message and subject using AWS SES.

    Args:
        recipients (list): List of email addresses to send the email to.
        message (str): The message content of the email.
        subject (str): The subject of the email. Defaults to "Notification".
    """
    sender_email = "no-reply@email.secuboard.live"

    try:
        server = smtplib.SMTP(SMTP_SERVER)
        server.connect(SMTP_SERVER, 587)
        server.starttls()
        print(SMTP_PASSWORD)
        print(SMTP_USERNAME)
        server.login(SMTP_USERNAME, SMTP_PASSWORD)

        for recipient_email in recipients:
            msg = f"From: {sender_email}\nTo: {recipient_email}\nSubject: {subject}\n\n{message}"
            server.sendmail(sender_email, recipient_email, msg)
            print(f"Email sent successfully to {recipient_email}")

        server.quit()
    except smtplib.SMTPException as e:
        print(f"Failed to send email using SMTP: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
