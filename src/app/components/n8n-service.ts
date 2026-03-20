// Import necessary libraries
import axios from 'axios';

// Define types for the response and config
interface MapleBearResponse {
    data: any;
    status: number;
}

interface MapleBearConfig {
    baseURL: string;
    timeout?: number;
    retry?: number;
}

class MapleBear {
    private config: MapleBearConfig;
    private currentRetry: number = 0;

    constructor(config: MapleBearConfig) {
        this.config = config;
    }

    // Method to perform a GET request with CORS and retry logic
    async get(endpoint: string): Promise<MapleBearResponse> {
        const url = `${this.config.baseURL}${endpoint}`;
        const options = {
            method: 'GET',
            url: url,
            timeout: this.config.timeout || 1000,
        };

        try {
            const response = await axios(options);
            return { data: response.data, status: response.status };
        } catch (error) {
            // Handle retry logic
            if (this.currentRetry < (this.config.retry || 3)) {
                this.currentRetry++;
                return this.get(endpoint);
            }
            throw error;
        }
    }

    // Health check method
    async healthCheck(): Promise<boolean> {
        try {
            const response = await this.get('/health');
            return response.status === 200;
        } catch (error) {
            return false;
        }
    }
}

// Export the MapleBear class for usage in other parts of the application
export default MapleBear;