# Temp Master Dashboard

A fullstack web dashboard to monitor temperature readings from SwitchBot Meter devices.

## Features

- Temperature charts for all SwitchBot Meter devices using Recharts
- Time scale switching (hour/day/week/month/year)
- Auto-refresh every 30 seconds (frontend, via TanStack Query) with background data collection every 2 minutes (backend)
- Rate limiting protection with exponential backoff, surfaced as a warning banner in the UI
- Japanese facility display names for devices, and meters not reporting for over 7 days are moved to a separate "未更新のメーター" section
- Multiple themes (Light / Dark / Industrial) with `prefers-color-scheme` detection and `localStorage` persistence
- Database backup download from the UI
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

Vite + React + TypeScript, with Tailwind CSS for styling, Recharts for charts and
TanStack Query for data fetching. Node.js 22.13+ (or 24+) is required.

1. Navigate to the frontend directory:
   ```bash
   cd switchbot-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and point `VITE_API_URL` at the backend you want
   to use (defaults to `https://snakeroom.fly.dev`; use `http://localhost:8000`
   for a local backend):
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:5173 in your browser

In development the dev server proxies `/api` to `VITE_API_URL`, so requests stay
same-origin. In a production build an empty `VITE_API_URL` means "same origin",
which is how FastAPI serves the bundle.

Other scripts:

```bash
npm run build        # type-check and build into dist/
npm run lint         # ESLint
npm run format       # Prettier
```

#### Themes

The navbar has a theme selector with three themes: **Light** (the look of the
previous dashboard), **Dark** and **Industrial** (high-contrast control-room
palette). Palettes live in `src/theme/themes.ts` and are applied as CSS variables
on `<html>`; Tailwind utilities and the Recharts line colours both read from
them, so switching restyles the whole dashboard. The choice is persisted in
`localStorage`, and the first visit follows `prefers-color-scheme`.

## API Endpoints

- `GET /api/meters` - Returns list of all meter devices with current temperature (from cache)
- `GET /api/meters/{device_id}/history` - Returns temperature history with time_scale parameter
- `POST /api/meters/refresh` - Triggers immediate data collection
- `GET /api/status` - Returns backend status and configuration
- `GET /api/backup` - Downloads the SQLite database file

## Deployment

`Dockerfile` is a multi-stage build: a Node stage runs `npm ci && npm run build`
for `switchbot-frontend`, and the resulting `dist/` is copied into the backend
image as `./static/`, which FastAPI serves at `/` (with an `index.html` fallback
for unknown paths).

## Notes

- Temperature history is stored in memory and resets on backend restart
- Backend data collection interval: 2 minutes minimum
- Frontend refresh interval: 30 seconds
- SwitchBot API has strict rate limits (~10000 requests/day)
