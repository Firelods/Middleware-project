var map = L.map("map").setView([48.8566, 2.3522], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

window.addEventListener("centerMap", (event) => {
    const { lat, lon } = event.detail;

    map.setView([lat, lon], 13); // Recentrer la carte sur la position de l'utilisateur

    L.marker([lat, lon]).addTo(map).bindPopup("Vous êtes ici").openPopup();
});

function showCustomNotification(title, message, type) {
    // Récupération du composant de notification par son ID
    const notificationComponent = document.getElementById("notification");

    // Appel de la méthode pour afficher la notification avec le titre et le message personnalisé
    notificationComponent.showNotification(title, message, type);
}

// Exemple d'appel pour tester
document.addEventListener("DOMContentLoaded", () => {
    showCustomNotification(
        "Bienvenue !",
        "Votre session a commencé avec succès.",
        "error"
    );
});
