document.addEventListener('DOMContentLoaded', () => {
    const languageSwitcher = document.getElementById('language-switcher');
    const currentLang = localStorage.getItem('language') || 'pt';

    const updateUI = (translations) => {
        document.querySelector('#header-title').textContent = translations.header;
        document.querySelector('#description p').textContent = translations.mapDescription;
        document.querySelector('#controls label').textContent = translations.selectLocation;
        document.querySelector('#trackSelect').innerHTML = `<option value="all">${translations.allLocations}</option>`;
        // Update other elements similarly...
    };

    const loadTranslations = (lang) => {
        fetch(`locales/${lang}.json`)
            .then(response => response.json())
            .then(translations => {
                updateUI(translations);
                localStorage.setItem('language', lang);
            })
            .catch(error => console.error('Error loading translations:', error));
    };

    languageSwitcher.addEventListener('change', (event) => {
        const selectedLang = event.target.value;
        loadTranslations(selectedLang);
    });

    loadTranslations(currentLang);
});
