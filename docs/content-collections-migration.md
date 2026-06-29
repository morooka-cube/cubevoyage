# Content Collections 移行 設計書

> ステータス: **設計確定（実装未着手）**
> 対象: `src/pages/**/*.md`（ファイルベースルーティング）→ Astro 5 Content Collections への移行
> 関連: https://docs.astro.build/ja/guides/content-collections/

---

## 1. 背景・目的

現状、本文コンテンツは `src/pages/**/*.md` に置かれ、ファイル配置がそのまま URL 階層になる
ファイルベースルーティングで管理されている。ナビ・パンくず・子ページ一覧は
`src/lib/pages.ts` が `import.meta.glob` で frontmatter を読み、URL 階層から導出している。

これを Astro の **Content Collections** に移行し、

- frontmatter を **Zod スキーマで型安全**に検証する
- `getCollection()` ベースの整理された API に統一する
- 画像を **`public/` から `src/assets/` へ移し、コレクション管理対象に含める**
- ビルド時に **リンク切れ・孤立画像・frontmatter 不整合を検出**できるようにする

ことを目的とする。

### 非目的（やらないこと）

- **画像の最適化はしない。** astro:assets による sharp 変換・リサイズは行わず、GIF はそのまま出力する。
- URL 構造の変更はしない。**現行 URL を完全に維持**する（WordPress 互換・SEO/被リンク維持）。

---

## 2. 現状アーキテクチャ（移行前）

| 項目 | 現状 |
|---|---|
| md ファイル | `src/pages/**/*.md`（**159 ファイル**）。`type` は page 158 / post 1 |
| layout | 全 md が frontmatter `layout` で `DocPage.astro` を相対パス指定 |
| ルーティング | ファイルベース（`src/pages/a/b.md` → `/a/b/`） |
| ナビ導出 | `src/lib/pages.ts` が `import.meta.glob('/src/pages/**/*.md', {eager,import:'frontmatter'})` で同期構築 |
| 画像 | `public/wp-content/uploads/**`（**807 ファイル**）。本文・OGP から**絶対パス**参照 |
| 本文画像参照 | markdown `![]()` を含む **56 ファイル** / 生 `<img>` を含む **32 ファイル**（`<table>` ギャラリー含む） |
| 画像の共有 | 参照ユニーク **802 枚中 384 枚（48%）が複数ページから共有**（最多 9 ページ） |
| 設定 | `output: 'static'`、`trailingSlash: 'always'`、`build.format: 'directory'`、Cloudflare adapter、`imageService: 'compile'` |

### frontmatter 現状フィールド

```yaml
layout: "../../../layouts/DocPage.astro"   # 移行で削除
title: "F2Lの手順は覚えなくていい！？"
date: "2015-02-10"
order: 24
type: "page"                                # page | post
coverImage: "/wp-content/uploads/2015/02/I2.gif"
```

---

## 3. 確定方針（決定事項）

| # | 論点 | 決定 | 理由 |
|---|---|---|---|
| D1 | md の置き場 | `src/pages/**` → **`src/content/docs/**`**（階層・ファイル名維持） | コレクション化の基本。URL は動的ルートで再現 |
| D2 | ルーティング | **`src/pages/[...slug].astro`** 動的ルートで描画。URL 完全維持 | `entry.id` が現行 URL 階層に一致 |
| D3 | ナビ導出 | `import.meta.glob` → **`getCollection('docs')`** に `pages.ts` を書き換え（async 化） | コレクション API への統一 |
| D4 | 画像の置き場 | **`src/assets/**`** に `wp-content/uploads/` プレフィックスを除いて移動（`YYYY/MM/file` 構造を維持） | 48% 共有のため page bundle 不可。中央集約一択 |
| D5 | 本文画像の参照変換 | **remark プラグインは使わない。md ファイル内の参照パスを直接（相対パスに）書き換える** | ビルド時依存を増やさず、Astro 標準の markdown 画像処理に乗せる |
| D6 | 生 `<img>` の扱い | **案①: markdown 記法へ変換**（32 ファイル） | プレーン .md のまま全画像を src/assets 経由にできる。MDX 化を避ける |
| D7 | 画像最適化 | **しない**（GIF パススルー） | 対象はほぼアニメ GIF。最適化メリット小・アニメ破損リスク回避 |
| D8 | coverImage | schema の **`image()`** で型付け（相対パス参照に書き換え） | コレクション管理対象に含める。OGP は `.src` を使用 |

---

## 4. ディレクトリ構成（before → after）

```
# before
src/
  pages/
    how-to-solve/advanced/f2l-theory.md      # layout 付き、本文に /wp-content 参照
    ...（159 md）
  lib/pages.ts                                # import.meta.glob
public/
  wp-content/uploads/2015/02/I2.gif           # 807 画像

# after
src/
  content.config.ts                           # 追加: docs コレクション定義
  content/
    docs/
      how-to-solve/advanced/f2l-theory.md     # layout 削除、画像参照は相対パスに
      ...（159 md を移動）
  assets/
    2015/02/I2.gif                            # 807 画像を移動（wp-content/uploads/ プレフィックス除去）
  pages/
    [...slug].astro                           # 追加: 動的ルート
    index.astro / 404.astro                   # 残置（コレクション外）
  layouts/DocPage.astro                       # Props/OGP を微修正
  lib/pages.ts                                # getCollection ベースに改修
# public/wp-content は最終的に削除
```

> `home.md` / `hello-world.md`(唯一の post) / `index.astro` / `404.astro` の所属は移行ステップ 1 で個別判断（コレクションに入れるか pages 残置か）。

---

## 5. コレクション定義 `src/content.config.ts`

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const docs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/docs' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      order: z.number().default(0),
      type: z.enum(['page', 'post']).default('page'),
      date: z.coerce.date().optional(),
      // 画像をコレクション管理に含めるため image()。値は md からの相対パス。
      coverImage: image().optional(),
    }),
});

export const collections = { docs };
```

- `layout` フィールドは schema に含めない（全 md から削除する）。
- `image()` により `coverImage` は **string ではなく `ImageMetadata`** になる。OGP 出力箇所の修正が必要（§8.3）。

---

## 6. ルーティング `src/pages/[...slug].astro`

```astro
---
import { getCollection, render } from 'astro:content';
import DocPage from '../layouts/DocPage.astro';

export async function getStaticPaths() {
  const entries = await getCollection('docs');
  return entries.map((entry) => ({
    params: { slug: entry.id }, // 例: "how-to-solve/advanced/f2l-theory"
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
---
<DocPage frontmatter={entry.data}>
  <Content />
</DocPage>
```

- `trailingSlash: 'always'` + `build.format: 'directory'` により `entry.id` がそのまま現行 URL（末尾スラッシュ付きディレクトリ）に一致。
- ルート直下の特殊ページ（`index.astro`, `404.astro` 等）は `src/pages` に残置するため衝突しない。

---

## 7. `src/lib/pages.ts` 改修

ロジック（親子・パンくず・ソート・ナビツリー）は流用。**データ源と同期/非同期だけ変える。**

```ts
import { getCollection } from 'astro:content';

const entries = await getCollection('docs');

export const allPages: PageMeta[] = entries.map((e) => ({
  path: '/' + e.id + '/',          // 現 fileToPath 相当
  title: e.data.title,
  order: e.data.order ?? 0,
  type: e.data.type ?? 'page',
  coverImage: e.data.coverImage,   // 型が string → ImageMetadata に変わる
}));

// 以降の byPath / getChildren / getBreadcrumb / buildTree / navTree などは現行ロジックを流用
```

### 注意: 同期 export の async 化

現状 `pages.ts` は**トップレベルで同期的に** `import.meta.glob(..., {eager:true})` を実行し、
`navTree` / `primaryNav` / `footerNav` を**同期 export** している。`getCollection` は **async** のため、

- `pages.ts` をトップレベル `await` で初期化する（Astro コンポーネントの frontmatter は ESM top-level await 可）、または
- `navTree` 等を**関数化**して呼び出し側で `await` する

のいずれかが必要。**本移行で最も影響範囲の大きい構造変更点**なので、`pages.ts` を import している
全コンポーネント（`Header` / `Footer` / `NavTree` / `SectionNav` / `Breadcrumbs` / `DocPage`）の参照箇所を
合わせて確認する。

---

## 8. 画像移行

### 8.1 集約（D4）

`public/wp-content/uploads/**` を **`src/assets/**` へ `wp-content/uploads/` プレフィックスを除いて移動**。
`YYYY/MM/file` の日付階層構造はそのまま維持する。参照書き換えスクリプトは `/wp-content/uploads/YYYY/MM/file` を `../（深さ分）assets/YYYY/MM/file` に変換する。

### 8.2 本文画像の参照書き換え（D5・remark 不使用）

Astro 標準の markdown 画像処理は **`![]()` 記法の相対パス参照のみ**を import・出力対象にする。
そこで **md ファイル本文の参照パス自体を、絶対パスから「その md ファイルからの相対パス」に書き換える。**

```
# before（絶対パス・public 前提）
![](/wp-content/uploads/2015/02/Q2.gif)

# after（src/content/docs/how-to-solve/advanced/f2l-theory.md からの相対）
![](../../../../assets/2015/02/Q2.gif)
```

- 相対プレフィックス（`../` の数）は **md ファイルの階層深さで変わる**。
  例: `src/content/docs/how-to-solve/advanced/X.md` → `../../../../assets/...`
- 書き換えは **一度きりの移行スクリプト**で機械的に行う（各ファイルのパス深さから相対プレフィックスを算出し、
  `/wp-content/` 参照を置換）。手作業ではなくスクリプト化する（リンク切れを防ぐため）。
- 書き換え後は Astro が `src/assets` の画像を import・ビルド出力する。出力 URL は
  `/_astro/Q2.<hash>.gif` のハッシュ名になる（**画像 URL の互換性は捨てる**＝D7 で合意済み）。

### 8.3 生 `<img>` の変換（D6・案①）

生 `<img src="/wp-content/...">`（32 ファイル）は Astro の画像パイプラインを通らないため、
**markdown 記法 `![]()` に変換**してから §8.2 のパス書き換え対象に含める。

- 単純な `<img>` → `![alt](相対パス)` に置換。
- `<table>` ギャラリー（例: `history.md`, `f2l-theory.md` の 2 枚並べ）は
  markdown では表現しづらいため、**CSS クラス付きの図表マークアップ**（例: `<figure>`／グリッド用 div）に置換し、
  中の画像は `![]()`（相対パス）にする。レイアウト用 CSS を 1 つ用意して当てる。
- この 32 ファイルは個別確認が必要（自動化しきれない部分が残る）。

### 8.4 coverImage と OGP（D8）

- frontmatter の `coverImage` も `/wp-content/...` → **相対パス**に書き換える（§8.2 と同じ規則）。
  `image()` スキーマにより `entry.data.coverImage` は `ImageMetadata` になる。
- `DocPage.astro:21` の現行 OGP 生成は string 前提:

  ```ts
  // before
  const ogImage = frontmatter.coverImage?.startsWith('/') ? frontmatter.coverImage : undefined;
  ```

  これを `ImageMetadata` 対応に変更し、**絶対 URL 化**して渡す:

  ```ts
  // after（イメージ）: coverImage?.src は /_astro/... の相対 URL
  const ogImage = frontmatter.coverImage
    ? new URL(frontmatter.coverImage.src, Astro.site).toString()
    : undefined;
  ```

  OGP は絶対 URL 必須のため `Astro.site`（= `https://cubevoyage.net`）で解決する。

### 8.5 GIF・最適化に関する注意

- D7 により最適化はしないが、**Astro の markdown 画像処理は既定で画像を処理（再エンコード）し得る**。
  GIF のアニメーションが保持されるかは **ビルド成果物で必ず確認**する（移行ステップ 6）。
- 万一アニメ GIF が壊れる場合の**フォールバック**: 壊れる GIF のみ `public/` に残し絶対パス参照に戻す
  （= その画像だけ D4 の例外扱い）。設計上の退避策として明記しておく。

---

## 9. 影響・要対応チェックリスト

- ✅ **本文の URL 相対リンク**（`[…](../f2l-advanced)`, `[…](../)`）→ URL を完全維持するため**無修正で動作**。
- ⚠️ `DocPage.astro`: `Props` の `coverImage` 型（string→ImageMetadata）と OGP 生成（§8.3）。
- ⚠️ `pages.ts`: 同期 export の async 化（§7）。import 元コンポーネント全件の参照確認。
- ⚠️ 全 md からの `layout` 行削除。
- ⚠️ `src/lib/site.ts` の `TEAPOT_IMAGE`（`/wp-content/...` を直接参照）: teapot はコレクション外のため、
  この画像は **public に残す**か別途 import するか判断（§8 の集約対象から除外）。
- ⚠️ `astro.config.mjs`: `image.domains` 等は現状維持で可。`output: static` のまま。
- ⚠️ `sitemap` / `public/_routes.json` / `public/_headers`: 動的ルート化後も SSG のため出力 URL は不変。要ビルド確認。
- ⚠️ 画像出力 URL がハッシュ名（`/_astro/...`）に変わる: 外部から `/wp-content/...` 画像へ直リンクがある場合は 404 化（D7 で許容済み）。
- ⚠️ `home.md` / `hello-world.md`(post) の所属確定。

---

## 10. 移行ステップ（実装フェーズ）

1. **コレクション定義先行**: `src/content.config.ts` 追加（`image()` 含む schema）。型のみ先に検証。
2. **md 移動**: `src/pages/**/*.md` → `src/content/docs/**/*.md`。全ファイルの `layout` 行を一括削除。
   `index.astro`/`404.astro` 等は pages 残置。`home.md`/`hello-world.md` の所属を確定。
3. **動的ルート＋ナビ**: `src/pages/[...slug].astro` 追加。`pages.ts` を `getCollection`＋async に改修し、
   依存コンポーネントの参照を更新。
4. **第一次検証（画像は旧 public のまま）**: この時点では本文画像を `/wp-content/...` 絶対参照のまま通し、
   `astro dev` で **全 URL・ナビ・パンくず・子一覧・404** が現行と一致することを確認。
5. **画像集約＋参照書き換え**: `public/wp-content/uploads` → `src/assets/` へ `wp-content/uploads/` プレフィックスを除いて移動。
   移行スクリプトで本文の `/wp-content/...` 参照を相対パスに書き換え（§8.2）。
   生 `<img>`/`<table>` 32 ファイルを案①変換（§8.3）。`coverImage`／OGP 修正（§8.4）。
6. **第二次検証**: `astro build` で **リンク切れ・孤立画像・全 URL** を検証。
   Cloudflare preview（`wrangler pages dev ./dist`）で **GIF アニメ表示**を確認（§8.5）。
7. **クリーンアップ**: `public/wp-content` 削除（フォールバックで残す GIF があればそれだけ残す）。

---

## 11. リスク・未決事項

| 項目 | 内容 | 対応 |
|---|---|---|
| GIF アニメ破損 | markdown 画像処理が GIF を再エンコードしアニメが壊れる可能性 | ステップ 6 で確認、壊れるものは public 残置にフォールバック（§8.5） |
| `pages.ts` async 化の波及 | 同期 export 前提のコンポーネント全件に影響 | ステップ 3 で参照を全件洗い出し |
| 生 `<img>`/table 変換 | 32 ファイルは機械変換しきれず個別調整 | ステップ 5 で手当て、CSS クラスを 1 本用意 |
| 画像 URL 変更 | `/wp-content/...` → `/_astro/...` ハッシュ名。外部直リンクは 404 | D7 で許容。必要なら主要画像のみ `_redirects` 検討 |
| teapot 画像 | `TEAPOT_IMAGE` はコレクション外 | public 残置で確定（§9） |

---

## 付録: 確定ヒアリング結果

- 画像も含めて collection 管理対象にする（md だけでなく画像も）。
- 画像最適化は**不要**。`src/assets` への**集約のみ**。
- 参照変換は **remark プラグインを使わず**、md の画像参照パスを直接書き換える。
- 生 `<img>` は **案①（markdown 記法へ変換）**。
- 本ドキュメントは設計のみ。**実装は未着手。**
