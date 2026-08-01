import { describe, expect, it } from "vitest";
import { buildNav, parentPath, sortPages } from "../src/lib/nav-core";
import type { PageMeta } from "../src/lib/types";

const page = (path: string, title: string, order = 0): PageMeta => ({
  path,
  title,
  order,
});

// ナビ導出の検証用ページ集合（実コンテンツとは独立）
const pages: PageMeta[] = [
  page("/how-to-solve", "そろえ方", 1),
  page("/how-to-solve/beginner", "初級", 2),
  page("/how-to-solve/advanced", "上級", 1),
  page("/how-to-solve/beginner/step1", "ステップ1", 1),
  page("/speedcubing", "スピードキューブ", 2),
  page("/officialevent", "公式大会", 3),
  page("/contact", "問い合わせ", 9),
  page("/about", "このサイトについて", 9),
  // 親ページ（/orphan）が存在しない孤立ページ
  page("/orphan/child", "孤児", 1),
];

const PRIMARY = ["how-to-solve", "speedcubing", "officialevent"];
const nav = buildNav(pages, PRIMARY);

describe("parentPath", () => {
  it("1 階層上のパスを返す", () => {
    expect(parentPath("/a/b/c")).toBe("/a/b");
    expect(parentPath("/a/b")).toBe("/a");
  });

  it("トップレベルの親は '/'", () => {
    expect(parentPath("/a")).toBe("/");
  });
});

describe("sortPages", () => {
  it("order 昇順、同値なら path 昇順", () => {
    const sorted = [
      page("/b", "B", 2),
      page("/c", "C", 1),
      page("/a", "A", 1),
    ].sort(sortPages);
    expect(sorted.map((p) => p.path)).toEqual(["/a", "/c", "/b"]);
  });
});

describe("getChildren", () => {
  it("直下の子だけを order 順で返す（孫は含めない）", () => {
    expect(nav.getChildren("/how-to-solve").map((p) => p.path)).toEqual([
      "/how-to-solve/advanced",
      "/how-to-solve/beginner",
    ]);
  });

  it("トップレベルは '/' で取得できる", () => {
    expect(nav.getChildren("/").map((p) => p.path)).toEqual([
      "/how-to-solve",
      "/speedcubing",
      "/officialevent",
      "/about",
      "/contact",
    ]);
  });

  it("子がなければ空配列", () => {
    expect(nav.getChildren("/how-to-solve/advanced")).toEqual([]);
  });
});

describe("getTitle", () => {
  it("パスからタイトルを引ける", () => {
    expect(nav.getTitle("/how-to-solve")).toBe("そろえ方");
  });

  it("末尾スラッシュ付きでも引ける", () => {
    expect(nav.getTitle("/how-to-solve/")).toBe("そろえ方");
    expect(nav.getTitle("/how-to-solve//")).toBe("そろえ方");
  });

  it("存在しないパスは undefined", () => {
    expect(nav.getTitle("/nope")).toBeUndefined();
    expect(nav.getTitle("/")).toBeUndefined();
  });
});

describe("getBreadcrumb", () => {
  it("祖先だけを浅い順に返し、現在ページは含めない", () => {
    expect(nav.getBreadcrumb("/how-to-solve/beginner/step1")).toEqual([
      { path: "/how-to-solve", title: "そろえ方" },
      { path: "/how-to-solve/beginner", title: "初級" },
    ]);
  });

  it("末尾スラッシュ付きでも同じ結果", () => {
    expect(nav.getBreadcrumb("/how-to-solve/beginner/")).toEqual([
      { path: "/how-to-solve", title: "そろえ方" },
    ]);
  });

  it("トップレベルページは空", () => {
    expect(nav.getBreadcrumb("/how-to-solve")).toEqual([]);
  });

  it("実体のない祖先はスキップする", () => {
    expect(nav.getBreadcrumb("/orphan/child")).toEqual([]);
  });
});

describe("navTree", () => {
  it("階層構造を再帰的に組み立てる", () => {
    const howToSolve = nav.navTree.find((n) => n.path === "/how-to-solve");
    expect(howToSolve?.children.map((c) => c.path)).toEqual([
      "/how-to-solve/advanced",
      "/how-to-solve/beginner",
    ]);
    const beginner = howToSolve?.children.find(
      (c) => c.path === "/how-to-solve/beginner"
    );
    expect(beginner?.children.map((c) => c.path)).toEqual([
      "/how-to-solve/beginner/step1",
    ]);
  });
});

describe("primaryNav / footerNav", () => {
  it("primaryNav は PRIMARY_SLUGS の順に並ぶ（order ではなく）", () => {
    expect(nav.primaryNav.map((n) => n.path)).toEqual([
      "/how-to-solve",
      "/speedcubing",
      "/officialevent",
    ]);
  });

  it("primaryNav は実在しない slug を無視する", () => {
    const partial = buildNav(pages, ["speedcubing", "missing"]);
    expect(partial.primaryNav.map((n) => n.path)).toEqual(["/speedcubing"]);
  });

  it("footerNav は主要ナビ以外のトップレベルページ", () => {
    expect(nav.footerNav.map((n) => n.path)).toEqual(["/about", "/contact"]);
  });

  it("primaryNav と footerNav は重複しない", () => {
    const primary = new Set(nav.primaryNav.map((n) => n.path));
    expect(nav.footerNav.some((n) => primary.has(n.path))).toBe(false);
  });
});
