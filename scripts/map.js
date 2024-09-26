document.addEventListener('DOMContentLoaded', () => {
    const setMapHeight = () => {
    const headerHeight = document.querySelector('header').offsetHeight;
    const controlsHeight = document.querySelector('#controls').offsetHeight;
    const availableHeight = window.innerHeight - headerHeight - controlsHeight;
    document.querySelector('#map').style.height = `${availableHeight - 20}px`; // Remove the -12 if unnecessary
};

window.addEventListener('resize', setMapHeight);
document.addEventListener('DOMContentLoaded', setMapHeight);


    // notification system

    const handleError = (error, context) => {
        console.error(`Error in ${context}:`, error);
        let message;
        switch (context) {
            case 'map_init':
                message = 'Failed to initialize the map. Please refresh the page or check your internet connection.';
                break;
            case 'tile_layer':
                message = 'Unable to load map tiles. Some map features may be unavailable.';
                break;
            case 'geolocation':
                message = 'Unable to access your location. Please check your browser settings.';
                break;
            case 'track_load':
                message = 'Failed to load one or more tracks. Some routes may be missing.';
                break;
            case 'marker_load':
                message = 'Failed to load location markers. Some points of interest may be missing.';
                break;
            case 'species_data':
                message = 'Unable to load species data. Species information may be incomplete. Maybe try checking you internet conection...';
                break;
            default:
                message = 'An unexpected error occurred. Please try again later.';
        }
        showNotification(message, 'error');
    };

    const showNotification = (message, type = 'error') => {
        console.log("notif")
        const notification = document.createElement('div');
        console.log("notifi")
        notification.textContent = message;
        notification.className = `notification ${type}`;
        document.body.insertBefore(notification, document.body.firstChild);

        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
            }, 600);
        }, 5000);
    };



    const getCurrentLanguage = () => {
        return localStorage.getItem('language') || 'pt'; // Default to Portuguese if not set

    };

    // Call setMapHeight on load and resize events
    setMapHeight();
    window.addEventListener('resize', setMapHeight);

    // Initialize the map and tile layer
    let map;
    try {
        map = L.map('map').setView([37.6364, -7.6690], 10.4);
    } catch (error) {
        handleError(error, 'map_init');
        return; // Stop execution if map fails to initialize
    }

    try {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map).on('tileerror', (error) => {
            handleError(error, 'tile_layer');
        });
    } catch (error) {
        handleError(error, 'tile_layer');
    }

    // Add locate control
    L.control.locate().addTo(map);



    let markerCluster;
    try {
        markerCluster = L.markerClusterGroup().addTo(map);
    } catch (error) {
        handleError(error, 'marker_load');
    }

    var myIcon = L.icon({
        iconUrl: '/images/marker.svg',
        iconSize: [38, 95],
        iconAnchor: [22, 94],
        popupAnchor: [-3, -60]
    });


    const locations = [
        { name: "Azenhas do Guadiana", lat: 37.6462, lng: -7.6525 },
        { name: "Ribeira de Oeiras", lat: 37.6254, lng: -7.8099 },
        { name: "Vila de Mértola", lat: 37.6372, lng: -7.6633 }
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
                    previousPopupLatLng = { lat: latLng.lat, lng: latLng.lng };  // Store the location
                    showTrackPopup(trackName, latLng, isTrack = true);
                });

                gpxLayer.on('error', (e) => {
                    handleError(e.error, 'track_load');
                });
            })
            .catch(error => {
                handleError(error, 'track_load');
            });
    };


    const tracks = [
        { file: 'tracks/PR3 MTL - As margens do Guadiana.gpx', name: 'PR3 MTL - As Margens do Guadiana' },
        { file: 'tracks/PR5 MTL - Ao Ritmo das Águas do Vascão.gpx', name: 'PR5 MTL - Ao Ritmo das Águas do Vascão' },
        { file: 'tracks/PR8 MTL - Moinho do Alferes_ um Percurso Ribeirinho.gpx', name: 'PR8 MTL - Moinho do Alferes um Percurso Ribeirinho' }
    ];

    tracks.forEach(track => loadTrack(track.file, track.name));

    // Handle track selection from the dropdown
    trackSelect.addEventListener('change', (event) => {
    const selectedTrack = event.target.value;

    // Reset the styles for all tracks
    for (const trackName in trackLayers) {
        if (trackLayers[trackName]) {
            trackLayers[trackName].setStyle({ color: 'grey' });
        }
    }

    // Handle 'all' option for resetting the view
    if (selectedTrack === 'all') {
        map.setView([37.6364, -7.6673], 12.5);
    } 
    // Handle when a specific track is selected
    else if (trackLayers[selectedTrack]) {
        trackLayers[selectedTrack].setStyle({ color: 'red' });
        map.fitBounds(trackBounds[selectedTrack]);

        const middlePoint = trackBounds[selectedTrack].getCenter();
        previousPopupLatLng = middlePoint;  // Store the location
        showSpeciesList(selectedTrack, middlePoint, true); // Pass true for isTrack
    } 
    // Handle when a specific location is selected
    else if (locationMarkers[selectedTrack]) {
        const marker = locationMarkers[selectedTrack];
        map.setView(marker.getLatLng(), 15);
        previousPopupLatLng = marker.getLatLng();
        showSpeciesList(selectedTrack, marker.getLatLng(), false); // Pass false for isTrack
    } 
    else {
        console.error(`Selected track or marker not found: ${selectedTrack}`);
    }
});

    let currentPopup = null;


    const showDetailedPopup = (placeName, isTrack = true) => {
        fetch('/json/details.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                const details = data[placeName];
                const currentLang = getCurrentLanguage();

                if (details) {
                    const detailedPopupContent = `
                <div class="detailed-popup">
                    <h2>${currentLang === 'PT' ? 'Sobre' : 'About'} ${placeName}</h2>
                    <p>${details[`description-${currentLang}`]}</p>
                    <a href="${details.links[0].url}">${details.links[0][`text-${currentLang}`]}</a>
                </div>
                `;

                    if (currentPopup) {
                        currentPopup.remove();
                    }

                    // Ensure latLng is defined before creating the popup
                    if (previousPopupLatLng) {
                        const latLngObj = L.latLng(previousPopupLatLng.lat, previousPopupLatLng.lng);
                        currentPopup = L.popup({
                            offset: isTrack ? L.point(0, 0) : L.point(-3, -60)  // Apply offset conditionally
                        })
                            .setLatLng(latLngObj)
                            .setContent(detailedPopupContent)
                            .openOn(map);


                    } else {
                        console.error('previousPopupLatLng is undefined or null');
                    }
                } else {
                    console.error(`No details found for ${placeName}`);
                }
            })
            .catch(error => console.error('Error loading detailed information:', error));
    };



    // Create markers and add them to the map
    locations.forEach(location => {
        const currentLang = getCurrentLanguage();
        const marker = L.marker([location.lat, location.lng], { icon: myIcon }).addTo(markerCluster);
        marker.bindPopup(
            `<div class="placediv">
            <h2>${currentLang === 'PT' ? 'Sobre' : 'About'} ${location.name}</h2>
                <div class="placedivbuttons">
                <button class="species-button" data-location="${location.name}">${currentLang === 'PT' ? 'Ver espécies' : 'View species'}</button>
                <button class="details-button" data-location="${location.name}">${currentLang === 'PT' ? 'Informações' : 'Information'}</button>
                </div>
            </div>`,
            {
                offset: L.point(0, 0)
            }
        );

        marker.on('popupopen', () => {
            // Update previousPopupLatLng when the popup opens
            previousPopupLatLng = { lat: location.lat, lng: location.lng };

            document.querySelector('.species-button').addEventListener('click', () => {
                showSpeciesList(location.name, previousPopupLatLng);
            });

            document.querySelector('.details-button').addEventListener('click', () => {
                showDetailedPopup(location.name, isTrack = false);
            });
        });

        locationMarkers[location.name] = marker;
    });


    // Update showTrackPopup to include a button for detailed information
    const showTrackPopup = (trackName, latLng, isTrack) => {
        const currentLang = getCurrentLanguage();
        const popupContent = `
            <div class="placediv">
                <h2 class="placepopup">${trackName}</h2>
                <div class="placedivbuttons">
                <button class="species-button" data-location="${trackName}">${currentLang === 'PT' ? 'Ver espécies' : 'View species'}</button>
                <button class="details-button" data-location="${trackName}">${currentLang === 'PT' ? 'Informações' : 'Information'}</button>
                </div>
            </div>
        `;

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

        document.querySelector('.species-button').addEventListener('click', () => {
            showSpeciesList(trackName, latLng, true);
        });

        document.querySelector('.details-button').addEventListener('click', () => {
            showDetailedPopup(trackName, isTrack = true);
        });
    };


    const showSpeciesList = (association, latLng, isTrack = false) => {
        const currentLang = getCurrentLanguage();

        fetch('/json/species.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                const filteredData = association === 'all'
                    ? data
                    : data.filter(species => species.association === association);

                // Get unique species names based on the current language
                const uniqueSpecies = Array.from(
                    new Set(filteredData.map(species => species[`nome-${currentLang}`]))
                );

                const speciesList = uniqueSpecies.map(speciesName =>
                    `<li data-species-name="${speciesName}" class="speciesli">${speciesName}</li>`
                ).join('');

                const popupContent =
                    `<div class="speciesdiv">
                        <h2>${currentLang === 'pt' ? 'Espécies em' : 'Species in'} ${association}</h2>
                        <ul class="species-list">${speciesList}</ul>
                    </div>`;

                if (currentPopup) {
                    currentPopup.remove();
                }

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
                        const speciesName = event.target.getAttribute('data-species-name');
                        const species = filteredData.filter(species => species[`nome-${currentLang}`] === speciesName);
                        showSpeciesInfo(species, association, isTrack);
                    });
                });
            })
            .catch(error => {
                handleError(error, 'species_data');
            });
    };


    // Modify the showSpeciesInfo function
    const showSpeciesInfo = (species, association, isTrack = false) => {
        if (!species || species.length === 0) {
            console.error('Species information is missing');
            return;
        }

        const currentLang = getCurrentLanguage();

        // Retrieve the current heard species list from localStorage
        let heardSpecies = JSON.parse(localStorage.getItem('heardSpecies')) || [];

        // Function to update button text based on current state
        function updateButton() {
            heardSpecies = JSON.parse(localStorage.getItem('heardSpecies')) || [];
            const isHeard = heardSpecies.includes(species[0]["nome-PT"]);
            heardButton.textContent = isHeard ? 'Remove from Heard' : 'Add to Heard';
        }

        // Bundle all sound urls and descriptions
        const recordingsContent = species.map(entry =>
            `<div class="sounddiv">
                ${entry.sound_url}
                <p>${entry[`descricao-${currentLang}`]}</p>
            </div>`
        ).join('');

        const popupContent =
            `<div class="SpeciesInfo">
            <div class="buttonmappopup">
                <button id="backButton" class="back-button">${currentLang === 'PT' ? 'Voltar à lista' : 'Back to list'}</button>
                <button id="heardButton">${heardSpecies.includes(species[0][`nome-${currentLang}`]) ? (currentLang === 'PT' ? 'Remover de Ouvidos' : 'Remove from Heard') : (currentLang === 'PT' ? 'Adicionar a Ouvidos' : 'Add to Heard')}</button>
            </div>
            <h2>${species[0][`nome-${currentLang}`]} (${species[0].scientific_name})</h2>
            <a class="specieslink" href="species.html?name=${encodeURIComponent(species[0][`nome-${currentLang}`])}">
                ${species[0][`nome-${currentLang}`]} (${species[0].scientific_name})
            </a>
            <p>${species[0][`notas-${currentLang}`]}</p>
            <p><strong>${currentLang === 'PT' ? 'Melhores meses para se ouvir' : 'Best months to hear'}:</strong> ${species[0][`most_probable_months_${currentLang}`].join(', ')}</p>
            ${recordingsContent}
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
                previousAssociation = association;
                showSpeciesList(previousAssociation, previousPopupLatLng, isTrack);
            }
        });

        const heardButton = document.getElementById('heardButton');
        heardButton.addEventListener('click', () => {
            heardSpecies = JSON.parse(localStorage.getItem('heardSpecies')) || [];
            const isHeard = heardSpecies.includes(species[0][`nome-PT`]);
            heardButton.textContent = isHeard ? (currentLang === 'PT' ? 'Remover de Ouvidos' : 'Remove from Heard') : (currentLang === 'PT' ? 'Adicionar a Ouvidos' : 'Add to Heard');

            if (isHeard) {
                heardSpecies = heardSpecies.filter(specie => specie !== species[0][`nome-PT`]);
            } else {
                heardSpecies.push(species[0][`nome-PT`]);
            }

            localStorage.setItem('heardSpecies', JSON.stringify(heardSpecies));
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
                showSpeciesList(trackName, middlePoint, isTrack = true);

                // Automatically select the track in the dropdown
                trackSelect.value = trackName;
            } else {
                console.error(`Track not found: ${trackName}`);
            }
        }
    };
});
