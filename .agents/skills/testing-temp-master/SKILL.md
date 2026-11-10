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

### 3. Build the frontend

The backend serves the Vite `dist/` output. It looks in `$STATIC_DIR`, then `switchbot-backend/static/`, then `switchbot-frontend/dist/`, so a local build is picked up automatically:

```bash
cd switchbot-dashboard/switchbot-frontend
source ~/.nvm/nvm.sh   # Node is only available via nvm on Devin VMs
npm ci && npm run build
```

**Important:** The static directory is resolved at module import time. If you build after starting the server for the first time, restart it.

For frontend-only work, skip the backend and run `VITE_API_URL=https://snakeroom.fly.dev npm run dev` (port 5173).

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
- Footer: should say "Temp Master Dashboard v2.0 - Built with React + Vite"
- Verify no "Snake" or "SnakeRoom" text exists anywhere: `document.body.innerHTML.includes('Snake')` should be `false`

### API Connectivity
- `GET /api/status` returns `configured: true` and `meters_count` > 0
- `GET /api/meters` returns live meter data with temperature, humidity, battery
- Connection status badge (`data-testid="connection-status"`) shows "Connected" (green)

### UI Functionality
- Theme switcher (header): Light / Dark / High contrast; sets `<html data-theme>` and persists to localStorage key `temp-master-theme`
- Time Range selector: Last Hour / Last 24 Hours / Last 7 Days / Last 30 Days / Last Year
- Charts: Chart.js 4 (react-chartjs-2) temperature + humidity line charts per active meter
- Refresh Data button triggers data reload

## Running Backend Tests

```bash
cd switchbot-dashboard/switchbot-backend
poetry run pytest -v
```

Expected: 106 tests pass. Frontend: `npm run lint && npm run typecheck && npm test` in `switchbot-frontend/`.

## Architecture Notes

- Backend: FastAPI + aiosqlite (SQLite persistence at `/data/app.db` or local `app.db`)
- Frontend: Vite + React 18 + TypeScript, TanStack Query (30s polling), Tailwind CSS with CSS-variable themes (legacy jQuery version in `switchbot-frontend/legacy/`)
- Deployment: Fly.io (see `fly.toml`)
- Background data collection runs with 120s interval, with rate limiting and exponential backoff
