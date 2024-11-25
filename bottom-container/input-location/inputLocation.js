import { ApiClient } from "/service/api-client.js";
class LocationComponent extends HTMLElement {
    chosenLocation = {};

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.loadTemplate();
    }

    async loadTemplate() {
        try {
            const response = await fetch(
                "bottom-container/input-location/location-template.html"
            );
            if (!response.ok) {
                throw new Error("Erreur lors du chargement du template");
            }

            const templateText = await response.text();
            const templateElement = document.createElement("div");
            templateElement.innerHTML = templateText;

            const template = templateElement.querySelector("template");
            if (template) {
                this.shadowRoot.appendChild(template.content.cloneNode(true));
                this.addEventListeners();
            }
        } catch (error) {
            console.error("Erreur : ", error);
        }
    }

    addEventListeners() {
        const departureInput = this.shadowRoot.getElementById("departure");
        const arrivalInput = this.shadowRoot.getElementById("arrival");
        const startNavigationButton =
            this.shadowRoot.getElementById("start-navigation");

        departureInput.addEventListener("input", (event) => {
            this.autocomplete(event.target.value, "departure");
        });
        departureInput.addEventListener("click", (event) => {
            this.autocomplete(event.target.value, "departure");
        });
        departureInput.addEventListener("focusout", () => {
            const dropdown =
                this.shadowRoot.getElementById("departure-dropdown");
            setTimeout(() => {
                dropdown.innerHTML = "";
                dropdown.remove();
            });
        });

        arrivalInput.addEventListener("input", (event) => {
            this.autocomplete(event.target.value, "arrival");
        });
        arrivalInput.addEventListener("click", (event) => {
            this.autocomplete(event.target.value, "arrival");
        });
        arrivalInput.addEventListener("focusout", () => {
            const dropdown = this.shadowRoot.getElementById("arrival-dropdown");
            setTimeout(() => {
                dropdown.innerHTML = "";
                dropdown.remove();
            }, 200);
        });

        startNavigationButton.addEventListener("click", () => {
            console.log("Start navigation button clicked");
            console.log(this.chosenLocation);
            const departure = this.shadowRoot.getElementById("departure").value;
            const departureLat = this.chosenLocation.departureLat;
            const departureLon = this.chosenLocation.departureLon;
            const arrival = this.shadowRoot.getElementById("arrival").value;
            const arrivalLat = this.chosenLocation.arrivalLat;
            const arrivalLon = this.chosenLocation.arrivalLon;
            const city = this.chosenLocation.city;
            console.log(departure, arrival, departureLat, departureLon, arrivalLat, arrivalLon, city);
            
            if (
                departure &&
                arrival &&
                departureLat &&
                departureLon &&
                arrivalLat &&
                arrivalLon &&
                city
            ) {
                this.startItinerary(
                    departure,
                    arrival,
                    departureLat,
                    departureLon,
                    arrivalLat,
                    arrivalLon,
                    city
                );
            } else {
                window.dispatchEvent(
                    new CustomEvent("displayNotif", {
                        detail: {
                            title: "Erreur",
                            message:
                                "Veuillez saisir des adresses valides pour le départ et l'arrivée.",
                            type: "error",
                        },
                    })
                );
            }
        });
    }

    startItinerary(
        departure,
        arrival,
        departureLat,
        departureLon,
        arrivalLat,
        arrivalLon,
        city
    ) {
        console.log("Lancement de la navigation");
        
        const apiClient = new ApiClient("http://localhost:8081");
        apiClient
            .getItinerary(
                departureLat,
                departureLon,
                arrivalLat,
                arrivalLon,
                "vitesse",
                city
            )
            .then((data) => {
                console.log("Données reçues:", data);
                window.dispatchEvent(
                    new CustomEvent("displayNotif", {
                        detail: {
                            title: "Navigation lancée",
                            message: `Navigation lancée de ${departure} à ${arrival}`,
                            type: "info",
                        },
                    })
                );
                window.dispatchEvent(
                    new CustomEvent("drawItinerary", {
                        detail: {
                            polyline:
                                data.GetItineraryResult.Route.Routes[0]
                                    .Geometry,
                        },
                    })
                );
                window.dispatchEvent(
                    new CustomEvent("displayInstructionComponent")
                );
            })
            .catch((error) => {
                console.error("Erreur:", error);
            });
    }

    async autocomplete(query, inputId) {
        const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
            query
        )}&limit=5`;

        try {
            if (query.length >= 3) {
                const response = await fetch(url);
                const data = await response.json();
                const suggestions = data.features;
                this.showSuggestions(suggestions, inputId);
            } else {
                const suggestions = [];
                this.showSuggestions(suggestions, inputId);
            }
        } catch (error) {
            console.error(
                "Erreur lors de la récupération des suggestions :",
                error
            );
        }
    }

    showSuggestions(suggestions, inputId) {
        console.log(suggestions);

        const inputElement = this.shadowRoot.getElementById(inputId);
        const dropdownId = `${inputId}-dropdown`;

        let dropdown = this.shadowRoot.getElementById(dropdownId);
        // if other dropdown exists, remove it
        const otherDropdown = this.shadowRoot.querySelector(
            ".autocomplete-dropdown"
        );
        if (otherDropdown && otherDropdown !== dropdown) {
            otherDropdown.remove();
        }
        if (!dropdown) {
            dropdown = document.createElement("div");
            dropdown.id = dropdownId;
            dropdown.className = "autocomplete-dropdown";
            this.shadowRoot.appendChild(dropdown);
        }
        // reverse suggestions tab
        suggestions = suggestions.reverse();

        dropdown.innerHTML = "";
        suggestions.forEach((suggestion) => {
            const suggestionItem = document.createElement("div");
            suggestionItem.className = "autocomplete-item";
            suggestionItem.textContent = suggestion.properties.label;
            // add custom field in html element for coordinates

            suggestionItem.addEventListener("click", () => {
                inputElement.value = suggestion.properties.label;
                dropdown.innerHTML = "";
                dropdown.remove();
                // Si l'utilisateur a sélectionné une adresse, on centre la carte sur cette adresse
                const [lon, lat] = suggestion.geometry.coordinates;
                this.chosenLocation[`${inputId}Lat`] = lat;
                this.chosenLocation[`${inputId}Lon`] = lon;
                this.chosenLocation[`city`] =
                    suggestion.properties.city.toLowerCase();
                console.log(this.chosenLocation);
                this.centerMapOnLocation(lat, lon);
            });
            dropdown.appendChild(suggestionItem);
        });
        dropdown.scrollTop = dropdown.offsetHeight;
        if (suggestions.length > 0) {
            console.log("suggestions not empty");
            return;
        }
        const mapOption = document.createElement("div");
        mapOption.className = "autocomplete-item map-icon";
        mapOption.textContent = "Pick point on map";
        dropdown.appendChild(mapOption);

        const locationOption = document.createElement("div");
        locationOption.className = "autocomplete-item location-icon";
        locationOption.textContent = "Use device location";
        locationOption.addEventListener("click", () => {
            this.getDeviceLocation();
            dropdown.innerHTML = "";
            dropdown.remove();
        });
        // scroll to the bottom of the dropdown
        dropdown.appendChild(locationOption);
        dropdown.scrollTop = dropdown.offsetHeight;
    }

    getDeviceLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;

                    // Appel à l'API de géocodage inverse pour récupérer l'adresse
                    const response = await fetch(
                        `https://api-adresse.data.gouv.fr/reverse/?lon=${longitude}&lat=${latitude}`
                    );
                    const data = await response.json();

                    if (data.features && data.features.length > 0) {
                        const address = data.features[0].properties.label;
                        this.shadowRoot.getElementById("departure").value =
                            address; // Remplir l'input avec l'adresse
                    }

                    this.centerMapOnLocation(latitude, longitude);
                },
                (error) => {
                    console.error(
                        "Erreur lors de la récupération de la localisation : ",
                        error
                    );
                    alert("Impossible de récupérer votre localisation.");
                }
            );
        } else {
            alert(
                "La géolocalisation n'est pas supportée par votre navigateur."
            );
        }
    }
    centerMapOnLocation(lat, lon) {
        window.dispatchEvent(
            new CustomEvent("centerMap", { detail: { lat, lon } })
        );
    }
}

customElements.define("location-component", LocationComponent);
