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
        });
    });

    createVideoBtn.addEventListener('click', async () => {
        if (!selectedMood) return;

        createVideoBtn.textContent = 'Создание...';
        createVideoBtn.disabled = true;

        try {
            const response = await fetch('http://localhost:8000/api/generate-video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mood: selectedMood, duration: 10 })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText);
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

        } catch (err) {
            console.error(err);
            alert('Ошибка сети или сервера: ' + err.message);
        } finally {
            createVideoBtn.textContent = 'Создать видео';
            createVideoBtn.disabled = false;
        }
    });
});
