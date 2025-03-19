# Tweed Rate Limiter

This web server implements a scalable rate limiter that uses Redis to manage request counts in a distributed environment.

## Prerequisites

- Node.js installed (version 16 or higher)
- Docker and Docker Compose installed

## Running the Tweed App

1. Clone the repository
2. Build and start the services using Docker Compose::
    ```bash
    docker compose up --build
    ```
3. The first web server will be available at `http://localhost:3000`.
4. The second web server will be available at `http://localhost:3001`.
5. To Stop the services run:
    ```bash
    docker compose down
    ```

**Scaling the Service:**
To scale the number of tweed instances, simply modify the docker-compose.yml file to add more instances. For example:

```yaml
  tweed-3:
    build: .
    container_name: tweed-app-instance-3
    environment:
      - NODE_ENV=production
      - PORT=3002
      - REDIS_PORT=6379
      - REDIS_HOST=redis
      - STANDARD_TIER_RATE_LIMIT=500
      - HIGH_TIER_RATE_LIMIT=1000
      - SLIDING_WINDOW_TIME_IN_SEC=60
    ports:
      - "3002:3002"
    depends_on:
      - redis
```

**Rate Limiting Logic:**

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


## Running Tests

1. Run the following command to run the tests in the test evironment:
    ```bash
    docker compose -f docker-compose.test.yml run --build tweed-test npm run test
    ```
2. To stop the test app run:
    ```bash
    docker compose -f docker-compose.test.yml down
    ```