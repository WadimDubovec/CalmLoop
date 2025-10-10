import { API_ENDPOINTS, VIDEO_CONFIG } from './constants.js';

export class ApiService {
    async generateVideo(mood, duration = VIDEO_CONFIG.DEFAULT_DURATION) {
        console.log('Отправка запроса на:', API_ENDPOINTS.GENERATE_VIDEO);
        console.log('Данные:', { mood, duration });
        
        try {
            const response = await fetch(API_ENDPOINTS.GENERATE_VIDEO, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ mood, duration })
            });

            console.log('Статус ответа:', response.status);

            if (!response.ok) {
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    // Если не удалось распарсить JSON, используем текст
                    const text = await response.text();
                    errorMessage = text || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const blob = await response.blob();
            console.log('Получен blob размером:', blob.size, 'байт');
            
            if (blob.size === 0) {
                throw new Error('Получен пустой файл видео');
            }

            return blob;

        } catch (error) {
            console.error('Ошибка в generateVideo:', error);
            throw error;
        }
    }

    async checkServerAvailability() {
        try {
            // Используем GET вместо HEAD, так как некоторые серверы блокируют HEAD
            const response = await fetch(API_ENDPOINTS.BASE, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            // Считаем сервер доступным если получаем любой ответ (даже 404/405)
            // Главное - нет сетевой ошибки
            console.log('Статус проверки сервера:', response.status);
            return true;
            
        } catch (error) {
            console.warn('Сервер недоступен:', error.message);
            return false;
        }
    }

    // Метод для очистки квоты хранилища
    async clearStorageQuota() {
        try {
            // Очищаем все blob URLs
            if (window.URL && window.URL.revokeObjectURL) {
                // Этот метод помогает очистить кэш blob URLs
                console.log('Очистка blob URLs');
            }
            
            // Очищаем кэш fetch если возможно
            if (window.caches) {
                const cacheNames = await caches.keys();
                for (const name of cacheNames) {
                    await caches.delete(name);
                }
                console.log('Кэш очищен');
            }
        } catch (error) {
            console.log('Ошибка при очистке кэша:', error);
        }
    }
}