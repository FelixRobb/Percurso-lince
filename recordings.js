document.addEventListener('DOMContentLoaded', () => {
    const recordingsList = document.getElementById('recordings-list');
    const filterSeasonButton = document.getElementById('filter-season');
    const filterNameButton = document.getElementById('filter-name');
    const filterLatinNameButton = document.getElementById('filter-latin-name');

    fetch('birds.json')
        .then(response => response.json())
        .then(data => {
            let birds = data;
            displayBirds(birds);

            filterSeasonButton.addEventListener('click', () => {
                birds = sortBySeason(birds);
                displayBirds(birds);
            });

            filterNameButton.addEventListener('click', () => {
                birds = sortByName(birds);
                displayBirds(birds);
            });

            filterLatinNameButton.addEventListener('click', () => {
                birds = sortByLatinName(birds);
                displayBirds(birds);
            });
        })
        .catch(error => console.error('Error loading bird data:', error));

    function displayBirds(birds) {
        recordingsList.innerHTML = '';
        birds.forEach(bird => {
            const birdItem = document.createElement('div');
            birdItem.classList.add('bird-item');
            birdItem.innerHTML = `
                <h2>${bird.name} (${bird.scientific_name})</h2>
                <p>${bird.description}</p>
                <p><strong>Most probable date to see it:</strong> ${bird.most_probable_date}</p>
                <img src="${bird.image}" alt="${bird.name}">
                <audio controls src="${bird.audio}"></audio>
                <p><a href="index.html#${bird.location.lat},${bird.location.lng}">View on Map</a></p>
            `;
            recordingsList.appendChild(birdItem);
        });
    }

    function sortBySeason(birds) {
        const currentMonth = new Date().getMonth();
        const seasonMonths = ["December", "January", "February"].includes(currentMonth) ? "Winter" :
            ["March", "April", "May"].includes(currentMonth) ? "Spring" :
            ["June", "July", "August"].includes(currentMonth) ? "Summer" : "Fall";
        return birds.filter(bird => bird.most_probable_date.toLowerCase().includes(seasonMonths.toLowerCase()));
    }

    function sortByName(birds) {
        return birds.sort((a, b) => a.name.localeCompare(b.name));
    }

    function sortByLatinName(birds) {
        return birds.sort((a, b) => a.scientific_name.localeCompare(b.scientific_name));
    }
});
