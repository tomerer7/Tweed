export interface AppConfig {
    server: {
        port: any;
    };
    logLevel: string;
    rateLimit: Record<UserTier, RateLimitConfig>;
}

export type UserTier = 'high' | 'standard';

export interface RateLimitConfig {
    maxRequests: number;
    windowSizeInSec: number;
}