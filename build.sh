#!/bin/bash
set -e

npm run build
npm install -g .
dashboard

