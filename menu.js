function toggleMenu() {
    var sideMenu = document.getElementById("side-menu");

    if (sideMenu.style.display === "block") {
        closeMenu();
    } else {
        openMenu();
    }
}

function openMenu() {
    var sideMenu = document.getElementById("side-menu");
    sideMenu.style.display = "block";
    sideMenu.style.width = "90vw";

    // Add an event listener to close the menu when clicking outside
    document.addEventListener('click', closeMenuOnOutsideClick);
}

function closeMenu() {
    var sideMenu = document.getElementById("side-menu");
    sideMenu.style.display = "none";
    sideMenu.style.width = "0";

    // Remove the event listener after closing the menu
    document.removeEventListener('click', closeMenuOnOutsideClick);
}

function closeMenuOnOutsideClick(event) {
    var sideMenu = document.getElementById("side-menu");
    var menuIcon = document.getElementById("menu-icon");

    // Check if the clicked element is not the menu or the menu icon
    if (!sideMenu.contains(event.target) && !menuIcon.contains(event.target)) {
        closeMenu();
    }
}