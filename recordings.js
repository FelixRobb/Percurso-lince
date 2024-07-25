document.addEventListener('DOMContentLoaded', () => {
    const recordingsList = document.getElementById('recordings-list');
    const filterMonthButton = document.getElementById('filter-season');
    const filterNameButton = document.getElementById('filter-name');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const filterAssociationSelect = document.getElementById('filter-association');

    let allBirds = [];
    let filteredBirds = [];

    fetch('species.json')
        .then(response => response.json())
        .then(birds => {
            // Aggregate data to get unique species with averaged months
            const aggregatedBirds = aggregateBirds(birds);
            allBirds = sortByName(aggregatedBirds);
            populateAssociationFilter(allBirds);
            filteredBirds = allBirds; // Initialize filteredBirds
            displayBirds(filteredBirds);

            // Event listeners for filtering and search
            filterNameButton.addEventListener('click', () => {
                filteredBirds = sortByName(filteredBirds);
                displayBirds(filteredBirds);
            });

            filterMonthButton.addEventListener('click', () => {
                filteredBirds = sortByMonth(filteredBirds);
                displayBirds(filteredBirds);
            });

            searchButton.addEventListener('click', () => {
                const query = searchInput.value.toLowerCase();
                filteredBirds = allBirds.filter(bird =>
                    (bird.association === filterAssociationSelect.value || filterAssociationSelect.value === '') &&
                    (bird.name.toLowerCase().includes(query) || bird.scientific_name.toLowerCase().includes(query))
                );
                displayBirds(filteredBirds);
            });

            filterAssociationSelect.addEventListener('change', () => {
                updateFilteredBirds();
                displayBirds(filteredBirds);
            });
        })
        .catch(error => console.error('Error loading bird data:', error));

    function aggregateBirds(birds) {
        const uniqueBirds = {};

        birds.forEach(bird => {
            if (!uniqueBirds[bird.name]) {
                uniqueBirds[bird.name] = {
                    name: bird.name,
                    scientific_name: bird.scientific_name,
                    most_probable_months: new Set(bird.most_probable_months),
                    association: bird.association,
                    comenta: bird.comenta,
                    description: bird.description,
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
        // Assuming each month is equally weighted for simplicity
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
                <a href="species.html?name=${encodeURIComponent(bird.name)}">${bird.name} (${bird.scientific_name})</a>
            `;
            recordingsList.appendChild(birdItem);
        });
    }

    function populateAssociationFilter(birds) {
        const uniqueLocations = [...new Set(birds.map(bird => bird.association))];
        filterAssociationSelect.innerHTML = '<option value="">All Locations</option>'; // Reset filter options
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

        birdsThisMonth.sort((a, b) => a.name.localeCompare(b.name));
        birdsNotThisMonth.sort((a, b) => a.name.localeCompare(b.name));

        return birdsThisMonth.concat(birdsNotThisMonth);
    }

    function sortByName(birds) {
        return birds.sort((a, b) => a.name.localeCompare(b.name));
    }
});
