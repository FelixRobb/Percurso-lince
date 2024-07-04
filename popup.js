document.addEventListener('DOMContentLoaded', function () {
    const popup = document.getElementById('popup');
    const closeBtn = document.getElementById('popup-close');

    // Number of days after which the popup should appear again
    const popupIntervalDays = 7;

    // Function to check if the popup should be shown
    function shouldShowPopup() {
        const lastShown = localStorage.getItem('popupLastShown');
        if (!lastShown) {
            return true;
        }
        const now = new Date();
        const lastShownDate = new Date(lastShown);
        const timeDifference = now - lastShownDate;
        const daysDifference = timeDifference / (1000 * 3600 * 24);
        return daysDifference >= popupIntervalDays;
    }

    // Show popup if needed
    if (shouldShowPopup()) {
        popup.style.display = 'flex';

        // Update the last shown time
        localStorage.setItem('popupLastShown', new Date().toISOString());
    }

    // Close popup button event listener
    closeBtn.addEventListener('click', function () {
        popup.style.display = 'none';
    });
});