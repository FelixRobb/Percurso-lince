document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('map').setView([37.6364, -7.6673], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add user location
    map.locate({setView: true, maxZoom: 16});
    map.on('locationfound', e => {
        L.marker(e.latlng).addTo(map)
            .bindPopup("You are here")
            .openPopup();
    });

    // Load bird data
    fetch('birds.json')
        .then(response => response.json())
        .then(data => {
            const birdMarkers = {};
            data.forEach(bird => {
                const marker = L.marker([bird.location.lat, bird.location.lng]).addTo(map);
                const popupContent = `
                    <div>
                        <div style="display: flex; align-items: center; margin-right: 20px;">
                            <img style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px;" src="static/${bird.image}" alt="${bird.name}">
                            <h2 style="margin-left: 10px; text-align: center; display: flex; justify-content: center; align-items: center;">${bird.name} (${bird.scientific_name})</h2>
                        </div>
                        <p>${bird.description}</p>
                        <p><strong>Most probable date to see it:</strong> ${bird.most_probable_date}</p>
                        ${bird.sound_url}
                        <p><strong>Track:</strong> ${bird.track}</p>
                    </div>
                `;
                marker.bindPopup(popupContent);
                if (!birdMarkers[bird.track]) {
                    birdMarkers[bird.track] = [];
                }
                birdMarkers[bird.track].push(marker);
            });

            // Populate track dropdown
            const trackSelect = document.getElementById('trackSelect');
            Object.keys(birdMarkers).forEach(track => {
                const option = document.createElement('option');
                option.value = track;
                option.textContent = track;
                trackSelect.appendChild(option);
            });

            // Track change event
            trackSelect.addEventListener('change', (event) => {
                const selectedTrack = event.target.value;
                Object.keys(birdMarkers).forEach(track => {
                    birdMarkers[track].forEach(marker => {
                        if (track === selectedTrack || selectedTrack === 'all') {
                            map.addLayer(marker);
                        } else {
                            map.removeLayer(marker);
                        }
                    });
                });
            });
        })
        .catch(error => console.error('Error loading bird data:', error));

    // Load GPX tracks
    fetch('tracks.json')
        .then(response => response.json())
        .then(data => {
            data.forEach(track => {
                new L.GPX(track.url, {
                    async: true,
                    marker_options: {
                        startIconUrl: null,
                        endIconUrl: null,
                        shadowUrl: null
                    },
                    polyline_options: {
                        color: 'blue',
                        opacity: 0.75,
                        weight: 3
                    }
                }).on('loaded', (e) => {
                    map.fitBounds(e.target.getBounds());
                }).addTo(map);
            });
        })
        .catch(error => console.error('Error loading track data:', error));
});
