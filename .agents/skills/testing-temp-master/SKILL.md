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

### 3. Frontend (React + Vite)

For UI development, run the Vite dev server against the local backend:

```bash
cd switchbot-dashboard/switchbot-frontend
npm install
echo 'VITE_API_URL=http://localhost:8000' > .env
npm run dev   # http://localhost:5173
```

To test the production path (backend serving the built SPA), build and symlink `dist/` into `static/`:

```bash
cd switchbot-dashboard/switchbot-frontend
VITE_API_URL= npm run build
ln -s $(pwd)/dist ../switchbot-backend/static
```

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
- Footer: should say "Temp Master Dashboard v2.0 - Built with React + TypeScript + Vite + Tailwind CSS"
- Verify no "Snake" or "SnakeRoom" text exists anywhere: `document.body.innerHTML.includes('Snake')` should be `false`

### API Connectivity
- `GET /api/status` returns `configured: true` and `meters_count` > 0
- `GET /api/meters` returns live meter data with temperature, humidity, battery
- Connection status badge in the navbar shows "Connected" (green pill)

### UI Functionality
- Time Range selector: Last Hour / Last 24 Hours / Last 7 Days / Last 30 Days / Last Year
- Charts: Recharts SVG line charts (one per active meter)
- Refresh Data button triggers data reload
- Theme toggle (ライト / ダーク / システム設定): toggles the `dark` class on `<html>` and persists to `localStorage` key `temp-master-theme`
- Stale meters (no update for 7+ days) appear in the separate 未更新のメーター section

## Fallback: testing the frontend without SwitchBot credentials

If `SWITCHBOT_TOKEN` / `SWITCHBOT_SECRET` are unavailable, the backend still starts but returns
`configured: false` and 0 meters, so no UI data path can be exercised. In that case run a small
mock API (stdlib `http.server` is enough) that serves `/api/meters`, `/api/status`,
`/api/meters/{id}/history?time_scale=...`, `POST /api/meters/refresh` and `/api/backup`
with CORS `Access-Control-Allow-Origin: *`, then point the dev server at it:

```bash
echo 'VITE_API_URL=http://localhost:8001' > switchbot-dashboard/switchbot-frontend/.env
npm run dev
```

Design the mock so broken behaviour is visible:
- one meter with `last_updated` 10 days old → must land in the 未更新のメーター section with no chart
- `is_rate_limited: true` + `backoff_remaining` toggled by a flag file (e.g. `/tmp/mock_rate_limited`)
  so the Rate Limited banner can be shown/hidden by clicking Refresh Data
- different point counts / temperature amplitudes per `time_scale` so the chart axis format
  (`HH:MM` / `Tue 10` / `Aug 18`) and Y range visibly change when switching Time Range
- change the current temperature on every `/api/meters` call so the 30s auto-refresh is provable

## Known environment pitfall: Python version

`pyproject.toml` requires `python = "^3.12"`, but the box may only have Python 3.10, in which case
`poetry run fastapi run ...` fails with
`Current Python version (3.10.12) is not allowed by the project (^3.12)`.
Workaround that worked: a plain venv plus uvicorn (the app code itself runs on 3.10):

```bash
python3 -m venv /tmp/bevenv
/tmp/bevenv/bin/pip install "fastapi[standard]==0.127.0" httpx python-dotenv aiosqlite
cd switchbot-dashboard/switchbot-backend && /tmp/bevenv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
```

An empty `.env` (`SWITCHBOT_TOKEN=` / `SWITCHBOT_SECRET=`) is enough to boot for SPA-serving /
SPA-fallback checks (`/` and any unknown path like `/foo` must both return `index.html`).

## Running Frontend Tests

```bash
cd switchbot-dashboard/switchbot-frontend
npm run lint
npm test
```

## Running Backend Tests

```bash
cd switchbot-dashboard/switchbot-backend
poetry run pytest -v
```

Expected: 97 tests pass.

## Architecture Notes

- Backend: FastAPI + aiosqlite (SQLite persistence at `/data/app.db` or local `app.db`)
- Frontend: React 18 + TypeScript + Vite + Tailwind CSS + Recharts
- Deployment: Fly.io (see `fly.toml`)
- Background data collection runs with 120s interval, with rate limiting and exponential backoff
