document.addEventListener('DOMContentLoaded', () => {
    const popup = document.getElementById('popup');
    const popupClose = document.getElementById('popup-close');

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value};${expires};path=/`;
    }

    if (!getCookie('popupDisplayed')) {
        popup.style.display = 'flex';
        popup.querySelector('.popup-content').style.display = 'block';
    }

    popupClose.addEventListener('click', () => {
        popup.style.display = 'none';
        setCookie('popupDisplayed', 'true', 1);
    });
});
