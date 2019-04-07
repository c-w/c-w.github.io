#!/usr/bin/env node
/* eslint no-console: "off" */

const fs = require('fs-extra');
const process = require('process');
const request = require('request-promise');
const yargs = require('yargs');

const argv = yargs
  .option('o', {
    alias: 'output',
    type: 'string',
    describe: 'Location where to store the Github contributions chart',
    coerce: arg => {
      if (process.env.FORCE_ASSET_REFRESH !== 'true' && fs.existsSync(arg)) {
        process.exit(0);
      }
      return arg;
    },
    demand: true,
  })
  .option('u', {
    alias: 'github-user',
    type: 'string',
    describe: 'The Github user for which to fetch the contributions chart',
    default: (process.env.TRAVIS_REPO_SLUG || '').split('/')[0],
    coerce: arg => {
      if (!arg) {
        throw new Error(`Must specify -u [github-user] or TRAVIS_REPO_SLUG environment variable`)
      }
      return arg;
    },
    demand: true,
  })
  .argv;

request({ uri: `https://ghchart.rshah.org/${argv.githubUser}`, encoding: null })
  .then(buffer => fs.writeFile(argv.output, buffer))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
