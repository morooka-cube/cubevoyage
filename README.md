# Cube Voyage

https://cubevoyage.net

---

## アーキテクチャ

| 項目 | 内容 |
|---|---|
| フレームワーク | Astro 5（`output: 'static'`） |
| アダプタ | `@astrojs/cloudflare` |
| ホスティング | Cloudflare Pages（静的配信 + Worker） |
| 本文 | `src/content/docs/**/*.md`（Astro 5 Content Collections） |

```
src/
  assets/YYYY/MM/   ← 記事内で使用する画像（public/ には置かない）
  components/       ← Header / Footer / Breadcrumbs / SectionNav
  content/
    docs/**/*.md    ← 各ページ本文（URL階層 = ディレクトリ構造）
  layouts/
    BaseLayout.astro
    DocPage.astro   ← Content Collection ページの共通レイアウト
  lib/
    site.ts         ← サイト定数（title/description/origin・主要ナビ slug）
    pages.ts        ← 全 md の frontmatter からナビ/パンくず/子一覧を導出
  pages/
    [...slug].astro ← Content Collection の全エントリーを描画
    index.astro     ← ホーム（src/home.md の本文を埋め込む）
    404.astro
  home.md
  content.config.ts ← Content Collection スキーマ定義
  styles/global.css
public/
  _routes.json / _headers / favicon*.png / robots.txt
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
npm run preview   # wrangler で dist/ をローカル配信（Worker 込み・418 を確認可）
npm run deploy    # ビルド＋Cloudflare Pages デプロイ
```

---

## コンテンツの編集

本文は `src/content/docs/**/*.md` を直接編集します（ファイル配置 = URL 階層）。

```
src/content/docs/how-to-solve.md            → /how-to-solve/
src/content/docs/how-to-solve/beginner.md   → /how-to-solve/beginner/
```

frontmatter 必須フィールド：

```yaml
---
title: "ページタイトル"
order: 2        # 兄弟ページ間のソート順（昇順）
---
```

ナビ・パンくず・子ページ一覧は `src/lib/pages.ts` が frontmatter とファイルパスから**ビルド時に自動導出**するため、md を追加・移動するだけで反映されます。

### 画像

記事内の画像は `src/assets/YYYY/MM/ファイル名` に置き、Markdown から相対パスで参照します。Astro の画像最適化は使わず素の `<img>` タグで扱います（`imageService: 'passthrough'`）。

---

## Cloudflare へのデプロイ

### 方法 A: Wrangler CLI（手早い）

```bash
npx wrangler login
npm run deploy
```

### 方法 B: Git 連携（自動デプロイ・推奨）

1. このリポジトリを GitHub 等へ push
2. Cloudflare ダッシュボード → **Workers & Pages → Create → Pages → Connect to Git**
3. ビルド設定:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Compatibility flags**: `nodejs_compat`
   - **Compatibility date**: `2025-06-01` 以降

---

## 動作確認のポイント

- 主要ページ・階層ナビ・パンくず・子ページ一覧が表示される
