import os
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText

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
        # Connect to the SMTP server
        server = smtplib.SMTP(SMTP_SERVER, 587)
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)

        for recipient_email in recipients:
            msg = MIMEText(message)
            msg['Subject'] = subject
            msg['From'] = sender_email
            msg['To'] = recipient_email

            server.sendmail(sender_email, recipient_email, msg.as_string())
            print(f"Email sent successfully to {recipient_email}")

        server.quit()
    except smtplib.SMTPException as e:
        print(f"Failed to send email using SMTP: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
