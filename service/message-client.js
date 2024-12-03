import { showCustomNotification } from "../notification/notification.js";

export class MessageClient {
    constructor(brokerUrl, userId) {
        this.brokerUrl = brokerUrl; // URL WebSocket du broker
        this.userId = userId; // UserId pour filtrer les messages
        this.stompClient = null; // Instance du client Stomp.js
    }

    // Connexion au broker
    connect() {
        this.stompClient = new StompJs.Client({
            brokerURL: this.brokerUrl, // URL du broker WebSocket
            connectHeaders: {
                login: "admin", // Nom d'utilisateur configuré dans le broker
                passcode: "admin", // Mot de passe configuré dans le broker
            },
            // debug: (str) => {
            //     console.log("StompJS Debug:", str);
            // },
            reconnectDelay: 5000, // Délai de reconnexion automatique
            heartbeatIncoming: 4000, // Battement cardiaque pour les messages entrants
            heartbeatOutgoing: 4000, // Battement cardiaque pour les messages sortants
        });

        // Connecter au broker
        this.stompClient.onConnect = () => {
            console.log("Connecté au broker ActiveMQ.");
            this.subscribeToItineraryQueue(
                "/queue/itinerary-updates." + this.userId
            ); // S'abonner à la queue spécifiée
            this.subscribeToAlertQueue("/queue/trafic-alerts." + this.userId); // S'abonner à la queue spécifiée
        };

        // Gestion des erreurs
        this.stompClient.onStompError = (frame) => {
            console.error("Erreur Stomp:", frame.headers["message"]);
            console.error("Détails:", frame.body);
            showCustomNotification(
                "Erreur Stomp",
                frame.headers["message"],
                "error"
            );
        };
        this.handleUpdateRequest();
        this.stompClient.activate();
    }

    /**
     * Send a request to the server to get the next instruction
     */
    sendUpdateRequest() {
        this.startMessageTimeout();
        this.stompClient.publish({
            destination: "/queue/request-updates." + this.userId,
            body: JSON.stringify({
                UserId: this.userId,
                type: "update",
            }),
        });
    }

    // S'abonner à la queue des itinéraires
    subscribeToItineraryQueue(queueName) {
        this.stompClient.subscribe(queueName, (message) => {
            console.log("Message d'itinéraire reçu:", message.body);
            clearTimeout(this.messageTimeout);
            this.handleItineraryMessage(JSON.parse(message.body));
        });
    }

    // S'abonner à la queue des alertes de trafic
    subscribeToAlertQueue(queueName) {
        this.stompClient.subscribe(queueName, (message) => {
            console.log("Message d'alerte reçu:", message.body);
            this.handleAlertMessage(JSON.parse(message.body));
        });
    }

    /**
     * Start a timeout to show a notification if the server does not respond within 5 seconds
     */
    startMessageTimeout() {
        this.messageTimeout = setTimeout(() => {
            showCustomNotification(
                "Erreur de connexion",
                "Le serveur ne répond pas. Veuillez réessayer plus tard.",
                "error"
            );
            this.stompClient.deactivate();
        }, 5000);
    }

    /**
     * Handle the request for the next instruction
     */
    handleUpdateRequest() {
        window.addEventListener("requestNextInstruction", (event) => {
            this.sendUpdateRequest();
        });
    }

    // Gérer les messages reçus
    handleItineraryMessage(message) {
        if (message.UserId === this.userId && message.type != "update") {
            // Émettre un événement global avec les détails de l'instruction
            window.dispatchEvent(
                new CustomEvent("newInstruction", {
                    detail: {
                        instruction: message.Instruction,
                        direction: message.Type,
                        distance: message.Distance,
                        duration: message.Duration,
                        coordinates: {
                            lat: message.Maneuver.Location
                                ? message.Maneuver.Location[1]
                                : null,
                            lng: message.Maneuver.Location
                                ? message.Maneuver.Location[0]
                                : null,
                        },
                        bearing: message.Maneuver.bearing_before,
                        arrived: message.Arrived,
                    },
                })
            );
        }
    }

    handleAlertMessage(message) {
        console.log("Alerte reçue:", message);
        console.log("this.userId:", this.userId);
        console.log("UserId:", message.UserId);

        if (message.UserId === this.userId /*&& message.type != "update"*/) {
            // Émettre un événement global avec les détails de l'instruction
            showCustomNotification(
                message.Title,
                message.Description,
                message.Severity
            );
        }
    }

    // Afficher les messages dans l'interface utilisateur
    displayMessage(message) {
        const messageContainer = document.getElementById("messageContainer");

        if (!messageContainer) {
            console.error("Aucun conteneur pour afficher les messages !");
            return;
        }

        const messageElement = document.createElement("div");
        messageElement.textContent = `Instruction: ${message.Instruction}, Distance: ${message.Distance} km, Durée: ${message.Duration} min`;
        messageContainer.appendChild(messageElement);
    }

    // Déconnexion du broker
    disconnect() {
        if (this.stompClient && this.stompClient.active) {
            this.stompClient.deactivate();
            console.log("Déconnecté du broker ActiveMQ.");
        }
    }
}
