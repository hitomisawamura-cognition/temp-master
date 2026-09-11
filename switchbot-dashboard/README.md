# Temp Master Dashboard

A fullstack web dashboard to monitor temperature readings from SwitchBot Meter devices.

## Features

- Temperature charts for all SwitchBot Meter devices using Recharts
- Time scale switching (hour/day/week/month/year)
- Multiple UI themes (Light / Dark / Ocean / Solarized) with `prefers-color-scheme` detection and `localStorage` persistence
- Stale meters (no update for 7+ days) are grouped in a separate section
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

3. Copy `.env.example` to `.env` and adjust `VITE_API_URL` if needed:
   ```bash
   cp .env.example .env
   ```

   | Variable       | Default                      | Description                                           |
   | -------------- | ---------------------------- | ----------------------------------------------------- |
   | `VITE_API_URL` | `https://snakeroom.fly.dev`  | Base URL of the backend API. Use `http://localhost:8000` for a local backend, or leave empty for same-origin. |

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:5173 in your browser

Other scripts:

```bash
npm run build      # type-check + production build to dist/
npm run lint       # ESLint + Prettier check
npm run typecheck  # TypeScript only
npm run format     # Prettier write
```

#### Tech stack

React 19 + Vite + TypeScript, TanStack Query for data fetching / 30s polling, Recharts for charts, CSS Modules with CSS custom properties for theming.

#### Themes

Use the **Theme** selector in the navbar to switch between Light, Dark, Ocean and Solarized. The choice is stored in `localStorage` (`temp-master-theme`); on first visit the OS `prefers-color-scheme` is respected. Themes are defined as CSS variables in `src/index.css` (`--bg`, `--panel-bg`, `--text`, `--accent`, `--chart-line`, ...) and the Recharts colors follow them.

### Docker

The `Dockerfile` is a multi-stage build: a Node stage runs `npm ci && npm run build` for the frontend, then the Python stage copies `dist/` into `./static/`, which FastAPI serves at `/` with an SPA fallback to `index.html`. The frontend bundle is built with `VITE_API_URL=https://snakeroom.fly.dev` by default; override with `--build-arg VITE_API_URL=...` (an empty value makes API calls same-origin).

## API Endpoints

- `GET /api/meters` - Returns list of all meter devices with current temperature (from cache)
- `GET /api/meters/{device_id}/history` - Returns temperature history with time_scale parameter
- `POST /api/meters/refresh` - Triggers immediate data collection
- `GET /api/status` - Returns backend status and configuration

## Notes

- Temperature history is stored in memory and resets on backend restart
- Backend data collection interval: 2 minutes minimum
- Frontend refresh interval: 30 seconds
- SwitchBot API has strict rate limits (~10000 requests/day)
