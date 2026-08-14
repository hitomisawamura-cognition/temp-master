# temp-master セキュリティ・依存関係・ライセンス監査報告書

- 対象リポジトリ: `hitomisawamura-cognition/temp-master`
- 監査日: 2026-08-14
- 対象範囲: FastAPI/Poetry バックエンド、静的フロントエンド、Docker/Fly.io、GitHub Actions、バックアップスクリプト、依存関係、ライセンス
- 方法: 3つの独立セッションによるサービス別監査、手動コードレビュー、依存関係スキャン、設定スキャン、ShellCheck、SBOM確認

## 1. エグゼクティブサマリ

監査では、公開デプロイ上でデータ漏えいとデータ改ざんにつながる **P0を2件**、外部CDNのサプライチェーンリスクと既知脆弱バージョンを含む **P0相当を1件**確認しました。P0対応は並列セッションで開始済みです。

| 区分 | 件数 | 状況 |
|---|---:|---|
| P0 | 3 | 修正PR作成済み（PR #3、#4、#5）。PR #4と#5は重複しているため、採用案を一本化する必要あり |
| P1 | 6 | 一部修正済み。依存更新、非root化、ライセンス方針、CSP等は未対応 |
| P2/P3 | 10以上 | 改善候補として整理 |
| ライセンス | 2 | リポジトリのLICENSE不在、依存ライセンス目録・帰属表示の不足 |

最優先は、**P0修正PRを重複なく統合し、デプロイ前に `ADMIN_TOKEN` を設定すること**です。既存の公開期間に取得・改ざんされた可能性があるため、認証情報と公開データの取り扱いも確認してください。

## 2. サービス別結果

### 2.1 switchbot-backend

対象: `switchbot-dashboard/switchbot-backend`

#### P0-1: `/api/backup` が無認証でSQLite全体を返す

- 根拠: `app/main.py:776-789`（監査前）
- 影響: デバイスID、デバイス名、計測履歴、レイテンシログを含むDBをインターネット上の任意利用者が取得可能
- 対応: `ADMIN_TOKEN`による認証を追加したPR #4/#5
- 運用必須事項: デプロイ前に `fly secrets set ADMIN_TOKEN="$(openssl rand -hex 32)"` を実行

#### P0-2: `/api/import` が無認証でDBを書き換え可能

- 根拠: `app/main.py:732-773`（監査前）
- 影響: 任意データの投入、既存データの上書き、読み取りデータの完全性破壊、ボリューム枯渇
- 対応: `ADMIN_TOKEN`による認証を追加したPR #4/#5

#### P1/P2

- `allow_origins=["*"]` と `allow_credentials=True` の危険な組み合わせ（`app/main.py:589-595`）。PR #4/#5で改善。
- `/api/meters/refresh` の無認証呼び出しでSwitchBot APIクォータを消費可能。PR #4は60秒スロットリング、PR #5は未対応。
- `.env` が監査前の `.gitignore` に無く、誤コミットの危険。PR #4で改善。
- 上流APIのレスポンス本文・例外文字列のクライアント転写。PR #4で汎用メッセージ化。
- `limit` とISO日時の入力検証不足。PR #4で上限と400応答を追加。
- 未使用の `psycopg[binary]`（LGPL-3.0-only）。PR #4で削除。
- Dockerコンテナがroot実行。非root化はFly.ioボリューム権限の検証を伴うため別PR推奨。
- 例外の握り潰し、公開された `/docs`・`/openapi.json`、本番に不要なFastAPI standard extrasは継続改善。

### 2.2 switchbot-frontend

対象: `switchbot-dashboard/switchbot-frontend/index.html`

#### P0相当: 外部CDNのSRI欠如と古い脆弱バージョン

- 根拠: 監査前の `index.html:10,176,179,182`
- jQuery 1.12.4は既知のXSS脆弱性、Bootstrap 3.3.7も既知のXSS脆弱性を含む
- CDNリソースにSRIが無く、CDN改ざん時に任意JavaScriptが実行され得る
- 対応: jQuery 3.7.1、Bootstrap 3.4.1への更新、および4リソースへのSRI追加をPR #3で実施
- Chart.js 2.9.4は据え置きだがSRIを追加。長期的にはメジャー更新を別途評価

#### P1/P2

- `API_URL` が `https://snakeroom.fly.dev` にハードコードされている（`index.html:191`）。PR #37の意図的変更とされるため、送信先を同一オリジンに戻すか運用意図を確認する必要あり。
- CSP、`X-Content-Type-Options`、`Referrer-Policy`、`X-Frame-Options` が未設定。
- npmマニフェストがなく、Dependabot/npm auditの対象外。実体はindex.html一枚で、READMEのnpm手順と乖離。
- DOM構築は文字列連結と`.html()`に依存。現状は`escapeHtml()`適用を確認したが、将来のエスケープ漏れ防止のためDOM APIまたは`.text()`への移行を推奨。
- 外部由来のdevice_idをcanvasのidに使用しており、特殊文字で描画不整合の可能性。

### 2.3 コンテナ、CI/CD、デプロイ、スクリプト

対象: `Dockerfile`、`fly.toml`、`.github/workflows/*`、`backup_database.sh`

#### 対応済みまたはPR化済み

- P0のバックアップ・インポート認証
- GitHub Actionsの `permissions: contents: read`
- `superfly/flyctl-actions/setup-flyctl@master` のSHA固定
- Poetryの `latest` 参照を固定バージョンへ変更
- バックアップスクリプトの `set -euo pipefail`、`umask 077`、ファイル列挙の堅牢化

#### 未対応

- Dockerfileのroot実行（P1）。Fly.ioの `/data` マウント権限を含むステージング検証が必要。
- `python:3.12-slim` のタグがダイジェスト固定でない（P2）。
- Actionsの他のタグ参照もSHA固定とDependabot導入を推奨。
- `/healthz` を利用したDocker/Fly.ioヘルスチェックが未定義（P3）。
- SQLiteボリュームのスナップショット・復旧方針が設定に現れていない（P3）。
- `backup_database.sh` の `--interval` 数値検証が未実施（P3）。

## 3. 依存関係監査

### 3.1 バックエンド

`pyproject.toml` と `poetry.lock` を確認しました。主要な直接依存はFastAPI、httpx、python-dotenv、aiosqliteです。未使用のpsycopgはPR #4で削除されています。

監査セッション間でスキャン結果に差異があります。

- backend監査: `pip-audit`でlockからエクスポートした55パッケージを確認し、既知脆弱性0件
- コンテナ/CI監査: `trivy`で `starlette`、`python-multipart`、`urllib3`、`python-dotenv` に2026年公開の脆弱性候補を検出したと報告

ツール、データベース、実行時点の差異が考えられるため、**この差異を解消するまで「脆弱性0件」と断定しません**。CI上で同一スキャンツール・同一lockfile・同一結果形式を固定し、FastAPI/Starletteの互換性を含めて再確認してください。特にStarletteのメジャー更新はFastAPI更新と回帰テストを伴う別PRに分離するのが安全です。

### 3.2 フロントエンド

package.jsonやlockfileは存在せず、CDN直参照です。PR #3でバージョン更新とSRI固定を実施済みですが、自動脆弱性監査の対象外である点は残ります。

## 4. ライセンス監査

- リポジトリルートにLICENSE/COPYING/NOTICEがなく、プロジェクト自身の利用条件が不明です。権利者が社内限定・独自ライセンス・OSSのどれを選ぶか決定してください。
- バックエンド依存は主にMIT、BSD、Apache、ISC、MPL、PSF等でした。未使用の `psycopg`（LGPL-3.0-only）は削除候補であり、PR #4で削除されています。
- フロントエンドのjQuery、Bootstrap、Chart.jsはMITです。第三者帰属表示を `THIRD_PARTY_NOTICES` 等に整理することを推奨します。
- SBOMツールではlockfileからライセンス情報を完全取得できず、依存ライセンス目録は未整備です。CI成果物としてSPDX SBOMとライセンス一覧を生成してください。

## 5. P0対応と統合方針

| PR | 内容 | 判断 |
|---|---|---|
| [PR #3](https://github.com/hitomisawamura-cognition/temp-master/pull/3) | CDN依存の更新とSRI | 採用候補 |
| [PR #4](https://github.com/hitomisawamura-cognition/temp-master/pull/4) | 管理API認証、CORS、入力検証、依存整理、運用修正 | PR #5と比較して採用候補 |
| [PR #5](https://github.com/hitomisawamura-cognition/temp-master/pull/5) | 管理API認証、CI/CD・スクリプト堅牢化 | PR #4と重複。単独採用または差分取り込みに限定 |

PR #3とPR #4はともに `index.html` を変更するため、同時マージ時の競合解消と、バックアップUIの認証方式を統合後に確認してください。PR #4とPR #5は同じP0を修正しており、両方をそのままマージしないでください。

マージ後の必須作業:

1. Fly.ioに強度の高い `ADMIN_TOKEN` を設定する。
2. 未設定時503、無効トークン401、正しいトークンで200となることをステージングで確認する。
3. 認証導入前に取得されたDBバックアップと書き込みログの有無を確認し、必要ならトークン・関連データをローテーションする。
4. 依存スキャン結果の差異をCIで解消する。

## 6. 監査の制約

- 本番Fly.ioへの攻撃的な検証、実環境のsecret・ボリューム権限・バックアップ実態の確認は行っていません。
- ローカル環境はPython 3.10で、プロジェクト指定のPython 3.12と一致しないため、親セッションではPoetry依存環境の再構築を実施していません。
- リポジトリ履歴全体のgitleaks等による秘密情報スキャンは未実施です。
- license-checkツール、hadolint、grypeは利用できず、ライセンスとコンテナ脆弱性の一部は静的確認と子セッション報告に基づきます。

## 7. 詳細な監査成果物

- [バックエンド監査PR #4](https://github.com/hitomisawamura-cognition/temp-master/pull/4)
- [フロントエンド監査PR #3](https://github.com/hitomisawamura-cognition/temp-master/pull/3)
- [コンテナ/CI監査PR #5](https://github.com/hitomisawamura-cognition/temp-master/pull/5)
