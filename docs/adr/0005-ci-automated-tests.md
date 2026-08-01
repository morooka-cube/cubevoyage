# 0005. Dependabot PR を安全にマージするための CI 自動テスト

## ステータス

Accepted（2026-08-01）

## コンテキスト

依存パッケージの更新は Dependabot が weekly で PR を作る。しかしテスト・型チェック・
ビルドを自動実行する仕組みが無く、更新を取り込んで良いかどうかは人間がローカルで
`npm run build` を叩いて確認するしかなかった。実際、`@astrojs/cloudflare` の
メジャー更新でアダプタのオプション（`platformProxy`）が廃止されていたことに
気付けていなかった。

このサイトの本文は Markdown、表示ロジックはナビ導出（`src/lib/nav.ts`）と
Astro のビルドパイプライン（ルーティング・画像最適化・サイトマップ・
Cloudflare 向け `_redirects` / `_headers` 生成）に集中している。依存更新で壊れるのは
ほぼこのビルドパイプラインであり、単体テストだけでは検出できない。

テストランナーの選択肢として、Astro 公式が案内する `getViteConfig()`（`astro/config`）を
使って Vitest から `astro:content` を直接 import する構成を試したが、
`@astrojs/cloudflare` が注入する `vite-plugin-cloudflare` が Vitest のランナー環境と
衝突して起動しない（`depsOptimizer is required in dev mode`）。プラグインを名前で
除外する回避策は、依存更新でプラグイン名が変わるたびに CI が不可解に落ちるため、
「依存更新を安全に検証する」という目的と矛盾する。

## 決定

CI（GitHub Actions・`.github/workflows/ci.yml`）で **typecheck → build → test** を
push（main）と全 PR に対して実行する。

テストは 2 層に分ける。

1. **単体テスト**（`tests/nav-core.test.ts`）
   ナビ導出ロジックを Astro 非依存の純粋関数 `src/lib/nav-core.ts` に切り出し、
   固定のページ集合を渡して検証する。`src/lib/nav.ts` は `astro:content` から
   ページ一覧を取得して `buildNav()` に渡すだけの薄い層とする。
   これにより Vitest は素の `vitest/config` で動き、Astro/Cloudflare の
   Vite プラグイン構成に依存しない。

2. **ビルド成果物のスモークテスト**（`tests/build-output.test.ts`）
   `npm run build` 後の `dist/` を読んで検証する。全 md がディレクトリ形式で
   出力されているか、`/teapot` が事前レンダリングされていないか、sitemap・
   `_redirects`・`_headers`・画像最適化（webp 変換 / GIF 通過）・計測ビーコンが
   期待どおりかを確認する。Astro 本体・アダプタ・sitemap 統合・Sharp のいずれが
   壊れてもここで落ちる。

あわせて Dependabot に `github-actions` エコシステムを追加し、npm の minor / patch は
グループ化して 1 PR にまとめる（major は個別 PR のまま個別に検証する）。

## 影響

- Dependabot PR は CI が緑であることを確認してからマージできる。ブランチ保護で
  `typecheck / build / test` を必須チェックにすれば、緑でない更新はマージできない。
- ナビ導出ロジックの変更は `src/lib/nav-core.ts` に対して行う。`nav.ts` は
  Content Collections との接続のみを担い、ロジックを持たない。
- `tests/build-output.test.ts` は `dist/` が無いと失敗する。ローカルでは
  `npm run build && npm test` の順に実行する。
- ビルド成果物のスモークテストは HTML の文字列一致を含むため、マークアップを
  意図的に変えたときはテストの更新が必要になる。
- 型チェックを CI の必須ステップにするため、`astro check` が報告していた
  既存のエラー（廃止済みの `platformProxy` オプション、`env` のキャスト、
  `{'\n'}` 式のパースエラー）を解消した。
