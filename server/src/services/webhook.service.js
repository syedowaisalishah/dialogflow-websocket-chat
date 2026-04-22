class WebhookService {
    handleFulfillment(queryResult) {
        const rawIntentName = queryResult.intent.displayName;
        const intentName = rawIntentName.toLowerCase().trim();
        const parameters = queryResult.parameters;

        console.log(`[WebhookService] Processing intent: "${rawIntentName}"`);

        // Helper to extract parameters from direct params or contexts
        const getParam = (name, aliases = []) => {
            const keys = [name, ...aliases];
            // 1. Try direct parameters
            for (const key of keys) {
                const val = parameters[key];
                if (val && typeof val === 'string' && val.toLowerCase() !== 'yes' && val.toLowerCase() !== 'no') return val;
                if (val && typeof val === 'number') return val;
            }
            // 2. Try output contexts
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

        // ── INTENT MATCHING LOGIC ───────────────────────────────────────────
        
        if (intentName.includes('route')) {
            fulfillmentText = 'How many *passengers* are traveling, and in which *class* would you prefer: *economy*, *business*, or *first class*?';
        }
        else if (intentName.includes('passengers')) {
            fulfillmentText = `Let me confirm: A flight from *${departure}* to *${destination}*, for *${passengers} passenger* in *${seatClass} class*. Is that correct?`;
        }
        else if (intentName.includes('yes') || intentName.includes('confirm')) {
            fulfillmentText = "Great! I'll search for the *best available flights* for you.";
        }
        else {
            console.log(`[WebhookService] No specialized logic for: "${rawIntentName}"`);
        }

        return {
            fulfillmentText,
            fulfillmentMessages: [
                {
                    text: {
                        text: [fulfillmentText]
                    }
                }
            ]
        };
    }
}

module.exports = new WebhookService();
