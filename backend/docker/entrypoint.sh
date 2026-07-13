#!/bin/sh
set -e

if [ ! -f /app/vendor/autoload.php ]; then
    composer install --no-interaction --prefer-dist
fi

if [ ! -f /app/.env ] && [ -f /app/.env.example ]; then
    cp /app/.env.example /app/.env
fi

exec "$@"
