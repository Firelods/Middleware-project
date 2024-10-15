class LocationComponent extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({ mode: "open" });

        this.loadTemplate();
    }

    async loadTemplate() {
        try {
            const response = await fetch("location-template.html");
            if (!response.ok) {
                throw new Error("Erreur lors du chargement du template");
            }

            const templateText = await response.text();
            const templateElement = document.createElement("div");
            templateElement.innerHTML = templateText;

            const template = templateElement.querySelector("template");
            if (template) {
                this.shadowRoot.appendChild(template.content.cloneNode(true));
            }
        } catch (error) {
            console.error("Erreur : ", error);
        }
    }

    addEventListeners() {
        const startNavigationButton =
            this.shadowRoot.getElementById("start-navigation");

        startNavigationButton.addEventListener("click", () => {
            const departure = this.shadowRoot.getElementById("departure").value;
            const arrival = this.shadowRoot.getElementById("arrival").value;

            if (departure && arrival) {
                alert(`Navigation lancée de ${departure} à ${arrival}`);
                //TODO: Implémenter la navigation
            } else {
                alert(
                    "Veuillez saisir des adresses valides pour le départ et l'arrivée."
                );
            }
        });
    }
}

customElements.define("location-component", LocationComponent);
