# ADR 0003: D1 の型付けを生成型へ、スキーマ管理を wrangler マイグレーションへ

- ステータス: Accepted
- 日付: 2026-07-11
- 関連: ADR 0001, ADR 0002

## コンテキスト

自前 Web アナリティクス（ADR 0001）の D1 アクセスには 2 つの運用上の弱点があった。

1. **型付け**: `src/pages/api/hit.ts` と `src/pages/admin/analytics.astro` の双方で、
   D1 の最小インターフェース（`D1Like` / `D1Prepared`）を手書き定義し、`env.ANALYTICS_DB` を
   `as` キャストで取り出していた。2 ファイルに重複があり、実際の D1 API（`first`・`batch` 等）とも乖離しうる。
2. **スキーマ管理**: スキーマは単一の `schema.sql` を `wrangler d1 execute --file` で手動適用する運用。
   適用履歴が DB に記録されず、差分変更（カラム追加など）を順序立てて安全に流す仕組みがない。
   二重適用・適用忘れは `IF NOT EXISTS` で凌いでいるだけだった。

ビルド構成上、`package.json` の dev/build/deploy スクリプトはすでに `wrangler types` を実行しており、
`wrangler.toml` のバインディングから `D1Database` 型付きの `Env`（`worker-configuration.d.ts`）が生成される。
また `wrangler` には D1 マイグレーション機能（`wrangler d1 migrations`）が組み込まれている。
どちらも既存ツールチェーンの範囲で、新規依存を増やさずに上記を解消できる。

## 検討した選択肢

1. **現状維持** — 手書き型の重複と手動スキーマ適用が残る。却下。
2. **Drizzle / Kysely 等の ORM・クエリビルダ導入** — 型安全なスキーマ・クエリ・マイグレーションを一括で得られるが、
   テーブルは `hits` 1 つ、読み取りは `unixepoch()` / `date(ts,'unixepoch')` / `SUM(CASE WHEN ...)` など
   SQLite 固有の集計が中心で raw SQL に逃げることになり、追加依存・ビルド複雑化に見合わない。テーブル増加・
   集計の複雑化が起きた時点で再検討する。
3. **既存ツールチェーンのみで改善（採用）** — 生成型 `D1Database` と `wrangler d1 migrations` を使う。

## 決定

- **型付け**: 手書きの `D1Like` / `D1Prepared` を削除し、`wrangler types` が生成する `D1Database` 型を使う。
  ADR 0002 の決定によりバインディングは常に存在する前提のため、`env.ANALYTICS_DB` はそのまま `D1Database`
  として受ける。シークレット `ANALYTICS_DASH_KEY` は `wrangler.toml` に現れず生成型に含まれないため、
  その 1 箇所のみキャストを残す。
- **スキーマ管理**: `schema.sql` を廃し、`migrations/0001_create_hits.sql` へ移す。
  `wrangler.toml` の D1 エントリに `migrations_dir = "migrations"` を明示する。
  適用は `wrangler d1 migrations apply cubevoyage_analytics --remote`。適用履歴は D1 内の
  管理テーブルで追跡される。以後のスキーマ変更は連番マイグレーションを追加する。

## 影響

### 良い点

- 手書き型の重複（2 ファイル・約 15 行）が消え、実際の D1 API と型が一致する。
- スキーマ変更がバージョン管理・履歴追跡され、差分適用が安全になる。二重適用・適用忘れの事故を防ぐ。
- 新規依存はなし。既存の `wrangler types` / `wrangler` 機能の範囲に収まる。

### 割り切り・コスト

- 既存の本番 D1 は `schema.sql` 適用済みのため、初回マイグレーションは `IF NOT EXISTS` により
  実質何もしない（`d1_migrations` に適用済みとして記録される）。
- ORM 導入は見送るため、集計クエリは引き続き raw SQL で書く。
