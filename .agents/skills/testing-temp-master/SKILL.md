---
name: testing-temp-master
description: Test the Temp Master SwitchBot dashboard locally. Use when verifying UI changes, API connectivity, or branding updates.
---

# Testing Temp Master Dashboard

## Prerequisites

- Python 3.12+
- Poetry (dependency management)
- Node.js 20+ / npm (frontend)
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

### 3. Start the backend server

```bash
cd switchbot-dashboard/switchbot-backend
poetry run fastapi run app/main.py --host 0.0.0.0 --port 8000
```

The API is served at `http://localhost:8000/api/...` and the API docs at `http://localhost:8000/docs`.

### 4. Start the frontend dev server

```bash
cd switchbot-dashboard/switchbot-frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
```

Open `http://localhost:5173`.

### 5. (Optional) Test the production layout

The Dockerfile builds the frontend and copies `dist/` to `switchbot-backend/static/`. To
reproduce it locally so the backend serves the SPA at `http://localhost:8000/`:

```bash
cd switchbot-dashboard/switchbot-frontend && npm run build
ln -s $(pwd)/dist ../switchbot-backend/static
```

**Important:** The static directory check in `main.py` happens at module import time (`STATIC_DIR = Path(__file__).resolve().parent.parent / "static"`). If you create the symlink after starting the server, you must restart the server.

## Key Test Points

### Branding Verification
- Page title (`<title>` tag): should say "Temp Master Dashboard"
- Navbar brand: should say "Temp Master Dashboard"
- Footer: should say "Temp Master Dashboard v1.0 - Built with React + Vite + Tailwind CSS"
- Verify no "Snake" or "SnakeRoom" text exists anywhere: `document.body.innerHTML.includes('Snake')` should be `false`

### API Connectivity
- `GET /api/status` returns `configured: true` and `meters_count` > 0
- `GET /api/meters` returns live meter data with temperature, humidity, battery
- Connection status badge in the header shows "Connected"

### UI Functionality
- Time Range selector: Last Hour / Last 24 Hours / Last 7 Days / Last 30 Days / Last Year
- Charts: Recharts SVG line charts (one per active meter)
- Refresh Data button triggers data reload; Download Backup opens `/api/backup`
- Theme selector in the header: Light / Dark / Instrument Panel; the selection persists
  across reloads (`localStorage` key `temp-master-theme`) and visibly recolors panels,
  text, and chart lines
- Meters not updated for 7+ days appear in the "未更新のメーター" section without charts

## Running Backend Tests

```bash
cd switchbot-dashboard/switchbot-backend
poetry run pytest -v
```

Expected: 97 tests pass.

## Architecture Notes

- Backend: FastAPI + aiosqlite (SQLite persistence at `/data/app.db` or local `app.db`)
- Frontend: React 18 + TypeScript + Vite + Tailwind CSS, Recharts charts, TanStack Query
  data fetching (30s `refetchInterval`), themes via `<html data-theme>` + CSS variables
- Deployment: Fly.io (see `fly.toml`)
- Background data collection runs with 120s interval, with rate limiting and exponential backoff
