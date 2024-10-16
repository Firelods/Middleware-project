class NotificationComponent extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    this.loadTemplate();
  }

  async loadTemplate() {
    try {
      const response = await fetch("notification-template.html");
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
}

customElements.define("notification-component", NotificationComponent);
