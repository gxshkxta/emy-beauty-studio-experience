/* =========================================
   EMY STUDIO - DYNAMIC CALENDAR & FORMSPREE ENGINE
========================================= */

const FORMSPREE_ENDPOINT = "https://formspree.io/f/moevnrej";

document.addEventListener('DOMContentLoaded', () => {
    function trackEvent(eventName, data = {}) {
        console.log(`[Analytics Event]: ${eventName}`, data);
    }

    trackEvent('calendar_open');

    // Настройка на месеците за календара
    const months = [
        { name: "Септември 2026", days: 30, startDay: 2 },
        { name: "Октомври 2026", days: 31, startDay: 3 }
    ];
    let currentMonthIndex = 0;

    let selectedDate = '25 Септември 2026';
    let selectedService = 'Маникюр';
    let selectedTime = '15:30';

    const monthLabel = document.querySelector('.calendar-nav span');
    const daysContainer = document.querySelector('.calendar-days');
    const prevBtn = document.querySelector('.calendar-nav .fa-chevron-left');
    const nextBtn = document.querySelector('.calendar-nav .fa-chevron-right');

    function renderCalendar() {
        const current = months[currentMonthIndex];
        if (monthLabel) monthLabel.textContent = current.name;
        if (daysContainer) daysContainer.innerHTML = '';

        for (let i = 0; i < current.startDay; i++) {
            const emptySpan = document.createElement('span');
            emptySpan.classList.add('dim');
            emptySpan.textContent = 31 - (current.startDay - i - 1);
            daysContainer.appendChild(emptySpan);
        }

        for (let day = 1; day <= current.days; day++) {
            const daySpan = document.createElement('span');
            daySpan.textContent = day;
            
            if (day % 2 === 0 || day === 25) {
                daySpan.classList.add('has-dot');
            }

            if (currentMonthIndex === 0 && day === 25) {
                daySpan.classList.add('selected');
            }

            daySpan.addEventListener('click', () => {
                document.querySelectorAll('.calendar-days span').forEach(s => s.classList.remove('selected'));
                daySpan.classList.add('selected');
                selectedDate = `${day} ${current.name}`;
                trackEvent('date_selected', { date: selectedDate });
            });

            daysContainer.appendChild(daySpan);
        }
    }

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            currentMonthIndex = (currentMonthIndex === 0) ? months.length - 1 : currentMonthIndex - 1;
            renderCalendar();
        });

        nextBtn.addEventListener('click', () => {
            currentMonthIndex = (currentMonthIndex + 1) % months.length;
            renderCalendar();
        });
    }

    renderCalendar();

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

    // Обработка на бутона за запазване на час и изпращане към Formspree
    const submitBtn = document.querySelector('.btn-gold');
    if (submitBtn) {
        submitBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const clientName = nameInput ? nameInput.value : 'Гост';
            const clientPhone = phoneInput ? phoneInput.value : 'Не посочен';

            trackEvent('booking_submitted', {
                date: selectedDate,
                service: selectedService,
                time: selectedTime,
                name: clientName,
                phone: clientPhone
            });

            // Данни за изпращане с двата имейла за сигурност
            const formData = {
                service: selectedService,
                date: selectedDate,
                time: selectedTime,
                client_name: clientName,
                client_phone: clientPhone,
                recipients: 'emiliq.pavlova@abv.bg, nemogadasinapraqp6ta@gmail.com'
            };

            try {
                const response = await fetch(FORMSPREE_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    console.log('Заявката е изпратена успешно към Formspree!');
                } else {
                    console.error('Грешка при изпращане към Formspree.');
                }
            } catch (error) {
                console.error('Мрежова грешка:', error);
            }

            // Success State екран за клиента
            const panel = document.querySelector('.booking-glass-panel');
            panel.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; display: flex; flex-direction: column; gap: 20px; align-items: center; color: #fff;">
                    <i class="fas fa-check-circle" style="font-size: 4rem; color: #ffd700;"></i>
                    <h2 style="font-weight: 300; font-size: 2rem;">Заявката е изпратена.</h2>
                    <p style="color: rgba(255,255,255,0.7); max-width: 450px; line-height: 1.5; font-size: 0.95rem;">
                        Благодарим ти, ${clientName}! Успешно резервирахте <strong>${selectedService}</strong> за дата <strong>${selectedDate}</strong> в <strong>${selectedTime}</strong> ч. 
                        Информацията е изпратена успешно до Емилия (emiliq.pavlova@abv.bg) и резервния имейл.
                    </p>
                    <button onclick="location.reload();" class="btn-primary" style="margin-top: 15px; cursor: pointer; padding: 10px 25px;">
                        Нова резервация
                    </button>
                </div>
            `;
            
            trackEvent('booking_completed');
        });
    }
});