---
name: testing-temp-master
description: Test the Temp Master SwitchBot dashboard locally. Use when verifying UI changes, API connectivity, or branding updates.
---

# Testing Temp Master Dashboard

## Prerequisites

- Python 3.12+
- Poetry (dependency management)
- SwitchBot API credentials

## Devin Secrets Needed

- `SWITCHBOT_TOKEN` - SwitchBot API token
- `SWITCHBOT_SECRET` - SwitchBot API secret

## Local Development Setup

### Frontend-only testing against the public backend

For UI-only changes, no local Python backend or SwitchBot secrets are needed:

```bash
cd switchbot-dashboard/switchbot-frontend
VITE_API_URL=https://snakeroom.fly.dev npm run dev
```

Open `http://localhost:5173`. Use live meter counts rather than hard-coding them in
reusable tests. The backup endpoint may require authentication even when meter
reads are public: distinguish opening the correct `/api/backup` tab from actually
downloading a database. Do not report a completed download if the tab says
`Not authenticated`.

For the disconnected state, start a separate Vite instance with
`VITE_API_URL=http://localhost:9 npm run dev -- --port 5174` and open port 5174.
Expect `Disconnected` and `Failed to fetch meters: Failed to fetch`.

For narrow-screen tests, check control bounding boxes as well as document
`scrollWidth`: a fixed navbar can clip controls without increasing page width.
For a blocked-storage test, inject throwing `Storage.prototype.getItem` and
`setItem` methods before application startup, then verify both methods really
throw before judging the theme fallback. If using raw CDP, enable the Page domain
before `Page.addScriptToEvaluateOnNewDocument` and keep that CDP session attached.

### 1. Install dependencies

```bash
cd switchbot-dashboard/switchbot-backend
poetry install --no-interaction
```

### 2. Create .env file

```bash
cd switchbot-dashboard/switchbot-backend
echo "SWITCHBOT_TOKEN=${SWITCHBOT_TOKEN}" > .env
echo "SWITCHBOT_SECRET=${SWITCHBOT_SECRET}" >> .env
```

### 3. Build the frontend and symlink the static files

The Dockerfile builds `switchbot-frontend/` (Vite) and copies `dist/` to `switchbot-backend/static/`, but locally this directory doesn't exist. Build it and create a symlink:

```bash
cd switchbot-dashboard/switchbot-frontend
npm install
VITE_API_URL= npm run build   # empty URL = same-origin API
cd ../..
ln -s $(pwd)/switchbot-dashboard/switchbot-frontend/dist switchbot-dashboard/switchbot-backend/static
```

Alternatively run the Vite dev server (`npm run dev`, http://localhost:5173) with `VITE_API_URL=http://localhost:8000` in `switchbot-frontend/.env`.

**Important:** The static directory check in `main.py` happens at module import time (`STATIC_DIR = Path(__file__).resolve().parent.parent / "static"`). If you create the symlink after starting the server, you must restart the server.

### 4. Start the server

```bash
cd switchbot-dashboard/switchbot-backend
poetry run fastapi run app/main.py --host 0.0.0.0 --port 8000
```

The frontend is served at `http://localhost:8000/` and the API docs at `http://localhost:8000/docs`.

## Key Test Points

### Branding Verification
- Page title (`<title>` tag): should say "Temp Master Dashboard"
- Navbar brand: should say "Temp Master Dashboard"
- Footer: should say "Temp Master Dashboard v2.0 - Built with React + Vite + Recharts"
- Verify no "Snake" or "SnakeRoom" text exists anywhere: `document.body.innerHTML.includes('Snake')` should be `false`

### API Connectivity
- `GET /api/status` returns `configured: true` and `meters_count` > 0
- `GET /api/meters` returns live meter data with temperature, humidity, battery
- Connection status badge (`#connection-status`) shows "Connected" (green)

### UI Functionality
- Time Range selector: Last Hour / Last 24 Hours / Last 7 Days / Last 30 Days / Last Year
- Charts: Recharts SVG area charts (`svg.recharts-surface`), colors follow the theme
- Theme selector (`#theme-select`) in navbar: Light / Dark / Ocean / Solarized, persisted in `localStorage` (`temp-master-theme`)
- Stale meters (7+ days without update) appear under "未更新のメーター" without charts
- Refresh Data button triggers data reload

### Frontend checks

```bash
cd switchbot-dashboard/switchbot-frontend
npm run lint && npm run build
```

## Running Backend Tests

```bash
cd switchbot-dashboard/switchbot-backend
poetry run pytest -v
```

Expected: 97 tests pass.

## Architecture Notes

- Backend: FastAPI + aiosqlite (SQLite persistence at `/data/app.db` or local `app.db`)
- Frontend: React 19 + Vite + TypeScript, TanStack Query, Recharts, CSS Modules (`switchbot-frontend/src`)
- Deployment: Fly.io (see `fly.toml`)
- Background data collection runs with 120s interval, with rate limiting and exponential backoff
