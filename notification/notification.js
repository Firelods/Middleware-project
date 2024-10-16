class NotificationComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.templateLoaded = this.loadTemplate();
    }

    loadTemplate() {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(
                    "notification/notification-template.html"
                );
                if (!response.ok) {
                    throw new Error("Erreur lors du chargement du template");
                }

                const templateText = await response.text();
                const templateElement = document.createElement("div");
                templateElement.innerHTML = templateText;

                const template = templateElement.querySelector("template");
                if (template) {
                    this.shadowRoot.appendChild(
                        template.content.cloneNode(true)
                    );
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

    async showNotification(title, message, type = "info") {
        await this.templateLoaded;

        const titleElement = this.shadowRoot.querySelector(".notif-title");
        const messageElement = this.shadowRoot.querySelector(".notif-message");

        const infoIcon = this.shadowRoot.querySelector(".notif-icon svg.info");
        const errorIcon = this.shadowRoot.querySelector(
            ".notif-icon svg.error"
        );

        const closeButton = this.shadowRoot.querySelector(
            ".notif-cross button"
        );

        if (titleElement && messageElement && infoIcon && errorIcon) {
            titleElement.textContent = title;
            messageElement.textContent = message;

            if (type === "info") {
                infoIcon.style.display = "block";
                errorIcon.style.display = "none";
            } else if (type === "error") {
                infoIcon.style.display = "none";
                errorIcon.style.display = "block";
            }

            this.style.visibility = "visible";
            this.style.opacity = "1";

            closeButton.addEventListener("click", () => {
                this.style.opacity = "0";
                setTimeout(() => {
                    this.style.visibility = "hidden";
                }, 300); // Correspond à la durée de l'animation de fondu
            });

            setTimeout(() => {
                this.style.opacity = "0";
                setTimeout(() => {
                    this.style.visibility = "hidden";
                }, 500);
            }, 5000);
        } else {
            console.error("Les éléments de notification ne sont pas trouvés.");
        }
    }
}

customElements.define("notification-component", NotificationComponent);
