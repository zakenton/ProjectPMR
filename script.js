let currentSlide = 1;
const totalSlides = 19;
let currentSlideStylesheet = null;

async function loadSlide(index) {
    const container = document.getElementById('slide-content-container');
    
    // Удаляем предыдущий CSS файл слайда, если он был загружен
    if (currentSlideStylesheet) {
        currentSlideStylesheet.remove();
        currentSlideStylesheet = null;
    }
    
    // Загружаем CSS файл для текущего слайда и ждем его загрузки
    if (index >= 1 && index <= 10) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `styles/slide${index}.css`;
        link.id = `slide-${index}-css`;
        
        // Ждем загрузки CSS перед вставкой HTML
        await new Promise((resolve) => {
            link.onload = resolve;
            link.onerror = resolve; // Продолжаем даже если файл не найден
            document.head.appendChild(link);
            currentSlideStylesheet = link;
            // Таймаут на случай, если событие onload не сработает
            setTimeout(resolve, 50);
        });
    }
    
    try {
        const response = await fetch(`slides/slide${index}.html`);
        if (!response.ok) throw new Error('Not found');
        const html = await response.text();
        
        container.style.opacity = 0;
        container.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            container.innerHTML = html;
            // Важный момент: запускаем скрипты вручную
            executeScripts(container);
            
            container.style.opacity = 1;
            container.style.transform = 'translateY(0)';
            updateUI();
            
            // Перезапускаем анимации, если они есть (для случаев, когда CSS уже был загружен)
            const animatedElements = container.querySelectorAll('[class*="shadow"], [class*="data-stream"], [class*="rock-hand"], [class*="falling-item"]');
            animatedElements.forEach(el => {
                el.style.animation = 'none';
                // Принудительный reflow
                void el.offsetHeight;
                el.style.animation = null;
            });
        }, 200);
    } catch (e) {
        container.innerHTML = `
            <div class="highlight-box" style="background: var(--accent-pink)">SLIDE ${index}</div>
            <p style="font-family: monospace; font-weight: bold;">[ WARTET AUF INHALT... ]</p>
        `;
        updateUI();
    }
}

// Функция для принудительного запуска скриптов из подгружаемого HTML
function executeScripts(container) {
    const scripts = container.querySelectorAll('script');
    scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        oldScript.parentNode.replaceChild(newScript, oldScript);
    });
}

function updateUI() {
    document.getElementById('progress-bar').style.width = `${(currentSlide / totalSlides) * 100}%`;
    window.location.hash = `slide${currentSlide}`;
}

function nextSlide() { if(currentSlide < totalSlides) { currentSlide++; loadSlide(currentSlide); } }
function prevSlide() { if(currentSlide > 1) { currentSlide--; loadSlide(currentSlide); } }

let seconds = 0;
setInterval(() => {
    seconds++;
    const m = Math.floor(seconds/60).toString().padStart(2,'0');
    const s = (seconds%60).toString().padStart(2,'0');
    document.getElementById('timer').innerText = `${m}:${s}`;
}, 1000);

window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
});

loadSlide(currentSlide);