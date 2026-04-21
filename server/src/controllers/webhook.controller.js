class WebhookController {
    async handleFulfillment(req, res) {
        const { queryResult } = req.body;
        const intentName = queryResult.intent.displayName;
        const parameters = queryResult.parameters;

        console.log(`[Webhook] Parameters Received:`, JSON.stringify(parameters));
        console.log(`[Webhook] Contexts Received:`, JSON.stringify(queryResult.outputContexts));

        let fulfillmentText = queryResult.fulfillmentText;

        // Custom logic for "Flight Booking" fulfillment as seen in the diagram
        const flightIntents = ['book_flight', 'Flight Booking - Final', 'FlightBooking', 'FlightBooking - yes'];
        if (flightIntents.includes(intentName)) {
            // If parameters are missing in the intent (common in follow-up intents), look in contexts
            let finalParams = { ...parameters };
            if (queryResult.outputContexts) {
                queryResult.outputContexts.forEach(ctx => {
                    if (ctx.parameters) {
                        finalParams = { ...finalParams, ...ctx.parameters };
                    }
                });
            }

            const destination = finalParams.destination || 'your destination';
            const departure = finalParams.departure || 'your departure city';
            const passengers = finalParams.passengers || '1';
            
            fulfillmentText = `Great! I'll search for the best available flights from ${departure} to ${destination} for ${passengers} passenger(s) for you.`;
            console.log(`[Webhook] Final Fulfillment Text: ${fulfillmentText}`);
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
