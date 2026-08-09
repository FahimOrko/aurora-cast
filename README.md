# Aurora Cast

Aurora Cast — TypeScript API for fetching aurora and weather forecasts and locating the closest city to given coordinates.

Badges
- Language: TypeScript
- Runtime: Node.js (ESM)

Table of contents
- [What it is](#what-it-is)
- [One-liner](#one-liner)
- [Tech stack](#tech-stack)
- [Requirements](#requirements)
- [Environment](#environment)
- [Install & run](#install--run)
- [Available scripts](#available-scripts)
- [API](#api)
  - [Health check](#health-check)
  - [GET /api/v1/aurora/forecast](#get-apiv1auroraforecast)
  - [POST /api/v1/cities/closest](#post-apiv1citiesclosest)
- [Project structure](#project-structure)
- [Configuration details](#configuration-details)
- [Notes & implementation details](#notes--implementation-details)
- [Testing](#testing)
- [License](#license)
- [Maintainer](#maintainer)

## What it is
A small Express-based TypeScript service that exposes endpoints to fetch aurora/weather forecast data (by proxying configured external APIs) and a utility to find the closest city to given coordinates.

## One-liner
Aurora Cast — TypeScript API for fetching aurora and weather forecasts and locating the closest city to given coordinates.

## Tech stack
- Language: TypeScript (ES Module)
- HTTP framework: express v5
- Validation: zod
- HTTP client: axios
- Logging: pino + pino-http
- Utilities: fuse.js (fuzzy search), node-cache
- Security middlewares: helmet, hpp, cors
- Migrations / DB tooling referenced: drizzle-kit
- Dev tools: nodemon, ts-node, typescript

## Requirements
- Node.js (>=16 recommended)
- npm / yarn / pnpm
- (Optional) Docker for containerized runs

## Environment
The app validates required environment variables at startup using zod. The following environment variables are expected:
- PORT (number, defaults to 8080)
- ENVIRONMENT (one of: dev, prod, test — defaults to dev)
- CORS_ORIGIN (comma-separated origins)
- WEATHER_API_BASE_URL (full URL to weather API)
- AURORA_API_BASE_URL (full URL to aurora API)

Example .env
```env
PORT=8080
ENVIRONMENT=dev
CORS_ORIGIN=http://localhost:3000
WEATHER_API_BASE_URL=https://api.weather.example
AURORA_API_BASE_URL=https://api.aurora.example
```

Important: if environment variables are missing or invalid, the app will log the zod error tree and exit.

## Install & run
Clone and install:
```bash
git clone https://github.com/FahimOrko/aurora-cast.git
cd aurora-cast
npm install
```

Development (watch + build + run via nodemon):
```bash
npm run dev
# nodemon watches src, runs "npm run build && npm start"
```

Build and start (production):
```bash
npm run build      # runs `npx tsc`
npm start          # runs `node dist/server.js`
```

Docker (example):
```bash
docker build -t aurora-cast:latest .
docker run -p 8080:8080 --env-file .env aurora-cast:latest
```

## Available scripts (package.json)
- build: `npx tsc` (compile TypeScript)
- start: `node dist/server.js`
- dev: `nodemon --watch src --ext ts --exec "npm run build && npm start"`
- generate: `drizzle-kit generate` (migration codegen)
- migrate: `drizzle-kit migrate`
- geocode: `tsx scripts/geocode-cities.ts`

## API

### Health check
GET /
- 200 — JSON success wrapper with a small health object.

Example:
```bash
curl http://localhost:8080/
```

### GET /api/v1/aurora/forecast
- Query parameters (validated with zod):
  - date (string)
  - latitude (number)
  - longitude (number)
- Description: Returns forecast data assembled by the forecast service which queries the configured external weather and aurora APIs.

Example:
```bash
curl "http://localhost:8080/api/v1/aurora/forecast?date=2026-01-01&latitude=60.17&longitude=24.94"
```

Successful response: 200 with standardized success wrapper (see utils/responseFormatter.ts).

### POST /api/v1/cities/closest
- Body (validated with zod):
  - latitude (number)
  - longitude (number)
  - limit? (optional number)
- Description: Finds the closest city to the provided coordinates. The implementation uses a city dataset and utilities (fuse.js, node-cache) for matching & caching.

Example:
```bash
curl -X POST http://localhost:8080/api/v1/cities/closest \
  -H "Content-Type: application/json" \
  -d '{"latitude":60.17,"longitude":24.94}'
```

## Project structure (relevant files)
```
src/
  server.ts                 # HTTP server bootstrap (creates http.Server from app)
  app.ts                    # express app: middleware, routes, health check
  config/index.ts           # zod-based env parsing and config export
  routes/
    api.routes.ts           # mounts /aurora and /cities
    forecast.route.ts       # GET /forecast
    city.route.ts           # POST /closest
  controllers/
    forecast.controller.ts  # request handling and use of forecastService
    city.controller.ts      # handles closest-city requests
  services/
    forecast.service.ts     # orchestrates external API calls and business logic
  middleware/
    validate.middleware.ts  # zod-based request validation
    errorHandler.middleware.ts
    logger.middleware.ts
  utils/
    responseFormatter.ts    # formatResponseSuccess / formatResponseError
    logger.ts               # pino logger instance
scripts/
  geocode-cities.ts         # helper to geocode / prepare city dataset
package.json
tsconfig.json
```

## Configuration details
- CORS_ORIGIN in env is split on commas and used for CORS configuration.
- The app uses pino for structured logging and pino-http for request logging.
- All route handlers use a consistent response shape via formatResponseSuccess/formatResponseError.

## Notes & implementation details
- The app uses zod to validate both environment variables and incoming requests; invalid inputs are thrown and handled by the error middleware.
- Security middleware enabled: helmet, hpp, cors.
- No test runner is defined in package.json — add Jest or Vitest and CI test steps for production readiness.
- The presence of drizzle-kit scripts suggests a DB/migration workflow; set DATABASE_URL and migrate when you add DB-backed features.

## Testing
There are no test scripts configured in package.json. Recommended next steps:
- Add unit tests (Jest or Vitest)
- Add integration tests for the forecast and city endpoints
- Add a test script and CI step to run tests on push/PR

## License
This project uses the license declared in package.json: ISC. Add a LICENSE file if one is not present.

## Maintainer
FahimOrko

---

If you want, I can now:
- Commit this README.md update to the repository (I will replace the current README with the content above), or
- Make additional changes (shorten, add examples, or adjust wording).
