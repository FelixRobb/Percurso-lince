document.addEventListener("DOMContentLoaded", function () {
    const language = getLanguage();
    loadTranslations(language);
});

function getLanguage() {
    let language = localStorage.getItem("language");
    if (!language) {
        language = prompt("Escolha sua língua: 'pt' para português, 'en' para inglês:");
        localStorage.setItem("language", language);
    }
    return language;
}

function loadTranslations(language) {
    const path = `translations/${language}/recordings.json`;
    fetch(path)
        .then(response => response.json())
        .then(data => applyTranslations(data))
        .catch(error => console.error("Erro ao carregar traduções:", error));
}

function applyTranslations(translations) {
    Object.keys(translations).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = translations[id];
        }
    });
}

function changeLanguage(newLang) {
    localStorage.setItem("language", newLang);
    loadTranslations(newLang);
}