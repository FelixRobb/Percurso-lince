document.addEventListener('DOMContentLoaded', () => {
    const setMapHeight = () => {
        const headerHeight = document.querySelector('header').offsetHeight;
        const controlsHeight = document.querySelector('#controls').offsetHeight;
        const availableHeight = window.innerHeight - headerHeight - controlsHeight;

        document.querySelector('#map').style.height = `${availableHeight - 12}px`;
    };


    // Call setMapHeight on load and resize events
    setMapHeight();
    window.addEventListener('resize', setMapHeight);

    // Initialize the map and tile layer
    const map = L.map('map').setView([37.6364, -7.6690], 10.4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var myIcon = L.icon({
        iconUrl: 'marker.svg',
        iconSize: [38, 95],
        iconAnchor: [22, 94],
        popupAnchor: [-3, -60]
    });

    // Add locate control
    L.control.locate().addTo(map);

    // Create marker cluster group
    const markerCluster = L.markerClusterGroup().addTo(map);

    const locations = [
        { name: "Azenhas do Guadiana", lat: 37.6468, lng: -7.6512 },
        { name: "Ribeira de Oeiras", lat: 37.6254, lng: -7.8099 },
        { name: "Vila de Mértola", lat: 37.6438, lng: -7.6604 }
    ];

    const locationMarkers = {};
    const trackLayers = {};
    const trackBounds = {};
    let previousPopup = null;
    let previousPopupLatLng = null;
    let previousAssociation = 'all';

    // Function to populate the track select dropdown
    const populateTrackSelect = () => {
        const trackSelect = document.getElementById('trackSelect');
        trackSelect.innerHTML = '';

        const allTracksOption = document.createElement('option');
        allTracksOption.value = 'all';
        allTracksOption.textContent = 'Todas as localizações';
        trackSelect.appendChild(allTracksOption);

        locations.forEach(location => {
            const locationOption = document.createElement('option');
            locationOption.value = location.name;
            locationOption.textContent = location.name;
            trackSelect.appendChild(locationOption);
        });

        Object.keys(trackLayers).forEach(trackName => {
            if (trackLayers[trackName]) {
                const trackOption = document.createElement('option');
                trackOption.value = trackName;
                trackOption.textContent = trackName;
                trackSelect.appendChild(trackOption);
            }
        });
    };

    // Create markers and add them to the map
    locations.forEach(location => {

        const marker = L.marker([location.lat, location.lng], { icon: myIcon }).addTo(markerCluster);
        marker.bindPopup(
            `<div class="placediv">
        <h2 class="placepopup">${location.name}</h2>
        <button class="species-button" data-location="${location.name}">Ver especies</button>
        </div>`,
            {
                // Popup options can be adjusted here if necessary
                offset: L.point(0, 0)  // Example offset adjustment
            }
        );

        marker.on('popupopen', () => {
            if (!previousPopupLatLng) {
                previousPopupLatLng = { lat: location.lat, lng: location.lng };  // Store the location as an object
            }

            document.querySelector('.species-button').addEventListener('click', () => {
                previousPopupLatLng = { lat: location.lat, lng: location.lng };  // Update the location on button click
                showSpeciesList(location.name, previousPopupLatLng);
            });
        });

        locationMarkers[location.name] = marker;
    });



    // Load tracks and add them to the map
    const loadTrack = (trackFile, trackName) => {
        fetch(trackFile)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                return response.text();
            })
            .then(gpxData => {
                const gpxLayer = new L.GPX(gpxData, {
                    async: true,
                    polyline_options: {
                        color: "#f80000",
                        weight: 5,
                        opacity: .8
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

                    if (Object.keys(trackLayers).length === tracks.length) {
                        populateTrackSelect();
                        checkUrlParameters(); // Check URL parameters after loading all tracks
                    }
                });

                gpxLayer.on('click', (e) => {
                    const latLng = e.latlng;
                    previousPopupLatLng = { lat: latLng.lat, lng: latLng.lng };  // Store the location as an object  // Store the location
                    showSpeciesList(trackName, latLng, isTrack=true);
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

        for (const trackName in trackLayers) {
            if (trackLayers[trackName]) {
                trackLayers[trackName].setStyle({ color: 'grey' });
            }
        }

        if (selectedTrack === 'all') {
            map.setView([37.6364, -7.6673], 12.5);
        } else if (trackLayers[selectedTrack]) {
            trackLayers[selectedTrack].setStyle({ color: 'red' });
            map.fitBounds(trackBounds[selectedTrack]);

            const middlePoint = trackBounds[selectedTrack].getCenter();
            previousPopupLatLng = middlePoint;  // Store the location
            showSpeciesList(selectedTrack, middlePoint,);
        } else if (locationMarkers[selectedTrack]) {
            const marker = locationMarkers[selectedTrack];
            map.setView(marker.getLatLng(), 15);
        } else {
            console.error(`Selected track or marker not found: ${selectedTrack}`);
        }
    });

    let currentPopup = null;

    const showSpeciesList = (association, latLng, isTrack = false) => {
        fetch('species.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                const filteredData = association === 'all' ? data : data.filter(bird => bird.association === association);
                filteredData.sort((a, b) => {
                    const dateA = new Date(`2024-${a.most_probable_months[0]}`);
                    const dateB = new Date(`2024-${b.most_probable_months[0]}`);
                    return dateA - dateB;
                });

                console.log(isTrack)
                const speciesList = filteredData.map(bird => `<li data-species="${bird['nome-PT']}" class="speciesli">${bird['nome-PT']}</li>`).join('');

                const popupContent =
                    `<div class="speciesdiv">
                        <h2>Especies em ${association}</h2>
                        <ul class="species-list">${speciesList}</ul>
                    </div>`;

                if (currentPopup) {
                    currentPopup.remove();
                }

                // Ensure latLng is an object with lat and lng properties
                let latLngObj = Array.isArray(latLng) ? { lat: latLng[0], lng: latLng[1] } : latLng;

                if (latLngObj && latLngObj.lat !== undefined && latLngObj.lng !== undefined) {
                    currentPopup = L.popup({
                        offset: isTrack ? L.point(0, 0) : L.point(-3, -60)  // Apply offset conditionally
                    })
                        .setLatLng(latLngObj)
                        .setContent(popupContent)
                        .openOn(map);
                } else {
                    console.error('Invalid latLng value:', latLng);
                }

                document.querySelectorAll('.speciesli').forEach(item => {
                    item.addEventListener('click', (event) => {
                        const speciesName = event.target.getAttribute('data-species');
                        showSpeciesInfo(filteredData.find(bird => bird['nome-PT'] === speciesName), isTrack);  // Pass isTrack
                    });
                });
            })
            .catch(error => console.error('Error loading species data:', error));
    };



    const showSpeciesInfo = (bird, isTrack = false) => {
        if (!bird) {
            console.error('Species information is missing');
            return;
        }

        // Retrieve the current heard species list from localStorage
        let heardSpecies = JSON.parse(localStorage.getItem('heardSpecies')) || [];

        // Function to update button text based on current state
        function updateButton() {
            heardSpecies = JSON.parse(localStorage.getItem('heardSpecies')) || [];
            const isHeard = heardSpecies.includes(bird['nome-PT']);
            heardButton.textContent = isHeard ? 'Remove from Heard' : 'Add to Heard';
        }


        const popupContent =
            `<div class="SpeciesInfo">
                <div class="buttonmappopup">
                <button id="backButton" class="back-button">Voltar à lista</button>
                <button id="heardButton">${heardSpecies.includes(bird['nome-PT']) ? 'Remove from Heard' : 'Add to Heard'}</button>
                </div>
                <h2>${bird['nome-PT']} (${bird.scientific_name})</h2>
                <a class="specieslink" href="species.html?name=${encodeURIComponent(bird['nome-PT'])}">${bird['nome-PT']} (${bird.scientific_name})}</a>
                <p>${bird['notas-PT']}</p>
                <p>${bird['descricao-PT']}</p>
                <p><strong>Melhores meses para se ouvir:</strong> ${bird.most_probable_months.join(', ')}</p>
                <div class="sounddiv">
                ${bird.sound_url}
                </div>
            </div>`;

        if (previousPopup) {
            previousPopup.remove();
        }

        if (previousPopupLatLng) {
            previousPopup = L.popup({
                offset: isTrack ? L.point(0, 0) : L.point(-3, -60)  // Apply offset conditionally
            })
                .setLatLng(previousPopupLatLng)
                .setContent(popupContent)
                .openOn(map);
        } else {
            console.error('previousPopupLatLng is undefined');
        }

        document.querySelector('#backButton').addEventListener('click', () => {
            if (previousPopup) {
                previousPopup.remove();
                showSpeciesList(previousAssociation, previousPopupLatLng, isTrack);  // Pass isTrack parameter here
            }
        });

        const heardButton = document.getElementById('heardButton');
        heardButton.addEventListener('click', () => {
            heardSpecies = JSON.parse(localStorage.getItem('heardSpecies')) || [];
            const isHeard = heardSpecies.includes(bird['nome-PT']);

            if (isHeard) {
                // If species is already in the list, remove it
                heardSpecies = heardSpecies.filter(species => species !== bird['nome-PT']);
            } else {
                // If species is not in the list, add it
                heardSpecies.push(bird['nome-PT']);
            }

            // Update the heardSpecies in localStorage
            localStorage.setItem('heardSpecies', JSON.stringify(heardSpecies));

            // Update the button text based on the new state
            updateButton();
        });

        // Initial call to set the correct button text
        updateButton();
    };


    // Handle URL parameters for track selection
    const checkUrlParameters = () => {
        const queryParams = new URLSearchParams(window.location.search);
        if (queryParams.has('lat') && queryParams.has('lng')) {
            const lat = parseFloat(queryParams.get('lat'));
            const lng = parseFloat(queryParams.get('lng'));
            if (!isNaN(lat) && !isNaN(lng)) {
                map.setView([lat, lng], 15);

                // Automatically select the closest location in the dropdown
                const closestLocation = locations.reduce((prev, curr) => {
                    const prevDist = Math.sqrt(Math.pow(prev.lat - lat, 2) + Math.pow(prev.lng - lng, 2));
                    const currDist = Math.sqrt(Math.pow(curr.lat - lat, 2) + Math.pow(curr.lng - lng, 2));
                    return prevDist < currDist ? prev : curr;
                });

                trackSelect.value = closestLocation.name;
            } else {
                console.error('Invalid lat or lng URL parameters');
            }
        } else if (queryParams.has('track')) {
            const trackName = decodeURIComponent(queryParams.get('track'));

            for (const track in trackLayers) {
                if (trackLayers[track]) {
                    trackLayers[track].setStyle({ color: 'grey' });
                }
            }

            if (trackLayers[trackName]) {
                trackLayers[trackName].setStyle({ color: 'red' });
                map.fitBounds(trackBounds[trackName]);

                const middlePoint = trackBounds[trackName].getCenter();
                previousPopupLatLng = middlePoint;  // Store the location
                showSpeciesList(trackName, middlePoint, isTrack=true);

                // Automatically select the track in the dropdown
                trackSelect.value = trackName;
            } else {
                console.error(`Track not found: ${trackName}`);
            }
        }
    };
});
