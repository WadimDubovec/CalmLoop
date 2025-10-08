# utils.py

from datetime import datetime

def get_mood_display_name(mood_key: str) -> str:
    """Возвращает отображаемое имя настроения по ключу"""
    names = {
        "calm_weather": "Спокойная погода",
        "waterfall": "Водопад",
        "forest": "Лес",
        "thunderstorm": "Гроза",
        "night_sky": "Ночное небо"
    }
    return names.get(mood_key, mood_key)

def current_timestamp() -> str:
    """Возвращает текущую дату и время в ISO формате"""
    return datetime.utcnow().isoformat()
