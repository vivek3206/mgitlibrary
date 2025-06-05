document.addEventListener('DOMContentLoaded', () => {
    // Get all book row containers
    const bookRowContainers = document.querySelectorAll('.book-row-container');

    bookRowContainers.forEach(container => {
        const bookRow = container.querySelector('.book-row');
        const leftButton = container.querySelector('.scroll-left');
        const rightButton = container.querySelector('.scroll-right');

        // Calculate scroll amount based on book card width
        const scrollAmount = bookRow.querySelector('.book-card').offsetWidth + 16; // 16px for gap

        // Scroll left
        leftButton.addEventListener('click', () => {
            bookRow.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth'
            });
        });

        // Scroll right
        rightButton.addEventListener('click', () => {
            bookRow.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        });

        // Show/hide scroll buttons based on scroll position
        const updateScrollButtons = () => {
            const scrollLeft = bookRow.scrollLeft;
            const maxScroll = bookRow.scrollWidth - bookRow.clientWidth;

            leftButton.style.display = scrollLeft > 0 ? 'flex' : 'none';
            rightButton.style.display = scrollLeft < maxScroll ? 'flex' : 'none';
        };

        // Initial button state
        updateScrollButtons();

        // Update button state on scroll
        bookRow.addEventListener('scroll', updateScrollButtons);

        // Update button state on window resize
        window.addEventListener('resize', updateScrollButtons);
    });

    // Handle navigate buttons
    const navigateButtons = document.querySelectorAll('.navigate-btn');
    navigateButtons.forEach(button => {
        button.addEventListener('click', () => {
            const bookCard = button.closest('.book-card');
            const bookTitle = bookCard.querySelector('h3').textContent;
            // You can add your navigation logic here
            console.log(`Navigating to: ${bookTitle}`);
        });
    });
}); 