#!/usr/bin/env python3
"""
Тестовый скрипт для проверки AI генерации видео
"""

import os
import sys
from pathlib import Path

# Добавляем путь к модулям
sys.path.append(str(Path(__file__).parent))

from services.generate_video import generate_video_with_ai
from services.mood_prompts import MOOD_PROMPTS

def test_ai_generation():
    """Тестируем генерацию для всех настроений"""
    
    print("🤖 Тестирование AI генерации видео")
    print("=" * 50)
    
    # Проверяем наличие API ключа
    api_key = os.getenv("DASHSCOPE_API_KEY")
    if not api_key:
        print("❌ DASHSCOPE_API_KEY не найден в переменных окружения")
        print("💡 Создайте файл .env с вашим API ключом")
        return False
    
    print(f"✅ API ключ найден: {api_key[:10]}...")
    
    # Тестируем каждое настроение
    for mood in MOOD_PROMPTS.keys():
        print(f"\n🎬 Тестируем генерацию для: {mood}")
        try:
            video_path = generate_video_with_ai(mood)
            print(f"✅ Успешно: {video_path}")
        except Exception as e:
            print(f"❌ Ошибка: {e}")
    
    print("\n🎉 Тестирование завершено!")

if __name__ == "__main__":
    test_ai_generation()
