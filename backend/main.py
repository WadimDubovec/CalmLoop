from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from schemas import MoodRequest
from services import log_service
from services.generate_video import generate_video_with_ai  

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

# Роут для генерации видео через AI

@app.post("/api/generate-video")
async def generate_video_endpoint(request: MoodRequest):
    try:
        print(f"🎬 Запрос на генерацию видео для настроения: {request.mood}")
        
        # Генерируем видео через AI
        video_path = generate_video_with_ai(request.mood)
        
        print(f"✅ Видео сгенерировано и сохранено: {video_path}")
        return FileResponse(video_path)  # ✅ Отдаем файл напрямую
        
    except ValueError as e:
        print(f"❌ Ошибка валидации: {e}")
        return {"status": "error", "message": str(e)}
    except Exception as e:
        print(f"❌ Ошибка генерации видео: {e}")
        return {"status": "error", "message": f"Ошибка генерации видео: {str(e)}"}