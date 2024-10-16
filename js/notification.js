class NotificationComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.templateLoaded = this.loadTemplate();
  }

  loadTemplate() {
    return new Promise(async (resolve, reject) => {
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
          resolve(); // Résoudre la promesse une fois le template chargé
        } else {
          reject("Template non trouvé");
        }
      } catch (error) {
        console.error("Erreur : ", error);
        reject(error); // Rejeter la promesse en cas d'erreur
      }
    });
  }

  async showNotification(title, message) {
    await this.templateLoaded;

    const titleElement = this.shadowRoot.querySelector(".notif-title");
    const messageElement = this.shadowRoot.querySelector(".notif-message");
    const notificationElement = this.shadowRoot.querySelector(".notification");

    if (titleElement && messageElement && notificationElement) {
      titleElement.textContent = title;
      messageElement.textContent = message;

      this.style.visibility = "visible";
      this.style.opacity = "1";

      setTimeout(() => {
        // Animation de fondu
        this.style.opacity = "0";
        setTimeout(() => {
          this.style.visibility = "hidden";
        }, 300); 
      }, 3000); 
    } else {
      console.error("Les éléments de notification ne sont pas trouvés.");
    }
  }
}

customElements.define("notification-component", NotificationComponent);
