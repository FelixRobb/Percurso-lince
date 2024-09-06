document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const sidebarContent = document.getElementById('sidebar-content');
    const details = document.getElementById('details');
    const toggleButton = document.getElementById('toggle-sidebar');
    const closeButton = document.getElementById('close-sidebar');

    console.log('DOM fully loaded and parsed');

    // Define the location map
    const locationMap = {
        'Azenhas do Guadiana': 'map.html?lat=37.6468&lng=-7.6512',
        'Ribeira de Oeiras': 'map.html?lat=37.6254&lng=-7.8099',
        'Vila de Mértola': 'map.html?lat=37.6438&lng=-7.6604',
        'PR3 MTL - As Margens do Guadiana': 'map.html?track=PR3%20MTL%20-%20As%20Margens%20do%20Guadiana',
        'PR5 MTL - Ao Ritmo das Águas do Vascão': 'map.html?track=PR5%20MTL%20-%20Ao%20Ritmo%20das%20%C3%81guas%20do%20Vasc%C3%A3o',
        'PR8 MTL - Moinho do Alferes um Percurso Ribeirinho': 'map.html?track=PR8%20MTL%20-%20Moinho%20do%20Alferes%20um%20Percurso%20Ribeirinho'
    };

    console.log('Location map defined:', locationMap);

    // Extract the species name from the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const speciesName = urlParams.get('name');

    console.log('Species name from URL:', speciesName);
    document.title = speciesName;

    // Fetch species data and filter for the selected species
    fetch('species.json')
        .then(response => {
            console.log('Response received:', response);
            return response.json();
        })
        .then(species => {
            console.log('Species data received:', species);
            const speciesEntries = species.filter(species => species['nome-PT'] === speciesName);

            console.log('Filtered species entries:', speciesEntries);

            if (speciesEntries.length === 0) {
                details.innerHTML = `<p>No details found for species: ${speciesName}</p>`;
                console.warn('No details found for species:', speciesName);
                return;
            }

            // Create the sidebar content
            const sidebarContentHtml = speciesEntries.map((entry, index) => `
                <div class="sidebar-item" data-index="${index}">${entry.association}</div>
            `).join('');
            sidebarContent.innerHTML = sidebarContentHtml;

            console.log('Sidebar content HTML:', sidebarContentHtml);

            function displayDetails(entry) {
                const locationUrl = locationMap[entry.association] || '#';
                console.log('Location URL for', entry.association, ':', locationUrl);
            
                // Retrieve the current heard species list from localStorage
                let heardSpecies = JSON.parse(localStorage.getItem('heardSpecies')) || [];
            
                // Function to update button text based on current state
                function updateButton() {
                    heardSpecies = JSON.parse(localStorage.getItem('heardSpecies')) || [];
                    const isHeard = heardSpecies.includes(entry['nome-PT']);
                    heardButton.textContent = isHeard ? 'Remove from Heard' : 'Add to Heard';
                }
            
                // Initial button label set
                details.innerHTML = `
                    <h2>${entry['nome-PT']} (${entry.scientific_name})</h2>
                    <button id="heardButton">${heardSpecies.includes(entry['nome-PT']) ? 'Remove from Heard' : 'Add to Heard'}</button>
                    <p class="description">${entry['descricao-PT']}</p>
                    <p class="comments"><strong>Descrição:</strong> ${entry['notas-PT']}</p>
                    <p class="months"><strong>Melhores meses para se ouvir:</strong> ${entry.most_probable_months.join(', ')}</p>
                    <div class="sound-url">${entry.sound_url}</div>
                    <p class="location"><strong>Localização:</strong> <a href="${locationUrl}">${entry.association}</a></p>
                `;
            
                // Add event listener to the button to toggle add/remove from the heard list
                const heardButton = document.getElementById('heardButton');
                heardButton.addEventListener('click', () => {
                    heardSpecies = JSON.parse(localStorage.getItem('heardSpecies')) || [];
                    const isHeard = heardSpecies.includes(entry['nome-PT']);
                    
                    if (isHeard) {
                        // If species is already in the list, remove it
                        heardSpecies = heardSpecies.filter(species => species !== entry['nome-PT']);
                        console.log(`${entry['nome-PT']} removed from heard list!`);
                    } else {
                        // If species is not in the list, add it
                        heardSpecies.push(entry['nome-PT']);
                        console.log(`${entry['nome-PT']} added to heard list!`);
                    }
                    
                    // Update the heardSpecies in localStorage
                    localStorage.setItem('heardSpecies', JSON.stringify(heardSpecies));
                    
                    // Update the button text based on the new state
                    updateButton();
                });
            
                // Initial call to set the correct button text
                updateButton();
            }
            
            
            document.querySelectorAll('.sidebar-item').forEach(item => {
                item.addEventListener('click', (event) => {
                    const index = event.target.getAttribute('data-index');
                    console.log('Sidebar item clicked:', event.target.textContent, 'Index:', index);

                    document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
                    event.target.classList.add('active');
                    displayDetails(speciesEntries[index]);
                });
            });

            if (speciesEntries.length > 0) {
                const firstSidebarItem = document.querySelector('.sidebar-item');
                if (firstSidebarItem) {
                    firstSidebarItem.classList.add('active');
                    displayDetails(speciesEntries[0]);
                }
            }
        })
        .catch(error => console.error('Error loading species data:', error));

    // Add event listener to toggle button to open sidebar
    toggleButton.addEventListener('click', () => {
        console.log('button pressed')
        sidebar.classList.add('visible');
    });

    // Add event listener to close button to close sidebar
    closeButton.addEventListener('click', () => {
        sidebar.classList.remove('visible');
    });

    // Add event listener to document to close sidebar when clicking outside
    document.addEventListener('click', (event) => {
        if (!sidebar.contains(event.target) && !toggleButton.contains(event.target)) {
            sidebar.classList.remove('visible');
        }
    });   
});
