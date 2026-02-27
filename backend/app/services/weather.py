import httpx
from app.core.config import settings

async def fetch_weather_forecast(city: str) -> float:
    """
    Fetches the 5-day/3-hour forecast for the given city using OpenWeather API.
    Returns the maximum expected rain (in mm) within the next 12 hours.
    """
    if not settings.OPENWEATHER_API_KEY:
        print("Warning: OPENWEATHER_API_KEY is not set.")
        return 0.0

    url = f"https://api.openweathermap.org/data/2.5/forecast?q={city}&appid={settings.OPENWEATHER_API_KEY}&units=metric"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            
            # Look at the next 4 forecasts (3 hours each = 12 hours)
            recent_forecasts = data.get("list", [])[:4]
            max_rain = 0.0
            
            for forecast in recent_forecasts:
                # OpenWeather returns rain for the last 3 hours in the '3h' key
                rain_data = forecast.get("rain", {})
                rain_3h = rain_data.get("3h", 0.0)
                if rain_3h > max_rain:
                    max_rain = rain_3h
                    
            return max_rain
    except Exception as e:
        print(f"Error fetching weather for {city}: {e}")
        return 0.0
