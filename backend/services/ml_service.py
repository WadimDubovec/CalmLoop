import random
from pathlib import Path

def generate_video(mood: str) -> str:
    """
    Генерирует видео для выбранного настроения.
    Выбирается случайная картинка и звук из подготовленных.
    Возвращает путь к сгенерированному видео.
    """

    # 📌 Получаем путь к директории, где находится сам этот файл (ml_service.py)
    BASE_DIR = Path(__file__).resolve().parent
    FILES_DIR = BASE_DIR / "files"

    # 📁 Папки с файлами
    IMAGES_DIR = FILES_DIR / mood / "pictures"
    SOUNDS_DIR = FILES_DIR / mood / "music"

    # Разрешённые форматы
    IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg"]
    SOUND_EXTENSIONS = [".mp3", ".wav"]

    # Фильтруем только допустимые форматы
    if not IMAGES_DIR.exists() or not SOUNDS_DIR.exists():
        raise FileNotFoundError(f"❌ Папка {IMAGES_DIR} или {SOUNDS_DIR} не найдена")

    IMAGES = [f for f in IMAGES_DIR.iterdir() if f.suffix.lower() in IMAGE_EXTENSIONS]
    SOUNDS = [f for f in SOUNDS_DIR.iterdir() if f.suffix.lower() in SOUND_EXTENSIONS]

    if not IMAGES or not SOUNDS:
        raise FileNotFoundError("❌ Нет доступных картинок или звуков для генерации видео")

    selected_image = random.choice(IMAGES)
    selected_sound = random.choice(SOUNDS)

    # 📽 Здесь будет интеграция с ML моделью
    # Пока просто возвращаем путь к "демо-видео"
    GENERATED_DIR = BASE_DIR / "generated_videos"
    GENERATED_DIR.mkdir(exist_ok=True)

    generated_video_path = GENERATED_DIR / f"{mood}.mp4"

    print(f"🎬 Генерируем видео: {generated_video_path}")
    print(f"🖼️  Используем картинку: {selected_image}")
    print(f"🎧 Используем звук: {selected_sound}")

    # TODO: интеграция с ML моделью
    # Например, вызвать модель Wan2.2 через API или локально

    return str(generated_video_path)
