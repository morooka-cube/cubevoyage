import type { ImageMetadata } from "astro";

export interface PageMeta {
  path: string; // 先頭スラッシュ付き・末尾スラッシュなしの正規化URL（例: /speedcubing/4x4x4）
  title: string;
  order: number;
  coverImage?: ImageMetadata;
}

export interface NavNode {
  path: string;
  title: string;
  children: NavNode[];
}
