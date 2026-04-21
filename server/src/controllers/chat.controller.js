const dialogflowService = require('../services/dialogflow.service');
const sessionRepository = require('../repositories/session.repository');

class ChatController {
    async handleConnection(ws, req) {
        const wsId = req.headers['sec-websocket-key'];
        const sessionId = sessionRepository.createSession(wsId);
        
        console.log(`[ChatController] New client connected. Session: ${sessionId}`);

        ws.on('message', async (message) => {
            await this.handleMessage(ws, message, sessionId);
        });

        ws.on('close', () => {
            sessionRepository.deleteSession(wsId);
            console.log(`[ChatController] Client disconnected. Session: ${sessionId}`);
        });

        // Send welcome message
        console.log(`[ChatController] Using Project ID: ${process.env.DIALOGFLOW_PROJECT_ID}`);
        ws.send(JSON.stringify({
            text: 'Welcome to the structured Dialogflow Assistant! How can I help?',
            sender: 'bot'
        }));
    }

    async handleMessage(ws, message, sessionId) {
        try {
            const data = JSON.parse(message);
            const userText = data.text;

            if (!userText) return;

            console.log(`[ChatController] Message from ${sessionId}: ${userText}`);

            const result = await dialogflowService.detectIntent(sessionId, userText);

            ws.send(JSON.stringify({
                text: result.fulfillmentText,
                sender: 'bot'
            }));

        } catch (error) {
            console.error('[ChatController] Error:', error.message);
            ws.send(JSON.stringify({
                text: `Error: ${error.message}. Please ensure Dialogflow API is enabled.`,
                sender: 'bot',
                isError: true
            }));
        }
    }
}

module.exports = new ChatController();
