export class I18nManager {
    constructor(defaultLang = 'fr') {
        this.currentLang = defaultLang;
        this.translations = {};
    }

    async init() {
        await this.loadLanguage(this.currentLang);
        this.setupListener();
    }

    async loadLanguage(lang) {
        try {
            const response = await fetch(`lang/${lang}.json`);
            if (!response.ok) throw new Error(`File not found: ${lang}.json`);
            
            this.translations = await response.json();
            this.currentLang = lang;
            this.applyTranslations();
            this.updateDirection(lang);
            
            window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
        } catch (error) {
            console.error(`Language error: ${error.message}. Falling back to French.`);
            
            // Revert dropdown UI to previous working language (or default to 'fr')
            document.getElementById('lang-switcher').value = 'fr';
            
            // If we aren't already on French, load French
            if (this.currentLang !== 'fr') {
                await this.loadLanguage('fr');
            }
        }
    }

    applyTranslations() {
        // Standard text replacements
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (this.translations[key]) el.textContent = this.translations[key];
        });

        // Placeholder replacements for inputs
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (this.translations[key]) el.placeholder = this.translations[key];
        });
    }

    updateDirection(lang) {
        const dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.dir = dir;
        document.documentElement.lang = lang;
    }

    setupListener() {
        const switcher = document.getElementById('lang-switcher');
        switcher.value = this.currentLang;
        switcher.addEventListener('change', (e) => {
            this.loadLanguage(e.target.value);
        });
    }

    t(key) {
        return this.translations[key] || key; // Safely return the key name if translation is missing
    }
}