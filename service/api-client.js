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

    async getItinerary(originLat, originLng, destLat, destLng, priority, city) {
        const url = `${this.baseURL}/itinerary/GetItinerary?originLat=${originLat}&originLng=${originLng}&destLat=${destLat}&destLng=${destLng}&priority=${priority}&contract=${city}`;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Erreur lors de l’appel API:", error);
            throw error;
        }
    }
}

// apiClient.getItinerary(
//     43.59965517690049,
//     1.4408472084544073,
//     43.60011368530669,
//     1.44258404541932,
//     'vitesse'
// ).then(data => {
//     console.log('Données reçues:', data);
// }).catch(error => {
//     console.error('Erreur:', error);
// });
