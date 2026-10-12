/**
 * Управлява премиум входната анимация на календара.
 */
export function initCalendarEntrance(calendarContainerId) {
    const calendar = document.getElementById(calendarContainerId);
    if (!calendar) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!prefersReducedMotion) {
        calendar.classList.add('calendar-premium-entrance');
    } else {
        // При спряно движение, гарантираме, че е видим
        calendar.style.opacity = '1';
        calendar.style.transform = 'translateY(0)';
    }
}