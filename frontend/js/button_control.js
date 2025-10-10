document.addEventListener('DOMContentLoaded', () => {
    const moodButtons = document.querySelectorAll('.mood-btn');
    const createVideoBtn = document.getElementById('create-video-btn');
    const placeholderText = document.querySelector('.placeholder-text');
    const videoPreview = document.getElementById('video-preview');

    let selectedMood = null;
    let soundControlBtn = null;
    let videoLoadTimeout = null;
    let currentVideoHandlers = {};

    // Скрываем кнопку по умолчанию
    createVideoBtn.style.opacity = 0;
    createVideoBtn.style.transform = 'translate(-50%, -50%) scale(0)';
    createVideoBtn.disabled = true;

    // Функция для показа/скрытия placeholder
    function showPlaceholder(show = true) {
        if (show) {
            placeholderText.style.display = 'block';
            setTimeout(() => {
                placeholderText.style.opacity = 1;
            }, 10);
            
        } else {
            placeholderText.style.display = 'none'
            setTimeout(() => {
            placeholderText.style.opacity = 0;
            
            }, 300); // Совпадает с duration transition
        }
    }

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
        }, 1500);
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

    // Функция для очистки видео и обработчиков
    function cleanupVideo() {
        // Останавливаем видео
        videoPreview.pause();
        videoPreview.currentTime = 0;
        videoPreview.src = '';
        
        // Очищаем URL объекта
        if (videoPreview.src) {
            URL.revokeObjectURL(videoPreview.src);
        }
        
        // Удаляем обработчики
        Object.values(currentVideoHandlers).forEach(handler => {
            if (handler) {
                videoPreview.removeEventListener('loadeddata', handler.loaded);
                videoPreview.removeEventListener('error', handler.error);
            }
        });
        currentVideoHandlers = {};
        
        // Очищаем таймаут
        if (videoLoadTimeout) {
            clearTimeout(videoLoadTimeout);
            videoLoadTimeout = null;
        }
        
        // Удаляем кнопку звука
        if (soundControlBtn) {
            soundControlBtn.remove();
            soundControlBtn = null;
        }
    }

    // Функция для создания кнопки управления звуком
    function createSoundControls() {
        // Удаляем старую кнопку если есть
        if (soundControlBtn) {
            soundControlBtn.remove();
        }

        soundControlBtn = document.createElement('button');
        soundControlBtn.innerHTML = '🔊';
        soundControlBtn.className = 'sound-control-btn';
        soundControlBtn.style.cssText = `
            position: absolute;
            bottom: 20px;
            right: 20px;
            background: rgba(0,0,0,0.7);
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            cursor: pointer;
            z-index: 1000;
            font-size: 1.2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        `;
        
        soundControlBtn.addEventListener('click', () => {
            if (videoPreview.muted) {
                videoPreview.muted = false;
                videoPreview.volume = 0.5;
                soundControlBtn.innerHTML = '🔊';
                soundControlBtn.style.background = 'rgba(106, 140, 175, 0.9)';
            } else {
                videoPreview.muted = true;
                soundControlBtn.innerHTML = '🔇';
                soundControlBtn.style.background = 'rgba(0,0,0,0.7)';
            }
        });
        
        document.querySelector('.preview-container').appendChild(soundControlBtn);
    }

    // Функция для воспроизведения видео со звуком
    function playVideoWithSound() {
        videoPreview.muted = false;
        videoPreview.volume = 0.3;
        
        videoPreview.play().then(() => {
            console.log('Видео воспроизводится со звуком');
            if (soundControlBtn) {
                soundControlBtn.innerHTML = '🔊';
                soundControlBtn.style.background = 'rgba(106, 140, 175, 0.9)';
            }
        }).catch(error => {
            console.log('Автовоспроизведение звука заблокировано:', error);
            videoPreview.muted = true;
            videoPreview.play().then(() => {
                if (soundControlBtn) {
                    soundControlBtn.innerHTML = '🔇';
                    soundControlBtn.style.background = 'rgba(0,0,0,0.7)';
                }
            }).catch(e => {
                console.log('Не удалось воспроизвести видео:', e);
            });
        });
    }

    moodButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Очищаем предыдущее видео
            cleanupVideo();
            
            // Выделяем выбранный смайлик
            moodButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');

            selectedMood = button.dataset.mood;

            // Скрываем видео
            videoPreview.style.opacity = 0;
            videoPreview.style.display = 'none';

            // Показываем заглушку
            showPlaceholder(true);
            
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

            // Очищаем предыдущее видео
            cleanupVideo();

            // Скрываем кнопку
            createVideoBtn.style.opacity = 0;
            createVideoBtn.style.transform = 'translate(-50%, -50%) scale(0)';

            // Скрываем заглушку
            showPlaceholder(false);

            // Показываем видео
            videoPreview.src = videoURL;
            videoPreview.style.display = 'block';
            videoPreview.style.opacity = 0;
            videoPreview.style.transition = 'opacity 0.5s ease';

            // Создаем кнопку управления звуком
            createSoundControls();

            // Функции обработчиков
            const handleVideoLoad = () => {
                console.log('Видео успешно загружено');
                if (videoLoadTimeout) {
                    clearTimeout(videoLoadTimeout);
                    videoLoadTimeout = null;
                }
                setTimeout(() => {
                    videoPreview.style.opacity = 1;
                    playVideoWithSound();
                }, 50);
            };

            const handleVideoError = () => {
                console.error('Ошибка загрузки видео');
                if (videoLoadTimeout) {
                    clearTimeout(videoLoadTimeout);
                    videoLoadTimeout = null;
                }
                showMessage('❌ Ошибка загрузки видео', true);
                videoPreview.style.display = 'none';
                showPlaceholder(true); // Используем функцию для показа placeholder
                if (soundControlBtn) {
                    soundControlBtn.remove();
                    soundControlBtn = null;
                }
            };

            // Сохраняем ссылки на обработчики для последующей очистки
            currentVideoHandlers = {
                loaded: handleVideoLoad,
                error: handleVideoError
            };

            // Устанавливаем обработчики
            videoPreview.addEventListener('loadeddata', handleVideoLoad, { once: true });
            videoPreview.addEventListener('error', handleVideoError, { once: true });

            // Таймаут на случай если видео не загрузится
            videoLoadTimeout = setTimeout(() => {
                if (videoPreview.readyState < 2) {
                    console.log('Таймаут загрузки видео');
                    handleVideoError();
                }
            }, 10000);

            showMessage('✅ Видео успешно создано!');

        } catch (err) {
            console.error('Ошибка:', err);
            showMessage(`❌ Ошибка: ${err.message}`, true);
            
            // В случае ошибки показываем заглушку
            videoPreview.style.display = 'none';
            showPlaceholder(true); // Используем функцию для показа placeholder
            cleanupVideo();
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