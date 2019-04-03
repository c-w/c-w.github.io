#!/usr/bin/env node

const ghpages = require('gh-pages');
const process = require('process');
const path = require('path');

if (!process.env.GITHUB_TOKEN) {
  console.error('Missing GITHUB_TOKEN environment variable');
  process.exit(1);
}

ghpages.publish(path.join(__dirname, '..', 'build'), {
  repo: `https://${process.env.GITHUB_TOKEN}@github.com/${process.env.TRAVIS_REPO_SLUG}`,
  branch: 'master',
  message: `Travis build ${process.env.TRAVIS_BUILD_NUMBER}\n\n${process.env.TRAVIS_BUILD_WEB_URL}`,
  user: {
    name: 'Travis CI',
    email: 'travis@travis-ci.org',
  },
  silent: true,
}, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
});
