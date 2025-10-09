document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggle-stickers');
    const stickerDropdown = document.querySelector('.sticker-dropdown');

    toggleBtn.addEventListener('click', () => {
        stickerDropdown.classList.toggle('show');
        toggleBtn.classList.toggle('rotate'); // для анимации стрелки
    });
});
