#!/usr/bin/env node
/* eslint no-console: "off" */

const Promise = require('bluebird');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const process = require('process');
const fetch = require('node-fetch');
const yargs = require('yargs');

fetch.Promise = Promise;

const argv = yargs
  .option('i', {
    alias: 'input',
    type: 'string',
    describe: 'HTML file for which to fetch link previews',
    coerce: arg => {
      if (!fs.lstatSync(arg).isFile()) {
        throw new Error(`${arg} is not a file`);
      }
      return arg;
    },
    demand: true,
  })
  .option('o', {
    alias: 'output',
    type: 'string',
    describe: 'Location where to store link previews file',
    coerce: arg => {
      if (process.env.FORCE_ASSET_REFRESH !== 'true' && fs.existsSync(arg)) {
        process.exit(0);
      }
      return arg;
    },
    demand: true,
  })
  .argv;

const getOpenGraphValue = ($, og) => {
  const node = $(`meta[property="og:${og}"]`).get(0);
  return node ? node.attribs.content.trim() : '';
}

const fetchPreviewInfo = (uri) => {
  return fetch(uri)
    .then(response => response.text())
    .then(html => {
      const $ = cheerio.load(html);
      const title = getOpenGraphValue($, 'title');
      const image = getOpenGraphValue($, 'image');
      const description = getOpenGraphValue($, 'description');
      return image && (title || description)
        ? { uri, title, image, description }
        : null;
    });
};

const htmlContent = fs.readFileSync(argv.input, 'utf-8');
const $ = cheerio.load(htmlContent);

const previewLinks = $('a.preview').get().map(linkNode => linkNode.attribs.href);

Promise.all(previewLinks.map(fetchPreviewInfo))
  .then(previewInfos => {
    const previews = {};
    previewInfos.filter(info => info).forEach(({ uri, image, title, description }) => {
      previews[uri] = { image, title, description };
    });
    return fs.writeFile(argv.output, JSON.stringify(previews, null, 2), { encoding: 'utf-8' });
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
