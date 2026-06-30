import { I18nManager } from './i18n.js';
import { MenuManager } from './menu.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Set dynamic copyright year
    document.getElementById('year').textContent = new Date().getFullYear();

    // Initialize systems
    const i18n = new I18nManager('fr');
    await i18n.init();

    const menu = new MenuManager(i18n);
    await menu.init();

    // Activate Desktop Drag-to-Scroll for Navigation
    setupDesktopScroll();
});

function setupDesktopScroll() {
    const nav = document.getElementById('category-nav');
    if (!nav) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    // Mouse Wheel Scroll (Translates vertical wheel to horizontal scroll)
    nav.addEventListener('wheel', (e) => {
        if(e.deltaY !== 0) {
            e.preventDefault();
            nav.scrollLeft += e.deltaY;
        }
    }, { passive: false });

    // Click and Drag to Scroll
    nav.addEventListener('mousedown', (e) => {
        isDown = true;
        nav.style.cursor = 'grabbing';
        startX = e.pageX - nav.offsetLeft;
        scrollLeft = nav.scrollLeft;
    });

    nav.addEventListener('mouseleave', () => {
        isDown = false;
        nav.style.cursor = '';
    });

    nav.addEventListener('mouseup', () => {
        isDown = false;
        nav.style.cursor = '';
    });

    nav.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - nav.offsetLeft;
        const walk = (x - startX) * 2; // Scroll speed multiplier
        nav.scrollLeft = scrollLeft - walk;
    });
}