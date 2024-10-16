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
function showCustomNotification(title, message) {
  // Récupération du composant de notification par son ID
  const notificationComponent = document.getElementById("notification");

  // Appel de la méthode pour afficher la notification avec le titre et le message personnalisé
  notificationComponent.showNotification(title, message);
}

// Exemple d'appel pour tester
document.addEventListener("DOMContentLoaded", () => {
  showCustomNotification(
    "Bienvenue !",
    "Votre session a commencé avec succès."
  );
});
