# Temp Master Dashboard

A fullstack web dashboard to monitor temperature readings from SwitchBot Meter devices.

## Features

- Temperature charts for all active SwitchBot Meter devices using Chart.js 4
- Time scale switching (hour/day/week/month/year)
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

Vite + React 19 + strict TypeScript, TanStack Query v5 (30-second polling),
Tailwind CSS v4 and Chart.js 4 with react-chartjs-2.
Light, Dark and Industrial themes are available in the navbar. The first visit
follows the system preference; subsequent visits restore the selected theme.
Devices without a valid update within seven days appear in a separate warning
section without history requests. Backup downloads report authentication errors inline.

1. Navigate to the frontend directory:
   ```bash
   cd switchbot-frontend
   ```

2. Install dependencies:
   ```bash
   npm ci
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

`VITE_API_URL` sets the API origin at build/dev-server startup. It defaults to
the same origin (`''`); `.env.example` points to `https://snakeroom.fly.dev`.
Docker builds default to that hosted API; override using
`docker build --build-arg VITE_API_URL=... .`.

Scripts (Node 22):
- `npm run dev`: start Vite
- `npm run build`: TypeScript check and production bundle in `dist/`
- `npm run lint`: ESLint (flat config, TypeScript and React Hooks)
- `npm run typecheck`: strict TypeScript check
- `npm test`: Vitest + Testing Library in jsdom
- `npm run preview`: serve the production bundle locally

Prettier configuration is included; format with `npx prettier --write .`.

## API Endpoints

- `GET /api/meters` - Returns list of all meter devices with current temperature (from cache)
- `GET /api/meters/{device_id}/history` - Returns temperature history with time_scale parameter
- `POST /api/meters/refresh` - Triggers immediate data collection
- `GET /api/status` - Returns backend status and configuration

## Notes

- Temperature history is persisted in the backend SQLite database
- Backend data collection interval: 2 minutes minimum
- Frontend refresh interval: 30 seconds
- SwitchBot API has strict rate limits (~10000 requests/day)
