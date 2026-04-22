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

            console.log(`[ChatController] User Input: "${userText}"`);

            const result = await dialogflowService.detectIntent(sessionId, userText);

            // Full debug dump — diagnose empty/missing responses
            console.log(`[ChatController] DIALOGFLOW RESULT:`, JSON.stringify({
                intent: result.intent && result.intent.displayName,
                fulfillmentText: result.fulfillmentText,
                webhookStatus: result.webhookStatus,
                fulfillmentMessages: result.fulfillmentMessages
            }, null, 2));

            let replyText = result.fulfillmentText;
            
            // Fallback strategy for empty fulfillmentText
            if (!replyText || replyText.trim() === "") {
                if (result.fulfillmentMessages && result.fulfillmentMessages.length > 0) {
                    const msg = result.fulfillmentMessages[0];
                    if (msg.text && msg.text.text && msg.text.text[0]) {
                        replyText = msg.text.text[0];
                        console.log(`[ChatController] Falling back to fulfillmentMessages[0]`);
                    }
                }
            }

            if (!replyText || replyText.trim() === "") {
                replyText = "(no response from agent)";
                console.warn(`[ChatController] Warning: No text found in result matching intent "${result.intent ? result.intent.displayName : 'UNKNOWN'}"`);
            }

            console.log(`[ChatController] Final Reply: "${replyText}"`);

            ws.send(JSON.stringify({
                text: replyText,
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
