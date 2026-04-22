const chatService = require('../services/chat.service');
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

        // Greeting handled by client as requested
        console.log(`[ChatController] Connection established for project: ${process.env.DIALOGFLOW_PROJECT_ID}`);
    }

    async handleMessage(ws, message, sessionId) {
        try {
            const data = JSON.parse(message);
            const userText = data.text;

            if (!userText) return;

            console.log(`[ChatController] Input: "${userText}"`);

            // Use service for business logic
            const response = await chatService.processMessage(sessionId, userText);

            if (response) {
                console.log(`[ChatController] Response: "${response.text}" (Intent: ${response.intent})`);
                
                ws.send(JSON.stringify({
                    text: response.text,
                    sender: 'bot'
                }));
            }

        } catch (error) {
            console.error('[ChatController] Error:', error.message);
            
            // Standard user-facing error message
            ws.send(JSON.stringify({
                text: `Error: ${error.message}. Please check your connection or Dialogflow API status.`,
                sender: 'bot',
                isError: true
            }));
        }
    }
}

module.exports = new ChatController();
