#!/usr/bin/env node
/* eslint no-console: "off" */
/* eslint-env node */

const fs = require('fs-extra');
const process = require('process');
const fetch = require('node-fetch');
const yargs = require('yargs');

const argv = yargs
  .option('o', {
    alias: 'output',
    type: 'string',
    describe: 'Location where to store the Github contributions chart',
    coerce: (arg) => {
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
    default: (process.env.GITHUB_REPOSITORY || '').split('/')[0],
    coerce: (arg) => {
      if (!arg) {
        throw new Error(
          `Must specify -u [github-user] or GITHUB_REPOSITORY environment variable`
        );
      }
      return arg;
    },
    demand: true,
  }).argv;

fetch(`https://ghchart.rshah.org/${argv.githubUser}`)
  .then((response) => response.text())
  .then((chart) => {
    if (!chart.includes('<svg ')) {
      console.error(chart);
      process.exit(2);
    }

    return fs.writeFile(argv.output, chart, 'utf-8');
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
