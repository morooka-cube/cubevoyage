// サイト全体の定数（ページ本文ではない site レベル設定）。
// ナビ・パンくず等のページ階層は frontmatter から src/lib/pages.ts が導出する。

export const SITE = {
  title: 'Cube Voyage',
  description:
    'ルービックキューブの速いそろえ方、解き方、最速攻略法、解法、スピードキューブ、LBL法など',
  origin: 'https://cubevoyage.net',
};

// ヘッダー(主要ナビ)に出すトップレベルページの slug（この順で表示）。
// それ以外のトップレベルページはフッターナビに回る。
export const PRIMARY_SLUGS = ['how-to-solve', 'speedcubing', 'officialevent'];
