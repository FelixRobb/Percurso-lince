document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    const map = L.map('map').setView([37.6364, -7.6673], 12.5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    console.log('Tile layer added to map');

    L.control.locate().addTo(map);
    console.log('Locate control added to map');

    const markerCluster = L.markerClusterGroup().addTo(map);
    console.log('Marker cluster group added to map');

    const locations = [
        { name: "Azenhas do Guadiana", lat: 37.6468, lng: -7.6512 },
        { name: "Ribeira de Oeiras", lat: 37.6254, lng: -7.8099 },
        { name: "Vila de Mértola", lat: 37.6438, lng: -7.6604 }
    ];

    const locationMarkers = {};
    const trackLayers = {};
    const trackBounds = {};
    let previousPopup = null; // Store the previous popup content
    let previousPopupLatLng = null; // Store the latLng of the previous popup
    let previousAssociation = 'all'; // Track the last association shown

    // Function to populate the track select dropdown
    const populateTrackSelect = () => {
        const trackSelect = document.getElementById('trackSelect');
        trackSelect.innerHTML = ''; // Clear existing options

        // Add "All Tracks" option
        const allTracksOption = document.createElement('option');
        allTracksOption.value = 'all';
        allTracksOption.textContent = 'All Locations';
        trackSelect.appendChild(allTracksOption);

        // Add options for marker locations
        locations.forEach(location => {
            const locationOption = document.createElement('option');
            locationOption.value = location.name;
            locationOption.textContent = location.name;
            trackSelect.appendChild(locationOption);
        });

        // Add options for tracks
        for (const trackName in trackLayers) {
            if (trackLayers[trackName]) {
                const trackOption = document.createElement('option');
                trackOption.value = trackName;
                trackOption.textContent = trackName;
                trackSelect.appendChild(trackOption);
            }
        }
    };

    // Create markers and add them to the map
    locations.forEach(location => {
        console.log(`Creating marker for location: ${location.name}`);
        const marker = L.marker([location.lat, location.lng]).addTo(markerCluster);
        marker.bindPopup(
            `<div class="placediv">
            <h2 class="placepopup">${location.name}</h2>
            <button class="species-button" data-location="${location.name}">View Species</button>
            </div>`
        );

        marker.on('popupopen', () => {
            console.log(`Popup opened for location: ${location.name}`);
            document.querySelector('.species-button').addEventListener('click', () => {
                showSpeciesList(location.name, [location.lat, location.lng]);
            });
        });

        locationMarkers[location.name] = marker;
    });

    // Load tracks and add them to the map
    const loadTrack = (trackFile, trackName) => {
        console.log(`Loading track: ${trackName} from file: ${trackFile}`);
        fetch(trackFile)
            .then(response => response.text())
            .then(gpxData => {
                const gpxLayer = new L.GPX(gpxData, {
                    async: true,
                    polyline_options: {
                        color: 'grey',
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

                    // Populate dropdown after all tracks are loaded
                    if (Object.keys(trackLayers).length === tracks.length) {
                        populateTrackSelect();
                    }

                    // Check URL parameters after populating dropdown
                    checkUrlParameters();
                });

                gpxLayer.on('click', (e) => {
                    const latLng = e.latlng;
                    console.log(`Track click at: ${latLng}`);
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

    // Handle track selection from the dropdown
    const trackSelect = document.getElementById('trackSelect');
    trackSelect.addEventListener('change', (event) => {
        const selectedTrack = event.target.value;
        console.log(`Track selected: ${selectedTrack}`);

        // Reset all track colors to grey
        for (const trackName in trackLayers) {
            if (trackLayers[trackName]) {
                trackLayers[trackName].setStyle({ color: 'grey' });
            }
        }

        if (selectedTrack === 'all') {
            map.setView([37.6364, -7.6673], 12.5);
            console.log('View set to default');
        } else if (trackLayers[selectedTrack]) {
            console.log(`Highlighting track: ${selectedTrack}`);
            trackLayers[selectedTrack].setStyle({ color: 'red' });
            map.fitBounds(trackBounds[selectedTrack]);

            const middlePoint = trackBounds[selectedTrack].getCenter();
            showSpeciesList(selectedTrack, middlePoint);
        } else if (locationMarkers[selectedTrack]) {
            const marker = locationMarkers[selectedTrack];
            map.setView(marker.getLatLng(), 15);
            /*marker.openPopup();*/
            console.log(`Centering on marker: ${selectedTrack}`);
        }
    });

    let currentPopup = null;

    const showSpeciesList = (association, latLng) => {
        console.log(`Showing species list for association: ${association}, at: ${latLng}`);
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
                    console.log('Previous popup removed');
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

                console.log('Popup opened with species list');
                document.querySelectorAll('.speciesli').forEach(item => {
                    item.addEventListener('click', (event) => {
                        const speciesName = event.target.getAttribute('data-species');
                        console.log(`Species clicked: ${speciesName}`);
                        showSpeciesInfo(filteredData.find(bird => bird.name === speciesName), latLng);
                    });
                });
            })
            .catch(error => console.error('Error loading species data:', error));
    };

    const showSpeciesInfo = (bird) => {
        const popupContent =
            `<div class="SpeciesInfo">
                <button id="backButton" class="back-button">Back to list</button>
                <h2>${bird.name} (${bird.scientific_name})</h2>
                <p>${bird.comenta}</p>
                <p>${bird.description}</p>
                <p><strong>Best months to listen:</strong> ${bird.most_probable_months.join(', ')}</p>
                <div class="sounddiv">
                ${bird.sound_url}
                </div>
            </div>`;

        if (previousPopup) {
            previousPopup.remove();
        }

        previousPopup = L.popup()
            .setLatLng(previousPopupLatLng || map.getCenter())
            .setContent(popupContent)
            .openOn(map);

        document.querySelector('#backButton').addEventListener('click', () => {
            if (previousPopup) {
                previousPopup.remove();
                showSpeciesList(previousAssociation, previousPopupLatLng);
            }
        });
    };

    // Handle URL parameters for track selection
    const checkUrlParameters = () => {
        const queryParams = new URLSearchParams(window.location.search);
        if (queryParams.has('lat') && queryParams.has('lng')) {
            const lat = parseFloat(queryParams.get('lat'));
            const lng = parseFloat(queryParams.get('lng'));
            map.setView([lat, lng], 15);
            console.log(`URL parameters: lat=${lat}, lng=${lng}`);
        } else if (queryParams.has('track')) {
            const trackName = decodeURIComponent(queryParams.get('track'));
            console.log(`URL parameters: track=${trackName}`);

            for (const track in trackLayers) {
                if (trackLayers[track]) {
                    trackLayers[track].setStyle({ color: 'grey' });
                }
            }

            if (trackLayers[trackName]) {
                console.log(`Centering on track: ${trackName}`);
                trackLayers[trackName].setStyle({ color: 'red' });
                map.fitBounds(trackBounds[trackName]);

                const middlePoint = trackBounds[trackName].getCenter();
                showSpeciesList(trackName, middlePoint);
            } else {
                console.error(`Track not found: ${trackName}`);
            }
        }
    };
});
