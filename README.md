# Report Diffs Action

A Github action that reports visual differences between the base and head commit of pull requests by comparing user sessions replayed before and after the change.

Follow the instructions at https://app.meticulous.ai/docs to set this up on your repo.

## How to make a new `v1` release

1. Create a pull request to merge `main` into `releases/v1` -> [Click here to do so](https://github.com/alwaysmeticulous/report-diffs-action/compare/releases/v1...main)

2. Merge it as a `merge` commit (not `squashed` nor `rebased`)

3. [Draft a new release](https://github.com/alwaysmeticulous/report-diffs-action/releases/new)

   1. Set the next `v1.x.y` as a new tag
   2. Set `releases/v1` as the target
   3. Write release notes

4. Run `./scripts/move-v1-tag-to-latest-release.sh`
