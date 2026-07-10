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

`cloudflareinsights.com` の JS ビーコンは広告ブロッカーにブロックされやすいため、
**ファーストパーティ（自ドメイン）での計測**に置き換えています。第三者ゼロ・Cookie なし・
Cloudflare Workers Analytics Engine の無料枠で完結します。

| 役割 | 実体 |
|---|---|
| 送信 | `BaseLayout.astro` のインラインビーコン → `navigator.sendBeacon('/api/hit', …)` |
| 収集 | `src/pages/api/hit.ts`（SSR）→ `WEB_ANALYTICS.writeDataPoint(…)` |
| 保存先 | Analytics Engine データセット `cubevoyage_web_analytics`（`wrangler.toml`） |
| 閲覧 | `src/pages/admin/analytics.astro`（SSR・要キー）→ Analytics Engine SQL API |

記録項目：パス / リファラのホスト / 国（`cf-ipcountry`）/ デバイス（UA から desktop・mobile）/ 画面幅。
IP アドレスやユーザー識別子は保存しません。

### ダッシュボードの初期設定

集計の読み出しには Cloudflare の API トークンが必要です（書き込みはバインディングのみで動作）。

```bash
# 権限「Account Analytics: Read」のトークンを作成して設定
wrangler secret put CF_ACCOUNT_ID       # Cloudflare のアカウント ID
wrangler secret put CF_API_TOKEN        # Account Analytics: Read 権限のトークン
wrangler secret put ANALYTICS_DASH_KEY  # 任意の閲覧用パスワード
```

設定後、`https://cubevoyage.net/admin/analytics/?key=<ANALYTICS_DASH_KEY>` で過去30日の集計を表示します。
データセットは初回のページビュー記録時に自動作成されます（反映まで数分かかる場合あり）。

> 補足：`sum(_sample_interval)` を使うため、サンプリングが効いても実数に補正されます。
> Grafana や `curl` で SQL API を直接叩くことも可能です。

---

## 動作確認のポイント

- 主要ページ・階層ナビ・パンくず・子ページ一覧が表示される
- ページ閲覧時に `/api/hit` へビーコンが飛ぶ（DevTools の Network で `hit` が 204）
