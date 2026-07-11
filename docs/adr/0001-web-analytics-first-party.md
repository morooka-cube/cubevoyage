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
  - 無ければ `console.log` で **Workers Logs** に構造化出力する（追加リソース不要のフォールバック）。
- **保存（無料枠）**: D1 データベース `cubevoyage_analytics`（スキーマは `schema.sql`）。
  `wrangler.toml` でバインド済み。
- **閲覧**: `src/pages/admin/analytics.astro`（SSR）が D1 を直接クエリして過去30日を集計表示する。
  認証は **HTTP Basic 認証**（`ANALYTICS_DASH_KEY` を照合）。キーを URL に載せないことで
  Workers Logs・ブラウザ履歴・Referer への漏洩を避ける。API トークンは不要。
- **観測性**: `wrangler.toml` の `[observability]` で Workers Logs を有効化し、
  D1 バインドが無い環境でも計測イベントを保存・閲覧できるようにする。

記録項目はパス / リファラのホスト / 国（`cf-ipcountry`）/ デバイス（UA から desktop・mobile）/ 画面幅のみ。
**IP アドレスやユーザー識別子は保存しない。Cookie も使わない。**

Analytics Engine は不採用とし、代わりに D1 バインディングを `wrangler.toml` に設定する
（`database_id` はデプロイ先アカウントの D1 を指す）。

## 影響

### 良い点

- 自ドメイン受信のため広告ブロッカーに強く、計測漏れが大幅に減る。
- 第三者スクリプト・Cookie ゼロでプライバシー的にクリーン。
- 無料枠で完結。追加バインドは D1（無料枠）のみで、AE のような有料プラン前提のリソースを使わない
  → Git 統合デプロイがグリーンになる。
- D1 バインドが無い環境でも Workers Logs へフォールバックするため計測は落ちない。将来 AE へ戻すことも可能。

### 割り切り・コスト

- D1 データベースはデプロイ先アカウントに存在している必要がある（`wrangler d1 create` ＋ `schema.sql` 適用）。
  別アカウントへ移す場合は `database_id` の差し替えが要る。D1 バインドが無い環境では
  集計ダッシュボードは使えず、Workers Logs を目視する形になる。
- 独自実装のため計測ロジックの保守は自分たちの責任になる。
- SSR エンドポイント（`/api/hit`）が増える。ただし計測失敗は握りつぶし、ページ体験には影響させない。
- `/api/hit` は無認証の公開 write であり、現状オリジンチェック・レート制限・重複排除を持たない。
  第三者が任意の `{p,r,w}` を大量に POST すると、攻撃者が選んだ `path` / `width`（`device` は UA で偽装可能）
  の偽レコードで D1・ダッシュボード集計が汚染され、テーブルが無制限に肥大化しうる。
  記録内容は無害化済み（IP・識別子は保存しない）だが、計測値の信頼性と保存コストの観点でリスクが残る。

### フォローアップ

- D1 ダッシュボードを使う場合の手順は `README.md` の「Web アナリティクス」節を参照。
- `/api/hit` の濫用対策（`Sec-Fetch-Site` などのオリジンチェック、レート制限、bot 判定）は
  計測汚染・保存コストが問題化した時点で導入を検討する。現時点では未実装。
- 有料プランを有効化して AE 構成に戻す場合は本 ADR を Superseded とし、後続 ADR を作成する。
