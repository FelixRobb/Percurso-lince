function normalizeString(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function updateFilteredSpecies() {
    let heardSpecies = localStorage.getItem('heardSpecies');
    if (heardSpecies) {
        heardSpecies = JSON.parse(heardSpecies);

        // Fetch species.json to get the names based on the IDs
        fetch('species.json')
            .then(response => response.json())
            .then(data => {
                const searchInput = document.getElementById('searchInput');
                const query = normalizeString(searchInput.value);
                
                // Filter species based on heardSpecies IDs
                let filteredSpecies = data
                    .filter(species => heardSpecies.includes(species.id)) // Filter only heard species
                    .map(species => {
                        const name = normalizeString(species['nome-PT']);
                        const scientificName = normalizeString(species.scientific_name);
                        let weight = 0;

                        // If search query is not empty, apply search logic
                        if (query) {
                            // Highest weight: common name starts with the query
                            if (name.startsWith(query)) {
                                weight += 3;
                            }

                            // Second highest weight: scientific name starts with the query and is more than 3 characters
                            if (scientificName.startsWith(query) && query.length > 3) {
                                weight += 2;
                            }

                            // Lower weight: query is found anywhere in the common name
                            if (name.includes(query)) {
                                weight += 1;
                            }

                            // Lowest weight: query is found anywhere in the scientific name
                            if (scientificName.includes(query)) {
                                weight += 0.5;
                            }

                            return { species, weight };
                        } else {
                            // If no search query, just return species
                            return { species, weight: 1 };
                        }
                    })
                    .filter(item => item.weight > 0) // Only include species that have a weight (if search query)
                    .sort((a, b) => {
                        if (query) {
                            return b.weight - a.weight; // Sort by weight, highest first
                        } else {
                            // Alphabetical order if no search query
                            return a.species['nome-PT'].localeCompare(b.species['nome-PT']);
                        }
                    })
                    .map(item => item.species); // Map back to the species objects

                displayHeardSpecies(filteredSpecies);
            })
            .catch(error => console.error('Error loading species.json:', error));
    }
}

function displayHeardSpecies(filteredSpecies) {
    const speciesList = document.getElementById('speciesList');
    speciesList.innerHTML = ''; // Clear the list

    filteredSpecies.forEach(species => {
        const li = document.createElement('li');

        // Create the link to the species.html page
        const link = document.createElement('a');
        link.className = 'heardspecieslink';
        link.href = `species.html?name=${encodeURIComponent(species['nome-PT'])}`;
        link.textContent = species['nome-PT'];
        li.appendChild(link);

        // Add delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Remover';
        deleteButton.onclick = () => deleteSpecies(species.id); // Use species ID here
        li.appendChild(deleteButton);

        speciesList.appendChild(li);
    });
}

// Event listener for search input
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', updateFilteredSpecies);

// Initialize the list
