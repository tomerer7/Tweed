# Tweed Rate Limiter

This service implements a scalable rate limiter that uses Redis to manage request counts in a distributed environment.

## Prerequisites

- Node.js installed (version 16 or higher)
- Docker and Docker Compose installed

## Running the Service

1. Clone the repository
2. Run `docker-compose up --build` to start the Redis container and rate limiter service.
3. The service will be available at `http://localhost:3000`.
4. To Stop the services run `docker-compose down`

## Running Tests

1. Run `docker-compose -f docker-compose.test.yml up --build` to start the test Redis container and rate limiter service and execute the tests.
2. To Stop the services run `docker-compose -f docker-compose.test.yml down`

## Rate Limiting Logic

- High tier: 1000 requests per minute. (30 for tests)
- Standard tier: 500 requests per minute. (5 for tests)


**Example Usage:**

- Make a request
    ```
    curl -X POST http://localhost:3000/api/request \
        -H "Content-Type: application/json" \
        -d '{"userId": "user1", "userTier": "standard"}'
    ```
