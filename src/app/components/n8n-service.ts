// n8n-service.ts

import axios from 'axios';

class N8nService {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    // CORS proxy handling
    private getProxiedUrl(url: string): string {
        return `https://your-cors-proxy.com/${url}`; // Use your actual CORS proxy here
    }

    // Timeout handling
    public async requestWithTimeout(url: string, timeout: number = 5000) {
        return axios.get(url, { timeout });
    }

    // Retry logic
    public async retryRequest(url: string, retries: number = 3): Promise<any> {
        let lastError;
        for (let i = 0; i < retries; i++) {
            try {
                const response = await this.requestWithTimeout(this.getProxiedUrl(url));
                return response.data;
            } catch (error) {
                lastError = error;
                console.error(`Attempt ${i + 1} failed:`, error.message);
            }
        }
        throw lastError;
    }

    // Health check
    public async healthCheck(): Promise<boolean> {
        try {
            const response = await this.requestWithTimeout(this.getProxiedUrl('/health')); // Adjust path as necessary
            return response.status === 200;
        } catch (error) {
            console.error('Health check failed:', error.message);
            return false;
        }
    }
}

export default N8nService;