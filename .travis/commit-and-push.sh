#!/usr/bin/env bash

if [ -z "${GITHUB_TOKEN}" ]; then
  echo "Missing GITHUB_TOKEN environment variable" >&2
  exit 1
fi

if git commit --message "Travis build ${TRAVIS_BUILD_NUMBER}" --author "Travis CI <travis@travis-ci.org>"; then
  git remote add upstream "https://${GITHUB_TOKEN}@github.com/c-w/c-w.github.io.git"
  git push upstream "${TRAVIS_BRANCH}"
fi
