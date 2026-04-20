const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const dotenv = require('dotenv');
const { SessionsClient } = require('@google-cloud/dialogflow');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Dialogflow Client Setup
const projectId = process.env.DIALOGFLOW_PROJECT_ID;
const sessionClient = new SessionsClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

wss.on('connection', (ws) => {
    console.log('Client connected');
    
    // Create a unique session ID for this connection
    const sessionId = Math.random().toString(36).substring(7);
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            const userText = data.text;

            console.log(`Received from client: ${userText}`);

            // Send text to Dialogflow
            const request = {
                session: sessionPath,
                queryInput: {
                    text: {
                        text: userText,
                        languageCode: 'en-US',
                    },
                },
            };

            const responses = await sessionClient.detectIntent(request);
            const result = responses[0].queryResult;

            console.log(`Dialogflow Response: ${result.fulfillmentText}`);

            // Relay back to client
            ws.send(JSON.stringify({
                text: result.fulfillmentText,
                sender: 'bot'
            }));

        } catch (error) {
            console.error('Error processing message:', error);
            ws.send(JSON.stringify({
                error: 'Failed to process message',
                details: error.message
            }));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });

    // Send welcome message
    ws.send(JSON.stringify({
        text: 'Hello! How can I help you today?',
        sender: 'bot'
    }));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
