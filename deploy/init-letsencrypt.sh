#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: $0 your-domain.com"
  exit 1
fi

DOMAIN=$1
EMAIL="admin@$DOMAIN"
BASE_DIR="$(dirname "$0")"

echo "=== Initializing Let's Encrypt for $DOMAIN ==="

# Create directories
mkdir -p "$BASE_DIR/certbot/www"

# Stop any existing nginx
docker compose -f "$BASE_DIR/docker-compose.prod.yml" down nginx 2>/dev/null || true

# Start nginx with temp config for certbot
docker compose -f "$BASE_DIR/docker-compose.prod.yml" up -d nginx
sleep 2

# Run certbot
docker compose -f "$BASE_DIR/docker-compose.prod.yml" run --rm certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN"

# Reload nginx to use new certs
docker compose -f "$BASE_DIR/docker-compose.prod.yml" exec nginx nginx -s reload

echo ""
echo "=== Done! SSL certificates for $DOMAIN have been generated. ==="
echo "=== Certificates auto-renew every 12 hours via certbot container. ==="
