document.addEventListener('DOMContentLoaded', () => {
    const details = document.getElementById('details');


    // Define the location map
    const locationMap = {
        'Azenhas do Guadiana': 'map.html?lat=37.6462&lng=-7.6525',
        'Ribeira de Oeiras': 'map.html?lat=37.6254&lng=-7.8099',
        'Vila de Mértola': 'map.html?lat=37.6438&lng=-7.6604',
        'PR3 MTL - As Margens do Guadiana': 'map.html?track=PR3%20MTL%20-%20As%20Margens%20do%20Guadiana',
        'PR5 MTL - Ao Ritmo das Águas do Vascão': 'map.html?track=PR5%20MTL%20-%20Ao%20Ritmo%20das%20%C3%81guas%20do%20Vasc%C3%A3o',
        'PR8 MTL - Moinho do Alferes um Percurso Ribeirinho': 'map.html?track=PR8%20MTL%20-%20Moinho%20do%20Alferes%20um%20Percurso%20Ribeirinho'
    };


    // Extract the species name from the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const speciesName = urlParams.get('name');

    document.title = speciesName;

    // Fetch species data and filter for the selected species
    fetch('species.json')
        .then(response => {
            return response.json();
        })
        .then(species => {
            const speciesEntries = species.filter(species => species['nome-PT'] === speciesName);

            window.top.document.title = speciesName;

            if (speciesEntries.length === 0) {
                details.innerHTML = `<p>No details found for species: ${speciesName}</p>`;
                console.warn('No details found for species:', speciesName);
                return;
            }

            // Create a Set to keep track of unique locations (associations)
            const uniqueLocations = new Set();

            // Filter unique entries by location (association)
            const uniqueSpeciesEntries = speciesEntries.filter(entry => {
                if (uniqueLocations.has(entry.association)) {
                    return false; // Skip duplicates
                }
                uniqueLocations.add(entry.association);
                return true;
            });

            // Function to display details, including the select element
            function displayDetails(entry, speciesEntries) {
                const locationUrl = locationMap[entry.association] || '#';

                // Retrieve the current heard species list from localStorage
                let heardSpecies = JSON.parse(localStorage.getItem('heardSpecies')) || [];

                // Filter speciesEntries by the selected association (location)
                const locationEntries = speciesEntries.filter(e => e.association === entry.association);

                // Initialize content for multiple recordings
                let recordingsContent = '';

                locationEntries.forEach((locationEntry) => {
                    recordingsContent += `
                        ${locationEntry.sound_url}
                        <p class="description"><strong><i></strong>${locationEntry['descricao-PT']}</i></p>
                    `;
                });


                // Function to update button text based on current state
                function updateButton() {
                    heardSpecies = JSON.parse(localStorage.getItem('heardSpecies')) || [];
                    const isHeard = heardSpecies.includes(entry['nome-PT']);
                    heardButton.textContent = isHeard ? 'Remove from Heard' : 'Add to Heard';
                }

                // Build the species details and insert the select dropdown after the species name
                details.innerHTML = `
                    <h2>${entry['nome-PT']} (${entry.scientific_name})</h2>
                    <button id="heardButton">${heardSpecies.includes(entry['nome-PT']) ? 'Remove from Heard' : 'Add to Heard'}</button>
                    <p class="comments">${entry['notas-PT']}</p>
                    <p class="months"><strong>Melhores meses para se ouvir:</strong> ${entry.most_probable_months.join(', ')}</p>
                    <label id="location-select-label" for="location-select"><strong>Escolha a Localização:</strong></label>
                    <select id="location-select"></select>
                    ${recordingsContent}
                    <p class="location"><strong>Localização associada:</strong> <a href="${locationUrl}">${entry.association}</a></p>
                `;

                // Populate the select element with unique locations
                const locationSelect = document.getElementById('location-select');
                const locationOptionsHtml = uniqueSpeciesEntries.map((entry, index) => `
                    <option value="${index}">${entry.association}</option>
                `).join('');
                locationSelect.innerHTML = locationOptionsHtml;

                // Pre-select the first option and trigger change event
                locationSelect.selectedIndex = uniqueSpeciesEntries.indexOf(entry);

                // Add event listener to the button to toggle add/remove from the heard list
                const heardButton = document.getElementById('heardButton');
                heardButton.addEventListener('click', () => {
                    heardSpecies = JSON.parse(localStorage.getItem('heardSpecies')) || [];
                    const isHeard = heardSpecies.includes(entry['nome-PT']);

                    if (isHeard) {
                        // If species is already in the list, remove it
                        heardSpecies = heardSpecies.filter(species => species !== entry['nome-PT']);
                    } else {
                        // If species is not in the list, add it
                        heardSpecies.push(entry['nome-PT']);
                    }

                    // Update the heardSpecies in localStorage
                    localStorage.setItem('heardSpecies', JSON.stringify(heardSpecies));

                    // Update the button text based on the new state
                    updateButton();
                });

                // Initial call to set the correct button text
                updateButton();
            }

            // Display details for the first location by default
            if (uniqueSpeciesEntries.length > 0) {
                displayDetails(uniqueSpeciesEntries[0], speciesEntries);  // Display details for the first location
            }

            // Event listener for select element
            details.addEventListener('change', (event) => {
                const selectedIndex = event.target.value;
                displayDetails(uniqueSpeciesEntries[selectedIndex], speciesEntries);
            });
        })
        .catch(error => console.error('Error loading species data:', error));
});
