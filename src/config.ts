import { AppConfig } from "./utils/interfaces";

const standardTierRateLimit = parseInt(process.env.STANDARD_TIER_RATE_LIMIT || "500");
const highTierRateLimit = parseInt(process.env.HIGH_TIER_RATE_LIMIT || "1000");
const slidingWindowTimeInSec = parseInt(process.env.SLIDING_WINDOW_TIME_IN_SEC || "60");

const config: AppConfig = {
    server: {
        port: process.env.PORT || 3000
    },
    redis: {
        host: process.env.REDIS_HOST || 'redis',
        port: process.env.REDIS_PORT || 6379
    },
    logLevel: 'debug',
    rateLimit: {
        high: { maxRequests: highTierRateLimit, slidingWindowTimeInSec: slidingWindowTimeInSec },
        standard: { maxRequests: standardTierRateLimit, slidingWindowTimeInSec: slidingWindowTimeInSec }
    }
};

export default config;