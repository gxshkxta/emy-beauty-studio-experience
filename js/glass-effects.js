/**
 * Управлява кристалните отблясъци по стъклените клетки (date cells).
 */
export function initCrystalShimmer(cellSelector) {
    const cells = document.querySelectorAll(cellSelector);
    if (!cells.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Изчакваме основната анимация (calendar entrance) да започне (около 400ms)
    setTimeout(() => {
        cells.forEach(cell => {
            // Подготвяме клетката
            cell.classList.add('crystal-cell-wrapper');

            // Генерираме рандом забавяне (staggered timing) между 0 и 1.5 секунди
            const randomDelay = Math.random() * 1500;

            setTimeout(() => {
                cell.classList.add('crystal-shimmer-effect');
                
                // Изчистваме класа, след като анимацията приключи (2 секунди), 
                // за да не товарим браузъра и да се случи само веднъж при първо зареждане.
                setTimeout(() => {
                    cell.classList.remove('crystal-shimmer-effect');
                }, 2100); 

            }, randomDelay);
        });
    }, 400); 
}