#/bin/bash
set -e
git fetch origin releases/v1
git tag --delete v1
git tag v1 origin/releases/v1
git push --tag --force
