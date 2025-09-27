from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging
from datetime import datetime

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="CalmLoop API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class MoodRequest(BaseModel):
    mood: str
    duration: int

@app.post("/api/log-mood")
async def log_mood(request: MoodRequest):
    """Логируем выбранное настроение"""
    
    mood_display = {
        "calm": "Спокойное",
        "happy": "Радостное", 
        "sad": "Грустное",
        "angry": "Злое", 
        "dream": "Сонливое"
    }
    
    mood_name = mood_display.get(request.mood, request.mood)
    
    logger.info(f"🎭 Пользователь выбрал: '{mood_name}'")
    logger.info(f"⏱ Длительность: {request.duration} сек.")
    logger.info(f"📊 Данные: {request.dict()}")
    logger.info("-" * 50)
    
    return {
        "status": "success", 
        "message": f"Настроение '{mood_name}' записано в лог!",
        "logged_data": request.dict(),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/")
async def root():
    return {"message": "CalmLoop API работает!", "status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)