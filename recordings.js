document.addEventListener('DOMContentLoaded', () => {
    const recordingsList = document.getElementById('recordings-list');
    
    let allBirds = [];
    let uniqueBirds = {};

    fetch('species.json')
        .then(response => response.json())
        .then(birds => {
            birds.forEach(bird => {
                if (!uniqueBirds[bird.name]) {
                    uniqueBirds[bird.name] = [];
                }
                uniqueBirds[bird.name].push(bird);
            });

            const speciesList = Object.keys(uniqueBirds).map(species => ({
                name: species,
                scientific_name: uniqueBirds[species][0].scientific_name
            }));

            displayBirds(speciesList);
        })
        .catch(error => console.error('Error loading bird data:', error));

    function displayBirds(birds) {
        recordingsList.innerHTML = '';
        birds.forEach(bird => {
            const birdItem = document.createElement('div');
            birdItem.classList.add('bird-item');
            birdItem.innerHTML = `
                <h2 style="margin-left: 10px; text-align: center; display: flex; justify-content: center; align-items: center;">
                    <a href="species.html?name=${encodeURIComponent(bird.name)}">${bird.name} (${bird.scientific_name})</a>
                </h2>
            `;
            recordingsList.appendChild(birdItem);
        });
    }
});
