import config from '../config';
import { UserTier } from '../utils/interfaces';
import { BadRequestError, TooManyRequestsError } from '../utils/httpError';
import { asyncHandler } from '../utils/asyncHandler';
import redis from '../redisClient';
import logger from '../utils/Logger';

export const rateLimiter = asyncHandler(async (req: any, res: any, next: any) => {
    const userId = req.body.userId;
    const userTier: UserTier = req.body.userTier;

    if (!userId || !userTier) {
        logger.error("Missing userId or userTier");
        throw new BadRequestError("Missing userId or userTier");
    }

    const rateLimitConfig = config.rateLimit[userTier];
    const key = `rate_limit:${userTier}:${userId}`;
    const now = Date.now();


    // decided to use sliding window algorithm as it more fair and accurate and more important it prevents burst requests at window edges
    const timestamps: string[] = await redis.lrange(key, 0, -1);

    const validTimestamps = timestamps.filter((timestamp) => {
        return now - parseInt(timestamp) <= rateLimitConfig.slidingWindowTimeInSec * 1000;
    });

    if (validTimestamps.length >= rateLimitConfig.maxRequests) {
        logger.error("Rate limit exceeded");
        throw new TooManyRequestsError();
    }

    await redis.lpush(key, now.toString());

    await redis.ltrim(key, 0, rateLimitConfig.maxRequests - 1);

    await redis.expire(key, Math.ceil(rateLimitConfig.slidingWindowTimeInSec * 1000));

    next();
});
