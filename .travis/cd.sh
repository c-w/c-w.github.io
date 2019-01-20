#!/usr/bin/env bash

set -o errexit

(
  cd "$(dirname "$0")/.."

  npm run build
  mv build.html index.html

  .travis/fetch-github-chart.js
  .travis/fetch-previews.js
  .travis/commit-and-push.sh
)
