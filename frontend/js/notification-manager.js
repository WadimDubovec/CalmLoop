export class NotificationManager {
    showMessage(text, isError = false) {
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
}