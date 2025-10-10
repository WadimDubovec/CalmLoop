import { MOOD_DISPLAY_NAMES } from './constants.js';

export class UIManager {
    constructor() {
        this.moodButtons = document.querySelectorAll('.mood-btn');
        this.createVideoBtn = document.getElementById('create-video-btn');
        this.placeholderText = document.querySelector('.placeholder-text');
        this.videoPreview = document.getElementById('video-preview');
        this.previewContainer = document.querySelector('.preview-container');
        
        this.selectedMood = null;
        this.hasUserSelectedMood = false; // Флаг: пользователь уже выбирал настроение
        
        this.initUI();
    }

    initUI() {
        // Изначальное состояние: показываем placeholder, скрываем кнопку и видео
        this.showPlaceholder(true);
        this.showCreateButton(false);
        this.showVideoPreview(false);
        
        console.log("✅ UI инициализирован: показываем placeholder");
    }

    showPlaceholder(show = true) {
        console.log(`showPlaceholder called with: ${show}`);
        
        if (show) {
            this.placeholderText.style.display = 'block';
            requestAnimationFrame(() => {
                this.placeholderText.style.opacity = '1';
            });
            console.log("✅ Placeholder показан");
        } else {
            this.placeholderText.style.opacity = '0';
            setTimeout(() => {
                this.placeholderText.style.display = 'none';
                console.log("✅ Placeholder скрыт");
            }, 300);
        }
    }

    showCreateButton(show = true) {
        console.log(`showCreateButton called with: ${show}`);
        
        if (show) {
            this.createVideoBtn.disabled = false;
            this.createVideoBtn.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
            this.createVideoBtn.style.opacity = '1';
            this.createVideoBtn.style.transform = 'translate(-50%, -50%) scale(1)';
            console.log("✅ Кнопка создания показана");
        } else {
            this.createVideoBtn.style.opacity = '0';
            this.createVideoBtn.style.transform = 'translate(-50%, -50%) scale(0)';
            console.log("✅ Кнопка создания скрыта");
        }
    }

    setCreateButtonState(creating = false) {
        if (creating) {
            this.createVideoBtn.textContent = 'Создание...';
            this.createVideoBtn.disabled = true;
        } else {
            this.createVideoBtn.textContent = 'Создать видео';
            this.createVideoBtn.disabled = false;
        }
    }

    selectMood(mood) {
        console.log(`selectMood called with: ${mood}`);
        
        // Снимаем выделение со всех кнопок
        this.moodButtons.forEach(btn => btn.classList.remove('selected'));
        
        // Выделяем выбранную кнопку
        const selectedButton = Array.from(this.moodButtons).find(
            btn => btn.dataset.mood === mood
        );
        if (selectedButton) {
            selectedButton.classList.add('selected');
        }
        
        this.selectedMood = mood;
        this.hasUserSelectedMood = true; // Пользователь выбрал настроение
        
        // ПРИ ВЫБОРЕ НАСТРОЕНИЯ: скрываем placeholder, показываем кнопку
        this.showPlaceholder(false);
        this.showCreateButton(true);
        
        console.log(`✅ Настроение выбрано: ${mood}, placeholder скрыт, кнопка показана`);
    }

    getSelectedMood() {
        return this.selectedMood;
    }

    getMoodDisplayName(mood) {
        return MOOD_DISPLAY_NAMES[mood] || mood;
    }

    showVideoPreview(show = true) {
        console.log(`showVideoPreview called with: ${show}`);
        
        if (show) {
            this.videoPreview.style.display = 'block';
            this.videoPreview.style.opacity = '0';
            this.videoPreview.style.zIndex = '2';
            
            requestAnimationFrame(() => {
                this.videoPreview.style.opacity = '1';
            });
            console.log("✅ Видео показано");
        } else {
            this.videoPreview.style.opacity = '0';
            setTimeout(() => {
                this.videoPreview.style.display = 'none';
                this.videoPreview.style.zIndex = '';
                console.log("✅ Видео скрыто");
            }, 300);
        }
    }

    // Метод для состояния "видео создано"
    showVideoCreated() {
        console.log("🔄 Переход в состояние 'видео создано'");
        this.showPlaceholder(false);
        this.showCreateButton(false);
        this.showVideoPreview(true);
    }

    // Метод для сброса к состоянию выбора (когда очищаем видео)
    resetToSelection() {
        console.log("🔄 Сброс к состоянию выбора");
        this.showVideoPreview(false);
        
        // ЕСЛИ пользователь уже выбирал настроение раньше - не показываем placeholder
        if (this.hasUserSelectedMood) {
            this.showPlaceholder(false);
            this.showCreateButton(true); // Показываем кнопку
        } else {
            // Если это первый раз - показываем placeholder
            this.showPlaceholder(true);
            this.showCreateButton(false);
        }
        
        this.selectedMood = null;
        
        // Снимаем выделение со всех кнопок
        this.moodButtons.forEach(btn => btn.classList.remove('selected'));
    }

    // Метод для полного сброса (например, при перезагрузке)
    fullReset() {
        console.log("🔄 Полный сброс UI");
        this.hasUserSelectedMood = false;
        this.selectedMood = null;
        this.moodButtons.forEach(btn => btn.classList.remove('selected'));
        this.initUI();
    }

    // Получить все кнопки настроения
    getMoodButtons() {
        return this.moodButtons;
    }
}