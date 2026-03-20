import { NextApiRequest, NextApiResponse } from 'next';

// In-memory storage for n8n responses
const n8nResponses: Record<string, any> = {};

// API endpoint for n8n callback
export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        // Store n8n response in memory
        const { id, response } = req.body;
        n8nResponses[id] = response;
        return res.status(200).json({ message: 'Response stored successfully' });
    }

    // Handle GET request to poll for responses
    if (req.method === 'GET') {
        const { id } = req.query;
        const response = n8nResponses[id];
        if (response) {
            return res.status(200).json({ response });
        } else {
            return res.status(404).json({ message: 'No response found for this ID' });
        }
    }

    // Method Not Allowed
    return res.status(405).json({ message: 'Method Not Allowed' });
}