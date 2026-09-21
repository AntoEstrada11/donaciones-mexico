#!/bin/sh
set -e
mkdir -p /app/public/uploads/hero /app/.output/public/uploads/hero
node --experimental-strip-types server/database/migrate.ts
exec node .output/server/index.mjs
