document.addEventListener('DOMContentLoaded', () => {
    const recordingsList = document.getElementById('recordings-list');
    const filterMonthButton = document.getElementById('filter-season');
    const filterNameButton = document.getElementById('filter-name');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const filterAssociationSelect = document.getElementById('filter-association');

    let allBirds = [];
    let filteredBirds = [];
    let currentLanguage = 'pt'; // Default language, adjust as needed

    fetch('species.json')
        .then(response => response.json())
        .then(birds => {
            allBirds = aggregateBirds(birds);
            populateAssociationFilter(allBirds);
            filteredBirds = allBirds;
            displayBirds(filteredBirds);

            filterNameButton.addEventListener('click', () => {
                filteredBirds = sortByName(filteredBirds);
                displayBirds(filteredBirds);
            });

            filterMonthButton.addEventListener('click', () => {
                filteredBirds = sortByMonth(filteredBirds);
                displayBirds(filteredBirds);
            });

            searchButton.addEventListener('click', performSearch);

            searchInput.addEventListener('keyup', (event) => {
                if (event.key === 'Enter') {
                    performSearch();
                }
            });

            filterAssociationSelect.addEventListener('change', () => {
                updateFilteredBirds();
                displayBirds(filteredBirds);
            });

            // Handle language change event
            document.addEventListener('languageChanged', () => {
                updatePageLanguage();
                searchInput.placeholder = translate('searchPlaceholder');
                populateAssociationFilter(allBirds);
                filteredBirds = sortByName(filteredBirds);
                displayBirds(filteredBirds);
            });
        })
        .catch(error => console.error('Error loading bird data:', error));

    function performSearch() {
        const query = searchInput.value.toLowerCase();
        filteredBirds = allBirds.filter(bird =>
            (bird.association === filterAssociationSelect.value || filterAssociationSelect.value === '') &&
            (bird.name.toLowerCase().includes(query) || 
             bird.nameEN.toLowerCase().includes(query) || 
             bird.scientific_name.toLowerCase().includes(query))
        );
        displayBirds(filteredBirds);
    }

    function aggregateBirds(birds) {
        const uniqueBirds = {};

        birds.forEach(bird => {
            if (!uniqueBirds[bird.name]) {
                uniqueBirds[bird.name] = {
                    name: bird.name,
                    nameEN: bird.nameEN,
                    scientific_name: bird.scientific_name,
                    most_probable_months: new Set(bird.most_probable_months),
                    association: bird.association,
                    notasPT: bird.notasPT,
                    notesEN: bird.notesEN,
                    descricaoPT: bird.descricaoPT,
                    descriptionEN: bird.descriptionEN,
                    sound_url: bird.sound_url
                };
            } else {
                bird.most_probable_months.forEach(month => uniqueBirds[bird.name].most_probable_months.add(month));
            }
        });

        return Object.values(uniqueBirds).map(bird => ({
            ...bird,
            most_probable_months: averageMonths([...bird.most_probable_months])
        }));
    }

    function averageMonths(months) {
        return months.sort((a, b) => a.localeCompare(b));
    }

    function updateFilteredBirds() {
        const selectedLocation = filterAssociationSelect.value;
        filteredBirds = selectedLocation
            ? allBirds.filter(bird => bird.association === selectedLocation)
            : allBirds;
    }

    function displayBirds(birds) {
        recordingsList.innerHTML = '';
        birds.forEach(bird => {
            const birdItem = document.createElement('div');
            birdItem.classList.add('bird-item');
            birdItem.innerHTML = `
                <a href="species.html?name=${encodeURIComponent(bird.name)}">
                    ${currentLanguage === 'pt' ? bird.name : bird.nameEN} (${bird.scientific_name})
                </a>
            `;
            recordingsList.appendChild(birdItem);
        });
    }

    function populateAssociationFilter(birds) {
        const uniqueLocations = [...new Set(birds.map(bird => bird.association))];
        filterAssociationSelect.innerHTML = `<option value="">${translate('allLocations')}</option>`;
        uniqueLocations.forEach(location => {
            const option = document.createElement('option');
            option.value = location;
            option.textContent = location;
            filterAssociationSelect.appendChild(option);
        });
    }

    function sortByMonth(birds) {
        const monthNames = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
        const currentMonthIndex = new Date().getMonth();
        const currentMonth = monthNames[currentMonthIndex];

        const birdsThisMonth = birds.filter(bird => bird.most_probable_months.includes(currentMonth));
        const birdsNotThisMonth = birds.filter(bird => !bird.most_probable_months.includes(currentMonth));

        birdsThisMonth.sort((a, b) => (currentLanguage === 'pt' ? a.name : a.nameEN).localeCompare(currentLanguage === 'pt' ? b.name : b.nameEN));
        birdsNotThisMonth.sort((a, b) => (currentLanguage === 'pt' ? a.name : a.nameEN).localeCompare(currentLanguage === 'pt' ? b.name : b.nameEN));

        return birdsThisMonth.concat(birdsNotThisMonth);
    }

    function sortByName(birds) {
        return birds.sort((a, b) => {
            const nameA = currentLanguage === 'pt' ? a.name : a.nameEN;
            const nameB = currentLanguage === 'pt' ? b.name : b.nameEN;
            return nameA.localeCompare(nameB);
        });
    }

    function updatePageLanguage() {
        // Implement language update logic here
        // For example, you might update the `currentLanguage` variable based on user selection
        currentLanguage = getCurrentLanguage(); // Replace with your actual method of getting the current language
    }

    function translate(key) {
        // Implement translation logic here
        // This function should return the translated string for the given key
        // Example:
        const translations = {
            'searchPlaceholder': currentLanguage === 'pt' ? 'Procurar...' : 'Search...',
            'allLocations': currentLanguage === 'pt' ? 'Todos os locais' : 'All locations'
        };
        return translations[key] || key;
    }

    function getCurrentLanguage() {
        // Example implementation, replace with your actual logic
        return 'pt'; // or 'en' or whatever language based on user selection
    }
});
