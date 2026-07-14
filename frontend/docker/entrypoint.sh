#!/bin/sh
set -e

if [ ! -d /app/node_modules ] || [ ! -f /app/node_modules/.package-lock.json ]; then
    npm ci
fi

exec "$@"
