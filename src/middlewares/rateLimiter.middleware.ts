import { v4 as uuidv4 } from 'uuid';
import config from '../config';
import redis from '../redisClient';
import logger from '../utils/Logger';
import { UserTier } from '../utils/interfaces';
import { BadRequestError, TooManyRequestsError } from '../utils/httpError';
import { asyncHandler } from '../utils/asyncHandler';

export const rateLimiter = asyncHandler(async (req: any, res: any, next: any) => {
    const userId = req.body.userId;
    const userTier: UserTier = req.body.userTier;

    if (!userId || !userTier) {
        logger.error("Missing userId or userTier");
        throw new BadRequestError("Missing userId or userTier");
    }

    const rateLimitConfig = config.rateLimit[userTier];
    if (!rateLimitConfig) {
        logger.error(`Invalid user tier ${JSON.stringify({ userId, userTier })}`);
        throw new BadRequestError("Invalid user tier");
    }
    
    // decided to use sliding window algorithm as it more fair and accurate and more important, it prevents burst requests at window edges
    // using zset is better in terms of performance but has higher memory usage than list
    const key = `rate_limit:${userTier}:${userId}`;
    const now = Date.now();
    const uniqueMemberId = `${now}-${uuidv4()}`;

    // using redis transaction to ensure multiple command executed in atomic way
    const results = await redis.multi()
        // remove older timestamps outside the window
        .zremrangebyscore(key, 0, now - rateLimitConfig.slidingWindowTimeInSec * 1000)
        // count number of members after removal(number of requests in the last window)
        .zcard(key)
        // add timestamp to the sorted set. members are uniques so it must have a uniqueId(using just timestamp is not enough as multiple requests can arrive at the same time)
        .zadd(key, now, `${uniqueMemberId}`)
        // add TTL(to clean the cache when user doesn't make any request for a while)
        .expire(key, rateLimitConfig.slidingWindowTimeInSec)
        .exec()

    if (results) {
        const requestCount = results[1][1] as number;
        if (requestCount >= rateLimitConfig.maxRequests) {
            logger.error(`Rate limit exceeded ${JSON.stringify({ userId, userTier })}`);
            throw new TooManyRequestsError();
        }
    }

    next();
});
