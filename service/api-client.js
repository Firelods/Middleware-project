import { MessageClient } from "./message-client.js";
import { showCustomNotification } from "../notification/notification.js";

export class ApiClient {
    apiClientInstance = null;

    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    getApiClient() {
        if (this.apiClientInstance === null) {
            this.apiClientInstance = new ApiClient("http://localhost:8081");
        }
        return this.apiClientInstance;
    }

    async getItinerary(
        originLat,
        originLng,
        destLat,
        destLng,
        priority,
        departureCity,
        arrivalCity
    ) {
        const url = `${this.baseURL}/itinerary/GetItinerary?originLat=${originLat}&originLng=${originLng}&destLat=${destLat}&destLng=${destLng}&priority=${priority}&departureContract=${departureCity}&arrivalContract=${arrivalCity}`;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(`HTTP ${response.status} : ${errorMessage}`);
            }
            // parse the response
            const data = await response.json();
            const userId = data.GetItineraryResult.UserId;
            console.log("userId", userId);

            const brokerUrl = "ws://localhost:61614/stomp"; // URL du broker ActiveMQ

            const messageClient = new MessageClient(brokerUrl, userId);
            messageClient.connect();

            return data;
        } catch (error) {
            console.error("Erreur lors de l'appel API:", error);
            showCustomNotification("Erreur du serveur ", error, "error");
            throw error;
        }
    }
}
