document.addEventListener('DOMContentLoaded', () => {
    const popupCloseButton = document.getElementById('popup-close');
    
    // Always show the popup
    document.getElementById('popup').style.display = 'block';

    popupCloseButton.addEventListener('click', () => {
        // Redirect to map.html
        window.location.href = 'map.html';
    });
});
