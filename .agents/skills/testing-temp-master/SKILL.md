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

### 3. Symlink frontend static files

The Dockerfile copies `switchbot-frontend/` to `switchbot-backend/static/`, but locally this directory doesn't exist. You must create a symlink:

```bash
ln -s $(pwd)/switchbot-dashboard/switchbot-frontend switchbot-dashboard/switchbot-backend/static
```

**Important:** The static directory check in `main.py` happens at module import time (`STATIC_DIR = Path(__file__).resolve().parent.parent / "static"`). If you create the symlink after starting the server, you must restart the server.

### 3b. If SwitchBot credentials are unavailable (no secrets in the session)

`list_secrets` may report no secrets and `.env` may not exist. The dashboard is still fully testable:

1. Write **dummy** values to `.env` (`SWITCHBOT_TOKEN=dummy...`, `SWITCHBOT_SECRET=dummy...`). This makes
   `/api/status` return `configured: true` and makes `POST /api/meters/refresh` return 200 — `collect_data()`
   swallows the upstream auth failure (`main.py`, `except HTTPException: pass`), so seeded data is preserved.
   Without any credentials the refresh endpoint returns HTTP 500 and the button cannot be tested.
2. Seed devices/readings through `POST /api/import` (schema: `{"devices":[{device_id, device_name, device_type,
   current_temperature, current_humidity, battery, last_updated, readings:[{timestamp, temperature, humidity, battery}]}]}`).
   Timestamps must be ISO-8601 UTC. To exercise every Time Range option, seed readings at 10-min, 30-min, 3-h,
   daily and weekly spacing in one list. To exercise the stale section, add one device with `last_updated`
   ~10 days old and one with `last_updated` omitted entirely (renders 「値がありません（データ未受信）」).
3. Device names must match a key in `src/lib/constants.ts` `DISPLAY_NAMES` (e.g. `Bedroom Meter`, `Living Meter`,
   `外`, `ネズミ`, `夢`) if you want the Japanese plant-equipment display names to appear.

Caveat: with dummy credentials the Refresh button proves the POST + TanStack Query invalidation path only, not
that fresh values arrive from the SwitchBot cloud.

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
- Footer: should say "Temp Master Dashboard v1.0 - Built with jQuery + Bootstrap 3"
- Verify no "Snake" or "SnakeRoom" text exists anywhere: `document.body.innerHTML.includes('Snake')` should be `false`

### API Connectivity
- `GET /api/status` returns `configured: true` and `meters_count` > 0
- `GET /api/meters` returns live meter data with temperature, humidity, battery
- Connection status badge shows "Connected" (green, class `label-success`)

### UI Functionality
- View toggle: Default (equal 3-col grid) vs Shelf (featured meter + 3-col grid)
- Time Range selector: Last Hour / Last 24 Hours / Last 7 Days / Last 30 Days / Last Year
- Charts: Canvas elements rendered with Chart.js line charts
- Refresh Data button triggers data reload

## Running Backend Tests

```bash
cd switchbot-dashboard/switchbot-backend
poetry run pytest -v
```

Expected: 97 tests pass.

## Architecture Notes

- Backend: FastAPI + aiosqlite (SQLite persistence at `/data/app.db` or local `app.db`)
- Frontend: jQuery + Bootstrap 3 (single `index.html` file)
- Deployment: Fly.io (see `fly.toml`)
- Background data collection runs with 120s interval, with rate limiting and exponential backoff
