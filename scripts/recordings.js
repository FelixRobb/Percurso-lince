document.addEventListener('DOMContentLoaded', () => {
    const recordingsList = document.getElementById('recordings-list');
    const filterMonthButton = document.getElementById('filter-season');
    const filterNameButton = document.getElementById('filter-name');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const filterAssociationSelect = document.getElementById('filter-association');
    const filterTypeSelect = document.getElementById('filter-type');
    const filterTimeSelect = document.getElementById('filter-time');

    let allSpecies = [];
    let filteredSpecies = [];

    const getCurrentLanguage = () => {
        return localStorage.getItem('language') || 'PT'; // Default to Portuguese if not set
    };

    const translateUI = () => {
        const currentLang = getCurrentLanguage();
        
        // Translate button texts
        filterMonthButton.textContent = currentLang === 'PT' ? 'Filtrar por Mês' : 'Filter by Month';
        filterNameButton.textContent = currentLang === 'PT' ? 'Filtrar por Nome' : 'Filter by Name';
        searchButton.textContent = currentLang === 'PT' ? 'Pesquisar' : 'Search';

        // Translate select options
        filterAssociationSelect.options[0].text = currentLang === 'PT' ? 'Todas as Localizações' : 'All Locations';
        filterTypeSelect.options[0].text = currentLang === 'PT' ? 'Classe Animal' : 'Animal Class';
        filterTimeSelect.options[0].text = currentLang === 'PT' ? 'Hora do dia' : 'Time of day';

        // Translate placeholder
        searchInput.placeholder = currentLang === 'PT' ? 'Pesquisar espécies...' : 'Search species...';
    };

    fetch('/json/species.json')
        .then(response => response.json())
        .then(species => {
            const aggregatedSpecies = aggregateSpecies(species);
            allSpecies = sortByName(aggregatedSpecies);
            filteredSpecies = allSpecies; // Initialize filteredSpecies
            populateAssociationFilter(allSpecies);
            populateTypeFilter(allSpecies);
            populateTimeFilter(allSpecies);
            displaySpecies(filteredSpecies);
            translateUI();

            // Check URL for location and apply filter if needed
            const urlParams = new URLSearchParams(window.location.search);
            const locationFromUrl = urlParams.get('location'); // Assume URL parameter is "location"

            if (locationFromUrl) {
                const locationOption = Array.from(filterAssociationSelect.options).find(option => option.value === locationFromUrl);
                if (locationOption) {
                    filterAssociationSelect.value = locationFromUrl;
                    updateFilteredSpecies(); // Update filteredSpecies based on location
                    displaySpecies(filteredSpecies); // Show filteredSpecies
                }
            }

            filterNameButton.addEventListener('click', () => {
                filteredSpecies = sortByName(filteredSpecies);
                displaySpecies(filteredSpecies);
            });

            filterMonthButton.addEventListener('click', () => {
                filteredSpecies = sortByMonth(filteredSpecies);
                displaySpecies(filteredSpecies);
            });

            searchInput.addEventListener('input', () => {
                updateFilteredSpecies(); // Apply association, type, and time filters
                const query = searchInput.value.toLowerCase();
                const currentLang = getCurrentLanguage();
            
                filteredSpecies = filteredSpecies
                    .map(species => {
                        const name = species[`name-${currentLang}`].toLowerCase();
                        const scientificName = species.scientific_name.toLowerCase();
            
                        let weight = 0;
            
                        // Highest weight: common name starts with the query
                        if (name.startsWith(query)) {
                            weight += 3;
                        }
            
                        // Second highest weight: scientific name starts with the query and is more than 3 characters
                        if (scientificName.startsWith(query) && query.length > 2) {
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
                    })
                    .filter(item => item.weight > 0) // Only include species with a weight
                    .sort((a, b) => b.weight - a.weight) // Sort by weight, highest first
                    .map(item => item.species); // Map back to species objects
            
                displaySpecies(filteredSpecies);
            });

            filterAssociationSelect.addEventListener('change', () => {
                updateFilteredSpecies();
                displaySpecies(filteredSpecies);
            });

            filterTypeSelect.addEventListener('change', () => {
                updateFilteredSpecies();
                displaySpecies(filteredSpecies);
            });

            filterTimeSelect.addEventListener('change', () => {
                updateFilteredSpecies();
                displaySpecies(filteredSpecies);
            });
        })
        .catch(error => console.error('Error loading species data:', error));

    function aggregateSpecies(species) {
        const uniqueSpecies = {};
        const currentLang = getCurrentLanguage();

        species.forEach(species => {
            if (!uniqueSpecies[species[`nome-${currentLang}`]]) {
                uniqueSpecies[species[`nome-${currentLang}`]] = {
                    [`name-PT`]: species['nome-PT'],
                    [`name-EN`]: species['nome-EN'],
                    scientific_name: species.scientific_name,
                    most_probable_months_PT: new Set(species.most_probable_months_PT),
                    associations: new Set([species.association]),
                    [`group-PT`]: species['grupo-PT'],
                    [`group-EN`]: species['grupo-EN'],
                    [`quando-PT`]: species['quando-PT'],
                    [`quando-EN`]: species['quando-EN'],
                    [`comenta-PT`]: species['notas-PT'],
                    [`comenta-EN`]: species['notas-EN'],
                    [`description-PT`]: species['descricao-PT'],
                    [`description-EN`]: species['descricao-EN'],
                    sound_url: species.sound_url
                };
            } else {
                species.most_probable_months_PT.forEach(month => uniqueSpecies[species[`nome-${currentLang}`]].most_probable_months_PT.add(month));
                uniqueSpecies[species[`nome-${currentLang}`]].associations.add(species.association);
            }
        });

        return Object.values(uniqueSpecies).map(species => ({
            ...species, 
            most_probable_months_PT: averageMonths([...species.most_probable_months_PT]),
            associations: [...species.associations]
        }));
    }

    function averageMonths(months) {
        return months.sort((a, b) => a.localeCompare(b));
    }

    function updateFilteredSpecies() {
        const selectedLocation = filterAssociationSelect.value;
        const selectedType = filterTypeSelect.value;
        const selectedTime = filterTimeSelect.value;
        const currentLang = getCurrentLanguage();

        filteredSpecies = allSpecies.filter(species =>
            (selectedLocation === '' || species.associations.includes(selectedLocation)) &&
            (selectedType === '' || species[`group-${currentLang}`] === selectedType) &&
            (selectedTime === '' || species[`quando-${currentLang}`] === selectedTime)
        );
    }

    function displaySpecies(species) {
        recordingsList.innerHTML = '';
        const currentLang = getCurrentLanguage();
        species.forEach(species => {
            const speciesItem = document.createElement('div');
            speciesItem.classList.add('bird-item');
            speciesItem.innerHTML = `
                <a href="species.html?name=${encodeURIComponent(species[`name-PT`])}">${species[`name-${currentLang}`]} (${species.scientific_name})</a>
            `;
            recordingsList.appendChild(speciesItem);
        });
    }

    function populateAssociationFilter(species) {
        const uniqueLocations = [...new Set(species.flatMap(species => species.associations))];
        const currentLang = getCurrentLanguage();
        filterAssociationSelect.innerHTML = `<option value="">${currentLang === 'PT' ? 'Todas as Localizações' : 'All Locations'}</option>`;
        uniqueLocations.forEach(location => {
            const option = document.createElement('option');
            option.value = location;
            option.textContent = location;
            filterAssociationSelect.appendChild(option);
        });
    }

    function populateTypeFilter(species) {
        const currentLang = getCurrentLanguage();
        const uniqueTypes = [...new Set(species.map(species => species[`group-${currentLang}`]))];
        filterTypeSelect.innerHTML = `<option value="">${currentLang === 'PT' ? 'Classe Animal' : 'Animal Class'}</option>`;
        uniqueTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            filterTypeSelect.appendChild(option);
        });
    }

    function populateTimeFilter(species) {
        const currentLang = getCurrentLanguage();
        const uniqueTimes = [...new Set(species.map(species => species[`quando-${currentLang}`]))];
        filterTimeSelect.innerHTML = `<option value="">${currentLang === 'PT' ? 'Hora do dia' : 'Time of day'}</option>`;
        uniqueTimes.forEach(time => {
            const option = document.createElement('option');
            option.value = time;
            option.textContent = time;
            filterTimeSelect.appendChild(option);
        });
    }

    function sortByMonth(species) {
    // Define the month names in Portuguese (as they are used for calculations)
    const monthNamesPT = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

    // Get the current month index (0 for January, 1 for February, etc.)
    const currentMonthIndex = new Date().getMonth();

    // Get the current month name in Portuguese
    const currentMonthPT = monthNamesPT[currentMonthIndex];

    // Filter species that are most probable in the current month
    const speciesThisMonth = species.filter(species => species.most_probable_months_PT.includes(currentMonthPT));

    // Filter species that are not most probable in the current month
    const speciesNotThisMonth = species.filter(species => !species.most_probable_months_PT.includes(currentMonthPT));

    // Sort both groups alphabetically by the Portuguese name
    speciesThisMonth.sort((a, b) => a['name-PT'].localeCompare(b['name-PT']));
    speciesNotThisMonth.sort((a, b) => a['name-PT'].localeCompare(b['name-PT']));

    // Return the sorted list, with species for the current month appearing first
    return speciesThisMonth.concat(speciesNotThisMonth);
}


    function sortByName(species) {
        const currentLang = getCurrentLanguage();
        return species.sort((a, b) => a[`name-${currentLang}`].localeCompare(b[`name-${currentLang}`]));
    }
});