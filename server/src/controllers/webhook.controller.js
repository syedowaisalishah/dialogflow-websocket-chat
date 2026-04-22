class WebhookController {
    async handleFulfillment(req, res) {
        const { queryResult } = req.body;
        const rawIntentName = queryResult.intent.displayName;
        const intentName = rawIntentName.toLowerCase().trim();
        const parameters = queryResult.parameters;

        console.log(`[Webhook] RECEIVED: intent="${rawIntentName}"`);
        
        // Merge parameters from all output contexts
        let ctx = { ...parameters };
        if (queryResult.outputContexts) {
            queryResult.outputContexts.forEach(context => {
                if (context.parameters) {
                    ctx = { ...ctx, ...context.parameters };
                }
            });
        }

        let fulfillmentText = queryResult.fulfillmentText || '';

        // ── MATCHING LOGIC ──────────────────────────────────────────────────
        
        // 1. Route Intent (Where from/to)
        if (intentName.includes('route')) {
            fulfillmentText = 'How many passengers are traveling, and in which class would you prefer: economy, business, or first class?';
        }

        // 2. Passengers Intent (Count and Class)
        else if (intentName.includes('passengers')) {
            const departure  = ctx['geo-city']   || ctx['from']       || ctx['departure'] || 'your departure city';
            const destination= ctx['geo-city1']  || ctx['to']         || ctx['destination'] || 'your destination';
            const passengers = ctx['number']     || ctx['passengers'] || 1;
            const seatClass  = ctx['seat-class'] || ctx['class']      || 'economy';

            fulfillmentText = `Let me confirm: A flight from ${departure} to ${destination}, for ${passengers} passenger in ${seatClass} class. Is that correct?`;
        }

        // 3. Yes/Confirmation Intent
        else if (intentName.includes('yes') || intentName.includes('confirm')) {
            fulfillmentText = "Great! I'll search for the best available flights for you.";
        }
        
        // 4. Default / Fallback
        else {
            console.log(`[Webhook] No specialized logic for: "${rawIntentName}". Using default text: "${fulfillmentText}"`);
        }

        console.log(`[Webhook] RESPONSE: text="${fulfillmentText}"`);

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
