# Cube Voyage

https://cubevoyage.net

---

## アーキテクチャ

| 項目 | 内容 |
|---|---|
| フレームワーク | Astro 7（`output: 'static'`） |
| アダプタ | `@astrojs/cloudflare` |
| ホスティング | Cloudflare Workers（静的アセット配信 + Worker フォールバック） |
| 本文 | `src/content/**/*.md`（Astro Content Collections） |

```
src/
  assets/YYYY/MM/   ← 記事内で使用する画像（public/ には置かない）
  components/       ← Header / Footer / Breadcrumbs
  content/
    **/*.md         ← 各ページ本文（URL階層 = ディレクトリ構造）
  layouts/
    BaseLayout.astro
    DocPage.astro   ← Content Collection ページの共通レイアウト
  lib/
    site.ts         ← サイト定数（title/description・主要ナビ slug）
    nav.ts          ← 全 md の frontmatter からナビ/パンくず/子一覧を導出
    types.ts
  pages/
    [...slug].astro ← Content Collection の全エントリーを描画
    index.astro     ← ホーム（src/home.md の本文を埋め込む）
    404.astro
  home.md
  content.config.ts ← Content Collection スキーマ定義
  styles/global.css
public/
  robots.txt
```

---

## セットアップ

```bash
npm install
```

## 開発・ビルド

```bash
npm run dev       # 開発サーバー（http://localhost:4321）
npm run build     # dist/ に出力
npm run preview   # wrangler dev（Cloudflare Workers シミュレーションでプレビュー）
npm run deploy    # ビルド＋Cloudflare Workers デプロイ
```

---

## コンテンツの編集

本文は `src/content/**/*.md` を直接編集します（ファイル配置 = URL 階層）。

```
src/content/how-to-solve.md            → /how-to-solve/
src/content/how-to-solve/beginner.md   → /how-to-solve/beginner/
```

frontmatter 必須フィールド：

```yaml
---
title: "ページタイトル"
order: 2        # 兄弟ページ間のソート順（昇順）
---
```

ナビ・パンくず・子ページ一覧は `src/lib/nav.ts` が frontmatter とファイルパスから**ビルド時に自動導出**するため、md を追加・移動するだけで反映されます。

### 画像

記事内の画像は `src/assets/YYYY/MM/ファイル名` に置き、Markdown から相対パスで参照します。Astro の画像最適化（`imageService: 'compile'`）が有効なため、Sharp でビルド時に変換されます。カバー画像（`coverImage` frontmatter）は `<Image>` コンポーネント（`astro:assets`）で描画します。GIF はアニメーションを保持したまま通過します。

---

## Web アナリティクス（自前計測）

ファーストパーティ（自ドメイン）で計測します。第三者スクリプトゼロ・Cookie なし。
この方式を選んだ背景・検討した代替案は [ADR 0001](docs/adr/0001-web-analytics-first-party.md) を参照。

| 役割 | 実体 |
|---|---|
| 送信 | `BaseLayout.astro` から `src/scripts/analytics.ts` を読み込み → `navigator.sendBeacon('/api/hit', …)` |
| 収集 | `src/pages/api/hit.ts`（SSR）。D1 に記録（D1 バインドが無い環境では Workers Logs に出力） |
| 保存先 | D1 データベース `cubevoyage_analytics`（`wrangler.toml` でバインド済み・無料枠） |
| 閲覧 | `src/pages/admin/analytics.astro`（SSR・Basic 認証）→ D1 を直接クエリ |

記録項目：パス / リファラのホスト / 国（`cf-ipcountry`）/ デバイス（UA から desktop・mobile）/ 画面幅。
IP アドレスやユーザー識別子は保存しません。

### ダッシュボードの閲覧

`https://cubevoyage.net/admin/analytics/` にアクセスすると Basic 認証を求められる。
ユーザー名は任意、パスワードに `ANALYTICS_DASH_KEY`（下記で設定した値）を入力する。
キーは `Authorization` ヘッダで送られ URL には載らないため、ログ・ブラウザ履歴・Referer に漏れない。
API トークンは不要（Worker が D1 バインディングを直接クエリする）。

### セットアップ（別アカウントへデプロイする場合）

D1 バインディングは `wrangler.toml` に設定済み。別の Cloudflare アカウントへデプロイする際は、
同名の D1 を作成して `database_id` を差し替える：

```bash
npx wrangler d1 create cubevoyage_analytics
# 出力された database_id を wrangler.toml の [[d1_databases]] に反映
npx wrangler d1 migrations apply cubevoyage_analytics --remote   # migrations/ を適用
npx wrangler secret put ANALYTICS_DASH_KEY   # ダッシュボード閲覧用パスワード
npm run deploy
```

D1 バインドが無い環境では `/api/hit` は計測イベントを Cloudflare の **Workers Logs** に
`{"t":"pv","path":…}` 形式で出力する（ダッシュボード → Workers & Pages → 対象 Worker → Logs）。

---

## 動作確認のポイント

- 主要ページ・階層ナビ・パンくず・子ページ一覧が表示される
- ページ閲覧時に `/api/hit` へビーコンが飛ぶ（DevTools の Network で `hit` が 204）
