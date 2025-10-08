import logging
from datetime import datetime
from schemas import MoodRequest

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

MOOD_DISPLAY = {
    "calm_weather": "Спокойная погода",
    "waterfall": "Водопад", 
    "forest": "Лес",
    "thunderstorm": "Гроза", 
    "night_sky": "Ночное небо"
}


def log_mood(request: MoodRequest):
    """Логируем выбранное настроение"""
    mood_name = MOOD_DISPLAY.get(request.mood, request.mood)
    
    logger.info("=" * 100)
    logger.info(f"Пользователь выбрал: '{mood_name}'")
    logger.info(f"Длительность: {request.duration} сек.")
    logger.info(f"Данные: {request.dict()}")
    logger.info("=" * 100)
    
    return {
        "status": "success", 
        "message": f"Настроение '{mood_name}' записано в лог!",
        "logged_data": request.dict(),
        "timestamp": datetime.now().isoformat()
    }