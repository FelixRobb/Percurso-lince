document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('map').setView([37.6364, -7.6673], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    fetch('birds.json')
        .then(response => response.json())
        .then(data => {
            data.forEach(bird => {
                const marker = L.marker([bird.location.lat, bird.location.lng]).addTo(map);
                marker.on('click', () => {
                    const popupContent = `
                        <div>
                            <h2>${bird.name} (${bird.scientific_name})</h2>
                            <p>${bird.description}</p>
                            <p><strong>Most probable date to see it:</strong> ${bird.most_probable_date}</p>
                            <img src="${bird.image}" alt="${bird.name}">
                            <audio controls src="${bird.audio}"></audio>
                        </div>
                    `;
                    L.popup()
                        .setLatLng([bird.location.lat, bird.location.lng])
                        .setContent(popupContent)
                        .openOn(map);
                });
            });
        })
        .catch(error => console.error('Error loading bird data:', error));
});
