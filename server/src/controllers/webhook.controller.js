class WebhookController {
    async handleFulfillment(req, res) {
        const { queryResult } = req.body;
        const rawIntentName = queryResult.intent.displayName;
        const intentName = rawIntentName.toLowerCase().trim();
        const parameters = queryResult.parameters;

        console.log(`[Webhook] RECEIVED: intent="${rawIntentName}"`);
        
        // Extract parameters with priority: 
        // 1. Direct parameters from queryResult
        // 2. Fallback to outputContexts if direct params are missing or look like confirmation junk
        
        const getParam = (name, aliases = []) => {
            const keys = [name, ...aliases];
            // Try direct parameters first
            for (const key of keys) {
                const val = parameters[key];
                if (val && typeof val === 'string' && val.toLowerCase() !== 'yes' && val.toLowerCase() !== 'no') return val;
                if (val && typeof val === 'number') return val;
            }
            // Fallback to contexts
            if (queryResult.outputContexts) {
                for (const ctx of queryResult.outputContexts) {
                    if (ctx.parameters) {
                        for (const key of keys) {
                            const val = ctx.parameters[key];
                            if (val && typeof val === 'string' && val.toLowerCase() !== 'yes' && val.toLowerCase() !== 'no') return val;
                            if (val && typeof val === 'number') return val;
                        }
                    }
                }
            }
            return null;
        };

        const departure   = getParam('geo-city', ['from', 'departure']) || 'your departure city';
        const destination = getParam('geo-city1', ['to', 'destination']) || 'your destination';
        const passengers  = getParam('number', ['passengers']) || 1;
        const seatClass   = getParam('seat-class', ['class']) || 'economy';

        let fulfillmentText = queryResult.fulfillmentText || '';

        // ── MATCHING LOGIC ──────────────────────────────────────────────────
        
        // 1. Route Intent (Where from/to)
        if (intentName.includes('route')) {
            fulfillmentText = 'How many *passengers* are traveling, and in which *class* would you prefer: *economy*, *business*, or *first class*?';
        }

        // 2. Passengers Intent (Count and Class)
        else if (intentName.includes('passengers')) {
            fulfillmentText = `Let me confirm: A flight from *${departure}* to *${destination}*, for *${passengers} passenger* in *${seatClass} class*. Is that correct?`;
        }

        // 3. Yes/Confirmation Intent
        else if (intentName.includes('yes') || intentName.includes('confirm')) {
            fulfillmentText = "Great! I'll search for the *best available flights* for you.";
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
