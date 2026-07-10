import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

// ▼ 自前 Web アナリティクスの収集エンドポイント。
//    ファーストパーティ（自ドメイン）で受けるため広告ブロッカーに強い。
//    このルートのみ SSR（オンデマンド）で Worker 上で動作する。
export const prerender = false;

interface Beacon {
  p?: unknown; // pathname
  r?: unknown; // document.referrer
  w?: unknown; // screen.width
}

/** パスを正規化（先頭スラッシュ必須・クエリ/ハッシュ除去・長さ制限） */
function normalizePath(raw: unknown): string {
  if (typeof raw !== 'string' || raw.length === 0) return '/';
  let p = raw.split('?')[0].split('#')[0];
  if (!p.startsWith('/')) p = '/' + p;
  return p.slice(0, 512);
}

/** リファラをホスト名だけに縮約。自サイト内遷移・不正値は '' を返す */
function referrerHost(raw: unknown, selfHost: string): string {
  if (typeof raw !== 'string' || raw.length === 0) return '';
  try {
    const host = new URL(raw).host;
    return host === selfHost ? '' : host.slice(0, 128);
  } catch {
    return '';
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.text();
    let data: Beacon = {};
    if (body) {
      try {
        data = JSON.parse(body) as Beacon;
      } catch {
        /* 壊れたペイロードは無視 */
      }
    }

    const selfHost = new URL(request.url).host;
    const path = normalizePath(data.p);
    const referrer = referrerHost(data.r, selfHost);
    const country = (request.headers.get('cf-ipcountry') || 'XX').slice(0, 8);
    const ua = request.headers.get('user-agent') || '';
    const device = /Mobi|Android|iPhone|iPad|iPod/i.test(ua) ? 'mobile' : 'desktop';
    const width = typeof data.w === 'number' && isFinite(data.w) ? data.w : 0;

    // Analytics Engine へ 1 ページビューを記録。
    // 集計時は sum(_sample_interval) を使うとサンプリング補正済みの実数になる。
    env.WEB_ANALYTICS?.writeDataPoint({
      blobs: [path, referrer, country, device],
      doubles: [width],
      indexes: [path.slice(0, 96)], // サンプリングキー（ページ単位）
    });
  } catch {
    /* 計測失敗はユーザー体験に影響させない */
  }

  // ビーコンなので本文は不要。204 で即応答する。
  return new Response(null, { status: 204 });
};

// sendBeacon が使えない環境からの GET フォールバック等は受け付けない。
export const GET: APIRoute = () => new Response(null, { status: 405 });
