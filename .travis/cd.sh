#!/usr/bin/env bash

set -o errexit

(
  cd "$(dirname "$0")/.."

  npm run build
  mv build.html index.html

  .travis/fetch-github-chart.sh
  .travis/commit-and-push.sh
)
