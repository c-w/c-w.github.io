#!/usr/bin/env bash

if [ -z "${GITHUB_TOKEN}" ]; then
  echo "Missing GITHUB_TOKEN environment variable" >&2
  exit 1
fi

git config --global user.name "Travis CI"
git config --global user.email "travis@travis-ci.org"

git checkout --orphan gh-pages
git ls-files -z | xargs -0 git rm --cached --force

jq -r '.files | .[]' < .publishrc | xargs git add --force
git commit --message "$(printf "Travis build ${TRAVIS_BUILD_NUMBER}\n\n${TRAVIS_BUILD_WEB_URL}")"

user="$(git remote get-url origin | cut -d'/' -f4)"
repo="$(git remote get-url origin | cut -d'/' -f5)"
branch="$(jq -r '.branch' < .publishrc)"
git remote add upstream "https://${GITHUB_TOKEN}@github.com/${user}/${repo}"
git push --force upstream "gh-pages:${branch}"
