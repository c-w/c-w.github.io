#!/usr/bin/env bash

if curl --silent --fail "https://ghchart.rshah.org/c-w" > github.svg; then
  git add github.svg
fi
