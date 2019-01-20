#!/usr/bin/env node

const cheerio = require('cheerio');
const fs = require('fs-extra');
const path = require('path');
const process = require('process');
const request = require('request-promise');

const getOpenGraphValue = ($, og) => {
  const node = $(`meta[property="og:${og}"]`).get(0);
  return node ? node.attribs.content.trim() : '';
}

const fetchPreviewInfo = (uri) => {
  return request({ uri, transform: cheerio.load })
    .then($ => {
      const title = getOpenGraphValue($, 'title');
      const image = getOpenGraphValue($, 'image');
      const description = getOpenGraphValue($, 'description');
      return image && (title || description)
        ? { uri, title, image, description }
        : null;
    });
};

const previewsPath = path.join(__dirname, '..', 'previews.json');

if (process.argv.length >= 3 && process.argv[2] === '--if-missing' && fs.existsSync(previewsPath)) {
  process.exit(0);
}

const indexPath = path.join(__dirname, '..', 'index.html');
const htmlContent = fs.readFileSync(indexPath, 'utf-8');
const $ = cheerio.load(htmlContent);

const previewLinks = $('a.preview').get().map(linkNode => linkNode.attribs.href);

Promise.all(previewLinks.map(fetchPreviewInfo))
  .then(previewInfos => {
    const previews = {};
    previewInfos.filter(info => info).forEach(({ uri, image, title, description }) => {
      previews[uri] = { image, title, description };
    });
    return fs.writeFile(previewsPath, JSON.stringify(previews, null, 2), { encoding: 'utf-8' });
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
