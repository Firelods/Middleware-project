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
            this.subscribeToQueue("/queue/itinerary-updates."+this.userId); // S'abonner à la queue spécifiée
        };

        // Gestion des erreurs
        this.stompClient.onStompError = (frame) => {
            console.error("Erreur Stomp:", frame.headers["message"]);
            console.error("Détails:", frame.body);
        };
        this.handleUpdateRequest();
        this.stompClient.activate(); 
    }


    // S'abonner à une queue ActiveMQ
    subscribeToQueue(queueName) {
        this.stompClient.subscribe(queueName, (message) => {
            console.log("Message reçu:", message.body);
            this.handleMessage(JSON.parse(message.body));
        });
    }

    handleUpdateRequest() {
        window.addEventListener("requestNextInstruction", (event) => {
            this.sendUpdateRequest();
        });
    }

    sendUpdateRequest() {
        this.stompClient.publish({
            destination: "/queue/request-updates."+this.userId,
            body: JSON.stringify({
                UserId: this.userId,
                type:"update",
            }),
        });
    }

    // Gérer les messages reçus
    handleMessage(message) {

        if (message.UserId === this.userId && message.type != "update") {

            // Émettre un événement global avec les détails de l'instruction
            window.dispatchEvent(
                new CustomEvent("newInstruction", {
                    detail: {
                        instruction: message.Instruction,
                        direction: message.Type,
                        distance: message.Distance,
                        duration: message.Duration,
                        coordinates: {lat: message.Coordinates.Latitude, lng: message.Coordinates.Longitude}
                    },
                })
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
