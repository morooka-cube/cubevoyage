// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://cubevoyage.net',
  // 既定は全ページSSG。teapot ルートのみ `export const prerender = false` で
  // オンデマンド(SSR)レンダリングし、Cloudflare 上で本物の HTTP 418 を返す。
  output: 'static',
  adapter: cloudflare({
    platformProxy: { enabled: true },
    imageService: 'compile',
  }),
  integrations: [
    sitemap({
      // teapot(noindex) はサイトマップから除外
      filter: (page) => !page.includes('/teapot'),
    }),
  ],
  redirects: {
    '/how-to-solve/beginner': '/how-to-solve/beginner-m2l/',
  },
  // 末尾スラッシュの有無を問わずアクセス可能にする
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  image: {
    domains: [],
  },
});
