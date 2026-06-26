document.addEventListener('DOMContentLoaded', () => {
    const burgerBtn = document.getElementById('burgerBtn');
    const sidebar = document.getElementById('sidebar');

    // Клик по бургеру открывает/закрывает меню
    burgerBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        burgerBtn.classList.toggle('open'); // Меняет бургер на крестик
    });

    // Закрываем меню, если кликнули по экрану вне меню
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !burgerBtn.contains(e.target)) {
            sidebar.classList.remove('active');
            burgerBtn.classList.remove('open');
        }
    });
});