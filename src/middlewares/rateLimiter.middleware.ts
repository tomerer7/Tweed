import Redis from 'ioredis';
import config from '../config';
import { UserTier } from '../utils/interfaces';
import { BadRequestError, TooManyRequestsError } from '../utils/httpError';
import { asyncHandler } from '../utils/asyncHandler';

const redis = new Redis({ host: 'redis', port: 6379 });

export const rateLimiter = asyncHandler(async (req: any, res: any, next: any) => {
    const userId = req.body.userId;
    const userTier: UserTier = req.body.userTier;

    if (!userId || !userTier) {
        throw new BadRequestError("Missing userId or userTier");
    }

    const rateLimitConfig = config.rateLimit[userTier];
    const key = `rate_limit:${userTier}:${userId}`;
    const now = Date.now();

    await redis.zremrangebyscore(key, 0, now - rateLimitConfig.windowSizeInSec * 1000);
    const requestCount = await redis.zcard(key);

    if (requestCount >= rateLimitConfig.maxRequests) {
        throw new TooManyRequestsError();
    }

    await redis.zadd(key, now, `${now}`);
    await redis.expire(key, rateLimitConfig.windowSizeInSec);

    next();
});
