export interface AppConfig {
    server: {
        port: any;
    };
    redis: {
        host: string;
        port: any;
    }
    logLevel: string;
    rateLimit: Record<UserTier, RateLimitConfig>;
}

export type UserTier = 'high' | 'standard';

export interface RateLimitConfig {
    maxRequests: number;
    slidingWindowTimeInSec: number;
}