document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const details = document.getElementById('details');

    const urlParams = new URLSearchParams(window.location.search);
    const speciesName = urlParams.get('name');

    fetch('species.json')
        .then(response => response.json())
        .then(birds => {
            const speciesEntries = birds.filter(bird => bird.name === speciesName);

            if (speciesEntries.length === 0) {
                details.innerHTML = `<p>No details found for species: ${speciesName}</p>`;
                return;
            }

            const sidebarContent = speciesEntries.map((entry, index) => `
                <div class="sidebar-item" data-index="${index}">${entry.association}</div>
            `).join('');
            sidebar.innerHTML = sidebarContent;

            function displayDetails(entry) {
                details.innerHTML = `
                    <h2>${entry.name} (${entry.scientific_name})</h2>
                    <p class="description">${entry.description}</p>
                    <p class="comments"><strong>Comments:</strong> ${entry.comenta}</p>
                    <p class="months"><strong>Best months to listen:</strong> ${entry.most_probable_months.join(', ')}</p>
                    <div class="sound-url">${entry.sound_url}</div>
                    <p class="location"><strong>Location:</strong> <a href="map.html?location=${encodeURIComponent(entry.association)}">${entry.association}</a></p>
                `;
            }

            document.querySelectorAll('.sidebar-item').forEach(item => {
                item.addEventListener('click', (event) => {
                    const index = event.target.getAttribute('data-index');
                    document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
                    event.target.classList.add('active');
                    displayDetails(speciesEntries[index]);
                });
            });

            // Display first entry by default
            document.querySelector('.sidebar-item').classList.add('active');
            displayDetails(speciesEntries[0]);
        })
        .catch(error => console.error('Error loading species data:', error));
});
