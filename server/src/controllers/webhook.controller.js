class WebhookController {
    async handleFulfillment(req, res) {
        const { queryResult } = req.body;
        const intentName = queryResult.intent.displayName;
        const parameters = queryResult.parameters;

        console.log(`[Webhook] Received fulfillment request for intent: ${intentName}`);

        let fulfillmentText = queryResult.fulfillmentText;

        // Custom logic for "Flight Booking" fulfillment as seen in the diagram
        if (intentName === 'book_flight' || intentName === 'Flight Booking - Final') {
            const destination = parameters.destination || 'your destination';
            const departure = parameters.departure || 'your departure city';
            const passengers = parameters.passengers || '1';
            
            fulfillmentText = `Great! I'll search for the best available flights from ${departure} to ${destination} for ${passengers} passenger(s) for you.`;
        }

        return res.status(200).json({
            fulfillmentMessages: [
                {
                    text: {
                        text: [fulfillmentText]
                    }
                }
            ],
            fulfillmentText: fulfillmentText
        });
    }
}

module.exports = new WebhookController();
