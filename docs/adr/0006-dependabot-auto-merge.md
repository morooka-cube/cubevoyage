# 0006. Dependabot の minor/patch PR を CI 通過後に自動マージする

## ステータス

Accepted（2026-08-01）

## コンテキスト

ADR 0005 で CI（typecheck → build → test）が全 PR に対して自動実行されるようになった。
これにより Dependabot PR が壊れていないかは CI で機械的に確認できる一方、
マージ自体は引き続き人間が毎回手動で行っており、weekly で作られる npm-minor-patch /
github-actions グループ PR の確認・マージ作業が定常的な手間になっていた。

このリポジトリの branch protection は required review（書き込み権限者の承認 1 件以上）を
要求している。過去の PR が無承認でマージされているのは、リポジトリ管理者自身がこのルールを
bypass できる設定になっているため。Dependabot の自動マージを実行するのは管理者本人ではなく
GitHub Actions（`GITHUB_TOKEN` = `github-actions[bot]`）であり、この bypass の対象外のため、
`gh pr merge --auto` を有効化するだけでは承認待ちのまま止まる。

一方 major 更新（例: 開いている #54 の TypeScript 6→7）は破壊的変更を含み得るため、
CI だけでは互換性の全てを検証できない。ADR 0005 の決定どおり major は個別 PR のまま
人間のレビューを残す。

## 決定

`.github/workflows/dependabot-auto-merge.yml` を追加する。

- `dependabot[bot]` が作成した PR に対してのみ動作する
- `dependabot/fetch-metadata` で `update-type` を取得し、`semver-patch` /
  `semver-minor` の場合のみ以下を行う
  1. `gh pr review --approve` で `GITHUB_TOKEN`（`github-actions[bot]`）が承認を行い、
     required review の要件を満たす
  2. `gh pr merge --auto` で GitHub 標準の auto-merge を有効化する
     （実際のマージは CI 通過後に GitHub 側で行われる）
- `update-type` が grouped PR 全体の最大の semver 変更を表すため、npm-minor-patch /
  github-actions の各グループ PR にもそのまま適用できる
- major 更新は対象外とし、従来どおり手動レビュー・手動マージのままとする

## 影響

- npm-minor-patch と github-actions のグループ PR は CI 通過のみでマージされ、
  weekly の手動承認・手動マージ作業が不要になる
- major 更新 PR（TypeScript のメジャーアップデート等）は今までどおり人間の承認・手動対応が必要
- minor/patch の Dependabot PR に限り、人間の承認を経ずに `github-actions[bot]` の承認だけで
  マージされる。対象を広げる場合は本 ADR を見直す
