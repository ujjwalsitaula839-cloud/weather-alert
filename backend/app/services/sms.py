from twilio.rest import Client
from app.core.config import settings

def send_sms_alert(to_phone: str, message: str) -> bool:
    """
    Sends an SMS using the Twilio API.
    """
    if not all([settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN, settings.TWILIO_PHONE_NUMBER]):
        print("Warning: Twilio credentials not set. SMS not sent.")
        print(f"Mock SMS to {to_phone}: {message}")
        return False
        
    try:
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        message = client.messages.create(
            body=message,
            from_=settings.TWILIO_PHONE_NUMBER,
            to=to_phone
        )
        print(f"Sent SMS alert to {to_phone} (SID: {message.sid})")
        return True
    except Exception as e:
        print(f"Error sending SMS to {to_phone}: {e}")
        return False
