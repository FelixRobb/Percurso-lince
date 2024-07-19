// Get the OK button
var okButton = document.getElementById("modal-ok-button");

// When the user clicks the OK button, close the modal
okButton.onclick = function () {
    window.location.href = "home.html";
    modal.style.display = "none";
}


