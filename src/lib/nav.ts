// ナビゲーション・パンくず・子ページ一覧をビルド時に導出する。
// ファイル配置そのものが階層なので、親子情報は frontmatter に持たせない。
import type { PageMeta, NavNode } from "./types";
import { allPages } from "./collection";
import { PRIMARY_SLUGS } from "./site";

const byPath = new Map(allPages.map((p) => [p.path, p]));

// '/a/b/c/' → '/a/b/'（トップレベルは '/'）
function parentPath(path: string): string {
  const segs = path.replace(/^\/|\/$/g, "").split("/");
  segs.pop();
  return segs.length ? "/" + segs.join("/") + "/" : "/";
}

// 兄弟ソート: order 昇順 → path 昇順（menu_order 同値時の安定化）
function sortPages(a: PageMeta, b: PageMeta): number {
  return a.order - b.order || (a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
}

// 指定パス直下の子ページ（全タイプ）
export function getChildren(path: string): PageMeta[] {
  return allPages.filter((p) => parentPath(p.path) === path).sort(sortPages);
}

// パンくず: ルート直下〜親までの {path,title}（現在ページは含めない）
export function getBreadcrumb(path: string): { path: string; title: string }[] {
  const segs = path.replace(/^\/|\/$/g, "").split("/");
  const trail: { path: string; title: string }[] = [];
  let acc = "";
  for (let i = 0; i < segs.length - 1; i++) {
    acc += "/" + segs[i];
    const ancestor = byPath.get(acc + "/");
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
export const navTree: NavNode[] = buildTree("/");

// ヘッダー主要ナビ（PRIMARY_SLUGS の順）
export const primaryNav: NavNode[] = PRIMARY_SLUGS.map((slug) =>
  navTree.find((n) => n.path === "/" + slug + "/")
).filter((n): n is NavNode => !!n);

// フッターナビ（主要以外のトップレベル）
export const footerNav: NavNode[] = navTree.filter(
  (n) => !PRIMARY_SLUGS.includes(n.path.replace(/^\/|\/$/g, ""))
);
