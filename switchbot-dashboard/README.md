# Temp Master Dashboard

A fullstack web dashboard to monitor temperature readings from SwitchBot Meter devices.

## Features

- Temperature / humidity charts for all SwitchBot Meter devices (React 18 + Vite + TypeScript, Chart.js 4 via react-chartjs-2)
- Light / Dark / High-contrast themes (persisted in localStorage, defaults to `prefers-color-scheme`)
- Time scale switching (hour/day/week/month/year)
- Auto-refresh every 30 seconds (frontend) with background data collection every 2 minutes (backend)
- Rate limiting protection with exponential backoff
- All API calls are cached - GET endpoints never call SwitchBot API directly

## Setup

### Backend

1. Navigate to the backend directory:
   ```bash
   cd switchbot-backend
   ```

2. Install dependencies:
   ```bash
   poetry install
   ```

3. Copy `.env.example` to `.env` and add your SwitchBot credentials:
   ```bash
   cp .env.example .env
   ```
   
   Get your credentials from the SwitchBot app:
   - Go to Profile > Preferences > About
   - Tap App Version 10 times to enable Developer Options
   - Go to Developer Options > Get Token

4. Start the development server:
   ```bash
   poetry run fastapi dev app/main.py
   ```

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd switchbot-frontend
   ```

2. Install dependencies:
   ```bash
   npm ci
   ```

3. (Optional) Copy `.env.example` to `.env` and adjust:
   - `VITE_API_URL`: backend base URL. Empty (default) = same origin; the dev server proxies `/api` to `VITE_DEV_PROXY_TARGET` (default `http://localhost:8000`).
   - `VITE_DISPLAY_NAMES`: JSON object merged over the default device display names (`src/config/displayNames.ts`).
   - `VITE_DISPLAY_NAMES_URL`: JSON file (same shape) loaded at runtime and merged on top.

4. Start the development server:
   ```bash
   npm run dev
   # or against the public backend:
   VITE_API_URL=https://snakeroom.fly.dev npm run dev
   ```

5. Open http://localhost:5173 in your browser

Other scripts: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` (outputs `dist/`).

The FastAPI backend serves the built `dist/` at `/` (lookup: `$STATIC_DIR`, `switchbot-backend/static/`, then `switchbot-frontend/dist/`). The Docker image builds the frontend in a `node:20-alpine` stage; set the API origin with the `VITE_API_URL` build arg (see `fly.toml`).

The previous jQuery/Bootstrap 3 implementation is kept for reference in `switchbot-frontend/legacy/index.html`.

## API Endpoints

- `GET /api/meters` - Returns list of all meter devices with current temperature (from cache)
- `GET /api/meters/{device_id}/history` - Returns temperature history with time_scale parameter
- `POST /api/meters/refresh` - Triggers immediate data collection
- `GET /api/status` - Returns backend status and configuration
- `GET /api/backup` - Downloads the SQLite database

## Notes

- Temperature history is stored in memory and resets on backend restart
- Backend data collection interval: 2 minutes minimum
- Frontend refresh interval: 30 seconds
- SwitchBot API has strict rate limits (~10000 requests/day)
