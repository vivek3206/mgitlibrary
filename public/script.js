document.addEventListener('DOMContentLoaded', function() {
    // Get all book row containers
    const containers = document.querySelectorAll('.book-row-container');

    containers.forEach(container => {
        const bookRow = container.querySelector('.book-row');
        const leftBtn = container.querySelector('.scroll-left');
        const rightBtn = container.querySelector('.scroll-right');

        // Scroll left
        leftBtn.addEventListener('click', () => {
            bookRow.scrollBy({
                left: -200,
                behavior: 'smooth'
            });
        });

        // Scroll right
        rightBtn.addEventListener('click', () => {
            bookRow.scrollBy({
                left: 200,
                behavior: 'smooth'
            });
        });
    });
}); 