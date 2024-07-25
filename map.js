document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('map').setView([37.6364, -7.6673], 12.5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.control.locate().addTo(map);
    const markerCluster = L.markerClusterGroup().addTo(map);

    const locations = [
        { name: "Azenhas do Guadiana", lat: 37.6468, lng: -7.6512 },
        { name: "Ribeira de Oeiras", lat: 37.6254, lng: -7.8099 },
        { name: "Vila de Mértola", lat: 37.6438, lng: -7.6604 }
    ];

    const locationMarkers = {};
    locations.forEach(location => {
        const marker = L.marker([location.lat, location.lng]).addTo(markerCluster);
        marker.bindPopup(
            `<button class="species-button" data-location="${location.name}">View Species</button>`
        );

        marker.on('popupopen', () => {
            document.querySelector('.species-button').addEventListener('click', () => {
                showSpeciesList(location.name, [location.lat, location.lng]);
            });
        });

        locationMarkers[location.name] = marker;
    });

    const trackLayers = {};
    const trackBounds = {};

    const loadTrack = (trackFile, trackName) => {
        fetch(trackFile)
            .then(response => response.text())
            .then(gpxData => {
                const gpxLayer = new L.GPX(gpxData, {
                    async: true,
                    polyline_options: {
                        color: 'grey', // Default color
                        weight: 5,
                        opacity: 0.75
                    },
                    marker_options: {
                        startIconUrl: null,
                        endIconUrl: null,
                        shadowUrl: null
                    }
                }).addTo(map);

                gpxLayer.on('loaded', (e) => {
                    const bounds = e.target.getBounds();
                    trackBounds[trackName] = bounds;
                    trackLayers[trackName] = e.target;

                    console.log(`Track loaded: ${trackName}`);
                });

                gpxLayer.on('click', (e) => {
                    const latLng = e.latlng;
                    showSpeciesList(trackName, latLng);
                });
            })
            .catch(error => console.error(`Error loading track ${trackName}:`, error));
    };

    const tracks = [
        { file: 'tracks/PR3 MTL - As margens do Guadiana.gpx', name: 'PR3 MTL - As Margens do Guadiana' },
        { file: 'tracks/PR5 MTL - Ao Ritmo das Águas do Vascão.gpx', name: 'PR5 MTL - Ao Ritmo das Águas do Vascão' },
        { file: 'tracks/PR8 MTL - Moinho do Alferes_ um Percurso Ribeirinho.gpx', name: 'PR8 MTL - Moinho do Alferes um Percurso Ribeirinho' }
    ];

    tracks.forEach(track => loadTrack(track.file, track.name));

    const trackSelect = document.getElementById('trackSelect');
    trackSelect.addEventListener('change', (event) => {
        const selectedTrack = event.target.value;

        // Reset all track colors to grey
        for (const trackName in trackLayers) {
            if (trackLayers[trackName]) {
                trackLayers[trackName].setStyle({ color: 'grey' });
            }
        }

        // Highlight the selected track
        if (trackLayers[selectedTrack]) {
            trackLayers[selectedTrack].setStyle({ color: 'red' });
            map.fitBounds(trackBounds[selectedTrack]);

            // Open popup at the middle of the selected track
            const middlePoint = trackBounds[selectedTrack].getCenter();
            showSpeciesList(selectedTrack, middlePoint);
        }
    });

    const showSpeciesList = (association, latLng) => {
        fetch('species.json')
            .then(response => response.json())
            .then(data => {
                const filteredData = association === 'all' ? data : data.filter(bird => bird.association === association);
                filteredData.sort((a, b) => {
                    const dateA = new Date(`2024-${a.most_probable_months[0]}`);
                    const dateB = new Date(`2024-${b.most_probable_months[0]}`);
                    return dateA - dateB;
                });

                const speciesList = filteredData.map(bird => `<li data-species="${bird.name}" class="speciesli">${bird.name}</li>`).join('');
                const popupContent =
                    `<div class="speciesdiv">
                        <h2>Species at ${association}</h2>
                        <ul class="species-list">${speciesList}</ul>
                    </div>`;

                if (currentPopup) {
                    currentPopup.remove();
                }

                if (latLng) {
                    currentPopup = L.popup()
                        .setLatLng(latLng)
                        .setContent(popupContent)
                        .openOn(map);
                } else {
                    const location = locations.find(loc => loc.name === association);
                    if (location) {
                        currentPopup = L.popup()
                            .setLatLng([location.lat, location.lng])
                            .setContent(popupContent)
                            .openOn(map);
                        latLng = [location.lat, location.lng];
                    } else {
                        currentPopup = L.popup()
                            .setLatLng(map.getCenter())
                            .setContent(popupContent)
                            .openOn(map);
                        latLng = map.getCenter();
                    }
                }

                document.querySelectorAll('.speciesli').forEach(item => {
                    item.addEventListener('click', (event) => {
                        const speciesName = event.target.getAttribute('data-species');
                        showSpeciesInfo(filteredData.find(bird => bird.name === speciesName), latLng);
                    });
                });
            })
            .catch(error => console.error('Error loading species data:', error));
    };

    const showSpeciesInfo = (species, latLng) => {
        const popupContent = `
            <h2>${species.name} (${species.scientific_name})</h2>
            <p class="description">${species.description}</p>
            <p class="comments"><strong>Comments:</strong> ${species.comenta}</p>
            <p class="months"><strong>Best months to listen:</strong> ${species.most_probable_months.join(', ')}</p>
            <div class="sound-url">${species.sound_url}</div>
        `;

        if (currentPopup) {
            currentPopup.remove();
        }

        currentPopup = L.popup()
            .setLatLng(latLng)
            .setContent(popupContent)
            .openOn(map);
    };

    // Handle URL parameters for location and species
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.has('location')) {
        const locationName = decodeURIComponent(queryParams.get('location'));
        const speciesName = decodeURIComponent(queryParams.get('species'));

        let found = false;

        // Check and center on markers
        if (locationMarkers[locationName]) {
            map.setView(locationMarkers[locationName].getLatLng(), 15);
            found = true;
        }

        // Check and center on tracks
        if (trackBounds[locationName]) {
            map.fitBounds(trackBounds[locationName]);
            found = true;
        }

        if (found && speciesName) {
            fetch('species.json')
                .then(response => response.json())
                .then(data => {
                    const species = data.find(bird => bird.name === speciesName && bird.association === locationName);
                    if (species) {
                        const latLng = trackBounds[locationName] ? trackBounds[locationName].getCenter() : locationMarkers[locationName].getLatLng();
                        showSpeciesInfo(species, latLng);
                    } else {
                        console.warn(`Species ${speciesName} not found for location ${locationName}`);
                    }
                })
                .catch(error => console.error('Error loading species data:', error));
        }
    }
});
