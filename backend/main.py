from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from schemas import MoodRequest
from services import log_service, ml_service

app = FastAPI(title="CalmLoop API Gateway")

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # Разрешить все домены (для разработки)
    allow_methods=["*"],        # Все методы (GET, POST и т.д.)
    allow_headers=["*"],        # Все заголовки
)

# Роут для проверки сервера
@app.get("/")
async def root():
    return {"message": "CalmLoop API Gateway работает!", "status": "ok"}

# Роут для логирования настроения
@app.post("/api/log-mood")
async def log_mood(request: MoodRequest):
    """
    Получает настроение и длительность от фронтенда и
    передает в сервис логирования.
    """
    result = log_service.log_mood(request)
    return result

# Роут для генерации видео через ML сервис
@app.post("/api/generate-video")
async def generate_video(request: MoodRequest):
    """
    Получает настроение и длительность,
    передает в ML сервис для генерации видео.
    """
    video_url = ml_service.generate_video(request)
    return {"status": "success", "video_url": video_url}




