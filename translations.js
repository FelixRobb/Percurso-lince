let currentLanguage = 'pt';
const translations = {};

async function loadTranslations() {
    const languages = ['pt', 'en'];
    for (const lang of languages) {
        const response = await fetch(`${lang}.json`);
        translations[lang] = await response.json();
    }
}

function translate(key) {
    return translations[currentLanguage][key] || key;
}

function updatePageLanguage() {
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        element.textContent = translate(key);
    });

    document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
        const key = element.getAttribute('data-translate-placeholder');
        element.placeholder = translate(key);
    });
}

function toggleLanguage() {
    currentLanguage = currentLanguage === 'pt' ? 'en' : 'pt';
    updatePageLanguage();
}

loadTranslations().then(() => {
    updatePageLanguage();
});