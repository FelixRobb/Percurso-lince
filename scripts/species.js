document.addEventListener('DOMContentLoaded', () => {
    const details = document.getElementById('details');

    const getCurrentLanguage = () => {
        return localStorage.getItem('lang-psg') || 'PT'; // Default to Portuguese if not set
    };

    const locationMap = {
        'Azenhas do Guadiana': 'map.html?lat=37.6462&lng=-7.6525',
        'Ribeira de Oeiras': 'map.html?lat=37.6254&lng=-7.8099',
        'Vila de Mértola': 'map.html?lat=37.6438&lng=-7.6604',
        'PR3 MTL - As Margens do Guadiana': 'map.html?track=PR3%20MTL%20-%20As%20Margens%20do%20Guadiana',
        'PR5 MTL - Ao Ritmo das Águas do Vascão': 'map.html?track=PR5%20MTL%20-%20Ao%20Ritmo%20das%20%C3%81guas%20do%20Vasc%C3%A3o',
        'PR8 MTL - Moinho do Alferes um Percurso Ribeirinho': 'map.html?track=PR8%20MTL%20-%20Moinho%20do%20Alferes%20um%20Percurso%20Ribeirinho'
    };

    const urlParams = new URLSearchParams(window.location.search);
    const speciesName = urlParams.get('name');
    const titlename = "Details for " + speciesName;
    document.title = titlename;

    fetch('/json/species.json')
        .then(response => response.json())
        .then(species => {
            const currentLang = getCurrentLanguage();
            const nameKey = `nome-${currentLang.toUpperCase()}`;


            const speciesEntries = species.filter(species => species['nome-PT'] === speciesName);

            if (speciesEntries.length === 0) {
                details.innerHTML = `<p>No details found for species</p>`;
                return;
            }

            const uniqueLocations = new Set();
            const uniqueSpeciesEntries = speciesEntries.filter(entry => {
                if (uniqueLocations.has(entry.association)) return false;
                uniqueLocations.add(entry.association);
                return true;
            });

            function displayDetails(entry) {
                const locationUrl = locationMap[entry.association] || '#';
                let heardSpecies = JSON.parse(localStorage.getItem('heardSpecies')) || [];

                let recordingsContent = '';
                const locationEntries = speciesEntries.filter(e => e.association === entry.association);
                locationEntries.forEach(locationEntry => {
                    recordingsContent += `
                        ${locationEntry.sound_url}
                        <p class="description"><strong><i></strong>${locationEntry[`descricao-${currentLang.toUpperCase()}`]}</i></p>
                    `;
                });

                function updateButton() {
                    heardSpecies = JSON.parse(localStorage.getItem('heardSpecies')) || [];
                    const isHeard = heardSpecies.includes(entry[`nome-PT`]);
                    heardButton.textContent = isHeard ? (currentLang === 'PT' ? 'Remover de Ouvidos' : 'Remove from Heard') : (currentLang === 'PT' ? 'Adicionar a Ouvidos' : 'Add to Heard');
                }

                details.innerHTML = `
                    <h2>${entry[`nome-${currentLang.toUpperCase()}`]} (${entry.scientific_name})</h2>
                    <button id="heardButton">${heardSpecies.includes(entry[`nome-${currentLang.toUpperCase()}`]) ? (currentLang === 'PT' ? 'Remover de Ouvidos' : 'Remove from Heard') : (currentLang === 'PT' ? 'Adicionar a Ouvidos' : 'Add to Heard')}</button>
                    <p class="comments">${entry[`notas-${currentLang.toUpperCase()}`]}</p>
                    <p class="months"><strong>${currentLang === 'PT' ? 'Melhores meses para se ouvir' : 'Best months to hear'}:</strong> ${entry[`most_probable_months_${currentLang}`].join(', ')}</p>
                    ${recordingsContent}
                    <label id="location-select-label" for="location-select"><strong>${currentLang === 'PT' ? 'Escolha a Localização' : 'Choose Location'}:</strong></label>
                    <select id="location-select"></select>
                    <p class="location"><strong>${currentLang === 'PT' ? 'Localização associada' : 'Associated Location'}:</strong> <a href="${locationUrl}">${entry.association}</a></p>
                `;

                const locationSelect = document.getElementById('location-select');
                const locationOptionsHtml = uniqueSpeciesEntries.map((entry, index) => `
                    <option value="${index}">${entry.association}</option>
                `).join('');
                locationSelect.innerHTML = locationOptionsHtml;
                locationSelect.selectedIndex = uniqueSpeciesEntries.indexOf(entry);

                const heardButton = document.getElementById('heardButton');
                heardButton.addEventListener('click', () => {
                    heardSpecies = JSON.parse(localStorage.getItem('heardSpecies')) || [];
                    const isHeard = heardSpecies.includes(entry[`nome-PT`]);

                    if (isHeard) {
                        heardSpecies = heardSpecies.filter(species => species !== entry[`nome-PT`]);
                    } else {
                        heardSpecies.push(entry[`nome-PT`]);
                    }

                    localStorage.setItem('heardSpecies', JSON.stringify(heardSpecies));
                    updateButton();
                });

                updateButton();
            }

            if (uniqueSpeciesEntries.length > 0) {
                displayDetails(uniqueSpeciesEntries[0]);
            }

            details.addEventListener('change', (event) => {
                const selectedIndex = event.target.value;
                displayDetails(uniqueSpeciesEntries[selectedIndex]);
            });
        })
        .catch(error => console.error('Error loading species data:', error));
});
