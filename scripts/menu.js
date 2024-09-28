function toggleMenu() {
    var sideMenu = document.getElementById("side-menu");

    if (sideMenu.style.display === "flex") {
        closeMenu();
    } else {
        openMenu();
    }
}

function openMenu() {
    var sideMenu = document.getElementById("side-menu");
    var menubutton = document.getElementById("menu")
    menubutton.style.color = "#ff6a00"
    sideMenu.style.display = "flex";
    
    
    // Add an event listener to close the menu when clicking outside
    document.addEventListener('click', closeMenuOnOutsideClick);
}

function closeMenu() {
    var sideMenu = document.getElementById("side-menu");
    var menubutton = document.getElementById("menu")
    menubutton.style.color = "#fff"
    sideMenu.style.display = "none";
    

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