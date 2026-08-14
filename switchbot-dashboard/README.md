# Temp Master Dashboard

A fullstack web dashboard to monitor temperature readings from SwitchBot Meter devices.

Backend: FastAPI + SQLite. Frontend: React 18 + TypeScript + Vite + Tailwind CSS, with
Recharts for charts and TanStack Query for data fetching.

## Features

- Temperature charts for all SwitchBot Meter devices using Recharts
- Time scale switching (hour/day/week/month/year)
- Selectable themes (light / dark / instrument panel), persisted in `localStorage` and
  defaulting to the OS `prefers-color-scheme`
- Meters that have not reported for over 7 days are grouped into a separate section
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
   npm install
   ```

3. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   `VITE_API_URL` is the base URL of the backend API. Set it to e.g.
   `http://localhost:8000` when running the dev server against a local backend. If it is
   unset or empty, the frontend calls `/api/...` on its own origin, which is what the
   production container does (the backend serves the built SPA from `./static`).

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:5173 in your browser

6. Production build (outputs to `dist/`):
   ```bash
   npm run build
   ```

## API Endpoints

- `GET /api/meters` - Returns list of all meter devices with current temperature (from cache)
- `GET /api/meters/{device_id}/history` - Returns temperature history with time_scale parameter
- `POST /api/meters/refresh` - Triggers immediate data collection
- `GET /api/status` - Returns backend status and configuration
- `GET /api/backup` - Downloads the SQLite database file

## Notes

- Temperature history is stored in memory and resets on backend restart
- Backend data collection interval: 2 minutes minimum
- Frontend refresh interval: 30 seconds (TanStack Query `refetchInterval`)
- The Docker image builds the frontend in a `node` stage and copies `dist/` into the
  backend's `static/` directory, which the SPA catch-all route serves
- SwitchBot API has strict rate limits (~10000 requests/day)
