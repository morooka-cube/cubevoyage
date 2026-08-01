// ビルド成果物（dist/）のスモークテスト。
// 依存パッケージ更新でルーティング・画像最適化・サイトマップ等が壊れていないかを検出する。
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";
import { PRIMARY_SLUGS, SITE } from "../src/lib/site";

const root = fileURLToPath(new URL("..", import.meta.url));
const clientDir = `${root}dist/client`;
const serverDir = `${root}dist/server`;
const contentDir = `${root}src/content`;

const read = (relPath: string) => readFileSync(`${clientDir}/${relPath}`, "utf8");

// src/content/**/*.md を再帰列挙し、URL パス（先頭・末尾スラッシュ付き）に変換する
function contentUrlPaths(dir = contentDir, prefix = ""): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) {
      return contentUrlPaths(`${dir}/${entry.name}`, `${prefix}${entry.name}/`);
    }
    if (!entry.name.endsWith(".md")) return [];
    return [`/${prefix}${entry.name.slice(0, -".md".length)}/`];
  });
}

beforeAll(() => {
  if (!existsSync(clientDir)) {
    throw new Error(
      "dist/ が見つかりません。`npm run build` を実行してからテストしてください。"
    );
  }
});

describe("ページ生成", () => {
  it("トップページにサイトタイトルと canonical が出力される", () => {
    const html = read("index.html");
    expect(html).toContain(`<title>${SITE.title}`);
    expect(html).toContain('<link rel="canonical" href="https://cubevoyage.net/">');
  });

  it("404 ページが生成される", () => {
    expect(existsSync(`${clientDir}/404.html`)).toBe(true);
  });

  it("すべての md がディレクトリ形式（末尾スラッシュ）で出力される", () => {
    const urlPaths = contentUrlPaths();
    expect(urlPaths.length).toBeGreaterThan(50);
    const missing = urlPaths.filter(
      (p) => !existsSync(`${clientDir}${p}index.html`)
    );
    expect(missing).toEqual([]);
  });

  it("主要ナビのリンクがヘッダーに出力される", () => {
    const html = read("index.html");
    for (const slug of PRIMARY_SLUGS) {
      expect(html).toContain(`href="/${slug}"`);
    }
  });

  it("下層ページにパンくずが出力される", () => {
    const html = read("how-to-solve/beginner-m2l/step1/index.html");
    expect(html).toContain('class="breadcrumbs"');
    expect(html).toContain('href="/how-to-solve"');
    expect(html).toContain('href="/how-to-solve/beginner-m2l"');
  });

  it("子ページ一覧が親ページに出力される", () => {
    const html = read("how-to-solve/index.html");
    expect(html).toContain('href="/how-to-solve/beginner-m2l"');
  });
});

describe("SSR ルート", () => {
  it("teapot は事前レンダリングされない", () => {
    expect(existsSync(`${clientDir}/teapot`)).toBe(false);
  });

  it("Worker（SSR エントリ）がビルドされる", () => {
    expect(existsSync(`${serverDir}/entry.mjs`)).toBe(true);
  });
});

describe("サイトマップ / robots", () => {
  it("sitemap が生成される", () => {
    expect(existsSync(`${clientDir}/sitemap-index.xml`)).toBe(true);
    expect(read("sitemap-0.xml")).toContain("<loc>https://cubevoyage.net/</loc>");
  });

  it("sitemap に teapot を含めない", () => {
    expect(read("sitemap-0.xml")).not.toContain("/teapot");
  });

  it("robots.txt が sitemap を指す", () => {
    expect(read("robots.txt")).toContain(
      "Sitemap: https://cubevoyage.net/sitemap-index.xml"
    );
  });
});

describe("Cloudflare 向け出力", () => {
  it("astro.config のリダイレクトが _redirects に出力される", () => {
    expect(read("_redirects")).toMatch(
      /^\/how-to-solve\/beginner\/\s+\/how-to-solve\/beginner-m2l\/\s+301$/m
    );
  });

  it("_astro/* に immutable な Cache-Control が付く", () => {
    const headers = read("_headers");
    expect(headers).toContain("/_astro/*");
    expect(headers).toContain("Cache-Control: public, max-age=31536000, immutable");
  });
});

describe("画像最適化", () => {
  const assets = () => readdirSync(`${clientDir}/_astro`);

  it("ビルド時に webp へ変換される", () => {
    expect(assets().filter((f) => f.endsWith(".webp")).length).toBeGreaterThan(100);
  });

  it("GIF はアニメーション保持のため gif のまま出力される", () => {
    expect(assets().some((f) => f.endsWith(".gif"))).toBe(true);
  });
});

describe("アナリティクス計測", () => {
  it("全ページ共通のビーコン送信先が埋め込まれる", () => {
    expect(read("index.html")).toContain("/api/hit");
    expect(read("how-to-solve/index.html")).toContain("/api/hit");
  });
});
