# 0006. Dependabot の minor/patch PR を CI 通過後に自動マージする

## ステータス

Accepted（2026-08-01）

## コンテキスト

ADR 0005 で CI（typecheck → build → test）が全 PR に対して自動実行されるようになった。
これにより Dependabot PR が壊れていないかは CI で機械的に確認できる一方、
マージ自体は引き続き人間が毎回手動で行っており、weekly で作られる npm-minor-patch /
github-actions グループ PR の確認・マージ作業が定常的な手間になっていた。

このリポジトリに required review（承認必須）の branch protection は設定されておらず、
過去の PR も無承認でマージされている。CI が通っていることを機械的に確認できれば、
人間の承認を介さずマージしても安全性は変わらない。

一方 major 更新（例: 開いている #54 の TypeScript 6→7）は破壊的変更を含み得るため、
CI だけでは互換性の全てを検証できない。ADR 0005 の決定どおり major は個別 PR のまま
人間のレビューを残す。

## 決定

`.github/workflows/dependabot-auto-merge.yml` を追加する。

- `dependabot[bot]` が作成した PR に対してのみ動作する
- `dependabot/fetch-metadata` で `update-type` を取得し、`semver-patch` /
  `semver-minor` の場合のみ `gh pr merge --auto` で GitHub 標準の auto-merge を有効化する
  （実際のマージは CI 通過後に GitHub 側で行われる）
- `update-type` が grouped PR 全体の最大の semver 変更を表すため、npm-minor-patch /
  github-actions の各グループ PR にもそのまま適用できる
- major 更新は対象外とし、従来どおり手動レビュー・手動マージのままとする

## 影響

- npm-minor-patch と github-actions のグループ PR は CI 通過のみでマージされ、
  weekly の手動マージ作業が不要になる
- major 更新 PR（TypeScript のメジャーアップデート等）は今までどおり手動対応が必要
- 将来 required review を有効化する場合、この自動マージは PR 承認を経ずに
  マージされる想定であるため、branch protection の設計と合わせて本 ADR を見直す
