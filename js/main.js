var map = L.map("map").setView([48.8566, 2.3522], 13); // Coordonnées de Paris par défaut

// Ajouter les tuiles OSM
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Ajouter un marqueur
var marker = L.marker([48.8566, 2.3522])
    .addTo(map)
    .bindPopup("Un marqueur à Paris.")
    .openPopup();
