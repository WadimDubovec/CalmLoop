// Константы приложения
export const MOOD_DISPLAY_NAMES = {
    calm_weather: 'Спокойная погода',
    waterfall: 'Водопад',
    forest: 'Лес',
    thunderstorm: 'Гроза',
    night_sky: 'Ночное небо'
};

export const API_ENDPOINTS = {
    BASE: 'http://localhost:8000', // Добавлен порт 8000
    GENERATE_VIDEO: 'http://localhost:8000/api/generate-video' // Полный URL
};

export const VIDEO_CONFIG = {
    DEFAULT_DURATION: 10,
    LOAD_TIMEOUT: 10000,
    VOLUME: 0.3
};