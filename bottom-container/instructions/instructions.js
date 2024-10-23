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
      }
    } catch (error) {
      console.error("Erreur : ", error);
    }
  }

  addEventListeners() {
    const stopNavigationButton =
      this.shadowRoot.getElementById("stop-navigation");
    stopNavigationButton.addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("displayInputLocationComponent"));
    });
  }

  updateArrivalTime(hour, minutes) {
    if (!hour || !minutes) {
      console.error("Heure ou minutes manquantes");
      return;
    }
    if (hour < 0 || hour > 23) {
      console.error("Heure invalide");
      return;
    }
    if (minutes < 0 || minutes > 59) {
      console.error("Minutes invalides");
      return;
    }
    if (hour < 10) {
      hour = "0" + hour;
    }
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    const arrivalTime = document.getElementById("arrival");
    arrivalTime.textContent = `${hour}h${minutes}`;
  }

  udpateDirectionIcon(direction) {
    const directionIcon = document.getElementById("direction-icon");
    directionIcon.src = `img/directions-icon/${direction}.svg`;
  }

  updateDirectionInstructions(instructions) {
    const directionInstructions = document.getElementById("instruction");
    directionInstructions.textContent = instructions;
  }
}

customElements.define("instructions-component", InstructionsComponent);
