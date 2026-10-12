import { initCalendarEntrance } from './calendar-animation.js';
import { initCrystalShimmer } from './glass-effects.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Пускаме бавното спускане на главния контейнер
    // Замести 'calendar-container' с реалното ID на главния div на календара
    initCalendarEntrance('calendar-container');

    // 2. Пускаме кристалните отблясъци по клетките
    // Замести '.date-cell' с реалния клас, който имат дните в оригиналния дизайн
    initCrystalShimmer('.date-cell');
});