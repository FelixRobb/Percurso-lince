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

    fetch('species.json')
        .then(response => response.json())
        .then(species => {
            const aggregatedSpecies = aggregateSpecies(species);
            allSpecies = sortByName(aggregatedSpecies);
            filteredSpecies = allSpecies; // Initialize filteredSpecies
            populateAssociationFilter(allSpecies);
            populateTypeFilter(allSpecies);
            populateTimeFilter(allSpecies);
            displaySpecies(filteredSpecies);

            // Verifica a URL e seleciona a localização se for especificada
            const urlParams = new URLSearchParams(window.location.search);
            const locationFromUrl = urlParams.get('location'); // Assume que o parâmetro da URL é "location"

            if (locationFromUrl) {
                const locationOption = Array.from(filterAssociationSelect.options).find(option => option.value === locationFromUrl);
                if (locationOption) {
                    filterAssociationSelect.value = locationFromUrl;
                    updateFilteredSpecies(); // Atualiza as espécies filtradas com base na localização
                    displaySpecies(filteredSpecies); // Mostra as espécies filtradas
                }
            }

            // Gera e loga os links das localizações possíveis
            logLocationLinks();

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
            
                filteredSpecies = filteredSpecies
                    .map(species => {
                        const name = species.name.toLowerCase();
                        const scientificName = species.scientific_name.toLowerCase();
            
                        let weight = 0;
            
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
                    })
                    .filter(item => item.weight > 0) // Only include species that have a weight (i.e., matched the query)
                    .sort((a, b) => b.weight - a.weight) // Sort by weight, highest weight first
                    .map(item => item.species); // Map back to the species objects
            
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

        species.forEach(species => {
            if (!uniqueSpecies[species['nome-PT']]) {
                uniqueSpecies[species['nome-PT']] = {
                    name: species['nome-PT'],
                    scientific_name: species.scientific_name,
                    most_probable_months: new Set(species.most_probable_months),
                    association: species.association,
                    group_PT: species['grupo-PT'],
                    quando_PT: species['quando-PT'],
                    comenta: species['notas-PT'],
                    description: species['descricao-PT'],
                    sound_url: species.sound_url
                };
            } else {
                species.most_probable_months.forEach(month => uniqueSpecies[species['nome-PT']].most_probable_months.add(month));
            }
        });

        return Object.values(uniqueSpecies).map(species => ({
            ...species,
            most_probable_months: averageMonths([...species.most_probable_months])
        }));
    }

    function averageMonths(months) {
        return months.sort((a, b) => a.localeCompare(b));
    }

    function updateFilteredSpecies() {
        const selectedLocation = filterAssociationSelect.value;
        const selectedType = filterTypeSelect.value;
        const selectedTime = filterTimeSelect.value;

        filteredSpecies = allSpecies.filter(species =>
            (selectedLocation === '' || species.association === selectedLocation) &&
            (selectedType === '' || species.group_PT === selectedType) &&
            (selectedTime === '' || species.quando_PT === selectedTime)
        );
    }

    function displaySpecies(species) {
        recordingsList.innerHTML = '';
        species.forEach(species => {
            const speciesItem = document.createElement('div');
            speciesItem.classList.add('bird-item');
            speciesItem.innerHTML = `
                <a href="species.html?name=${encodeURIComponent(species.name)}">${species.name} (${species.scientific_name})</a>
            `;
            recordingsList.appendChild(speciesItem);
        });
    }

    function populateAssociationFilter(species) {
        const uniqueLocations = [...new Set(species.map(species => species.association))];
        filterAssociationSelect.innerHTML = '<option value="">Todas as Localizações</option>'; // Reset filter options
        uniqueLocations.forEach(location => {
            const option = document.createElement('option');
            option.value = location;
            option.textContent = location;
            filterAssociationSelect.appendChild(option);
        });
    }


    function populateTypeFilter(species) {
        const uniqueTypes = [...new Set(species.map(species => species.group_PT))];
        filterTypeSelect.innerHTML = '<option value="">Classe Animal</option>'; // Reset filter options
        uniqueTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            filterTypeSelect.appendChild(option);
        });
    }

    function populateTimeFilter(species) {
        const uniqueTimes = [...new Set(species.map(species => species.quando_PT))];
        filterTimeSelect.innerHTML = '<option value="">Hora do dia</option>'; // Reset filter options
        uniqueTimes.forEach(time => {
            const option = document.createElement('option');
            option.value = time;
            option.textContent = time;
            filterTimeSelect.appendChild(option);
        });
    }

    function sortByMonth(species) {
        const monthNames = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
        const currentMonthIndex = new Date().getMonth();
        const currentMonth = monthNames[currentMonthIndex];

        const speciesThisMonth = species.filter(species => species.most_probable_months.includes(currentMonth));
        const speciesNotThisMonth = species.filter(species => !species.most_probable_months.includes(currentMonth));

        speciesThisMonth.sort((a, b) => a.name.localeCompare(b.name));
        speciesNotThisMonth.sort((a, b) => a.name.localeCompare(b.name));

        return speciesThisMonth.concat(speciesNotThisMonth);
    }

    function sortByName(species) {
        return species.sort((a, b) => a.name.localeCompare(b.name));
    }
});
