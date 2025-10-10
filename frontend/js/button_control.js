document.addEventListener('DOMContentLoaded', () => {
    const moodButtons = document.querySelectorAll('.mood-btn');
    const createVideoBtn = document.getElementById('create-video-btn');
    const placeholderText = document.querySelector('.placeholder-text');
    const videoPreview = document.getElementById('video-preview');

    let selectedMood = null;

    // Скрываем кнопку по умолчанию
    createVideoBtn.style.opacity = 0;
    createVideoBtn.style.transform = 'translate(-50%, -50%) scale(0)';
    createVideoBtn.disabled = true;

    // Функция для показа уведомлений
    function showMessage(text, isError = false) {
        // Удаляем предыдущие сообщения
        const existingMessages = document.querySelectorAll('.toast-message');
        existingMessages.forEach(msg => msg.remove());
        const msg = document.createElement('div');
        msg.textContent = text;
        msg.className = 'toast-message';
        if (isError) {
            msg.style.background = '#ff6b6b';
        }
        document.body.appendChild(msg);

        setTimeout(() => msg.classList.add('visible'), 10);
        setTimeout(() => {
            msg.classList.remove('visible');
            setTimeout(() => msg.remove(), 300);
        }, 3000);
    }

    // Функция для получения русского названия настроения
    function getMoodDisplayName(mood) {
        const names = {
            calm_weather: 'Спокойная погода',
            waterfall: 'Водопад',
            forest: 'Лес',
            thunderstorm: 'Гроза',
            night_sky: 'Ночное небо'
        };
        return names[mood] || mood;
    }

    moodButtons.forEach(button => {
        button.addEventListener('click', () => {
            placeholderText.style.opacity = 0;
            // Выделяем выбранный смайлик
            moodButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');

            selectedMood = button.dataset.mood;

            // Скрываем видео и заглушку при выборе нового настроения
            videoPreview.style.opacity = 0;
            videoPreview.src = '';
            videoPreview.style.display = 'none';

            placeholderText.style.display = 'block';
            
            // Показываем кнопку
            createVideoBtn.disabled = false;
            createVideoBtn.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
            createVideoBtn.style.opacity = 1;
            createVideoBtn.style.transform = 'translate(-50%, -50%) scale(1)';

            showMessage(`✅ Выбрано: ${getMoodDisplayName(selectedMood)}`);
        });
    });

    createVideoBtn.addEventListener('click', async () => {
        if (!selectedMood) {
            showMessage('⚠️ Сначала выберите настроение!', true);
            return;
        }

        createVideoBtn.textContent = 'Создание...';
        createVideoBtn.disabled = true;

        try {
            const response = await fetch('http://localhost:8000/api/generate-video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mood: selectedMood, duration: 10 })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Ошибка сервера' }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const videoBlob = await response.blob();
            const videoURL = URL.createObjectURL(videoBlob);

            // Скрываем кнопку
            createVideoBtn.style.opacity = 0;
            createVideoBtn.style.transform = 'translate(-50%, -50%) scale(0)';

            // Скрываем заглушку
            placeholderText.style.display = 'none';

            // Показываем видео
            videoPreview.src = videoURL;
            videoPreview.style.display = 'block';
            videoPreview.style.opacity = 0;
            videoPreview.style.transition = 'opacity 0.5s ease';

            setTimeout(() => {
                videoPreview.style.opacity = 1;
            }, 50);

            showMessage('✅ Видео успешно создано!');



        } catch (err) {
            console.error('Ошибка:', err);
            showMessage(`❌ Ошибка: ${err.message}`, true);
            
            // В случае ошибки показываем заглушку
            videoPreview.style.display = 'none';
            placeholderText.style.display = 'block';
            placeholderText.style.opacity = 1;
        } finally {
            createVideoBtn.textContent = 'Создать видео';
            createVideoBtn.disabled = false;
        }
    });

    // Проверка доступности сервера при загрузке
    window.addEventListener('load', async () => {
        try {
            const response = await fetch('http://localhost:8000/');
            if (response.ok) {
                console.log('✅ Бэкенд доступен');
            }
        } catch (error) {
            console.warn('⚠️ Бэкенд недоступен');
            showMessage('⚠️ Сервер недоступен. Проверьте подключение.', true);
        }
    });
});