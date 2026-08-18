# Temp Master Dashboard

A fullstack web dashboard to monitor temperature readings from SwitchBot Meter devices.

## 技術スタック

- バックエンド: FastAPI + aiosqlite（Poetry 管理）
- フロントエンド: React 18 + TypeScript + Vite + Tailwind CSS + Recharts
- デプロイ: Docker（マルチステージビルド） / Fly.io

## Features

- Recharts による全 SwitchBot Meter デバイスの温度チャート
- 時間スケール切替（hour / day / week / month / year）
- ライト／ダーク／システム設定のテーマ切替（選択は localStorage に永続化）
- 7日以上更新のないメーターを「未更新のメーター」セクションに分離表示
- フロントエンドは30秒ごとに自動更新、バックエンドはバックグラウンドで定期収集
- レート制限時は指数バックオフし、UI に警告を表示
- GET エンドポイントはキャッシュ経由で、SwitchBot API を直接呼ばない
- データベースのバックアップダウンロード（`GET /api/backup`）

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

   `VITE_API_URL` にバックエンドのベースURLを指定する。ローカル開発では
   `http://localhost:8000`、Docker / Fly.io のように同一オリジンで配信する場合は
   空文字（相対パス）にする。

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:5173 in your browser

### その他のフロントエンドコマンド

```bash
npm run build    # 本番ビルド（dist/ を生成）
npm run preview  # ビルド結果のプレビュー
npm run lint     # ESLint
npm test         # Vitest
```

### テーマ切替

ナビバー右側のトグルでライト／ダーク／システム設定を切り替えられる。選択内容は
`localStorage`（キー: `temp-master-theme`）に保存され、初回ロード時は
`localStorage` → OS の `prefers-color-scheme` の順で初期テーマを決定する。

## API Endpoints

- `GET /api/meters` - Returns list of all meter devices with current temperature (from cache)
- `GET /api/meters/{device_id}/history` - Returns temperature history with time_scale parameter
- `POST /api/meters/refresh` - Triggers immediate data collection
- `GET /api/status` - Returns backend status and configuration
- `GET /api/backup` - Downloads the SQLite database file

## Docker

`switchbot-dashboard/Dockerfile` はマルチステージ構成で、Node ステージが
フロントエンドを `npm ci && npm run build` でビルドし、生成された `dist/` の中身を
最終イメージの `static/` 直下へコピーする。バックエンドは `static/index.html` を
SPA フォールバック（`/{full_path:path}`）として配信する。

```bash
cd switchbot-dashboard
docker build -t temp-master .
docker run -p 8000:8000 --env-file switchbot-backend/.env temp-master
```

## Notes

- Temperature history is stored in memory and resets on backend restart
- Backend data collection interval: 2 minutes minimum
- Frontend refresh interval: 30 seconds
- SwitchBot API has strict rate limits (~10000 requests/day)
