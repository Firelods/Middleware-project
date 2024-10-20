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
}

customElements.define("instructions-component", InstructionsComponent);
