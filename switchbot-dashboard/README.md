# Temp Master Dashboard

A fullstack web dashboard to monitor temperature readings from SwitchBot Meter devices.

## Features

- Temperature charts for all SwitchBot Meter devices using Recharts
- Time scale switching (hour/day/month/year)
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

3. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:5173 in your browser

## API Endpoints

- `GET /api/meters` - Returns list of all meter devices with current temperature (from cache)
- `GET /api/meters/{device_id}/history` - Returns temperature history with time_scale parameter
- `POST /api/meters/refresh` - Triggers immediate data collection (throttled to once per 60 seconds)
- `GET /api/status` - Returns backend status and configuration
- `GET /api/latency-logs`, `GET /api/latency-stats` - SwitchBot API latency logs and statistics

### Administrative endpoints (require `ADMIN_TOKEN`)

- `GET /api/backup` - Downloads the SQLite database
- `POST /api/import` - Imports devices and readings

Both require the header `Authorization: Bearer $ADMIN_TOKEN`. When `ADMIN_TOKEN` is
not set they return `503` and stay disabled.

```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" -o backup.db https://<host>/api/backup
```

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SWITCHBOT_TOKEN` / `SWITCHBOT_SECRET` | yes | SwitchBot API v1.1 credentials |
| `ADMIN_TOKEN` | for admin endpoints | Bearer token for `/api/backup` and `/api/import` |
| `ALLOWED_ORIGINS` | no | Comma separated CORS origins; empty (default) allows same-origin only |
| `DB_PATH` | no | SQLite path (defaults to `/data/app.db` when `/data` exists) |

## Notes

- Temperature history is stored in memory and resets on backend restart
- Backend data collection interval: 2 minutes minimum
- Frontend refresh interval: 30 seconds
- SwitchBot API has strict rate limits (~10000 requests/day)
