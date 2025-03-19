# Tweed Rate Limiter

This web server implements a scalable rate limiter that uses Redis to manage request counts in a distributed environment.

## Prerequisites

- Node.js installed (version 16 or higher)
- Docker and Docker Compose installed

## Running the Tweed App

1. Clone the repository
2. Run the following command to start the web server:
    ```bash
    docker compose up --build
    ```
3. The web server will be available at `http://localhost:3000`.
4. To Stop the app run:
    ```bash
    docker compose down
    ```

## Running Tests

1. Run the following command to run the tests in the test evironment:
    ```bash
    docker compose -f docker-compose.test.yml run --build tweed-test npm run test
    ```
2. To stop the test app run:
    ```bash
    docker compose -f docker-compose.test.yml down
    ```

## Rate Limiting Logic

- High tier: 1000 requests per minute.
- Standard tier: 500 requests per minute.

- Test's High tier: 50 requests per 5 seconds.
- Test's Standard tier: 10 requests per 5 seconds.


**Example Usage:**

- Make a request
    ```
    curl -X POST http://localhost:3000/api/request \
        -H "Content-Type: application/json" \
        -d '{"userId": "user1", "userTier": "standard"}'
    ```
