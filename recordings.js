document.addEventListener('DOMContentLoaded', () => {
    const recordingsList = document.getElementById('recordings-list');
    const filterMonthButton = document.getElementById('filter-season');
    const filterNameButton = document.getElementById('filter-name');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    let allBirds = [];

    fetch('species.json')
        .then(response => response.json())
        .then(birds => {
            allBirds = sortByName(birds); 
            displayBirds(allBirds);

            filterNameButton.addEventListener('click', () => {
                allBirds = sortByName(allBirds);
                displayBirds(allBirds);
            });

            filterMonthButton.addEventListener('click', () => {
                allBirds = sortByMonth(allBirds);
                displayBirds(allBirds);
            });

            searchButton.addEventListener('click', () => {
                const query = searchInput.value.toLowerCase();
                const filteredBirds = allBirds.filter(bird => 
                    bird.name.toLowerCase().includes(query) ||
                    bird.scientific_name.toLowerCase().includes(query)
                );
                displayBirds(filteredBirds);
            });
        })
        .catch(error => console.error('Error loading bird data:', error));

    function displayBirds(birds) {
        recordingsList.innerHTML = '';
        birds.forEach(bird => {
            const birdItem = document.createElement('div');
            birdItem.classList.add('bird-item');
            birdItem.innerHTML = `
                <h2 style="margin-left: 10px; text-align: center; display: flex; justify-content: center; align-items: center;">${bird.name} (${bird.scientific_name})</h2>
                <p>${bird.comenta}</p>
                <p>${bird.description}</p>
                <p><strong>Most probable months to see it:</strong> ${bird.most_probable_months.join(", ")}</p>
                <button class="load-sound-btn">Load Sound</button>
                <div class="sound-container"></div>
                <p>${bird.association}</p>
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
