import { UIManager } from './ui-manager.js';
import { VideoManager } from './video-manager.js';
import { NotificationManager } from './notification-manager.js';
import { ApiService } from './api-service.js';

class App {
    constructor() {
        this.uiManager = new UIManager();
        this.videoManager = new VideoManager(document.getElementById('video-preview'));
        this.notificationManager = new NotificationManager();
        this.apiService = new ApiService();
        
        this.cleanupInterval = null;
        
        this.initEventListeners();
        this.checkServerAvailability();
        this.startPeriodicCleanup();
        
        console.log("✅ App инициализирован");
    }

    initEventListeners() {
        console.log("Инициализация обработчиков событий...");
        
        // Обработчики кнопок настроения
        this.uiManager.getMoodButtons().forEach(button => {
            button.addEventListener('click', () => this.handleMoodSelection(button));
        });

        // Обработчик кнопки создания видео
        this.uiManager.createVideoBtn.addEventListener('click', () => this.handleVideoCreation());
        
        console.log(`✅ Найдено ${this.uiManager.getMoodButtons().length} кнопок настроения`);
    }

    startPeriodicCleanup() {
        this.cleanupInterval = setInterval(() => {
            this.videoManager.clearAllBlobURLs();
        }, 30000);
    }

    stopPeriodicCleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }

    handleMoodSelection(button) {
        const selectedMood = button.dataset.mood;
        console.log(`🔄 Обработка выбора настроения: ${selectedMood}`);
        
        // Очищаем предыдущее видео
        this.videoManager.cleanup();
        
        // Устанавливаем выбранное настроение (это скроет placeholder и покажет кнопку)
        this.uiManager.selectMood(selectedMood);

        this.notificationManager.showMessage(
            `✅ Выбрано: ${this.uiManager.getMoodDisplayName(selectedMood) || selectedMood}`
        );
    }

    async handleVideoCreation() {
        const selectedMood = this.uiManager.getSelectedMood();
        console.log(`🔄 Начало создания видео для настроения: ${selectedMood}`);
        
        if (!selectedMood) {
            this.notificationManager.showMessage('⚠️ Сначала выберите настроение!', true);
            return;
        }

        this.uiManager.setCreateButtonState(true);
        this.notificationManager.showMessage('🔄 Создание видео...');

        // Показываем анимацию на кнопке
        this.uiManager.setCreateButtonState(true);
        this.uiManager.showCreateButton(true);
        this.uiManager.setCreateButtonLoading(true);
        // НЕ скрываем placeholder - он должен оставаться

        try {
            await this.apiService.clearStorageQuota();
            
            const videoBlob = await this.apiService.generateVideo(selectedMood);
            const videoURL = URL.createObjectURL(videoBlob);

            // Очищаем предыдущее видео
            this.videoManager.cleanup();

            // Скрываем анимацию кнопки и placeholder
            this.uiManager.setCreateButtonLoading(false);
            this.uiManager.showPlaceholder(false);

             //скрываем кнопку создания видео
            this.uiManager.showCreateButton(false); 

            // Загружаем и воспроизводим видео
            await this.loadAndPlayVideo(videoURL);

            this.notificationManager.showMessage('✅ Видео успешно создано!');

        } catch (err) {
            console.error('Ошибка создания видео:', err);
            
            let errorMessage = '❌ Ошибка создания видео';
            if (err.message.includes('404')) {
                errorMessage = '❌ Эндпоинт не найден. Проверьте API бэкенда';
            } else if (err.message.includes('Failed to fetch')) {
                errorMessage = '❌ Сервер недоступен. Проверьте подключение';
            } else if (err.message.includes('405')) {
                errorMessage = '❌ Метод не разрешен. Проверьте настройки CORS';
            } else {
                errorMessage = `❌ ${err.message}`;
            }
            
            this.notificationManager.showMessage(errorMessage, true);
            this.handleCreationError();
        } finally {
            this.uiManager.setCreateButtonState(false);
            this.uiManager.setCreateButtonLoading(false);
        }
    }

    async loadAndPlayVideo(videoURL) {
        return new Promise((resolve) => {
            const handleVideoLoad = () => {
                console.log('✅ Видео успешно загружено');
                
                // Показываем видео только после полной загрузки
                this.uiManager.showVideoPreview(true);
                this.videoManager.createSoundControls();
                this.videoManager.playVideoWithSound();
                
                resolve();
            };

            const handleVideoError = () => {
                console.error('❌ Ошибка загрузки видео');
                this.notificationManager.showMessage('❌ Ошибка загрузки видео', true);
                this.handleCreationError();
                resolve();
            };

            this.videoManager.loadVideo(videoURL, handleVideoLoad, handleVideoError);
        });
    }

    handleCreationError() {
        console.log("🔄 Обработка ошибки создания");
        // При ошибке показываем placeholder и кнопку
        this.uiManager.showVideoPreview(false);
        this.uiManager.showPlaceholder(true); // Показываем placeholder
        this.uiManager.showCreateButton(true); // Показываем кнопку
        this.videoManager.cleanup();
    }

    async checkServerAvailability() {
        const isAvailable = await this.apiService.checkServerAvailability();
        if (!isAvailable) {
            console.warn('⚠️ Бэкенд недоступен');
            this.notificationManager.showMessage(
                '⚠️ Сервер недоступен. Запустите бэкенд на порту 8000', 
                true
            );
        } else {
            console.log('✅ Бэкенд доступен');
        }
    }

    destroy() {
        this.stopPeriodicCleanup();
        this.videoManager.cleanup();
    }

    resetToSelection() {
        this.uiManager.resetToSelection();
    }   
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 DOM загружен, запуск приложения...");
    new App();
});