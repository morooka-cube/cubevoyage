// ナビゲーション・パンくず・子ページ一覧をビルド時に導出する。
// ファイル配置そのものが階層なので、親子情報は frontmatter に持たせない。
// 導出ロジックは nav-core.ts（Astro 非依存）にあり、ここは Content Collections との接続のみを担う。
import { getCollection } from "astro:content";
import type { PageMeta } from "./types";
import { buildNav } from "./nav-core";
import { PRIMARY_SLUGS } from "./site";

const entries = await getCollection("docs");
const allPages: PageMeta[] = entries.map((e) => ({
  path: "/" + e.id,
  title: e.data.title,
  order: e.data.order ?? 0,
  coverImage: e.data.coverImage,
}));

export const {
  getChildren,
  getTitle,
  getBreadcrumb,
  navTree,
  primaryNav,
  footerNav,
} = buildNav(allPages, PRIMARY_SLUGS);
