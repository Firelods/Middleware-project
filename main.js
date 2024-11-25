var map = L.map("map").setView([48.8566, 2.3522], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

window.addEventListener("addMarker", (event) => {
    const { lat, lon, message } = event.detail;
    L.marker([lat, lon]).addTo(map).bindPopup(message).openPopup();
});

window.addEventListener("centerMap", (event) => {
    const { lat, lon } = event.detail;
    centerMap(lat, lon); // Recentrer la carte sur la position de l'utilisateur
});

window.addEventListener("displayInstructionComponent", (event) => {
    displayInputLocationComponent(false);
    displayInstructionComponent(true);
});

window.addEventListener("displayInputLocationComponent", (event) => {
    displayInstructionComponent(false);
    displayInputLocationComponent(true);
});

window.addEventListener("displayNotif", (event) => {
    const { title, message, type } = event.detail;
    showCustomNotification(title, message, type);
});

function centerMap(lat, lon) {
    map.setView([lat, lon], 13);
}

function displayInputLocationComponent(display) {
    const inputLocationComponent = document.getElementById(
        "inputLocationComponent"
    );
    inputLocationComponent.style.display = display ? "block" : "none";
}

function displayInstructionComponent(display) {
    const instructionComponent = document.getElementById(
        "instructionComponent"
    );
    instructionComponent.style.display = display ? "block" : "none";
}

function showCustomNotification(title, message, type) {
    // Récupération du composant de notification par son ID
    const notificationComponent = document.getElementById("notification");

    // Appel de la méthode pour afficher la notification avec le titre et le message personnalisé
    notificationComponent.showNotification(title, message, type);
}

let currentPolyline;
function displayItineraryOnMap(itinerary) {
    if (currentPolyline) {
        currentPolyline.remove();
    }
    const decodedPolyline = polyline.decode(itinerary);
    currentPolyline = L.polyline(
        decodedPolyline.map(([lat, lng]) => [lat, lng]),
        {
            color: "blue",
            weight: 5,
        }
    ).addTo(map);

    map.fitBounds(currentPolyline.getBounds());
}

window.addEventListener("drawItinerary", (event) => {
    displayItineraryOnMap(event.detail.polyline);
});

window.addEventListener("stopNavigation", (event) => {
    hideItineraryOnMap();
});

function hideItineraryOnMap() {
    if (currentPolyline) {
        currentPolyline.remove();
    }
}
