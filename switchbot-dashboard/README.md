# Temp Master Dashboard

A fullstack web dashboard to monitor temperature readings from SwitchBot Meter devices.

## Features

- Frontend: Vite + React + TypeScript (`switchbot-frontend/`), temperature charts via Chart.js v4 + react-chartjs-2
- Time scale switching (hour/day/week/month/year)
- Meters not updated for 7+ days are grouped into a separate "未更新のメーター" section
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

2. Install dependencies (Node.js 20+):
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and set the backend URL:
   ```bash
   cp .env.example .env
   ```

   `VITE_API_URL` is the base URL of the FastAPI backend (e.g. `http://localhost:8000`
   or `https://snakeroom.fly.dev`). Leave it empty to call the same origin that serves
   the frontend. It is read at build time, so rebuild after changing it.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:5173 in your browser

Other scripts: `npm run lint`, `npm run typecheck`, `npm test` (Vitest), `npm run build` (outputs `dist/`).

### Serving the built frontend from FastAPI

The backend serves any files under `switchbot-backend/static/` at `/` (SPA fallback to
`index.html`). Put the Vite build output there:

```bash
cd switchbot-frontend
VITE_API_URL= npm run build          # empty = same origin as the backend
ln -sfn "$(pwd)/dist" ../switchbot-backend/static
```

Restart the backend after creating the link (the `static/` check runs at import time).

### Docker / Fly.io

`Dockerfile` is multi-stage: a `node:22-slim` stage runs `npm ci && npm run build`, and
the resulting `dist/` is copied to `/app/static` in the Python image. The API base URL is
a build arg (default `https://snakeroom.fly.dev`, matching the previous hard-coded value):

```bash
docker build -t temp-master .                              # uses snakeroom.fly.dev
docker build --build-arg VITE_API_URL= -t temp-master .    # same-origin API
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
- Frontend refresh interval: 30 seconds
- SwitchBot API has strict rate limits (~10000 requests/day)
