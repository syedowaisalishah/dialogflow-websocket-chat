const webhookService = require('../services/webhook.service');

class WebhookController {
    async handleFulfillment(req, res) {
        try {
            const { queryResult } = req.body;
            
            if (!queryResult) {
                return res.status(400).json({ error: 'Missing queryResult in request body' });
            }

            console.log(`[WebhookController] Received fulfillment request for: "${queryResult.intent.displayName}"`);

            // Delegate to service
            const response = webhookService.handleFulfillment(queryResult);

            return res.status(200).json(response);

        } catch (error) {
            console.error('[WebhookController] Error:', error.message);
            return res.status(500).json({ 
                fulfillmentText: 'I encountered an error while processing your request.',
                error: error.message 
            });
        }
    }
}

module.exports = new WebhookController();
