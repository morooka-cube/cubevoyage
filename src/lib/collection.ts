// src/content/**/* の frontmatter とエントリーID(=URL階層)から PageMeta を生成する。
import { getCollection } from "astro:content";
import type { PageMeta } from "./types";

const entries = await getCollection("docs");
export const allPages: PageMeta[] = entries.map((e) => ({
  path: "/" + e.id + "/",
  title: e.data.title,
  order: e.data.order ?? 0,
  coverImage: e.data.coverImage,
}));
