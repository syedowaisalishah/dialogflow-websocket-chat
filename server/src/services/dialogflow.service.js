const axios = require('axios');
const googleAuth = require('../utils/googleAuth');

class DialogflowService {
    constructor() {
        this.projectId = process.env.DIALOGFLOW_PROJECT_ID;
    }

    async detectIntent(sessionId, text) {
        try {
            const token = await googleAuth.getAccessToken();
            const url = `https://dialogflow.googleapis.com/v2/projects/${this.projectId}/agent/sessions/${sessionId}:detectIntent`;
            
            const response = await axios.post(url, {
                queryInput: {
                    text: {
                        text: text,
                        languageCode: 'en-US'
                    }
                }
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.queryResult;
        } catch (error) {
            console.error('Dialogflow Service Error:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
}

module.exports = new DialogflowService();
