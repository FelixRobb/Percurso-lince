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
        marker.bindPopup(`<button class="species-button" data-location="${location.name}">View Species</button>`);
        locationMarkers[location.name] = marker;

        marker.on('popupopen', (e) => {
            document.querySelector('.species-button').addEventListener('click', () => {
                showSpeciesList(location.name);
            });
        });
    });

    const trackSelect = document.getElementById('trackSelect');
    trackSelect.addEventListener('change', (event) => {
        const selectedTrack = event.target.value;
        showSpeciesList(selectedTrack);
    });

    fetch('birds.json')
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

    const showSpeciesList = (association) => {
        fetch('birds.json')
            .then(response => response.json())
            .then(data => {
                const filteredData = association === 'all' ? data : data.filter(bird => bird.association === association);
                filteredData.sort((a, b) => {
                    const dateA = new Date(`2024 ${a.most_probable_months[0]}`);
                    const dateB = new Date(`2024 ${b.most_probable_months[0]}`);
                    return dateA - dateB;
                });

                const speciesList = filteredData.map(bird => `<li data-species="${bird.name}">${bird.name}</li>`).join('');
                const popupContent = `
                    <div>
                        <h2>Species at ${association}</h2>
                        <ul class="species-list">${speciesList}</ul>
                    </div>
                `;

                const location = locations.find(loc => loc.name === association);
                if (location) {
                    L.popup()
                        .setLatLng([location.lat, location.lng])
                        .setContent(popupContent)
                        .openOn(map);
                } else {
                    const trackPopup = L.popup()
                        .setLatLng(map.getCenter())
                        .setContent(popupContent)
                        .openOn(map);
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
        const popupContent = `
            <div>
                <h2>${bird.name} (${bird.scientific_name})</h2>
                <img src="${bird.image}" alt="${bird.name}" style="width:100px;height:100px;object-fit:cover;border-radius:4px;">
                <p>${bird.description}</p>
                <p><strong>Most probable months:</strong> ${bird.most_probable_months.join(', ')}</p>
                ${bird.sound_url}
            </div>
        `;

        const location = locations.find(loc => loc.name === bird.association);
        const latLng = location ? [location.lat, location.lng] : map.getCenter();

        L.popup()
            .setLatLng(latLng)
            .setContent(popupContent)
            .openOn(map);
    };
});
