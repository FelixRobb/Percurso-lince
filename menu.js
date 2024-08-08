function toggleMenu() {
    var sideMenu = document.getElementById("side-menu");
    if (sideMenu.style.display === "block") {
        sideMenu.style.display = "none";
        sideMenu.style.width = "0"
    } else {
        sideMenu.style.display = "block";
        sideMenu.style.width = "90vw"
    }
}
