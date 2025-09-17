import base64
import os.path
from email.message import EmailMessage

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build


GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REFRESH_TOKEN = os.getenv("GOOGLE_REFRESH_TOKEN")
SENDER_EMAIL = os.getenv("SENDER_EMAIL")


# If modifying these scopes, delete the file token.json
SCOPES = ["https://www.googleapis.com/auth/gmail.send"]

def gmail_send_message(addressee, subj, msg):
    """
  Create and send an email message
  Print the returned  message id
  Returns: Message object, including message id

  Load pre-authorized user credentials from the environment.

  Code amended by AYL to for auth using client data from .env and to build service
  """
    print("running gmail_send_email")

    creds = Credentials(
        None,  # access_token (None means it will refresh when needed)
        refresh_token=GOOGLE_REFRESH_TOKEN,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        scopes=SCOPES,
    )

    try:
        service = build("gmail", "v1", credentials=creds)
        print("authentication seems to work and service resource built")
        message = EmailMessage()

        message.set_content(msg)

        message["To"] = addressee
        message["From"] = SENDER_EMAIL
        message["Subject"] = subj

        # encoded message
        encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
        create_message = {"raw": encoded_message}

        send_message = service.users().messages().send(userId="me", body=create_message).execute()

        return f'Message Id: {send_message["id"]}'

    except Exception as e:
        print(f"An error occurred: {e}")
        send_message = None

    print(send_message)
    return send_message
