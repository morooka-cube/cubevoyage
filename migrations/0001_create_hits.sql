-- 自前 Web アナリティクスの hits テーブル。
CREATE TABLE IF NOT EXISTS hits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,                       -- unix 秒
  path TEXT NOT NULL,
  referrer TEXT NOT NULL DEFAULT '',         -- 参照元ホスト（自サイト内遷移は空）
  country TEXT NOT NULL DEFAULT 'XX',        -- cf-ipcountry
  device TEXT NOT NULL DEFAULT 'desktop',    -- desktop / mobile
  width INTEGER NOT NULL DEFAULT 0           -- 画面幅
);
CREATE INDEX IF NOT EXISTS idx_hits_ts ON hits (ts);
