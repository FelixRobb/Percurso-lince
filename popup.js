document.addEventListener('DOMContentLoaded', () => {
    const popupCloseButton = document.getElementById('popup-close');

    // Check if the user has already seen the popup
    if (localStorage.getItem('popupDisplayed')) {
        // Redirect to map.html or recordings.html if the popup was already displayed
        window.location.href = 'map.html';
    } else {
        // Show the popup
        document.getElementById('popup').style.display = 'block';
    }

    popupCloseButton.addEventListener('click', () => {
        // Mark the popup as displayed
        localStorage.setItem('popupDisplayed', 'true');
        // Redirect to map.html
        window.location.href = 'map.html';
    });
});