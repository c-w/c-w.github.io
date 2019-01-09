#!/usr/bin/env bash

if [ -z "${GITHUB_TOKEN}" ]; then
  echo "Missing GITHUB_TOKEN environment variable" >&2
  exit 1
fi

git config --global user.name "Travis CI"
git config --global user.email "travis@travis-ci.org"

git checkout --orphan gh-pages
git ls-files -z | xargs -0 git rm --cached --force

git add github.svg favicon.ico index.html CNAME
git commit --message "Travis build ${TRAVIS_BUILD_NUMBER}"

user="$(git remote get-url origin | cut -d'/' -f4)"
repo="$(git remote get-url origin | cut -d'/' -f5)"
git remote add upstream "https://${GITHUB_TOKEN}@github.com/${user}/${repo}"
git push --force upstream gh-pages:master
