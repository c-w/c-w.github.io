#!/usr/bin/env node
/* eslint no-console: "off" */

const fs = require('fs-extra');
const path = require('path');
const process = require('process');
const request = require('request-promise');

const chartPath = path.join(__dirname, '..', 'src', 'github.svg');

if (process.argv.length >= 3 && process.argv[2] === '--if-missing' && fs.existsSync(chartPath)) {
  process.exit(0);
}

request({ uri: 'https://ghchart.rshah.org/c-w', encoding: null })
  .then(buffer => fs.writeFile(chartPath, buffer))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
