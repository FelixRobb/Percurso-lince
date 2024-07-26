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

    function getQueryParams() {
        const params = {};
        const queryString = window.location.search.substring(1);
        const regex = /([^&=]+)=([^&]*)/g;
        let match;
        while (match = regex.exec(queryString)) {
            params[decodeURIComponent(match[1])] = decodeURIComponent(match[2]);
        }
        return params;
    }

    const queryParams = getQueryParams();
    console.log('Query Params:', queryParams);

    if (queryParams.lat && queryParams.lng) {
        const lat = parseFloat(queryParams.lat);
        const lng = parseFloat(queryParams.lng);
        map.setView([lat, lng], 15);
    }

    const locationMarkers = {};
    let previousPopup = null; // Store the previous popup content
    let previousPopupLatLng = null; // Store the latLng of the previous popup
    let previousAssociation = 'all'; // Track the last association shown

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

        for (const trackName in trackLayers) {
            if (trackLayers[trackName]) {
                trackLayers[trackName].setStyle({ color: 'grey' });
            }
        }

        if (trackLayers[selectedTrack]) {
            trackLayers[selectedTrack].setStyle({ color: 'red' });
            map.fitBounds(trackBounds[selectedTrack]);

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

                if (previousPopup) {
                    previousPopup.remove();
                }

                previousPopupLatLng = latLng;
                previousAssociation = association;

                if (latLng) {
                    previousPopup = L.popup()
                        .setLatLng(latLng)
                        .setContent(popupContent)
                        .openOn(map);
                } else {
                    const location = locations.find(loc => loc.name === association);
                    if (location) {
                        previousPopup = L.popup()
                            .setLatLng([location.lat, location.lng])
                            .setContent(popupContent)
                            .openOn(map);
                        latLng = [location.lat, location.lng];
                    } else {
                        previousPopup = L.popup()
                            .setLatLng(map.getCenter())
                            .setContent(popupContent)
                            .openOn(map);
                        latLng = map.getCenter();
                    }
                }

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

    const checkUrlParameters = () => {
        const queryParams = new URLSearchParams(window.location.search);
        if (queryParams.has('lat') && queryParams.has('lng')) {
            const lat = parseFloat(queryParams.get('lat'));
            const lng = parseFloat(queryParams.get('lng'));
            map.setView([lat, lng], 15);
        } else if (queryParams.has('track')) {
            const trackName = decodeURIComponent(queryParams.get('track'));
            if (trackBounds[trackName]) {
                trackSelect.value = trackName;
                trackLayers[trackName].setStyle({ color: 'red' });
                map.fitBounds(trackBounds[trackName]);

                const middlePoint = trackBounds[trackName].getCenter();
                showSpeciesList(trackName, middlePoint);
            }
        }
    };

    checkUrlParameters();
});
