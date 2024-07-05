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
                    const imageSrc = `static/${bird.image}`;
                    const audioSrc = `static/${bird.audio}`;

                    const popupContent = `
                    <div>
                        <div style="display: flex; align-items: center; margin-right: 20px;">
                            <img style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px;" src="${imageSrc}" alt="${bird.name}">
                            <h2 style="margin-left: 10px; text-align: center; display: flex; justify-content: center; align-items: center;">${bird.name} (${bird.scientific_name})</h2>
                        </div>
                        <p>${bird.description}</p>
                        <p><strong>Most probable date to see it:</strong> ${bird.most_probable_date}</p>
                        <audio controls src="${audioSrc}"></audio>
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
