import requests
import os
from dotenv import load_dotenv

load_dotenv()

MAILTRAP_API_URL = os.getenv("MAILTRAP_API_URL", "https://sandbox.api.mailtrap.io/api/send/2548160")
MAILTRAP_API_KEY = os.getenv("MAILTRAP_API_KEY", "default_api_key")

def send_email(recipients, message, subject="Notification"):
    """
    Sends an email to the specified recipients with the given message and subject.

    Args:
        recipients (list): List of email addresses to send the email to.
        message (str): The message content of the email.
        subject (str): The subject of the email. Defaults to "Notification".
    """
    payload = {
        "from": {"email": "hello@example.com", "name": "Mailtrap Test"},
        "to": [{"email": email} for email in recipients],
        "subject": subject,
        "text": message,
        "category": "Notification"
    }
    headers = {
        "Authorization": f"Bearer {MAILTRAP_API_KEY}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(MAILTRAP_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        print(f"Emails sent successfully: {response.json()}")
    except requests.exceptions.RequestException as e:
        print(f"Failed to send emails: {e}")
