#!/bin/sh
set -eu

export NODE_OPTIONS="${NODE_OPTIONS:+$NODE_OPTIONS }--dns-result-order=ipv4first"

if [ -n "${DATABASE_URL:-}" ]; then
  echo "Running database migrations..."
  npx drizzle-kit migrate --config=drizzle.config.js
else
  echo "WARNING: DATABASE_URL is not set; skipping migrations."
fi

echo "Starting API server..."
exec node dist/src/index.js
