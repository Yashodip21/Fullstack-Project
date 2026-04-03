async function initMap(locationName) {
    // Nominatim se coordinates fetch karo (free geocoding)
    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&limit=1`
    );
    const data = await response.json();

    // Agar location mili
    if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);

        // Map banao
        const map = L.map('map').setView([lat, lon], 10);

        // OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Marker add karo
        L.marker([lat, lon])
            .addTo(map)
            .bindPopup(`<b>${locationName}</b>`)
            .openPopup();

    } else {
        document.getElementById('map').innerHTML = 
            `<p class="text-muted text-center pt-5">Map not available for this location.</p>`;
    }
}

initMap(listingLocation);