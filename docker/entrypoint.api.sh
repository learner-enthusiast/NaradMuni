#!/bin/sh
set -eu

if [ -n "${DATABASE_URL:-}" ]; then
  echo "Running database migrations..."
  npx drizzle-kit migrate
fi

exec node dist/src/index.js
