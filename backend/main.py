from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from schemas import MoodRequest
from services import log_service, video_selector  

app = FastAPI(title="CalmLoop API Gateway")

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        
    allow_methods=["*"],        
    allow_headers=["*"],        
)

# Раздаём папку с видео по /video/
app.mount("/video", StaticFiles(directory="services/files"), name="video")

@app.post("/api/generate-video")
async def generate_video_endpoint(request: MoodRequest):
    try:
        video_path = video_selector.select_random_video(request.mood)
        # URL для фронта
        video_url = f"/video/{request.mood}/video/{video_path.split('/')[-1]}"
        return {"status": "success", "video_url": video_url}
    except FileNotFoundError as e:
        return {"status": "error", "message": str(e)}
    except Exception as e:
        return {"status": "error", "message": f"Неизвестная ошибка: {e}"}
