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

The Dockerfile builds `switchbot-frontend/` (React + Vite, Node.js 24) and copies `dist/` to the backend's `static/`. Locally:

```bash
cd switchbot-dashboard/switchbot-frontend && npm ci && npm run build && cd -
ln -s $(pwd)/switchbot-dashboard/switchbot-frontend/dist switchbot-dashboard/switchbot-backend/static
```

Alternatively run `npm run dev` in `switchbot-frontend/` (http://localhost:5173). `VITE_API_URL` defaults to `https://snakeroom.fly.dev`; set `VITE_API_URL=` to use the local backend via the dev proxy.

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
- Footer: should say "Temp Master Dashboard v2.0 - Built with React + Vite"
- Verify no "Snake" or "SnakeRoom" text exists anywhere: `document.body.innerHTML.includes('Snake')` should be `false`

### API Connectivity
- `GET /api/status` returns `configured: true` and `meters_count` > 0
- `GET /api/meters` returns live meter data with temperature, humidity, battery
- Connection status badge (`data-testid="connection-status"`) shows "接続済み" with `data-state="connected"`

### UI Functionality
- Theme switcher (radio group "テーマ"): ライト / ダーク / コントロールルーム / サクラ. Sets `<html data-theme>` and persists to localStorage key `temp-master-theme`
- 表示期間 selector: 過去1時間 / 過去24時間 / 過去7日間 / 過去30日間 / 過去1年間
- Charts: SVG area charts rendered with Recharts
- 未更新のメーター section lists meters not updated for 7+ days
- 「データを更新」 button triggers POST /api/meters/refresh and reloads data

## Running Frontend Checks

```bash
cd switchbot-dashboard/switchbot-frontend
npm run lint && npm run typecheck && npm test && npm run build
```

## Running Backend Tests

```bash
cd switchbot-dashboard/switchbot-backend
poetry run pytest -v
```

Expected: 97 tests pass.

## Architecture Notes

- Backend: FastAPI + aiosqlite (SQLite persistence at `/data/app.db` or local `app.db`)
- Frontend: React 19 + TypeScript + Vite + TanStack Query + Recharts + Tailwind CSS v4 (`switchbot-frontend/src`)
- Deployment: Fly.io (see `fly.toml`)
- Background data collection runs with 120s interval, with rate limiting and exponential backoff
