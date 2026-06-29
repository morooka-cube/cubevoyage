# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # 開発サーバー起動（astro dev）
npm run build      # 静的サイトビルド（astro build）
npm run preview    # Cloudflare Workers シミュレーションでプレビュー（wrangler pages dev ./dist）
npm run deploy     # ビルド＋Cloudflare Pages デプロイ
```

テスト・lint コマンドは未設定。

## Architecture

**Cube Voyage** — スピードキューブ（ルービックキューブ）情報サイト。Astro 5 + Cloudflare Pages で構成。

### コンテンツ配置（最重要）

すべての本文は `src/content/**/*.md` に置く（Astro 5 Content Collections）。ファイルのパス階層がそのまま URL になる。

```
src/content/how-to-solve.md            → /how-to-solve/
src/content/how-to-solve/beginner.md   → /how-to-solve/beginner/
```

フロントマター必須フィールド：
```yaml
---
title: "ページタイトル"
order: 2        # 兄弟ページ間のソート順（昇順）
---
```

### ナビゲーション生成（`src/lib/pages.ts`）

ナビゲーション・パンくず・子ページ一覧は **frontmatter + ファイルパスからビルド時に自動導出**する。ナビ構成を変えたい場合はフロントマターの `order` を変えるか、ファイルを移動する。

- `primaryNav` — ヘッダー主要ナビ。`src/lib/site.ts` の `PRIMARY_SLUGS` で順序を制御
- `footerNav` — PRIMARY_SLUGS 以外のトップレベルページ
- `getChildren(path)` — 指定パスの直下子ページ一覧（order → path 昇順）
- `getBreadcrumb(path)` — パンくずリスト（現在ページを除く祖先）

### ページルーティング

- `src/pages/[...slug].astro` — Content Collection の全エントリーを `DocPage` レイアウトで描画
- `src/pages/index.astro` — トップページ（`src/home.md` の本文を埋め込む）
- `src/pages/teapot.astro` — Easter egg。`export const prerender = false` で SSR にし HTTP 418 を返す
- `src/pages/404.astro` — 404 ページ

### レイアウト

- `BaseLayout.astro` — `<html>`・`<head>`・SEO・OGP。全レイアウトの基底
- `DocPage.astro` — Content Collection ページ向け。パンくず・子ページ一覧を自動付与

### デプロイ構成

- ほぼ全ページ SSG（`output: 'static'`）
- teapot ルートのみ SSR（Cloudflare Worker）
- `public/_routes.json` で `/teapot` だけ Worker へルーティング
- `trailingSlash: 'ignore'` — 末尾スラッシュ有無どちらでもアクセス可

### 画像

**記事内で使用する画像はすべて `src/assets/` で管理する（`public/` には置かない）。**

- 配置先：`src/assets/YYYY/MM/ファイル名`（例：`src/assets/2024/03/cube.jpg`）
- Markdown からは相対パスで参照する
- Astro の画像最適化（`imageService: 'compile'`）を有効化済み。Sharp でビルド時に変換される
- カバー画像（`coverImage` frontmatter）は `<Image>` コンポーネント（`astro:assets`）で描画する
- Markdown インライン画像（`![]()` 構文）もビルド時に最適化される。GIF はアニメーションを保持したまま通過する
