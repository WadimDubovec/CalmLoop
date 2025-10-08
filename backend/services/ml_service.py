import random
from pathlib import Path

# Пути к заранее подготовленным файлам
IMAGES_DIR = Path("assets/images")
SOUNDS_DIR = Path("assets/sounds")

# Примеры заранее подготовленных картинок и звуков
# В будущем можно загружать их динамически
IMAGES = list(IMAGES_DIR.glob("*.jpg"))  # или *.png
SOUNDS = list(SOUNDS_DIR.glob("*.mp3"))  # или *.wav

def generate_video(mood: str, duration: int) -> str:
    """
    Генерирует видео для выбранного настроения.
    Выбирается случайная картинка и звук из подготовленных.
    Возвращает путь к сгенерированному видео.
    """
    if not IMAGES or not SOUNDS:
        raise FileNotFoundError("Нет доступных картинок или звуков для генерации видео")
    
    selected_image = random.choice(IMAGES)
    selected_sound = random.choice(SOUNDS)

    # Здесь будет интеграция с ML моделью
    # На данный момент просто возвращаем путь к "демо-видео"
    # Позже можно заменить на реальную генерацию через модель
    generated_video_path = f"generated_videos/{mood}_{duration}s.mp4"
    
    print(f"Генерируем видео: {generated_video_path}")
    print(f"Используем картинку: {selected_image}")
    print(f"Используем звук: {selected_sound}")

    # TODO: интеграция с ML моделью
    # Например, вызвать модель Wan2.2 через API или локально
    # save_result_as(generated_video_path)

    return generated_video_path
