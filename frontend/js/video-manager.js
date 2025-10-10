import { VIDEO_CONFIG } from './constants.js';

export class VideoManager {
    constructor(videoElement) {
        this.videoElement = videoElement;
        this.soundControlBtn = null;
        this.videoLoadTimeout = null;
        this.currentVideoHandlers = {};
        this.currentVideoURL = null;
    }

    cleanup() {
        console.log('Очистка видео менеджера');
        
        // Останавливаем видео
        this.videoElement.pause();
        this.videoElement.currentTime = 0;
        
        // Очищаем предыдущий URL объекта
        if (this.currentVideoURL) {
            console.log('Освобождение URL:', this.currentVideoURL);
            URL.revokeObjectURL(this.currentVideoURL);
            this.currentVideoURL = null;
        }
        
        // Очищаем src после revokeObjectURL
        this.videoElement.src = '';
        this.videoElement.removeAttribute('src');
        this.videoElement.load(); // Важно: вызываем load для сброса
        
        // Удаляем обработчики
        Object.values(this.currentVideoHandlers).forEach(handler => {
            if (handler) {
                this.videoElement.removeEventListener('loadeddata', handler.loaded);
                this.videoElement.removeEventListener('error', handler.error);
                this.videoElement.removeEventListener('canplay', handler.loaded);
            }
        });
        this.currentVideoHandlers = {};
        
        // Очищаем таймаут
        if (this.videoLoadTimeout) {
            clearTimeout(this.videoLoadTimeout);
            this.videoLoadTimeout = null;
        }
        
        // Удаляем кнопку звука
        this.removeSoundControls();

        // Принудительная очистка кэша
        this.forceCleanup();
    }

    // Добавьте этот метод для принудительной очистки
    forceCleanup() {
        try {
            // Очищаем все возможные blob URLs
            if (this.videoElement.src && this.videoElement.src.startsWith('blob:')) {
                URL.revokeObjectURL(this.videoElement.src);
            }
            
            // Сбрасываем медиа элемент
            this.videoElement.load();
            
            // Очищаем кэш браузера для видео
            if (this.videoElement.webkitClearResourceCache) {
                this.videoElement.webkitClearResourceCache();
            }
            
        } catch (error) {
            console.log('Ошибка при forceCleanup:', error);
        }
    }

    // Метод для очистки всех blob URLs (решение проблемы квоты)
    clearAllBlobURLs() {
        // Этот метод можно вызывать периодически для очистки квоты
        console.log('Очистка всех blob URLs');
        
        // Создаем временный iframe для очистки кэша
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        
        try {
            iframe.contentWindow.URL.revokeObjectURL(this.currentVideoURL);
        } catch (e) {
            // Игнорируем ошибки
        }
        
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 100);
    }

    createSoundControls() {
        this.removeSoundControls();

        this.soundControlBtn = document.createElement('button');
        this.soundControlBtn.innerHTML = '🔊';
        this.soundControlBtn.className = 'sound-control-btn';
        
        this.soundControlBtn.addEventListener('click', () => this.toggleSound());
        document.querySelector('.preview-container').appendChild(this.soundControlBtn);
    }

    removeSoundControls() {
        if (this.soundControlBtn) {
            this.soundControlBtn.remove();
            this.soundControlBtn = null;
        }
    }

    toggleSound() {
        if (this.videoElement.muted) {
            this.videoElement.muted = false;
            this.videoElement.volume = VIDEO_CONFIG.VOLUME;
            if (this.soundControlBtn) {
                this.soundControlBtn.innerHTML = '🔊';
                this.soundControlBtn.style.background = 'rgba(106, 140, 175, 0.9)';
            }
        } else {
            this.videoElement.muted = true;
            if (this.soundControlBtn) {
                this.soundControlBtn.innerHTML = '🔇';
                this.soundControlBtn.style.background = 'rgba(0,0,0,0.7)';
            }
        }
    }

    async playVideoWithSound() {
        this.videoElement.muted = false;
        this.videoElement.volume = VIDEO_CONFIG.VOLUME;
        
        try {
            await this.videoElement.play();
            console.log('Видео воспроизводится со звуком');
            if (this.soundControlBtn) {
                this.soundControlBtn.innerHTML = '🔊';
                this.soundControlBtn.style.background = 'rgba(106, 140, 175, 0.9)';
            }
        } catch (error) {
            console.log('Автовоспроизведение звука заблокировано:', error);
            this.videoElement.muted = true;
            try {
                await this.videoElement.play();
                if (this.soundControlBtn) {
                    this.soundControlBtn.innerHTML = '🔇';
                    this.soundControlBtn.style.background = 'rgba(0,0,0,0.7)';
                }
            } catch (e) {
                console.log('Не удалось воспроизвести видео:', e);
            }
        }
    }

    loadVideo(videoURL, onLoad, onError) {
        this.cleanup();
        
        this.currentVideoURL = videoURL;
        this.videoElement.src = videoURL;
        this.videoElement.style.transition = 'opacity 0.5s ease';

        // Сохраняем обработчики
        this.currentVideoHandlers = {
            loaded: onLoad,
            error: onError
        };

        // Устанавливаем обработчики
        const loadedHandler = () => {
            console.log('Видео загружено');
            onLoad();
        };

        const errorHandler = (e) => {
            console.error('Ошибка загрузки видео:', e);
            onError();
        };

        this.videoElement.addEventListener('loadeddata', loadedHandler, { once: true });
        this.videoElement.addEventListener('canplay', loadedHandler, { once: true });
        this.videoElement.addEventListener('error', errorHandler, { once: true });

        // Таймаут на случай если видео не загрузится
        this.videoLoadTimeout = setTimeout(() => {
            if (this.videoElement.readyState < 2) {
                console.log('Таймаут загрузки видео');
                errorHandler();
            }
        }, VIDEO_CONFIG.LOAD_TIMEOUT);
    }
}