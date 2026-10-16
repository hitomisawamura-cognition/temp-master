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

### 3. Build the frontend and link it as static files

The Dockerfile builds `switchbot-frontend/` with Vite and copies `dist/` to `static/`. Locally:

```bash
cd switchbot-dashboard/switchbot-frontend
source ~/.nvm/nvm.sh   # Node is installed via nvm on the Devin VM
npm install
VITE_API_URL= npm run build   # empty = same origin as the backend
ln -sfn "$(pwd)/dist" ../switchbot-backend/static
```

**Important:** The static directory check in `main.py` happens at module import time (`STATIC_DIR = Path(__file__).resolve().parent.parent / "static"`). If you create the symlink after starting the server, you must restart the server.

Alternatively, without a local backend or SwitchBot credentials, run the Vite dev server against the deployed backend:

```bash
cd switchbot-dashboard/switchbot-frontend
VITE_API_URL=https://snakeroom.fly.dev npm run dev -- --port 5173
```

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
- Footer: should say "Temp Master Dashboard v2.0 - Built with Vite + React + TypeScript"
- Verify no "Snake" or "SnakeRoom" text exists anywhere: `document.body.innerHTML.includes('Snake')` should be `false`

### API Connectivity
- `GET /api/status` returns `configured: true` and `meters_count` > 0
- `GET /api/meters` returns live meter data with temperature, humidity, battery
- Connection status badge (`[data-testid=connection-status]`) shows "Connected" (green)

### UI Functionality
- Meter grid: 3 columns (>=992px) / 2 columns (>=768px) / 1 column
- Stale meters (last_updated 7+ days ago or missing) appear in the "未更新のメーター" section without charts
- Time Range selector: Last Hour / Last 24 Hours / Last 7 Days / Last 30 Days / Last Year
- Charts: Canvas elements rendered with Chart.js line charts
- Refresh Data button POSTs `/api/meters/refresh`, shows "Refreshing..." while disabled, then reloads
- Frontend checks: `npm run lint && npm run typecheck && npm test && npm run build` in `switchbot-frontend/`

## Running Backend Tests

```bash
cd switchbot-dashboard/switchbot-backend
poetry run pytest -v
```

Expected: 97 tests pass.

## Architecture Notes

- Backend: FastAPI + aiosqlite (SQLite persistence at `/data/app.db` or local `app.db`)
- Frontend: Vite + React + TypeScript (`src/components`, `src/hooks`, `src/api/client.ts`); API base URL from `VITE_API_URL`
- Deployment: Fly.io (see `fly.toml`)
- Background data collection runs with 120s interval, with rate limiting and exponential backoff
