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