# セキュリティ・依存関係・ライセンス監査レポート

## 1. 監査概要

- 対象リポジトリ: `hitomisawamura-cognition/temp-master`
- 対象日: 2026-08-14
- 対象コンポーネント:
  - `switchbot-dashboard/switchbot-backend`: FastAPI / Python / SQLite
  - `switchbot-dashboard/switchbot-frontend`: 静的 HTML / JavaScript / CDN
  - `switchbot-dashboard/Dockerfile`、`fly.toml`、`backup_database.sh`、GitHub Actions
- 実施方法: コード静的監査、Poetry lockfile・PyPIメタデータ確認、依存関係アドバイザリ確認、バックエンドテスト確認

本監査では、P0（直ちに全面停止または緊急対応が必要なもの）は確認されなかった。一方、公開環境ではP1相当の問題が複数あり、特にデータベース全体を取得できるバックアップAPIと、任意データを書き込めるインポートAPIは最優先で対応すべきである。

## 2. エグゼクティブサマリー

| 優先度 | 件数 | 主な内容 | 推奨期限 |
|---|---:|---|---|
| P0 | 0 | 今回確認できず | — |
| P1 | 6 | 未認証バックアップ／インポート、無制限インポート、任意Origin CORS、CDNのSRI欠如、古いフロントエンド依存、可変なCI依存 | 直ちに着手 |
| P2 | 5+ | API濫用、ログAPIの上限、セキュリティヘッダー、非rootコンテナ、入力制約など | 1スプリント以内 |
| P3 | 1+ | ドキュメント／ライセンス整備 | 次回メンテナンス |

P1修正として、`BACKUP_TOKEN` によるBearer認証を `/api/backup` と `/api/import` に追加するPRを別セッションで作成済みである。

- PR: https://github.com/hitomisawamura-cognition/temp-master/pull/10
- 注意: マージ前にFly.ioとバックアップ実行環境へ、同じ長いランダム値を `BACKUP_TOKEN` として安全に登録する必要がある。

## 3. 詳細 findings

### 3.1 バックエンド

#### P1: 認証なしでSQLite全体を取得可能

- 根拠: `switchbot-dashboard/switchbot-backend/app/main.py:776-789`
- `GET /api/backup` が認証・認可なしで `DB_PATH` のSQLiteファイルを返す。
- DBにはデバイス情報、測定履歴、外部APIのレイテンシログが保存される。
- 対応: 管理者専用の認証・認可を追加し、未認証時は401/403にする。バックアップファイルを公開HTTP APIで返す構成自体も見直す。
- 状態: 専用Bearerトークンによる最小修正をPR #10で実装済み。

#### P1: 認証なしで任意の測定データをインポート可能

- 根拠: `switchbot-dashboard/switchbot-backend/app/main.py:732-773`
- `POST /api/import` が任意の `device_id`、名称、種類、測定値、履歴をメモリとSQLiteへ書き込める。
- 実データの改ざん、ダッシュボード表示の汚染、DB肥大化につながる。
- 対応: 管理者専用認証、CSRF対策、入力件数・リクエストサイズ・値域・時系列の制約、トランザクション化、監査ログ。
- 状態: 専用Bearerトークンによる最小修正をPR #10で実装済み。サイズ・件数制限は別途必要。

#### P1: インポートの件数・サイズ無制限によるDoS

- 根拠: `switchbot-dashboard/switchbot-backend/app/main.py:725-729,738-767`
- `devices` と各 `readings` に実質的な最大件数・最大本文サイズがなく、各readingごとにDB書き込みが発生する。
- 対応: ASGI／リバースプロキシの本文サイズ制限、Pydanticの `max_length`、デバイス数・reading数の上限、一括トランザクション、レート制限を導入する。

#### P1: 任意OriginのCORSと認証情報許可

- 根拠: `switchbot-dashboard/switchbot-backend/app/main.py:592-599`
- `allow_origins=["*"]`、`allow_credentials=True`、全メソッド・全ヘッダー許可になっている。
- FastAPI／ブラウザの組み合わせによっては資格情報付きCORSの動作が制限されるが、許可範囲が過大であること自体が問題。
- 対応: 実際のフロントエンドOriginだけをallowlist化し、不要なら `allow_credentials` を無効化する。

#### P2: refresh APIの認証・レート制限不足

- 根拠: `switchbot-dashboard/switchbot-backend/app/main.py:636-647`
- `POST /api/meters/refresh` はSwitchBot資格情報が設定されていれば呼び出せ、利用者認証や呼び出し元単位のレート制限がない。
- 対応: 管理者認証または内部専用化、IP／利用者単位のレート制限、同時実行抑制を追加する。

#### P2: latencyログ取得の上限不足

- 根拠: `switchbot-dashboard/switchbot-backend/app/main.py:666-705`
- `limit` に妥当性・最大値の制約がなく、ログAPIへの過大な読み出しを許す。
- 対応: `limit` を1〜100などに制限し、ログAPIの公開範囲を管理者に限定する。

### 3.2 フロントエンド

#### P1: 外部CDNスクリプト／CSSにSRIとCSPがない

- 根拠: `switchbot-dashboard/switchbot-frontend/index.html:10,176-182`
- jQuery、Bootstrap、Chart.jsを外部CDNから読み込むが、`integrity` と `crossorigin` がなく、CSPも設定されていない。
- 対応: 依存をビルド成果物へ固定するか、少なくともSRIハッシュを付け、CSPでscript/style/connectの許可先を明示する。

#### P1: フロントエンド依存が古い

- 根拠: `switchbot-dashboard/switchbot-frontend/index.html:10,176-182`
- Bootstrap 3.3.7、jQuery 1.12.4、Chart.js 2.9.4を利用している。保守終了・既知の脆弱性・ブラウザ互換性の観点から更新計画が必要。
- 対応: 互換性テストを行ったうえで、サポート中のjQuery／Bootstrap／Chart.jsへ更新する。更新までの暫定策としてSRIと厳格なCSPを導入する。

#### P1: 公開バックエンドへの依存とデータ境界

- 根拠: `switchbot-dashboard/switchbot-frontend/index.html:189-191`
- API URLが `https://snakeroom.fly.dev` に固定されており、監査対象アプリの `temp-master` と異なるサービスを参照する。
- 対応:環境ごとの設定へ分離し、許可するOrigin・APIホスト・TLS設定を明示する。サービス間の責任範囲と認証方式を文書化する。

#### P2: セキュリティレスポンスヘッダーが未設定

- 根拠: 静的配信設定および `index.html` にCSP、HSTS、`X-Content-Type-Options`、`Referrer-Policy` 等の設定が見当たらない。
- 対応: Fly.io／アプリのいずれかでセキュリティヘッダーを付与する。

### 3.3 コンテナ、CI/CD、運用

#### P1: コンテナがrootユーザーで実行される

- 根拠: `switchbot-dashboard/Dockerfile:1-22`
- `USER` 指定がなく、Pythonアプリがrootで起動する。
- 対応:専用の非rootユーザーを作成し、アプリと `/data` の所有権を設定してから `USER` を切り替える。

#### P1: CI/CDの依存が可変

- 根拠: `.github/workflows/deploy.yml:42-44` の `dorny/paths-filter@v3`、`.github/workflows/deploy.yml:63-64` の `superfly/flyctl-actions/setup-flyctl@master`、`.github/workflows/ci.yml:96-100` の `version: latest`
- ActionのタグやPoetryのlatest指定は、将来の内容が変わり、サプライチェーン攻撃や再現不能ビルドのリスクになる。
- 対応: ActionsをコミットSHAで固定し、Poetryも明示バージョンへ固定する。Dependabot等で定期更新する。

#### P2: DockerイメージとPoetry導入の再現性不足

- 根拠: `switchbot-dashboard/Dockerfile:1,6`
- `python:3.12-slim` と `pip install poetry` が可変である。
- 対応:イメージdigest、Poetryバージョン、pipハッシュを固定し、定期的に更新する。

#### P2: バックアップスクリプトがHTTP応答の妥当性を十分検証しない

- 根拠: `switchbot-dashboard/backup_database.sh:58-77`
- ステータスコードのみで保存内容を判定し、TLS証明書検証・最小権限・暗号化保管・復元テストはスクリプトの責務外である。
- 対応:認証ヘッダー、`curl --fail --proto '=https' --tlsv1.2`、バックアップ暗号化、保持期間・アクセス権、定期復元テストを運用要件化する。

## 4. 依存関係監査

### Python

`switchbot-dashboard/switchbot-backend/poetry.lock` には、FastAPI 0.127.0、Starlette 0.50.0、httpx 0.28.1、urllib3 2.6.3、python-multipart 0.0.21、psycopg 3.3.2、aiosqlite 0.22.1などが固定されている。

監査セッションでは、`python-multipart`、`urllib3`、`starlette` について公式アドバイザリの影響確認対象として挙がった。現時点のロック済みバージョンが各アドバイザリの修正版か、FastAPIの互換制約を含めて、CIで毎回OSV／pip-audit等を実行する運用に移行することを推奨する。アドバイザリの有無だけでなく、実際の到達可能コードパスを確認してから更新する。

また、プロジェクトはPython `^3.12` を要求しているが、監査環境にはPython 3.10しかなく、ローカルでの再実行はできなかった。監査セッションではPython 3.12環境で `poetry install` とpytest 97件（修正PR側では102件）を実行し、成功している。

### JavaScript／CDN

フロントエンドにpackage manifestやlockfileはなく、CDN URLがHTMLへ直接記載されている。少なくとも次のバージョン管理とSRI導入が必要である。

- Bootstrap 3.3.7: MIT
- jQuery 1.12.4: MIT
- Chart.js 2.9.4: MIT

## 5. ライセンス監査

- リポジトリ直下にLICENSE、NOTICE、第三者コンポーネント一覧が見当たらない。
- Python依存は、確認できたメタデータ上ではMIT、BSD、Apache-2.0、MPL-2.0が中心である。例: FastAPI／Starlette系、httpx、aiosqlite、psycopg、pytest系。
- `certifi` はMPL-2.0、`httpx` はBSD-3-Clause、`h11` はMIT、`pytest` はMIT、`pytest-asyncio` はApache-2.0としてメタデータ上確認できた。
- 依存の一部はPyPIメタデータのLicense欄が空で、メタデータだけでは完全なライセンス判定ができない。配布物のLICENSEファイルと全transitive dependencyを含むSBOMを生成して確認すべきである。
- 対応: プロジェクト自身のライセンスを明示し、配布時に第三者ライセンス一覧とNOTICEを同梱する。CDN利用コンポーネントのライセンス表記もREADMEまたは画面のAbout等へ追加する。

## 6. 推奨対応順

1. PR #10をレビューし、Fly.ioとバックアップ実行環境に`BACKUP_TOKEN`を登録してからマージする。
2. `/api/import` の本文サイズ、デバイス数、reading数、値域、レート制限を追加する。
3. CORSを実Originのallowlistへ変更し、refresh／ログ／import／backupの認証・認可を整理する。
4. CDN依存のSRI・CSP・セキュリティヘッダーを導入し、古いライブラリを更新する。
5. Dockerを非root化し、ベースイメージ、Poetry、GitHub Actionsをdigest／SHA／明示バージョンで固定する。
6. OSV／pip-audit、ライセンス検査、SBOM生成をCIへ追加する。
7. LICENSE／NOTICEと復元テストを整備する。

## 7. 監査の制約

- 外部の本番サービスへリクエストや侵入テストは行っていない。
- Python 3.12が監査マシンに存在しなかったため、親セッションではローカルテストを再実行できなかった。Python 3.12を使った監査セッションの結果を併記している。
- 依存関係の「最新」判定は監査日時点のレジストリ／アドバイザリ情報に依存するため、CIの自動スキャンで継続確認すべきである。
