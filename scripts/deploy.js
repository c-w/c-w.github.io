#!/usr/bin/env node
/* eslint no-console: "off" */

const fs = require('fs');
const ghpages = require('gh-pages');
const process = require('process');
const yargs = require('yargs');

const argv = yargs
  .option('d', {
    alias: 'directory',
    type: 'string',
    describe: 'Directory to deploy',
    coerce: arg => {
      if (!fs.lstatSync(arg).isDirectory()) {
        throw new Error(`${arg} is not a directory`);
      }
      return arg;
    },
    demand: true,
  })
  .option('t', {
    alias: 'github-token',
    type: 'string',
    describe: 'Github access token used for deployment',
    default: process.env.GITHUB_TOKEN,
    coerce: arg => {
      if (!arg) {
        throw new Error(`Must specify -t [github-token] or GITHUB_TOKEN environment variable`)
      }
      return arg;
    },
    demand: true,
  })
  .option('r', {
    alias: 'github-repo',
    type: 'string',
    describe: 'Github repository to which to deploy',
    default: process.env.TRAVIS_REPO_SLUG,
    coerce: arg => {
      if (!arg) {
        throw new Error(`Must specify -r [github-repo] or TRAVIS_REPO_SLUG environment variable`)
      }
      return arg;
    },
    demand: true,
  })
  .option('b', {
    alias: 'github-branch',
    type: 'string',
    describe: 'Github branch to which to deploy',
    default: 'master',
  })
  .option('commit-title', {
    type: 'string',
    describe: 'Title to attach to deployment commit',
    default: `Travis build ${process.env.TRAVIS_BUILD_NUMBER}`,
  })
  .option('commit-message', {
    type: 'string',
    describe: 'Message to attach to deployment commit',
    default: process.env.TRAVIS_BUILD_WEB_URL,
  })
  .option('commit-user', {
    type: 'string',
    describe: 'User to attach to deployment commit',
    default: 'Travis CI',
  })
  .option('commit-email', {
    type: 'string',
    describe: 'Email to attach to deployment commit',
    default: 'travis@travis-ci.org',
  })
  .argv;

ghpages.publish(argv.directory, {
  repo: `https://${argv.githubToken}@github.com/${argv.githubRepo}`,
  branch: argv.githubBranch,
  message: `${argv.commitTitle}\n\n${argv.commitMessage}`,
  user: {
    name: argv.commitUser,
    email: argv.commitEmail,
  },
  silent: true,
}, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
});
