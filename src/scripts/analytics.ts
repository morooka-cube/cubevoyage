// 自前 Web アナリティクスのビーコン送信（クライアント側）。
// ファーストパーティ・Cookie/追跡なし。/api/hit へ現在ページの情報を送る。
// BaseLayout の <script> から import して読み込む（ページ読み込み時に一度実行）。

interface PageviewPayload {
  p: string; // pathname
  r: string; // document.referrer
  w: number; // screen.width
}

function sendPageview(): void {
  try {
    const payload: PageviewPayload = {
      p: location.pathname,
      r: document.referrer || '',
      w: (window.screen && screen.width) || 0,
    };
    const body = JSON.stringify(payload);

    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/hit', body);
    } else {
      void fetch('/api/hit', { method: 'POST', body, keepalive: true });
    }
  } catch {
    // 計測失敗はページ体験に影響させない
  }
}

sendPageview();
