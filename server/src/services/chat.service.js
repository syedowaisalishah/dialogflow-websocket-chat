const dialogflowService = require('./dialogflow.service');

class ChatService {
    async processMessage(sessionId, userText) {
        try {
            if (!userText) return null;

            const result = await dialogflowService.detectIntent(sessionId, userText);

            // Response extraction logic
            let replyText = result.fulfillmentText;
            
            // Fallback strategy for empty fulfillmentText
            if (!replyText || replyText.trim() === "") {
                if (result.fulfillmentMessages && result.fulfillmentMessages.length > 0) {
                    const msg = result.fulfillmentMessages[0];
                    if (msg.text && msg.text.text && msg.text.text[0]) {
                        replyText = msg.text.text[0];
                    }
                }
            }

            // Final fallback if still empty
            if (!replyText || replyText.trim() === "") {
                replyText = "(no response from agent)";
                console.warn(`[ChatService] No text found for intent: "${result.intent ? result.intent.displayName : 'UNKNOWN'}"`);
            }

            return {
                text: replyText,
                intent: result.intent && result.intent.displayName,
                webhookStatus: result.webhookStatus,
                fulfillmentMessages: result.fulfillmentMessages,
                rawResult: result
            };

        } catch (error) {
            console.error('[ChatService] Error:', error.message);
            throw new Error(error.message);
        }
    }
}

module.exports = new ChatService();
