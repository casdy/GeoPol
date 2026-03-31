import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

export async function getRedisClient() {
    if (!redisClient) {
        redisClient = createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });
        
        redisClient.on('error', (err) => console.error('[Redis Client] Error:', err));
        
        await redisClient.connect();
        console.log('[Redis Client] Connected.');
    }
    return redisClient;
}
