from datetime import datetime, timezone, timedelta
from app.db.session import SessionLocal
from app.db.models import User
from app.services.weather import fetch_weather_forecast
from app.services.sms import send_sms_alert
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import logging

logger = logging.getLogger(__name__)

async def check_weather_and_notify():
    logger.info(f"Running weather check at {datetime.now()}")
    db = SessionLocal()
    try:
        # Get all users who have alerts enabled and a valid city/phone
        users = db.query(User).filter(
            User.alerts_enabled == True,
            User.city.isnot(None),
            User.phone_number.isnot(None)
        ).all()
        
        # Group users by city to minimize API calls
        cities = {user.city for user in users}
        
        for city in cities:
            max_rain_mm = await fetch_weather_forecast(city)
            logger.info(f"City {city} max rain forecast (next 12h): {max_rain_mm}mm")
            
            # Find users in this city whose threshold is met
            city_users = [u for u in users if u.city == city]
            for user in city_users:
                # Check if rain is greater or equal to user's threshold and 
                # we haven't sent an alert in the last 12 hours
                if max_rain_mm >= user.rain_threshold_mm:
                    now = datetime.now(timezone.utc)
                    if user.last_alert_sent is None or (now - user.last_alert_sent) > timedelta(hours=12):
                        message = f"🌧️ Rain Alert! Expect up to {max_rain_mm}mm of rain in {city} in the next 12 hours."
                        success = send_sms_alert(user.phone_number, message)
                        if success:
                            user.last_alert_sent = now
                            db.commit()
                            
    except Exception as e:
        logger.error(f"Error in background weather task: {e}")
    finally:
        db.close()

scheduler = AsyncIOScheduler()

def start_scheduler():
    # Run the job every 30 minutes
    scheduler.add_job(check_weather_and_notify, 'interval', minutes=30)
    scheduler.start()
    logger.info("Scheduler started.")
