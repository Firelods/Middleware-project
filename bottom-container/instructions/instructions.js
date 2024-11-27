class InstructionsComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.loadTemplate();
    }

    async loadTemplate() {
        try {
            const response = await fetch(
                "bottom-container/instructions/instructions-template.html"
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
                this.listenForNewInstructions();
            }
        } catch (error) {
            console.error("Erreur : ", error);
        }
    }

    addEventListeners() {
        // Bouton pour arrêter la navigation
        const stopNavigationButton =
            this.shadowRoot.getElementById("stop-navigation");
        stopNavigationButton.addEventListener("click", () => {
            window.dispatchEvent(
                new CustomEvent("displayInputLocationComponent")
            );
            window.dispatchEvent(new CustomEvent("stopNavigation"));
        });

        // Instruction cliquable pour demander la suivante
        const directionInstructions =
            this.shadowRoot.getElementById("instruction");
        directionInstructions.addEventListener("click", () => {
            console.log(
                "Demande d'instruction suivante pour:",
                directionInstructions.textContent
            );

            window.dispatchEvent(
                new CustomEvent("requestNextInstruction")
            );
        });
    }

    listenForNewInstructions() {
        // Écoute des nouvelles instructions depuis les événements globaux
        window.addEventListener("newInstruction", (event) => {
            const { instruction, direction, distance, duration } = event.detail;

            this.updateDirectionInstructions(instruction);
            this.updateDirectionIcon(direction);
            this.updateArrivalTimeFromDuration(duration);

            console.log(`Instruction mise à jour : ${instruction}`);
        });
    }

    updateArrivalTimeFromDuration(duration) {
        const currentDate = new Date();
        const minutesToAdd = Math.ceil(duration);
        const arrivalDate = new Date(
            currentDate.getTime() + minutesToAdd * 60000
        );

        this.updateArrivalTime(
            arrivalDate.getHours(),
            arrivalDate.getMinutes()
        );
    }

    updateArrivalTime(hour, minutes) {
        const formattedHour = hour < 10 ? `0${hour}` : hour;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

        const arrivalTime = this.shadowRoot.getElementById("arrival");
        arrivalTime.textContent = `${formattedHour}h${formattedMinutes}`;
    }

    updateDirectionIcon(direction) {
        const directionIcon = this.shadowRoot.getElementById("direction-icon");

        // Correspondance entre les types numériques et les noms des fichiers SVG
        const directionMap = {
            0: "left",
            1: "right",
            2: "sharp-left",
            3: "sharp-right",
            4: "slight-left",
            5: "slight-right",
            6: "straight",
            7: "enter-roundabout",
            8: "exit-roundabout",
            9: "u-turn",
            10: "destination",
            11: "start",
            12: "keep-left",
            13: "keep-right"
        };

        // Récupération du nom du fichier SVG correspondant
        const svgName = directionMap[parseInt(direction)] || "default"; // Utilisation de "default" si le type est inconnu

        // Mise à jour de l'icône
        directionIcon.src = `img/directions-icon/${svgName}.svg`;
    }


    updateDirectionInstructions(instructions) {
        const directionInstructions = this.shadowRoot.getElementById("instruction");
        directionInstructions.textContent = instructions;
    }
}

customElements.define("instructions-component", InstructionsComponent);
