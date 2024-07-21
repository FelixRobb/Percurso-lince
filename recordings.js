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
                    <img style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px;" src="static/${bird.image}" alt="${bird.name}">
                    <h2 style="margin-left: 10px; text-align: center; display: flex; justify-content: center; align-items: center;">${bird.name} (${bird.scientific_name})</h2>
                </div>
                <p>${bird.description}</p>
                <p><strong>Most probable months to see it:</strong> ${bird.most_probable_months.join(", ")}</p>
                ${bird.sound_url}
                <p>${bird.association}</p>
            `;
            recordingsList.appendChild(birdItem);
        });
    }

    
function sortByMonth(birds) {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentMonthIndex = new Date().getMonth(); // 0 for January, 1 for February, etc.
    const currentMonth = monthNames[currentMonthIndex];

    // Separate birds into two groups: those visible this month and those not
    const birdsThisMonth = birds.filter(bird => bird.most_probable_months.includes(currentMonth));
    const birdsNotThisMonth = birds.filter(bird => !bird.most_probable_months.includes(currentMonth));


    // Sort both groups by name
    birdsThisMonth.sort((a, b) => a.name.localeCompare(b.name));
    birdsNotThisMonth.sort((a, b) => a.name.localeCompare(b.name));

    // Combine the two groups, with birds visible this month first
    const sortedBirds = birdsThisMonth.concat(birdsNotThisMonth);

    return sortedBirds;
}


    function sortByName(birds) {
        return birds.sort((a, b) => a.name.localeCompare(b.name));
    }
});
