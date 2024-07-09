        // Get the modal
        var modal = document.getElementById("myModal");

        // Get the <span> element that closes the modal
        var span = document.getElementsByClassName("close")[0];

        // Get the OK button
        var okButton = document.getElementById("modal-ok-button");

        // When the user clicks the OK button, close the modal
        okButton.onclick = function() {
            modal.style.display = "none";
        }

        // When the user clicks on <span> (x), close the modal
        span.onclick = function() {
            modal.style.display = "none";
        }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }

        // Display the modal when the page loads
        window.onload = function() {
            modal.style.display = "block";
        }