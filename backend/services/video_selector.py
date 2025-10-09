import random
from pathlib import Path

def select_random_video(mood: str) -> str:
    """
    Выбирает случайное видео из папки backend/services/files/{mood}/video.
    Возвращает полный путь к выбранному видео.
    """
    BASE_DIR = Path(__file__).resolve().parent
    VIDEO_DIR = BASE_DIR / "files" / mood / "video"

    if not VIDEO_DIR.exists():
        raise FileNotFoundError(f"❌ Папка {VIDEO_DIR} не найдена")

    VIDEO_EXTENSIONS = [".mp4", ".mov", ".avi"]
    videos = [f for f in VIDEO_DIR.iterdir() if f.suffix.lower() in VIDEO_EXTENSIONS]

    if not videos:
        raise FileNotFoundError(f"❌ Нет доступных видео в {VIDEO_DIR}")

    selected_video = random.choice(videos)
    print(f"🎬 Выбрано видео для настроения '{mood}': {selected_video}")
    return str(selected_video)
