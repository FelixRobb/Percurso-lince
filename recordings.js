document.addEventListener('DOMContentLoaded', () => {
    const recordingsList = document.getElementById('recordings-list');
    const filterMonthButton = document.getElementById('filter-season');
    const filterNameButton = document.getElementById('filter-name');

    fetch('birds.json')
             .then(response => response.json())
             .then(birds => {
                 // Initial display, ordered by name
                 birds = sortByName(birds); 
                 displayBirds(birds); 
                 // Event listener for name ordering (already present in your code)
                 filterNameButton.addEventListener('click', () => {
                     birds = sortByName(birds);
                     displayBirds(birds);
                 });
                 // Event listener for month ordering 
                 filterMonthButton.addEventListener('click', () => {
                     birds = sortByMonth(birds);
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
            <p><strong>Most probable months to see it:</strong> ${bird.most_probable_months.join(", ")}</p> 
            <audio controls src="static/${bird.audio}"></audio> 
            <p><a href="index.html#${bird.location.lat},${bird.location.lng}">View on Map</a></p>
        `;
            recordingsList.appendChild(birdItem);
        });
    }

    function sortByMonth(birds) {
        const currentMonth = new Date().toLocaleString('default', { month: 'long' });
        birds.sort((a, b) => {
            if (a.most_probable_months.includes(currentMonth) && !b.most_probable_months.includes(currentMonth)) {
                return -1; // a comes first
            } else if (!a.most_probable_months.includes(currentMonth) && b.most_probable_months.includes(currentMonth)) {
                return 1; // b comes first
            } else {
                return a.name.localeCompare(b.name); // Sort alphabetically if both or neither have the current month
            }
        });
        return birds;
    }

    function sortByName(birds) {
        return birds.sort((a, b) => a.name.localeCompare(b.name));
    }

});
