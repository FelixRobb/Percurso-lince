const birdData = [
    {
        name: 'European Robin',
        description: 'A small insectivorous passerine bird, distinctive for its orange-red breast.',
        imageUrl: 'images/robin.jpg',
        audioUrl: 'sounds/robin.mp3',
        lat: 37.805,
        lng: -7.564,
        date: '2024-07-01'
    },
    // Add more bird data here
];

const recordingsList = document.getElementById('recordings-list');

birdData.forEach(bird => {
    const recordingElement = document.createElement('div');
    recordingElement.className = 'recording';
    recordingElement.innerHTML = `
                                                                                            <h2>${bird.name}</h2>
                                                                                                    <p>${bird.description}</p>
                                                                                                            <p>Date: ${bird.date}</p>
                                                                                                                    <p>Location: <a href="index.html#${bird.lat},${bird.lng}">${bird.lat}, ${bird.lng}</a></p>
                                                                                                                            <audio controls>
                                                                                                                                        <source src="${bird.audioUrl}" type="audio/mpeg">
                                                                                                                                                    Your browser does not support the audio element.
                                                                                                                                                            </audio>
                                                                                                                                                                `;
    recordingsList.appendChild(recordingElement);
});
