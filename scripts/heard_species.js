document.addEventListener('DOMContentLoaded', () => {
    const heardSpeciesContainer = document.getElementById('speciesList');

    const getCurrentLanguage = () => {
        return localStorage.getItem('lang-psg') || 'pt'; // Default to Portuguese
    };

    const currentLang = getCurrentLanguage();
    const nameKey = `nome-${currentLang.toUpperCase()}`; // Dynamic key for the name based on the current language

    // Fetch species data from species.json
    fetch('/json/species.json')
        .then(response => response.json())
        .then(speciesData => {
            const heardSpecies = JSON.parse(localStorage.getItem('heardSpecies')) || [];

            if (heardSpecies.length === 0) {
                heardSpeciesContainer.innerHTML = `<p>${currentLang === 'pt' ? 'Nenhuma espécie ouvida.' : 'No species heard yet.'}</p>`;
                return;
            }

            // Create a list to store the species details
            const speciesListHTML = heardSpecies.map(ptName => {
                // Find the species data by Portuguese name
                const species = speciesData.find(s => s['nome-PT'] === ptName);
                if (!species) return ''; // Skip if species not found in data

                return `
                    <li>
                        <a class="heardspecieslink" href="species.html?name=${encodeURIComponent(species['nome-PT'])}">
                            ${species[nameKey]}
                        </a>
                        <button data-species="${species['nome-PT']}" class="remove-button">
                            ${currentLang === 'pt' ? 'Remover' : 'Remove'}
                        </button>
                    </li>
                `;
            }).join('');

            // Insert the generated species list into the HTML
            heardSpeciesContainer.innerHTML = `
                <div class="specieslistdiv">
                    <ul id="speciesList">${speciesListHTML}</ul>
                </div>
            `;

            // Add event listeners to the remove buttons
            document.querySelectorAll('.remove-button').forEach(button => {
                button.addEventListener('click', (event) => {
                    const speciesToRemove = event.target.getAttribute('data-species');
                    const updatedHeardSpecies = heardSpecies.filter(species => species !== speciesToRemove);
                    localStorage.setItem('heardSpecies', JSON.stringify(updatedHeardSpecies));

                    // Refresh the list
                    window.location.reload();
                });
            });
        })
        .catch(error => console.error('Error loading species data:', error));
});
