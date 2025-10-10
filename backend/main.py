from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from schemas import MoodRequest
from services import log_service
from services import video_selector  

app = FastAPI(title="CalmLoop API Gateway")

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        
    allow_methods=["*"],        
    allow_headers=["*"],        
)

# Роут для проверки сервера
@app.get("/")
async def root():
    return {"message": "CalmLoop API Gateway работает!", "status": "ok"}

# Роут для логирования настроения
@app.post("/api/log-mood")
async def log_mood(request: MoodRequest):
    result = log_service.log_mood(request)
    return result

# Роут для генерации видео через ML сервис

@app.post("/api/generate-video")
async def generate_video_endpoint(request: MoodRequest):
    try:
        video_path = video_selector.select_random_video(request.mood)
        return FileResponse(video_path)  # ✅ Отдаем файл напрямую
    except FileNotFoundError as e:
        return {"status": "error", "message": str(e)}