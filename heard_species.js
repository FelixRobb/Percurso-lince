function displayHeardSpecies() {
    let heardSpecies = localStorage.getItem('heardSpecies');
    if (heardSpecies) {
        heardSpecies = JSON.parse(heardSpecies);
        const speciesList = document.getElementById('speciesList');
        speciesList.innerHTML = ''; // Clear the list

        heardSpecies.forEach(species => {
            const li = document.createElement('li');

            // Create the link to the species.html page
            const link = document.createElement('a');
            link.className = 'heardspecieslink'
            link.href = `species.html?name=${encodeURIComponent(species)}`;
            link.textContent = species;
            li.appendChild(link);

            // Add delete button
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Remover';
            deleteButton.onclick = () => deleteSpecies(species);
            li.appendChild(deleteButton);

            speciesList.appendChild(li);
        });
    }
}

function deleteSpecies(speciesName) {
    let heardSpecies = JSON.parse(localStorage.getItem('heardSpecies'));
    heardSpecies = heardSpecies.filter(species => species !== speciesName);
    localStorage.setItem('heardSpecies', JSON.stringify(heardSpecies));
    displayHeardSpecies(); // Refresh the list
}

// Search functionality
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const speciesItems = document.querySelectorAll('#speciesList li');

    speciesItems.forEach(item => {
        const speciesName = item.childNodes[0].textContent.toLowerCase(); // Adjusted to focus on the species name only
        if (speciesName.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
});

displayHeardSpecies();