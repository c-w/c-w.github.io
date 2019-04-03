#!/usr/bin/env bash

set -o errexit

(
  cd "$(dirname "$0")/.."

  npm run build

  .travis/fetch-github-chart.js
  .travis/fetch-previews.js
  .travis/commit-and-push.sh
)
