type RateLimitStore = Map<string, { count: number; lastReset: number }>;

const globalStore: RateLimitStore = new Map();

export const rateLimit = (limit: number, windowMs: number) => {
    return {
        check: (identifier: string): boolean => {
            const now = Date.now();
            const record = globalStore.get(identifier);

            if (!record) {
                globalStore.set(identifier, { count: 1, lastReset: now });
                return true;
            }

            // Reset if window passed
            if (now - record.lastReset > windowMs) {
                record.count = 1;
                record.lastReset = now;
                return true;
            }

            // Check limit
            if (record.count >= limit) {
                return false;
            }

            record.count += 1;
            return true;
        }
    };
};
