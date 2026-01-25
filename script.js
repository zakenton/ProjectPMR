let currentSlide = 1;
const totalSlides = 20;

async function loadSlide(index) {
    const container = document.getElementById('slide-content-container');
    try {
        const response = await fetch(`slides/slide${index}.html`);
        if (!response.ok) throw new Error('Not found');
        const html = await response.text();
        
        container.style.opacity = 0;
        container.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            container.innerHTML = html;
            container.style.opacity = 1;
            container.style.transform = 'translateY(0)';
            updateUI();
        }, 200);
    } catch (e) {
        container.innerHTML = `
            <div class="highlight-box" style="background: var(--accent-pink)">SLIDE ${index}</div>
            <p style="font-family: monospace; font-weight: bold;">[ WARTET AUF INHALT... ]</p>
        `;
        updateUI();
    }
}

function updateUI() {
    document.getElementById('progress-bar').style.width = `${(currentSlide / totalSlides) * 100}%`;
    window.location.hash = `slide${currentSlide}`;
}

function nextSlide() { if(currentSlide < totalSlides) { currentSlide++; loadSlide(currentSlide); } }
function prevSlide() { if(currentSlide > 1) { currentSlide--; loadSlide(currentSlide); } }

// Таймер
let seconds = 0;
setInterval(() => {
    seconds++;
    const m = Math.floor(seconds/60).toString().padStart(2,'0');
    const s = (seconds%60).toString().padStart(2,'0');
    document.getElementById('timer').innerText = `${m}:${s}`;
}, 1000);

// Клавиатура
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
});

// Инициализация
loadSlide(currentSlide);