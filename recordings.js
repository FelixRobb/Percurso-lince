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
            allBirds = sortByName(birds);
            populateAssociationFilter(allBirds);
            // Display all birds initially
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
                <h2 style="margin-left: 10px; text-align: center; display: flex; justify-content: center; align-items: center;">${bird.name} (${bird.scientific_name})</h2>
                <p>${bird.comenta}</p>
                <p>${bird.description}</p>
                <p><strong>Best months to listen:</strong> ${bird.most_probable_months.join(", ")}</p>
                <button class="load-sound-btn">Load Sound</button>
                <div class="sound-container"></div>
                <p><strong>Location:</strong> ${bird.association}</p>
            `;

            const loadSoundButton = birdItem.querySelector('.load-sound-btn');
            const soundContainer = birdItem.querySelector('.sound-container');
            loadSoundButton.addEventListener('click', () => {
                soundContainer.innerHTML = bird.sound_url;
                loadSoundButton.disabled = true;
            });

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
