import { AppConfig } from "./utils/interfaces";

const config: AppConfig = {
    server: {
        port: 3000
    },
    logLevel: 'debug',
    rateLimit: {
        high: { maxRequests: 1000, windowSizeInSec: 60 },
        standard: { maxRequests: 500, windowSizeInSec: 60 }
    }
};

export default config;