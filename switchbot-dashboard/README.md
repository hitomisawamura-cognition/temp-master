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

3. Copy `.env.example` to `.env` and add your SwitchBot credentials and a
   private, randomly generated `API_KEY`. Without a key, backup and refresh
   requests are rejected.
   ```bash
   cp .env.example .env
   ```
   
   Get your credentials from the SwitchBot app:
   - Go to Profile > Preferences > About
   - Tap App Version 10 times to enable Developer Options
   - Go to Developer Options > Get Token

4. Start the development server:
   ```bash
   CORS_ALLOWED_ORIGINS=http://localhost:5173 poetry run fastapi dev app/main.py
   ```

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd switchbot-frontend
   ```

2. Serve the static dashboard locally:
   ```bash
   python3 -m http.server 5173 --bind 127.0.0.1
   ```

3. Open http://localhost:5173 in your browser. The dashboard uses the local
   backend on port 8000 and prompts for its API key for refresh and backup.

## API Endpoints

- `GET /api/meters` - Returns list of all meter devices with current temperature (from cache)
- `GET /api/meters/{device_id}/history` - Returns temperature history with time_scale parameter
- `POST /api/meters/refresh` - Triggers immediate data collection (requires `X-API-Key`)
- `GET /api/backup` - Downloads the SQLite database (requires `X-API-Key`)
- `GET /api/status` - Returns backend status and configuration

## Deployment and backups

- The deployed dashboard continues to use `https://snakeroom.fly.dev` for its
  API requests. Set `API_KEY` on the API serving those requests and include the
  dashboard's origin in its comma-separated `CORS_ALLOWED_ORIGINS` (the API
  defaults to allowing `https://temp-master.fly.dev`).
- Set `BACKUP_API_KEY` in the environment before running `./backup_database.sh`;
  it must match the key of `SWITCHBOT_BACKEND_URL` (default:
  `https://temp-master.fly.dev`). The script requires `curl` and `file`.
- The Docker app runs as UID/GID 10001. Before deploying with an existing
  persistent volume, make `/data` and its SQLite files writable by UID/GID 10001
  (for example, `chown -R 10001:10001 /data` from a privileged maintenance session).
  A mounted volume overrides the permissions set on `/data` in the image.

## Notes

- Temperature history is stored in memory and resets on backend restart
- Backend data collection interval: 2 minutes minimum
- Frontend refresh interval: 30 seconds
- SwitchBot API has strict rate limits (~10000 requests/day)
