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
            <div style="display: flex; align-items: center; margin-right: 20px;">
            <img  style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px;" src="static/${bird.image}" alt="${bird.name}"> 
            <h2 style="margin-left: 10px; text-align: center; display: flex; justify-content: center; align-items: center;">${bird.name} (${bird.scientific_name})</h2>
            </div>
            <p>${bird.description}</p>
            <p><strong>Most probable date to see it:</strong> ${bird.most_probable_date}</p>
            <audio controls src="static/${bird.audio}"></audio> 
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
