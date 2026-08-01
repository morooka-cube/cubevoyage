// ナビゲーション導出のロジック本体（Astro 非依存の純粋関数）。
// astro:content からのデータ取得は nav.ts が担当し、ここはページ一覧を受け取って
// ナビ・パンくず・子ページ一覧を組み立てるだけにする。
import type { PageMeta, NavNode } from "./types";

// '/a/b/c' → '/a/b'（トップレベルは '/'）
export function parentPath(path: string): string {
  const segs = path.slice(1).split("/");
  segs.pop();
  return segs.length ? "/" + segs.join("/") : "/";
}

// 兄弟ソート: order 昇順 → path 昇順（order 同値時の安定化）
export function sortPages(a: PageMeta, b: PageMeta): number {
  return a.order - b.order || (a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
}

export interface Nav {
  getChildren(path: string): PageMeta[];
  getTitle(path: string): string | undefined;
  getBreadcrumb(path: string): { path: string; title: string }[];
  navTree: NavNode[];
  primaryNav: NavNode[];
  footerNav: NavNode[];
}

export function buildNav(
  allPages: PageMeta[],
  primarySlugs: readonly string[]
): Nav {
  const byPath = new Map(allPages.map((p) => [p.path, p]));

  // 指定パス直下の子ページ（全タイプ）
  function getChildren(path: string): PageMeta[] {
    return allPages.filter((p) => parentPath(p.path) === path).sort(sortPages);
  }

  // 任意パスのページタイトルを取得（末尾スラッシュの有無を許容）。該当ページがなければ undefined
  function getTitle(path: string): string | undefined {
    const normalized = path.length > 1 ? path.replace(/\/+$/, "") : path;
    return byPath.get(normalized)?.title;
  }

  // パンくず: ルート直下〜親までの {path,title}（現在ページは含めない）
  function getBreadcrumb(path: string): { path: string; title: string }[] {
    const segs = path.replace(/\/$/, "").slice(1).split("/");
    const trail: { path: string; title: string }[] = [];
    let acc = "";
    for (let i = 0; i < segs.length - 1; i++) {
      acc += "/" + segs[i];
      const ancestor = byPath.get(acc);
      if (ancestor) trail.push({ path: ancestor.path, title: ancestor.title });
    }
    return trail;
  }

  function buildTree(path: string): NavNode[] {
    return getChildren(path).map((p) => ({
      path: p.path,
      title: p.title,
      children: buildTree(p.path),
    }));
  }

  // 全トップレベルのツリー
  const navTree = buildTree("/");

  // ヘッダー主要ナビ（primarySlugs の順）
  const primaryNav = primarySlugs
    .map((slug) => navTree.find((n) => n.path === "/" + slug))
    .filter((n): n is NavNode => !!n);

  // フッターナビ（主要以外のトップレベル）
  const footerNav = navTree.filter((n) => !primarySlugs.includes(n.path.slice(1)));

  return { getChildren, getTitle, getBreadcrumb, navTree, primaryNav, footerNav };
}
