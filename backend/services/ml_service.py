import random
from pathlib import Path

def generate_video(mood: str) -> str:
    """
    Генерирует видео для выбранного настроения.
    Возвращает путь к сгенерированному видео (например, с наложением картинки и музыки).
    """
    BASE_DIR = Path(__file__).resolve().parent
    FILES_DIR = BASE_DIR / "files"

    IMAGES_DIR = FILES_DIR / mood / "pictures"
    SOUNDS_DIR = FILES_DIR / mood / "music"

    IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg"]
    SOUND_EXTENSIONS = [".mp3", ".wav"]

    if not IMAGES_DIR.exists() or not SOUNDS_DIR.exists():
        raise FileNotFoundError(f"❌ Папка {IMAGES_DIR} или {SOUNDS_DIR} не найдена")

    IMAGES = [f for f in IMAGES_DIR.iterdir() if f.suffix.lower() in IMAGE_EXTENSIONS]
    SOUNDS = [f for f in SOUNDS_DIR.iterdir() if f.suffix.lower() in SOUND_EXTENSIONS]

    if not IMAGES or not SOUNDS:
        raise FileNotFoundError("❌ Нет доступных картинок или звуков для генерации видео")

    selected_image = random.choice(IMAGES)
    selected_sound = random.choice(SOUNDS)

    GENERATED_DIR = BASE_DIR / "generated_videos"
    GENERATED_DIR.mkdir(exist_ok=True)
    generated_video_path = GENERATED_DIR / f"{mood}.mp4"

    print(f"🎬 Генерируем видео: {generated_video_path}")
    print(f"🖼️ Используем картинку: {selected_image}")
    print(f"🎧 Используем звук: {selected_sound}")

    # Пока без ML модели, просто возвращаем путь
    return str(generated_video_path)
