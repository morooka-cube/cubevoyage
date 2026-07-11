# ADR 0001: Web アナリティクスを Cloudflare 製から自前ファーストパーティ計測へ移行

- ステータス: Accepted
- 日付: 2026-07-10
- 関連: PR #34

## コンテキスト

サイトのアクセス計測に **Cloudflare Web Analytics**（`static.cloudflareinsights.com/beacon.min.js` の
クライアント側 JS ビーコン）を導入していたが、実データがほとんど計測されず「うまく動かない」状態だった。

原因はトークンや設定ではなく、**クライアント側 JS ビーコンという方式そのもの**にある。
`cloudflareinsights.com` は uBlock Origin などの標準フィルタでほぼ確実にブロックされる。
本サイトの読者層（スピードキューブ＝技術リテラシーの高い層）はブラウザ拡張の利用率が高く、
アクセスの相当数が計測から漏れていたと考えられる。これは GA / Plausible / Umami の素の導入でも
同様に起きる構造的な問題であり、本質的な解決には**ファーストパーティ（自ドメイン／サーバー側）計測**が必要だった。

前提となる技術構成:

- Astro（`output: 'static'`）を Cloudflare Workers にデプロイ（大半は静的アセット、一部ルートのみ SSR）
- デプロイは Cloudflare の Git 統合（Workers Builds）で自動実行

## 検討した選択肢

1. **原因を切り分けて Cloudflare Web Analytics を維持** — 方式起因のため改善余地が乏しい。却下。
2. **GoatCounter / Plausible 等のホスト型** — スクリプトが第三者ドメインのままだとブロックされ得る。
3. **Umami をファーストパーティ proxy** — 管理画面は良いが外部アカウント／セルフホストが必要。
4. **Cloudflare Workers Analytics Engine（AE）で自前計測** — 第三者ゼロ・Cookie なしで完結。当初これを採用。

当初は選択肢 4（AE）で実装したが、Git 統合のデプロイが
`10089 no_access_to_analytics_engine` で**即失敗**した。AE はアカウント側での有効化
（実質的に有料 Workers プラン）が前提で、無料枠だけでは利用できないことが判明した。
※ローカルの `wrangler deploy --dry-run` はアカウント権限を検証しないため通ってしまい、実デプロイで初めて露呈した。

## 決定

**追加リソースなしでデプロイできる、ファーストパーティ計測**に移行する。

- **送信**: `src/scripts/analytics.ts` のビーコンを `BaseLayout.astro` から読み込み、
  ページ読み込み時に `navigator.sendBeacon('/api/hit', …)` で自ドメインへ送信する。
- **収集**: `src/pages/api/hit.ts`（SSR エンドポイント）で受信。
  - D1 バインディング `ANALYTICS_DB` があれば D1 に記録する。
  - 無ければ `console.log` で **Workers Logs** に構造化出力する（既定・追加リソース不要）。
- **保存（任意・無料枠）**: D1 データベース `cubevoyage_analytics`（スキーマは `schema.sql`）。
- **閲覧（任意）**: `src/pages/admin/analytics.astro`（SSR・`?key=` 認証）が D1 を直接クエリして
  過去30日を集計表示する。API トークンは不要。
- **観測性**: `wrangler.toml` の `[observability]` で Workers Logs を有効化し、
  既定構成でも計測イベントを保存・閲覧できるようにする。

記録項目はパス / リファラのホスト / 国（`cf-ipcountry`）/ デバイス（UA から desktop・mobile）/ 画面幅のみ。
**IP アドレスやユーザー識別子は保存しない。Cookie も使わない。**

Analytics Engine は不採用とし、`wrangler.toml` では D1 バインディングを
コメントの雛形として残す（有効化はユーザーの任意操作）。

## 影響

### 良い点

- 自ドメイン受信のため広告ブロッカーに強く、計測漏れが大幅に減る。
- 第三者スクリプト・Cookie ゼロでプライバシー的にクリーン。
- 無料枠で完結。バインディングは `SESSION(KV)` / `ASSETS` のみとなり、既存の稼働構成と一致する
  → Git 統合デプロイがグリーンになる。
- 段階的に強化できる（既定はログ、必要なら D1 でダッシュボード、将来 AE へ戻すことも可能）。

### 割り切り・コスト

- 既定（ログのみ）では集計ダッシュボードがなく、Workers Logs を目視する形になる。
  本格的な集計には D1 の有効化（`wrangler d1 create` ＋ `schema.sql` 適用）という一手間が必要。
- 独自実装のため計測ロジックの保守は自分たちの責任になる。
- SSR エンドポイント（`/api/hit`）が増える。ただし計測失敗は握りつぶし、ページ体験には影響させない。

### フォローアップ

- D1 ダッシュボードを使う場合の手順は `README.md` の「Web アナリティクス」節を参照。
- 有料プランを有効化して AE 構成に戻す場合は本 ADR を Superseded とし、後続 ADR を作成する。
