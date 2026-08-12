# Aurora Cast

Aurora Cast - TypeScript API for fetching aurora and weather forecasts and locating the closest city to a given city name.

Badges

- Language: TypeScript
- Runtime: Node.js (ESM)

Table of contents

- [What it is](#what-it-is)
- [How it's used](#how-its-used)
- [Tech stack](#tech-stack)
- [Requirements](#requirements)
- [Environment](#environment)
- [Install & run](#install--run)
- [Available scripts](#available-scripts)
- [API](#api)
  - [Health check](#health-check)
  - [POST /api/v1/aurora/forecast](#post-apiv1auroraforecast)
  - [POST /api/v1/cities/closest](#post-apiv1citiesclosest)
- [Project structure](#project-structure)
- [Configuration details](#configuration-details)

## What it is

A small Express-based TypeScript service that exposes endpoints to fetch aurora/weather forecast data (by proxying and combining configured external APIs) and a utility to resolve a spoken or typed city name to its closest known match, along with coordinates.

The service produces a single combined score per hour - factoring geomagnetic activity (kp index, adjusted for the requested location's latitude) and cloud cover - instead of exposing raw kp and weather values separately, so any consumer (voice agent, app, dashboard) can give a straightforward "chance of seeing the aurora" answer without doing that math itself.

This backend is the data layer behind **Aurora Cast**, a voice AI agent you can call on the phone: tell it a city and a day, and it tells you your chances of seeing the northern lights there, in plain language, and can book a reminder on Google Calendar if you want one.

## How it's used

This API is consumed by a **Vapi AI voice agent** as its backend. The voice agent handles the full phone-call flow - greeting the caller, collecting a spoken location and date, confirming both, delivering the forecast, and optionally booking a calendar reminder - calling out to this API and to Google Calendar through a set of tools:

- `find_closest_city_api` → `POST /api/v1/cities/closest` - resolves whatever place name the caller says into a known city name and coordinates.
- `get_aurora_forecast` → `POST /api/v1/aurora/forecast` - once a location and date are confirmed, retrieves the forecast; the agent translates the result (best viewing window and plain-language conditions) into natural spoken language, without ever reading raw scores or JSON to the caller.
- `check_google_calendar_availability` / `create_google_calendar_event` - native Vapi Google Calendar tools. If the caller wants a reminder, the agent checks the connected calendar for a conflict at the forecasted viewing window and, if free, books an event with a short summary of the forecast attached.

This means the API's job is strictly data and scoring - all conversational logic, prompting, date validation, and the calendar booking flow live in the Vapi assistant configuration, not in this codebase.

_(Demo video link: TBD)_

## Tech stack

- Language: TypeScript (ES Module)
- HTTP framework: express v5
- Validation: zod
- HTTP client: axios
- Logging: pino + pino-http
- Utilities: fuse.js (fuzzy search), node-cache
- Security middlewares: helmet, hpp, cors
- Dev tools: nodemon, ts-node, typescript

## Requirements

- Node.js (>=16 recommended)
- npm / yarn / pnpm

## Environment

The app validates required environment variables at startup using zod. The following environment variables are expected:

- PORT (number, defaults to 8080)
- ENVIRONMENT (one of: dev, prod, test - defaults to dev)
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

## Available scripts (package.json)

- build: `npx tsc` (compile TypeScript)
- start: `node dist/server.js`
- dev: `nodemon --watch src --ext ts --exec "npm run build && npm start"`
- generate: `drizzle-kit generate` (migration codegen) (not used)
- migrate: `drizzle-kit migrate`
- geocode: `tsx scripts/geocode-cities.ts`

## API

### Health check

GET /

- 200 - JSON success wrapper with a small health object.

Example:

```bash
curl http://localhost:8080/
```

### POST /api/v1/aurora/forecast

- Body (validated with zod):
  - date (string, `YYYY-MM-DD`)
  - latitude (number)
  - longitude (number)
- Description: Combines the aurora forecast (up to 3 days ahead) and night-only weather for the requested date, returning an hourly breakdown scored for aurora visibility plus the single best viewing window for that night.

Example request:

```bash
curl -X POST http://localhost:8080/api/v1/aurora/forecast \
  -H "Content-Type: application/json" \
  -d '{"date":"2026-08-11","latitude":65.0117914,"longitude":25.4701973}'
```

Example success response (`200`):

```json
{
  "success": true,
  "code": 200,
  "message": "Forecast retrieved successfully",
  "data": {
    "date": "2026-08-11",
    "latitude": 65.0117914,
    "longitude": 25.4701973,
    "predictable": true,
    "bestViewingWindow": {
      "time": "2026-08-11T22:00",
      "cloudCover": 64,
      "kp": 3.67,
      "score": 36,
      "conditions": "Possible"
    },
    "hourly": [
      {
        "time": "2026-08-11T00:00",
        "cloudCover": 94,
        "kp": 3.67,
        "score": 6,
        "conditions": "Poor"
      },
      {
        "time": "2026-08-11T22:00",
        "cloudCover": 64,
        "kp": 3.67,
        "score": 36,
        "conditions": "Possible"
      }
    ]
  }
}
```

Example error response - requested date beyond the ~3-day aurora forecast window (`400`):

```json
{
  "success": false,
  "code": 400,
  "errorMessage": "Aurora activity can't be predicted that far ahead. Forecasts are only available up to 2026-08-11."
}
```

### POST /api/v1/cities/closest

- Body (validated with zod):
  - city (string)
- Description: Fuzzy-matches a free-text city or place name (e.g. spoken input from a voice caller) against a known city dataset and returns the closest match's name and coordinates.

Example request:

```bash
curl -X POST http://localhost:8080/api/v1/cities/closest \
  -H "Content-Type: application/json" \
  -d '{"city":"Oulu"}'
```

Example success response (`200`):

```json
{
  "success": true,
  "code": 200,
  "message": "City found successfully",
  "data": {
    "name": "Oulu",
    "latitude": 65.0117914,
    "longitude": 25.4701973
  }
}
```

## Project structure (relevant files)

```
src/
  server.ts                 # HTTP server bootstrap (creates http.Server from app)
  app.ts                    # express app: middleware, routes, health check
  config/index.ts           # zod-based env parsing and config export
  routes/
    api.routes.ts           # mounts /aurora and /cities
    forecast.route.ts       # POST /forecast
    city.route.ts           # POST /closest
  controllers/
    forecast.controller.ts  # request handling and use of forecastService
    city.controller.ts      # handles closest-city requests
  services/
    forecast.service.ts     # orchestrates aurora + weather calls, scoring
    weather.service.ts      # night-hours-only weather extraction
    aurora.service.ts       # aurora forecast parsing and date range
  clients/
    weather.client.ts       # external weather API client (cached)
    aurora.client.ts        # external aurora API client (cached)
    http.client.ts          # shared axios instance
  cache/
    memoryCache.ts          # node-cache wrapper (swappable for Redis)
  middleware/
    validate.middleware.ts  # zod-based request validation
    errorHandler.middleware.ts
    logger.middleware.ts
  utils/
    responseFormatter.ts    # formatResponseSuccess / formatResponseError
    AppError.ts             # typed operational error class
    logger.ts               # pino logger instance
  schemas/
    forecast.schema.ts      # request validation schema
    weather.schema.ts       # external weather API response schema
    aurora.schema.ts        # external aurora API response schema
scripts/
  geocode-cities.ts         # helper to geocode / prepare city dataset
package.json
tsconfig.json
```

## Configuration details

- CORS_ORIGIN in env is split on commas and used for CORS configuration.
- The app uses pino for structured logging and pino-http for request logging.
- All route handlers use a consistent response shape via formatResponseSuccess/formatResponseError.
- Aurora and weather API responses are cached (node-cache) to reduce upstream calls - swappable for Redis in production without changing calling code.
