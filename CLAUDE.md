# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # 開発サーバー起動（astro dev）
npm run build      # 静的サイトビルド（astro build）
npm run preview    # Cloudflare Workers シミュレーションでプレビュー（wrangler dev）
npm run deploy     # ビルド＋Cloudflare Workers デプロイ
```

テスト・lint コマンドは未設定。

## ドキュメント方針

**過去の経緯・意思決定の過程は ADR（`docs/adr/NNNN-*.md`）にのみ記述する。README やコードコメントには書かない。**

- README・コードコメントは「現在どうなっているか / どう使うか」だけを現在形で書く。
  「当初は〜だったが〜に変更した」「A と B を比較して C を選んだ」といった経緯・理由は書かない。
- 設計判断の背景・検討した代替案・却下理由・トレードオフは ADR に集約する。
  必要なら README/コメントから該当 ADR へリンクする（説明の再掲はしない）。
- ADR は連番（`0001` から）＋ Nygard 形式（ステータス / コンテキスト / 決定 / 影響）。
  過去の決定を覆す場合は当該 ADR を `Superseded` にして後続 ADR を追加する（既存 ADR は書き換えない）。

## 日時の扱い

**開発・運用で日時を扱うときは日本時間（JST, UTC+9）をデフォルトとする。** 経緯は ADR 0004 参照。

- 開発・ビルド（`npm run dev` / `npm run build` / `npm run deploy`）は `TZ=Asia/Tokyo` を設定済み。
- Cloudflare Workers ランタイム（SSR: `/api/hit`, `/admin/analytics`）は常に UTC で動作し `TZ` の
  影響を受けない。D1 に保存する `ts` は UTC unix epoch 秒のまま保持し、JST への変換は
  読み出し・集計クエリ側で行う（例: `date(ts, 'unixepoch', '+9 hours')`）。
- `/admin/analytics` の日別集計・表示は日本時間で行う。24 時間 / 7 日 / 30 日の相対集計は
  タイムゾーンに依存しないため UTC 基準の計算のままでよい。
- 新しく日時を扱うコードを書く場合もこの原則（保存は UTC、表示・集計は JST 変換）に従う。

## 開発ワークフロー

### プッシュ前のコードレビュー（必須）

**`git push` する前に、必ずサブエージェント（Task/Agent tool）でコードレビューを実施する。**

- 変更を commit したら、push の前に Agent tool でサブエージェントを起動し、その差分（`git diff`）をレビューさせる
- レビュー観点：バグ・不具合、可読性、このリポジトリの規約（上記 Architecture のルール、とくにコンテンツ配置と画像管理）への準拠
- サブエージェントが指摘した問題は、push 前に修正する（対応不要と判断した場合はその理由を明示する）
- レビューと必要な修正が完了してから、はじめて `git push` する

## Architecture

**Cube Voyage** — スピードキューブ（ルービックキューブ）情報サイト。Astro 7 + Cloudflare Workers で構成。

### コンテンツ配置（最重要）

すべての本文は `src/content/**/*.md` に置く（Astro Content Collections）。ファイルのパス階層がそのまま URL になる。

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
- teapot ルートのみ SSR（Cloudflare Workers 上でオンデマンドレンダリング）
- Cloudflare Workers の静的アセット配信はアセット未一致時に自動で Worker へフォールバックするため、`/teapot` のような非静的ルートは追加設定なしで Worker 側にルーティングされる（`wrangler.toml` に `pages_build_output_dir` は設定しない = Pages ではなく Workers 用の構成）
- `trailingSlash: 'always'` — 末尾スラッシュを必須にする

### 画像

**記事内で使用する画像はすべて `src/assets/` で管理する（`public/` には置かない）。**

- 配置先：`src/assets/YYYY/MM/ファイル名`（例：`src/assets/2024/03/cube.jpg`）
- Markdown からは相対パスで参照する
- Astro の画像最適化（`imageService: 'compile'`）を有効化済み。Sharp でビルド時に変換される
- カバー画像（`coverImage` frontmatter）は `<Image>` コンポーネント（`astro:assets`）で描画する
- Markdown インライン画像（`![]()` 構文）もビルド時に最適化される。GIF はアニメーションを保持したまま通過する
