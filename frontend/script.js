// Элементы DOM
const moodButtons = document.querySelectorAll('.mood-btn');
const generateBtn = document.getElementById('generate-btn');
const downloadBtn = document.getElementById('download-btn');
const durationSlider = document.getElementById('duration-slider');
const durationValue = document.getElementById('duration-value');
const videoPreview = document.getElementById('video-preview');
const placeholderText = document.querySelector('.placeholder-text');

let selectedMood = null;
const API_BASE_URL = 'http://localhost:8000';

// Функция уведомления
function showMessage(text) {
    const msg = document.createElement('div');
    msg.textContent = text;
    msg.className = 'toast-message';
    document.body.appendChild(msg);

    setTimeout(() => msg.classList.add('visible'), 10);
    setTimeout(() => {
        msg.classList.remove('visible');
        setTimeout(() => msg.remove(), 300);
    }, 2500);
}

// Выбор настроения
moodButtons.forEach(button => {
    button.addEventListener('click', () => {
        moodButtons.forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        selectedMood = button.dataset.mood;
        console.log('Выбрано настроение:', selectedMood);
        showMessage(`✅ Выбрано: ${getMoodDisplayName(selectedMood)}`);
    });
});

// Обновление длительности
durationSlider.addEventListener('input', () => {
    durationValue.textContent = durationSlider.value;
});

// Отправка на Python бэкенд
generateBtn.addEventListener('click', async () => {
    if (!selectedMood) {
        showMessage('⚠️ Сначала выберите настроение!');
        return;
    }

    generateBtn.textContent = 'Отправка...';
    generateBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/api/log-mood`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mood: selectedMood,
                duration: parseInt(durationSlider.value)
            })
        });

        if (!response.ok) throw new Error('Ошибка сервера');
        const data = await response.json();
        
        showMessage(`✅ ${data.message}`);
        showDemoVideo(selectedMood);

    } catch (error) {
        console.error('Ошибка:', error);
        showMessage('❌ Сервер не отвечает. Запустите: docker-compose up');
        showDemoVideo(selectedMood);
    } finally {
        generateBtn.textContent = 'Создать видео';
        generateBtn.disabled = false;
    }
});

// Показ демо-видео
function showDemoVideo(mood) {
    const demoVideos = {
        calm: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        happy: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        sad: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        angry: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        dream: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'
    };

    videoPreview.src = demoVideos[mood] || demoVideos.calm;
    placeholderText.style.display = 'none';
    videoPreview.style.display = 'block';
    videoPreview.classList.add('fade-in');
    
    videoPreview.play().catch(e => console.log('Автовоспроизведение заблокировано'));

    downloadBtn.disabled = false;
    downloadBtn.classList.add('active');
}

// Скачивание видео
downloadBtn.addEventListener('click', () => {
    if (!downloadBtn.disabled && videoPreview.src) {
        const a = document.createElement('a');
        a.href = videoPreview.src;
        a.download = `calmloop-${selectedMood}.mp4`;
        a.click();
        showMessage('⬇️ Скачивание началось!');
    }
});

// Вспомогательные функции
function getMoodDisplayName(mood) {
    const names = {
        calm: 'Спокойное', 
        happy: 'Радостное', 
        sad: 'Грустное', 
        angry: 'Злое', 
        dream: 'Сонливое'
    };
    return names[mood] || mood;
}

// Проверка сервера при загрузке
window.addEventListener('load', async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/`);
        if (response.ok) console.log('✅ Python бэкенд доступен');
    } catch (error) {
        console.warn('⚠️ Бэкенд недоступен. Демо-режим.');
    }
});