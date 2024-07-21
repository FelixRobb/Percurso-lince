document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('map').setView([37.6364, -7.6673], 13.5);
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
        marker.bindPopup(`
            <button class="species-button" data-location="${location.name}">View Species</button>
        `);

        marker.on('popupopen', () => {
            document.querySelector('.species-button').addEventListener('click', () => {
                showSpeciesList(location.name, [location.lat, location.lng]);
            });
        });

        locationMarkers[location.name] = marker;
    });

    const loadTrack = (trackFile, trackName) => {
        fetch(trackFile)
            .then(response => response.text())
            .then(gpxData => {
                const gpxLayer = new L.GPX(gpxData, {
                    async: true,
                    polyline_options: {
                        color: 'red',
                        weight: 5,
                        opacity: 0.75
                    },
                    marker_options: {
                        startIconUrl: null,
                        endIconUrl: null,
                        shadowUrl: null
                    }
                }).addTo(map);

                gpxLayer.on('click', (e) => {
                    const latLng = e.latlng;
                    showSpeciesList(trackName, latLng);
                });

                const trackPopupLayer = L.geoJSON(gpxLayer.toGeoJSON(), {
                    onEachFeature: (feature, layer) => {
                        layer.on('click', () => {
                            const latLng = layer.getLatLng();
                            showSpeciesList(trackName, latLng);
                        });
                    }
                }).addTo(map);
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
        showSpeciesList(selectedTrack);
    });

    let currentPopup = null; // Track the current popup
    let lastLocation = null; // Track the last location shown
    let lastAssociation = 'all'; // Track the last association shown

    fetch('species.json')
        .then(response => response.json())
        .then(data => {
            const speciesData = data;
            const tracks = Array.from(new Set(speciesData.filter(bird => bird.association.includes('PR')).map(bird => bird.association)));

            tracks.forEach(track => {
                const option = document.createElement('option');
                option.value = track;
                option.textContent = track;
                trackSelect.appendChild(option);
            });

            showSpeciesList('all');
        })
        .catch(error => console.error('Error loading bird data:', error));

    const showSpeciesList = (association, latLng) => {
        fetch('species.json')
            .then(response => response.json())
            .then(data => {
                const filteredData = association === 'all' ? data : data.filter(bird => bird.association === association);
                filteredData.sort((a, b) => {
                    const dateA = new Date(`2024 ${a.most_probable_months[0]}`);
                    const dateB = new Date(`2024 ${b.most_probable_months[0]}`);
                    return dateA - dateB;
                });

                const speciesList = filteredData.map(bird => `<li data-species="${bird.name}" class="speciesli">${bird.name}</li>`).join('');
                const popupContent = `
                    <div class="speciesdiv">
                        <h2>Species at ${association}</h2>
                        <ul class="species-list">${speciesList}</ul>
                    </div>
                `;

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
                        latLng = [location.lat, location.lng]; // Ensure latLng is set
                    } else {
                        currentPopup = L.popup()
                            .setLatLng(map.getCenter())
                            .setContent(popupContent)
                            .openOn(map);
                        latLng = map.getCenter(); // Ensure latLng is set
                    }
                }

                lastLocation = latLng; // Track the location of the current popup
                lastAssociation = association;

                document.querySelectorAll('.species-list li').forEach(item => {
                    item.addEventListener('click', () => {
                        const speciesName = item.dataset.species;
                        const bird = data.find(bird => bird.name === speciesName);
                        showSpeciesInfo(bird);
                    });
                });
            })
            .catch(error => console.error('Error loading species list:', error));
    };

    const showSpeciesInfo = (bird) => {
        const popupContent = `
            <div class="SpeciesInfo">
                <button id="backButton" class="back-button" onclick="handleBackButtonClick()">Back to list</button>
                <h2>${bird.name} (${bird.scientific_name})</h2>
                <p>${bird.description}</p>
                <p><strong>Most probable months:</strong> ${bird.most_probable_months.join(', ')}</p>
                <div class="sounddiv">
                ${bird.sound_url}
                </div>
            </div>
        `;
    
        if (currentPopup) {
            currentPopup.remove();
        }
    
        currentPopup = L.popup()
            .setLatLng(lastLocation) // Use the last known location
            .setContent(popupContent)
            .openOn(map);
    
        // Define the inline function for the back button
        window.handleBackButtonClick = () => {
            if (currentPopup) {
                currentPopup.remove();
                showSpeciesList(lastAssociation, lastLocation); // Show the last species list at the previous location
            }
        };
    };
});
