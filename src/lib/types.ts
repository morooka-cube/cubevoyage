import type { ImageMetadata } from "astro";

export interface PageMeta {
  path: string; // 先頭・末尾スラッシュ付きの正規化URL（例: /speedcubing/4x4x4/）
  title: string;
  order: number;
  coverImage?: ImageMetadata;
}

export interface NavNode {
  path: string;
  title: string;
  children: NavNode[];
}
