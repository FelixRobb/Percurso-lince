const birdData = [
    {
        name: 'European Robin',
        description: 'A small insectivorous passerine bird, distinctive for its orange-red breast.',
        imageUrl: 'images/robin.jpeg',
        audioUrl: 'sounds/robin.mp3',
        lat: 37.805,
        lng: -7.564,
        date: '2024-07-01'
    },
    // Add more bird data here
];

const map = L.map('map').setView([37.8, -7.5], 10);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

birdData.forEach(bird => {
    const marker = L.marker([bird.lat, bird.lng]).addTo(map);
    const popupContent = `
                                                                                                <div class="pinpopup">
                                                                                                            <h2>${bird.name}</h2>
                                                                                                                        <img src="${bird.imageUrl}" alt="${bird.name}" width="100">
                                                                                                                                    <p>${bird.description}</p>
                                                                                                                                                <audio controls>
                                                                                                                                                                <source src="${bird.audioUrl}" type="audio/mpeg">
                                                                                                                                                                                Your browser does not support the audio element.
                                                                                                                                                                                            </audio>
                                                                                                                                                                                                    </div>
                                                                                                                                                                                                        `;
    marker.bindPopup(popupContent);
});
