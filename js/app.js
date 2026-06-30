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
});