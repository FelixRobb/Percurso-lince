document.addEventListener("DOMContentLoaded", function () {
    const language = getLanguage() || "pt";
    loadTranslations(language);
});

function getLanguage() {
    let language = localStorage.getItem("language");
    if (!language) {
        createLanguagePopup();
    }
    return language;
}

function createLanguagePopup() {
    const popup = document.createElement('div');
    popup.id = "language-popup";
    popup.innerHTML = `
        <div id="popup-content">
            <h2>Choose your language</h2>
            <button id="pt-btn">Português</button>
            <button id="en-btn">English</button>
        </div>
    `;
    document.body.appendChild(popup);

    // Estilizando o popup
    const styles = `
        #language-popup {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: rgba(0, 0, 0, 0.6);
            z-index: 9999;
        }
        #popup-content {
            background-color: #333;
            color: #fff;
            padding: 20px 30px;
            border-radius: 30px;
            text-align: center;
            box-shadow: 0px 0px 20px #000;
        }
        #popup-content h2 {
            margin-bottom: 20px;
        }
        #popup-content button {
            background-color: #666;
            margin: 10px;
            padding: 10px 20px;
            border: none;
            border-radius: 20px;
            font-size: 16px;
            cursor: pointer;
            transition: background-color 0.3s;
        }

        #popup-content button:hover {
            background-color: #ff6a00;
        }

    `;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    // Atribuindo eventos aos botões
    document.getElementById("pt-btn").addEventListener("click", () => setLanguage("pt"));
    document.getElementById("en-btn").addEventListener("click", () => setLanguage("en"));
}

function setLanguage(lang) {
    localStorage.setItem("language", lang);
    document.getElementById("language-popup").remove();
    loadTranslations(lang);
}

function loadTranslations(language) {
    const path = `translations/${language}/index.json`;
    fetch('translations/all.json')
        .then(response => response.json())
        .then(data => applyTranslations(data))
        .catch(error => console.error("Erro ao carregar traduções:", error));

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