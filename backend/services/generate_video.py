from http import HTTPStatus
from dashscope import VideoSynthesis
import dashscope
from dotenv import load_dotenv
import os
import requests
from pathlib import Path
from datetime import datetime
import time
from services.mood_prompts import MOOD_PROMPTS

# Загружаем переменные окружения
load_dotenv()

def initialize_dashscope():
    """Инициализация DashScope API"""
    API_KEY = os.getenv("DASHSCOPE_API_KEY")
    if not API_KEY:
        raise ValueError("❌ DASHSCOPE_API_KEY не найден в переменных окружения")
    
    dashscope.base_http_api_url = 'https://dashscope-intl.aliyuncs.com/api/v1'
    dashscope.api_key = API_KEY
    print("✅ DashScope API инициализирован")

def generate_video_with_ai(mood: str) -> str:
    """
    Генерирует видео для выбранного настроения используя AI.
    При ошибке AI использует готовые видео как fallback.
    Возвращает путь к сгенерированному видео.
    """
    print(f"🎬 Начинаем генерацию видео для настроения: {mood}")
    
    # Получаем промпт для настроения
    if mood not in MOOD_PROMPTS:
        raise ValueError(f"❌ Неизвестное настроение: {mood}")
    
    prompt_config = MOOD_PROMPTS[mood]
    prompt = prompt_config["prompt"]
    negative_prompt = prompt_config["negative_prompt"]
    
    print(f"📝 Промпт: {prompt[:100]}...")
    
    try:
        # Инициализируем API
        initialize_dashscope()
        
        # Подготавливаем параметры для генерации
        loop = prompt_config.get("loop", True)
        camera = prompt_config.get("camera", "static")
        
        # Улучшаем промпт для зацикленного видео
        enhanced_prompt = f"{prompt}. Camera: {camera}, seamless loop: {loop}"
        
        print(f"⏳ Генерируем зацикленное видео через AI...")
        print(f"📝 Камера: {camera}, Зацикливание: {loop}")
        
        # Засекаем время начала генерации
        start_time = time.time()
        print(f"🕐 Начало генерации: {datetime.now().strftime('%H:%M:%S')}")
        
        # Вызываем API для генерации видео
        rsp = VideoSynthesis.call(
            model='wan2.5-t2v-preview',
            prompt=enhanced_prompt,
            negative_prompt=negative_prompt,
            size='832*480'
        )
        
        if rsp.status_code == HTTPStatus.OK:
            # Вычисляем время генерации
            generation_time = time.time() - start_time
            video_url = rsp.output.video_url
            print(f"✅ Зацикленное видео сгенерировано за {generation_time:.1f} секунд: {video_url}")
            
            # Скачиваем и сохраняем видео с учетом параметров
            saved_path = download_and_save_video(video_url, mood, loop, camera)
            return saved_path
        else:
            raise Exception(f"❌ Ошибка генерации: {rsp.status_code}, {rsp.code}, {rsp.message}")
            
    except Exception as e:
        print(f"⚠️ AI генерация недоступна: {e}")
        print("🔄 Переключаемся на готовые видео...")
        return fallback_to_existing_video(mood)

def download_and_save_video(video_url: str, mood: str, loop: bool = True, camera: str = "static") -> str:
    """
    Скачивает видео по URL и сохраняет в соответствующую папку.
    Учитывает параметры зацикливания и камеры.
    """
    try:
        print(f"📥 Скачиваем видео: {video_url}")
        
        # Создаем папку для настроения если её нет
        BASE_DIR = Path(__file__).resolve().parent
        MOOD_VIDEO_DIR = BASE_DIR / "files" / mood / "video"
        MOOD_VIDEO_DIR.mkdir(parents=True, exist_ok=True)
        
        # Генерируем имя файла с параметрами зацикливания
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        loop_suffix = "_loop" if loop else "_no_loop"
        camera_suffix = f"_{camera}" if camera != "static" else ""
        filename = f"{mood}{loop_suffix}{camera_suffix}_{timestamp}.mp4"
        video_path = MOOD_VIDEO_DIR / filename
        
        # Скачиваем видео
        response = requests.get(video_url, stream=True)
        response.raise_for_status()
        
        with open(video_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        print(f"💾 Зацикленное видео сохранено: {video_path}")
        print(f"📊 Параметры: зацикливание: {loop}, камера: {camera}")
        return str(video_path)
        
    except Exception as e:
        print(f"❌ Ошибка при скачивании видео: {e}")
        # При ошибке скачивания тоже используем fallback
        print("🔄 Переключаемся на готовые видео...")
        return fallback_to_existing_video(mood)

def fallback_to_existing_video(mood: str) -> str:
    """
    Fallback функция - использует готовые видео при недоступности AI.
    Приоритет отдается зацикленным видео.
    """
    print(f"🔄 Используем готовые видео для настроения: {mood}")
    
    BASE_DIR = Path(__file__).resolve().parent
    VIDEO_DIR = BASE_DIR / "files" / mood / "video"
    
    if not VIDEO_DIR.exists():
        raise FileNotFoundError(f"❌ Папка {VIDEO_DIR} не найдена")
    
    VIDEO_EXTENSIONS = [".mp4", ".mov", ".avi"]
    videos = [f for f in VIDEO_DIR.iterdir() if f.suffix.lower() in VIDEO_EXTENSIONS]
    
    if not videos:
        raise FileNotFoundError(f"❌ Нет доступных видео в {VIDEO_DIR}")
    
    # Приоритет: зацикленные AI видео > обычные AI видео > готовые видео
    loop_videos = [v for v in videos if "_loop" in v.name]
    ai_videos = [v for v in videos if any(mood_name in v.name for mood_name in MOOD_PROMPTS.keys())]
    
    if loop_videos:
        selected_video = max(loop_videos, key=lambda x: x.stat().st_mtime)
        print(f"🎬 Используем зацикленное AI видео: {selected_video}")
    elif ai_videos:
        selected_video = max(ai_videos, key=lambda x: x.stat().st_mtime)
        print(f"🤖 Используем AI видео: {selected_video}")
    else:
        # Выбираем самое новое готовое видео
        videos.sort(key=lambda x: x.stat().st_mtime, reverse=True)
        selected_video = videos[0]
        print(f"📁 Используем готовое видео: {selected_video}")
    
    return str(selected_video)

def sample_sync_call_t2v(prompt: str):
    """Тестовая функция для проверки API"""
    initialize_dashscope()
    print('⏳ Пожалуйста, подождите...')
    rsp = VideoSynthesis.call(model='wan2.5-t2v-preview',
                              prompt=prompt,
                              size='832*480')
    print(rsp)
    if rsp.status_code == HTTPStatus.OK:
        print(f"✅ Видео URL: {rsp.output.video_url}")
    else:
        print('❌ Ошибка: status_code: %s, code: %s, message: %s' %
              (rsp.status_code, rsp.code, rsp.message))

if __name__ == '__main__':
    # Тестируем генерацию для каждого настроения
    test_prompt = 'A fixed security camera angle of an empty parking lot at night. Rain falls steadily under a streetlight, creating looping ripples in a puddle. no camera movement.'
    sample_sync_call_t2v(prompt=test_prompt)