# Cube Voyage

https://cubevoyage.net

---

## アーキテクチャ

| 項目 | 内容 |
|---|---|
| フレームワーク | Astro 7（`output: 'static'`） |
| アダプタ | `@astrojs/cloudflare`（`teapot` ルートのみ SSR） |
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
    teapot.astro    ← Easter egg（SSR で HTTP 418 を返す）
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
npm run preview   # wrangler dev（Cloudflare Workers シミュレーションでプレビュー・418 を確認可）
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

## 動作確認のポイント

- 主要ページ・階層ナビ・パンくず・子ページ一覧が表示される
