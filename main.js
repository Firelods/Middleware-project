import { showCustomNotification } from "./notification/notification.js";
var map = L.map("map", { rotate: true }).setView([48.8566, 2.3522], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

let departureMarker;
let arrivalMarker;
window.addEventListener("addMarker", (event) => {
    const { lat, lon, inputId } = event.detail;
    if (inputId == "departure") {
        if (departureMarker) {
            departureMarker.remove();
        }
        departureMarker = L.marker([lat, lon])
            .addTo(map)
            .bindPopup("Vous partez d'ici");
        departureMarker.openPopup();
    } else if (inputId == "arrival") {
        if (arrivalMarker) {
            arrivalMarker.remove();
        }
        arrivalMarker = L.marker([lat, lon])
            .addTo(map)
            .bindPopup("Vous arrivez ici");
        arrivalMarker.openPopup();
    } else {
        console.error("inputId not found when adding marker");
    }
});

window.addEventListener("updateMap", (event) => {
    const { lat, lon, zoom, bearing } = event.detail;
    // Utiliser setView pour recentrer et ajuster le zoom en un seul appel
    console.log("Centering map with details:", event.detail);
    if (lat && lon) {
        map.setView([lat, lon], zoom || map.getZoom());
    } else {
        console.error("Invalid coordinates provided for centering the map.");
    }
    console.log("Rotating map to bearing:", bearing);
    // smoothRotateMap(-bearing);
    smoothRotateMap(360 - bearing);
});

function smoothRotateMap(targetBearing) {
    const currentBearing = map.getBearing(); // Angle initial de la carte
    const totalSteps = 60; // Durée totale de l'animation en frames (~1 seconde si 60fps)
    let step = 0;

    let delta = targetBearing - currentBearing;
    if (delta > 180) delta -= 360; // Si l'écart est supérieur à 180°, prend le sens inverse
    if (delta < -180) delta += 360; // Si l'écart est inférieur à -180°, prend le sens inverse

    // Fonction de Bézier cubique pour une interpolation douce (ease-in-out)
    function cubicBezier(t, p0, p1, p2, p3) {
        return (
            Math.pow(1 - t, 3) * p0 +
            3 * Math.pow(1 - t, 2) * t * p1 +
            3 * (1 - t) * Math.pow(t, 2) * p2 +
            Math.pow(t, 3) * p3
        );
    }

    // Points de contrôle pour une transition douce (ease-in-out)
    const p0 = 0; // Départ
    const p1 = 0.25; // Accélération initiale
    const p2 = 0.75; // Décélération finale
    const p3 = 1; // Arrivée

    function animate() {
        step++;

        // Fraction de progression normalisée (de 0 à 1)
        const t = step / totalSteps;

        // Appliquer la courbe de Bézier pour ajuster la progression
        const easedProgress = cubicBezier(t, p0, p1, p2, p3);

        // Interpolation de la rotation
        const interpolatedBearing = currentBearing + delta * easedProgress;

        map.setBearing(interpolatedBearing); // Met à jour la rotation

        if (step < totalSteps) {
            requestAnimationFrame(animate); // Continue l'animation
        } else {
            map.setBearing(targetBearing); // Assure la position finale exacte
        }
    }

    requestAnimationFrame(animate); // Lance l'animation
}

map.on("click", (event) => {
    const lat = event.latlng.lat;
    const lon = event.latlng.lng;
    window.dispatchEvent(
        new CustomEvent("mapClicked", {
            detail: { lat, lon },
        })
    );
});

window.addEventListener("centerMap", (event) => {
    console.log("Centering map with details:", event.detail);
    const { lat, lon, zoom } = event.detail;

    // Utiliser setView pour recentrer et ajuster le zoom en un seul appel
    if (lat && lon) {
        map.setView([lat, lon], zoom || map.getZoom());
    } else {
        console.error("Invalid coordinates provided for centering the map.");
    }
});

window.addEventListener("displayInstructionComponent", (event) => {
    displayInputLocationComponent(false);
    displayInstructionComponent(true);
});

window.addEventListener("displayInputLocationComponent", (event) => {
    const { reset } = event.detail;
    displayInstructionComponent(false);
    displayInputLocationComponent(true, reset);
});

window.addEventListener("displayNotif", (event) => {
    const { title, message, type } = event.detail;
    showCustomNotification(title, message, type);
});

function displayInputLocationComponent(display, reset = false) {
    const inputLocationComponent = document.getElementById(
        "inputLocationComponent"
    );
    inputLocationComponent.style.display = display ? "block" : "none";
    if (reset) {
        window.dispatchEvent(new CustomEvent("resetInputLocationComponent"));
    }
}

function displayInstructionComponent(display) {
    const instructionComponent = document.getElementById(
        "instructionComponent"
    );
    instructionComponent.style.display = display ? "block" : "none";
}

let currentPolylines = []; // Liste pour gérer toutes les polylignes

function hideItineraryOnMap() {
    if (currentPolylines && currentPolylines.length > 0) {
        currentPolylines.forEach((polyline) => polyline.remove());
    }
}

function displayItineraryOnMap(footPolylines = [], bikePolylines = []) {
    // Supprimez les anciennes polylignes
    hideItineraryOnMap();
    currentPolylines = [];

    // Ajouter les polylignes en vélo (ligne continue)
    bikePolylines.forEach((polylineData) => {
        const decodedBike = polyline.decode(polylineData);
        const bikePolyline = L.polyline(
            decodedBike.map(([lat, lng]) => [lat, lng]),
            {
                color: "blue",
                weight: 5,
            }
        ).addTo(map);
        currentPolylines.push(bikePolyline);
    });

    // Ajouter les polylignes à pied (en pointillé)
    footPolylines.forEach((polylineData) => {
        const decodedFoot = polyline.decode(polylineData);
        const footPolyline = L.polyline(
            decodedFoot.map(([lat, lng]) => [lat, lng]),
            {
                color: "cyan",
                weight: 5,
                dashArray: "10, 10", // Pointillé
            }
        ).addTo(map);
        currentPolylines.push(footPolyline);
    });

    if (currentPolylines.length > 0) {
        const allBounds = currentPolylines.map((polyline) =>
            polyline.getBounds()
        );
        const combinedBounds = allBounds.reduce((acc, bounds) =>
            acc.extend(bounds)
        );
        map.fitBounds(combinedBounds, {
            padding: [30, 30],
        });
    }
}

window.addEventListener("drawItineraryCombined", (event) => {
    const { polylineFoot1, polylineFoot2, polylineBike } = event.detail;
    displayItineraryOnMap(
        [polylineFoot1, polylineFoot2].filter(Boolean), // Filtrer les null ou undefined
        [polylineBike].filter(Boolean)
    );
});

window.addEventListener("drawItineraryInterCity", (event) => {
    const {
        polylineFoot1,
        polylineFoot2,
        polylineFoot3,
        polylineBike1,
        polylineBike2,
    } = event.detail;
    displayItineraryOnMap(
        [polylineFoot1, polylineFoot2, polylineFoot3].filter(Boolean),
        [polylineBike1, polylineBike2].filter(Boolean)
    );
});

window.addEventListener("drawItineraryDirect", (event) => {
    const { polylineFoot } = event.detail;
    displayItineraryOnMap([polylineFoot], []);
});

window.addEventListener("displayInputLocationComponent", (event) => {
    displayInstructionComponent(false);
    displayInputLocationComponent(true);
});

function hideIconsOnMap() {
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });
}

function displayHubsOnMap(hub1, hub2) {
    if (hub1) {
        const hub1Marker = L.marker([hub1.Latitude, hub1.Longitude], {
            icon: L.icon({
                iconUrl: "img/hub.svg",
                iconSize: [40, 55],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
            }),
        })
            .addTo(map)
            .bindPopup("Hub 1");
        hub1Marker.openPopup();
    }

    if (hub2) {
        const hub2Marker = L.marker([hub2.Latitude, hub2.Longitude], {
            icon: L.icon({
                iconUrl: "img/hub.svg",
                iconSize: [40, 55],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
            }),
        })
            .addTo(map)
            .bindPopup("Hub 2");
        hub2Marker.openPopup();
    }
}

window.addEventListener("showHubs", (event) => {
    const { hub1, hub2 } = event.detail;
    displayHubsOnMap(hub1, hub2);
});

window.addEventListener("stopNavigation", (event) => {
    console.log("Arrêt de la navigation");
    const { arrived } = event.detail;
    window.dispatchEvent(
        new CustomEvent("displayInputLocationComponent", {
            detail: { reset: true },
        })
    );
    resetMap();
    console.log("Arrived:", arrived);
    if (arrived) {
        showCustomNotification(
            "Arrivé",
            "Vous êtes arrivé à destination !",
            "info"
        );
    } else {
        showCustomNotification(
            "Arrêt de la navigation",
            "La navigation a été arrêtée.",
            "error"
        );
    }
});

function resetMap() {
    console.log("Resetting map");
    // map.setZoom(13);
    hideItineraryOnMap();
    hideIconsOnMap();
}
