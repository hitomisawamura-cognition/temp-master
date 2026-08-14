# Temp Master Dashboard

A fullstack web dashboard to monitor temperature readings from SwitchBot Meter devices.

## Features

- Temperature charts for all SwitchBot Meter devices using Chart.js (react-chartjs-2)
- Dark / light theme toggle, persisted in `localStorage`
- Time scale switching (hour/day/week/month/year)
- Stale meters (no data for 7+ days) listed in a separate section without charts
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

Vite + React 18 + TypeScript. Node 20+ required.

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

   Set `VITE_API_URL` to the backend origin (e.g. `http://localhost:8000`) for local
   development. Leave it empty in production, where the backend serves the built
   frontend from the same origin and relative `/api/...` paths are used.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:5173 in your browser

## API Endpoints

- `GET /api/meters` - Returns list of all meter devices with current temperature (from cache)
- `GET /api/meters/{device_id}/history` - Returns temperature history with time_scale parameter
- `POST /api/meters/refresh` - Triggers immediate data collection
- `GET /api/status` - Returns backend status and configuration

## Build

```bash
cd switchbot-frontend
npm run build   # type-checks with tsc and emits dist/
```

The Docker image builds the frontend in a Node stage and copies `dist/` into the
backend's `static/` directory, which is served with SPA fallback.

## Notes

- Temperature history is stored in memory and resets on backend restart
- Backend data collection interval: 2 minutes minimum
- Frontend refresh interval: 30 seconds
- SwitchBot API has strict rate limits (~10000 requests/day)
