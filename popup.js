document.addEventListener('DOMContentLoaded', function () {
    const popup = document.getElementById('popup');
    const closeBtn = document.getElementById('popup-close');

    // Function to set a cookie with expiration in 24 hours
    function setCookie(name, value) {
        const date = new Date();
        date.setTime(date.getTime() + (86400 * 1000)); // 86400 seconds = 24 hours
        const expires = "expires=" + date.toUTCString();
        document.cookie = `${name}=${value}; ${expires}; path=/`;
    }

    // Function to check if the popup should be shown
    function shouldShowPopup() {
        return !document.cookie.includes('popupShown=true');
    }

    // Show popup if needed
    if (shouldShowPopup()) {
        popup.style.display = 'flex';
    }

    // Close popup button event listener
    closeBtn.addEventListener('click', function () {
        popup.style.display = 'none';
        setCookie('popupShown', 'true'); // Set the cookie when the popup is closed
    });
});