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


    const timestamps: string[] = await redis.lrange(key, 0, -1);
    logger.debug(`Remaining Requests in ZSet: ${timestamps}`);

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





    // const pipeline = redis.pipeline();

    // const redisTime = await redis.time()
    // const redisNowInMs = redisTime[0] * 1000 + Math.floor(redisTime[1] / 1000);
    // console.log('qwe', redisNowInMs - rateLimitConfig.slidingWindowTimeInSec * 1000)

    // const results = await redis.multi()
    //     .zremrangebyscore(key, 0, redisNowInMs - rateLimitConfig.slidingWindowTimeInSec * 1000)
    //     .zcard(key)
    //     .zadd(key, redisNowInMs, `${redisNowInMs}`)
    //     // .expire(key, rateLimitConfig.slidingWindowTimeInSec)
    //     .exec()

    // // 1. Remove old timestamps
    // pipeline.zremrangebyscore(key, 0, redisNowInMs - rateLimitConfig.slidingWindowTimeInSec * 1000);

    // // 2. Get current count
    // pipeline.zcard(key);

    // // 3. Add current timestamp
    // pipeline.zadd(key, redisNowInMs, `${redisNowInMs}`);

    // // 4. Set expiration for the sorted set
    // pipeline.expire(key, rateLimitConfig.slidingWindowTimeInSec);

    // const results = await pipeline.exec();

    // if (results) {
    //     const requestCount = results[0][1] as number;
    //     console.log(requestCount)
    //     if (requestCount >= rateLimitConfig.maxRequests) {
    //         throw new TooManyRequestsError();
    //     }
    // }


    // const script = `
    // -- sliding_window.lua
    // local key = KEYS[1]
    // local currentTimestamp = tonumber(ARGV[1])
    // local windowSize = tonumber(ARGV[2])
    // local maxRequests = tonumber(ARGV[3])

    // -- Remove old entries
    // redis.call('ZREMRANGEBYSCORE', key, 0, currentTimestamp - windowSize)

    // -- Get current count
    // local count = redis.call('ZCARD', key)

    // if count >= maxRequests then
    // return count
    // end

    // -- Add current timestamp
    // redis.call('ZADD', key, currentTimestamp, tostring(currentTimestamp))

    // -- Set expiry
    // redis.call('EXPIRE', key, math.floor(windowSize / 1000))

    // return count + 1
    // `

    // const result = await redis.eval(
    //     script,
    //     1,
    //     key,
    //     now,
    //     rateLimitConfig.slidingWindowTimeInSec*1000,
    //     rateLimitConfig.maxRequests
    //   );

    //   const currentCount = result as number;
    //   console.log('qwe',currentCount)

    //   if (currentCount > rateLimitConfig.maxRequests) {
    //     throw new TooManyRequestsError();
    //   }


    
    // const redisTime = await redis.time()
    // const redisNowInMs = redisTime[0] * 1000 + Math.floor(redisTime[1] / 1000);
    // logger.debug(`redisNowInMs: ${redisNowInMs}`);
    // await redis.zremrangebyscore(key, 0, redisNowInMs - rateLimitConfig.slidingWindowTimeInSec * 1000);

    // // // Debug log to check what requests are left in the sorted set
    // // const remainingRequests = await redis.zrange(key, 0, -1); // Get all timestamps in the zset
    // // logger.debug(`Remaining Requests in ZSet: ${remainingRequests}`);

    // const requestCount = await redis.zcard(key);
    // logger.debug(`Request Count: ${requestCount}`);

    // if (requestCount >= rateLimitConfig.maxRequests) {
    //     throw new TooManyRequestsError();
    // }

    // await redis.zadd(key, redisNowInMs, `${redisNowInMs}`);
    // await redis.expire(key, rateLimitConfig.slidingWindowTimeInSec);

    next();
});
