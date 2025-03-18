module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/app.ts',
        '!src/**/*.d.ts',
    ],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        'src/config',
        'src/utils/Logger',
        'src/utils/httpError',
        // 'src/app'
    ],
    coverageThreshold: {
        "global": {
            "branches": 90, 
            "functions": 90,
            "lines": 90,
            "statements": 90 
        }
    }
};
