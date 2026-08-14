---
name: testing-temp-master
description: Test the Temp Master SwitchBot dashboard locally. Use when verifying UI changes, API connectivity, or branding updates.
---

# Testing Temp Master Dashboard

## Prerequisites

- Python 3.12+
- Poetry (dependency management)
- Node.js 22.13+ (or 24+) for the Vite frontend
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

### 3. Start the server

```bash
cd switchbot-dashboard/switchbot-backend
poetry run fastapi run app/main.py --host 0.0.0.0 --port 8000
```

The API docs are at `http://localhost:8000/docs`.

### 4. Run the frontend

For UI work, run the Vite dev server and point it at a backend:

```bash
cd switchbot-dashboard/switchbot-frontend
cp .env.example .env   # set VITE_API_URL, e.g. http://localhost:8000
npm install
npm run dev            # http://localhost:5173
```

To test the production path instead (FastAPI serving the built bundle), build the
frontend and symlink `dist/` as the backend's static directory:

```bash
cd switchbot-dashboard/switchbot-frontend && npm run build
ln -s $(pwd)/dist ../switchbot-backend/static
```

**Important:** The static directory check in `main.py` happens at module import time (`STATIC_DIR = Path(__file__).resolve().parent.parent / "static"`). If you create the symlink after starting the server, you must restart the server.

## Key Test Points

### Branding Verification
- Page title (`<title>` tag): should say "Temp Master Dashboard"
- Navbar brand: should say "Temp Master Dashboard"
- Footer: should say "Temp Master Dashboard v1.0 - Built with Vite + React + TypeScript"
- Verify no "Snake" or "SnakeRoom" text exists anywhere: `document.body.innerHTML.includes('Snake')` should be `false`

### API Connectivity
- `GET /api/status` returns `configured: true` and `meters_count` > 0
- `GET /api/meters` returns live meter data with temperature, humidity, battery
- Connection status badge in the navbar shows "Connected"

### UI Functionality
- Time Range selector: Last Hour / Last 24 Hours / Last 7 Days / Last 30 Days / Last Year
- Charts: Recharts SVG line charts, one per active meter
- Theme selector in the navbar: Light / Dark / Industrial, persisted across reloads
- Meters not updated for 7+ days appear in the "未更新のメーター" section instead of the main grid
- Refresh Data button triggers data reload; Download Backup opens `/api/backup`

## Testing Without SwitchBot Credentials (stub proxy pattern)

If `SWITCHBOT_TOKEN`/`SWITCHBOT_SECRET` are not available, the frontend can be tested
against the deployed backend `https://snakeroom.fly.dev` through the Vite dev proxy
(this is the default `VITE_API_URL` fallback in `vite.config.ts`).

Note: the deployed `/api/backup` may return **HTTP 401** even though the repo's route has
no auth, so the Download Backup button cannot be proven against the live backend. Workaround:
run a small local Python `http.server` proxy on another port that forwards `/api/*` to
snakeroom while overriding selected responses, and start a second dev server pointed at it:

```bash
VITE_API_URL=http://localhost:8001 npm run dev -- --port 5174
```

Flag-file switches make backend states reachable that live data cannot produce:
- force `/api/status` → `is_rate_limited: true, backoff_remaining: 42` (rate-limit banner)
- force `/api/meters/*/history` → 500 (chart keeps last data + 「履歴の更新に失敗しました…」 warning)
- force `POST /api/meters/refresh` → 500 (red `Error.` banner, must clear on next successful meters fetch)
- serve a local `.db` for `/api/backup`

All queries poll every 30s (`REFRESH_INTERVAL` in `src/hooks/useDashboardData.ts`), so after
flipping a flag just wait ~40s for the state to appear/clear — no reload needed.
Theme choice is stored in `localStorage` under `temp-master-theme`, and it is **per origin**,
so switching between ports 5173/5174 resets the theme to Light.

## Layout Regression To Watch

The navbar is `sticky top-0` in normal flow. Making it `fixed` again reintroduces a
hard-coded body offset that no longer matches the navbar height once it wraps at narrow
widths, covering the Time Range / Refresh Data controls and swallowing clicks. When
touching the navbar or controls, resize to ~520px (`wmctrl -r :ACTIVE: -e 0,0,0,520,760`)
and confirm a click on the **top edge** of `Refresh Data` still works.

## Running Backend Tests

```bash
cd switchbot-dashboard/switchbot-backend
poetry run pytest -v
```

Expected: 97 tests pass.

## Architecture Notes

- Backend: FastAPI + aiosqlite (SQLite persistence at `/data/app.db` or local `app.db`)
- Frontend: Vite + React + TypeScript (Tailwind CSS, Recharts, TanStack Query); built assets are copied to `static/` by the Dockerfile
- Deployment: Fly.io (see `fly.toml`)
- Background data collection runs with 120s interval, with rate limiting and exponential backoff
