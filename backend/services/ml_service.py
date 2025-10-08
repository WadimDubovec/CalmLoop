import random
from pathlib import Path

def generate_video(mood: str) -> str:
    """
    Генерирует видео для выбранного настроения.
    Выбирается случайная картинка и звук из подготовленных.
    Возвращает путь к сгенерированному видео.
    """
    IMAGES_DIR = Path(f"files/{mood}/pictures")
    SOUNDS_DIR = Path(f"files/{mood}/music")
    IMAGES = list(IMAGES_DIR.glob("*.jpg"))  # или *.png
    SOUNDS = list(SOUNDS_DIR.glob("*.mp3"))  # или *.wav

    if not IMAGES or not SOUNDS:
        raise FileNotFoundError("Нет доступных картинок или звуков для генерации видео")

    selected_image = random.choice(IMAGES)
    selected_sound = random.choice(SOUNDS)

    # Здесь будет интеграция с ML моделью
    # На данный момент просто возвращаем путь к "демо-видео"
    # Позже можно заменить на реальную генерацию через модель
    generated_video_path = f"generated_videos/{mood}.mp4"

    print(f"Генерируем видео: {generated_video_path}")
    print(f"Используем картинку: {selected_image}")
    print(f"Используем звук: {selected_sound}")

    # TODO: интеграция с ML моделью
    # Например, вызвать модель Wan2.2 через API или локально
    # save_result_as(generated_video_path)

    return generated_video_path
