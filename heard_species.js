// Function to display heard species
function displayHeardSpecies(heardSpecies = null) {
    if (!heardSpecies) {
        heardSpecies = localStorage.getItem('heardSpecies');
        if (heardSpecies) {
            heardSpecies = JSON.parse(heardSpecies);
        } else {
            heardSpecies = [];
        }
    }

    // If no search term is present, sort alphabetically
    if (heardSpecies.length > 0 && !searchInput.value) {
        heardSpecies.sort((a, b) => a.localeCompare(b));
    }

    const speciesList = document.getElementById('speciesList');
    speciesList.innerHTML = ''; // Clear the list

    heardSpecies.forEach(species => {
        const li = document.createElement('li');

        // Create the link to the species.html page
        const link = document.createElement('a');
        link.className = 'heardspecieslink';
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

// Function to delete species from local storage
function deleteSpecies(speciesName) {
    let heardSpecies = JSON.parse(localStorage.getItem('heardSpecies'));
    heardSpecies = heardSpecies.filter(species => species !== speciesName);
    localStorage.setItem('heardSpecies', JSON.stringify(heardSpecies));
    displayHeardSpecies(heardSpecies); // Refresh the list
}

// Weighted Search Functionality
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    let heardSpecies = JSON.parse(localStorage.getItem('heardSpecies')) || [];

    if (searchTerm) {
        // Apply the weighted search logic
        const weightedResults = heardSpecies
            .map(species => {
                const name = species.toLowerCase();
                let weight = 0;

                // Highest weight: species name starts with the query
                if (name.startsWith(searchTerm)) {
                    weight += 3;
                }

                // Lower weight: query is found anywhere in the species name
                else if (name.includes(searchTerm)) {
                    weight += 1;
                }

                return { species, weight };
            })
            .filter(item => item.weight > 0) // Only include species that have a weight (i.e., matched the query)
            .sort((a, b) => b.weight - a.weight) // Sort by weight, highest weight first
            .map(item => item.species); // Map back to the species names

        // Update the display with weighted results
        displayHeardSpecies(weightedResults);
    } else {
        // If no search term, display all species sorted alphabetically
        displayHeardSpecies();
    }
});

// Initial display of heard species
displayHeardSpecies();