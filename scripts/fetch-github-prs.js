#!/usr/bin/env node
/* eslint no-console: "off" */
/* eslint-env node */

const fetch = require('node-fetch');
const fs = require('fs-extra');
const last = require('lodash/last');
const process = require('process');
const yargs = require('yargs');

const argv = yargs
  .option('o', {
    alias: 'output',
    type: 'string',
    describe: 'Location where to store the Github PRs',
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
        throw new Error(
          `Must specify -u [github-user] or TRAVIS_REPO_SLUG environment variable`
        );
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
        throw new Error(
          `Must specify -t [github-token] or GITHUB_TOKEN environment variable`
        );
      }
      return arg;
    },
    demand: true,
  }).argv;

const fetchAllPullRequests = ({ cursor, fetchSize, results }) => {
  return fetch('https://api.github.com/graphql', {
    headers: {
      Authorization: `Bearer ${argv.githubToken}`,
      'User-Agent': `${argv.githubUser}.github.io`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      query: `
        query($username: String!, $cursor: String, $fetchSize: Int!) {
          user(login: $username) {
            pullRequests(
              first: $fetchSize,
              after: $cursor,
              states: [
                OPEN,
                MERGED
              ],
              orderBy: {
                field: CREATED_AT,
                direction: DESC
              }
            ) {
              edges {
                cursor
              }
              nodes {
                createdAt
                title
                state
                url
                repository {
                  owner {
                    login
                    avatarUrl
                  }
                  name
                  url
                }
              }
            }
          }
        }
      `,
      variables: {
        username: argv.githubUser,
        fetchSize,
        cursor,
      },
    }),
  })
    .then(response => response.json())
    .then(graphql => {
      const { edges, nodes } = graphql.data.user.pullRequests;

      nodes.forEach(node => results.push(node));

      return edges.length < fetchSize
        ? Promise.resolve()
        : fetchAllPullRequests({
            cursor: last(edges).cursor,
            fetchSize,
            results,
          });
    });
};

const pullRequests = [];
fetchAllPullRequests({ cursor: null, fetchSize: 100, results: pullRequests })
  .then(() => fs.writeFile(argv.output, JSON.stringify({ pullRequests })))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
