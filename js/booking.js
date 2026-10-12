/* =========================================
   EMY STUDIO - DYNAMIC REAL-TIME CALENDAR & FORMSPREE
========================================= */

const FORMSPREE_ENDPOINT = "https://formspree.io/f/maeqdpzb";

document.addEventListener('DOMContentLoaded', () => {
    function trackEvent(eventName, data = {}) {
        console.log(`[Analytics Event]: ${eventName}`, data);
    }
    trackEvent('calendar_open');

    // 1. АВТОМАТИЧЕН РЕАЛЕН КАЛЕНДАР (Връзка с реалното време)
    const monthNames = ['Януари', 'Февруари', 'Март', 'Април', 'Май', 'Юни', 'Юли', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември'];
    
    // Взимаме точната днешна дата от браузъра
    let currentDateObj = new Date();
    let currentMonth = currentDateObj.getMonth();
    let currentYear = currentDateObj.getFullYear();
    let selectedDay = currentDateObj.getDate();

    let selectedDate = `${selectedDay} ${monthNames[currentMonth]} ${currentYear}`;
    let selectedService = 'Маникюр';
    let selectedTime = '15:30';

    const monthLabel = document.querySelector('.calendar-nav span');
    const daysContainer = document.querySelector('.calendar-days');
    const prevBtn = document.querySelector('.calendar-nav .fa-chevron-left');
    const nextBtn = document.querySelector('.calendar-nav .fa-chevron-right');

    function renderCalendar(month, year) {
        if (monthLabel) monthLabel.textContent = `${monthNames[month]} ${year}`;
        if (daysContainer) daysContainer.innerHTML = '';

        // Изчисляване на първия ден (0=Неделя, 1=Понеделник... преизчисляваме спрямо Понеделник)
        const firstDayIndex = new Date(year, month, 1).getDay();
        const shiftDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
        
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const prevMonthDays = new Date(year, month, 0).getDate();

        // Попълване на празните "dim" дни от предходния месец
        for (let i = 0; i < shiftDay; i++) {
            const emptySpan = document.createElement('span');
            emptySpan.classList.add('dim');
            emptySpan.textContent = prevMonthDays - shiftDay + i + 1;
            daysContainer.appendChild(emptySpan);
        }

        // Попълване на реалните дни на текущия месец
        for (let day = 1; day <= daysInMonth; day++) {
            const daySpan = document.createElement('span');
            daySpan.textContent = day;
            
            // Слагаме наличност (точки) - примерна логика
            if (day % 2 !== 0 || day === selectedDay) {
                daySpan.classList.add('has-dot');
            }

            // Автоматично маркираме днешната дата при отваряне
            if (day === selectedDay && month === currentDateObj.getMonth() && year === currentDateObj.getFullYear()) {
                daySpan.classList.add('selected');
            }

            // Интерактивност при клик на дата
            daySpan.addEventListener('click', () => {
                document.querySelectorAll('.calendar-days span').forEach(s => s.classList.remove('selected'));
                daySpan.classList.add('selected');
                selectedDay = day;
                selectedDate = `${day} ${monthNames[month]} ${year}`;
                trackEvent('date_selected', { date: selectedDate });
            });

            daysContainer.appendChild(daySpan);
        }
    }

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar(currentMonth, currentYear);
        });

        nextBtn.addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar(currentMonth, currentYear);
        });
    }

    // Рендираме календара веднага при зареждане
    renderCalendar(currentMonth, currentYear);

    // 2. ФОРМА ЗА ЗАПИСВАНЕ И ИЗПРАЩАНЕ КЪМ FORMSPREE
    const serviceSelect = document.querySelector('.booking-form select:nth-of-type(1)');
    const timeSelect = document.querySelector('.booking-form select:nth-of-type(2)');
    const nameInput = document.querySelector('.booking-form input[type="text"]');
    const phoneInput = document.querySelector('.booking-form input[type="tel"]');

    if (serviceSelect) {
        serviceSelect.addEventListener('change', (e) => {
            selectedService = e.target.value;
            trackEvent('service_selected', { service: selectedService });
        });
    }

    if (timeSelect) {
        timeSelect.addEventListener('change', (e) => {
            selectedTime = e.target.value;
            trackEvent('time_selected', { time: selectedTime });
        });
    }

    const submitBtn = document.querySelector('.btn-gold');
    if (submitBtn) {
        submitBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const clientName = nameInput && nameInput.value.trim() !== '' ? nameInput.value : 'Гост';
            const clientPhone = phoneInput && phoneInput.value.trim() !== '' ? phoneInput.value : 'Не посочен';

            trackEvent('booking_submitted', {
                date: selectedDate,
                service: selectedService,
                time: selectedTime,
                name: clientName,
                phone: clientPhone
            });

            const formData = {
                service: selectedService,
                date: selectedDate,
                time: selectedTime,
                client_name: clientName,
                client_phone: clientPhone,
                recipients: 'emyxp@abv.bg, nemogadasinapraqp6ta@gmail.com'
            };

            try {
                const response = await fetch(FORMSPREE_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    console.log('Успешно изпратено към Formspree!');
                }
            } catch (error) {
                console.error('Мрежова грешка:', error);
            }

            const panel = document.querySelector('.booking-glass-panel');
            panel.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; display: flex; flex-direction: column; gap: 20px; align-items: center; color: #fff;">
                    <i class="fas fa-check-circle" style="font-size: 4rem; color: #ffd700;"></i>
                    <h2 style="font-weight: 300; font-size: 2rem;">Заявката е изпратена.</h2>
                    <p style="color: rgba(255,255,255,0.7); max-width: 450px; line-height: 1.5; font-size: 0.95rem;">
                        Благодарим ти, ${clientName}! Успешно резервирахте <strong>${selectedService}</strong> за дата <strong>${selectedDate}</strong> в <strong>${selectedTime}</strong> ч.
                        <br><br>Информацията е изпратена към Емилия.
                    </p>
                    <button onclick="location.reload();" class="btn-primary" style="margin-top: 15px; cursor: pointer; padding: 10px 25px;">
                        Нова резервация
                    </button>
                </div>
            `;
            trackEvent('booking_completed');
        });
    }

    // 3. SOCIALS & ANALYTICS HOOKS (Интеграцията от предната стъпка)
    document.querySelectorAll('.socials a, .mobile-socials a').forEach(link => {
        link.addEventListener('click', (e) => {
            const platform = e.currentTarget.getAttribute('data-social');
            trackEvent(`${platform}_clicked`, { link_url: e.currentTarget.href });
            
            if (platform === 'phone' || platform === 'whatsapp') {
                setTimeout(() => { window.location.href = e.currentTarget.href; }, 100);
            } else if (platform === 'shop') {
                e.preventDefault();
            }
        });
    });
});
/* =========================================
   EMY GALLERY - SMOOTH INFINITE SCROLL
========================================= */
const GALLERY_IMAGE_PATH = "assets/images/"; 
const GALLERY_PHOTO_COUNT = 19;

// Променливи за плавно плъзгане (Lerp)
let currentScroll = 0;
let targetScroll = 0;
let galleryIsPaused = false;

function initGallery() {
    const track = document.getElementById('galleryTrack');
    if (!track) return;
    track.innerHTML = '';

    for (let i = 1; i <= GALLERY_PHOTO_COUNT; i++) {
        const img = document.createElement('img');
        img.src = `${GALLERY_IMAGE_PATH}photo${i}.jpg`;
        img.alt = `EMY Gallery ${i}`;
        img.onerror = function() { this.remove(); };
        track.appendChild(img);
    }
    
    // Дублираме ги за безкрайния цикъл
    track.innerHTML += track.innerHTML;
    animateGallery();
}

function animateGallery() {
    const track = document.getElementById('galleryTrack');
    if (!track) return;
    
    if (!galleryIsPaused) {
        // 1. СКОРОСТ НА РОТАЦИЯ: Беше 1.0, сега е 0.3 (много по-бавно)
        targetScroll -= 0.3; 
    }

    // 2. ПЛАВНО ПРЕЛИВАНЕ (Lerp) - прави движението на стрелките мазно
    currentScroll += (targetScroll - currentScroll) * 0.05;

    // Рестартиране на цикъла без прекъсване
    const halfWidth = track.scrollWidth / 2;
    if (Math.abs(targetScroll) >= halfWidth) {
        currentScroll += halfWidth;
        targetScroll += halfWidth;
    }
    
    track.style.transform = `translateX(${currentScroll}px)`;
    requestAnimationFrame(animateGallery);
}

// 3. СТРЕЛКИТЕ: Вече задават цел, а галерията се плъзва до нея
window.scrollGalleryLeft = function() {
    targetScroll += 350; 
    // Защита да не излизаме извън началото
    if (targetScroll > 0) targetScroll = 0; 
};

window.scrollGalleryRight = function() {
    targetScroll -= 350;
};

// Закачане на събитията
document.addEventListener('DOMContentLoaded', () => {
    initGallery();

    const wrap = document.getElementById('galleryWrap');
    if (wrap) {
        wrap.addEventListener('mouseenter', () => galleryIsPaused = true);
        wrap.addEventListener('mouseleave', () => galleryIsPaused = false);
    }
});