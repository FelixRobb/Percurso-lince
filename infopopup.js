// Open popup
function openInfoPopup(id) {
    document.getElementById(id).style.display = 'block';
}

// Close popup
function closeInfoPopup(id) {
    document.getElementById(id).style.display = 'none';
}

// Close the popup when clicking outside of it
window.onclick = function (event) {
    if (event.target.classList.contains('info-modal')) {
        event.target.style.display = 'none';
    }
}