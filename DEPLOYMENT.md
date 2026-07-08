# Deployment Guide

## Local Development

```bash
# Start PostgreSQL + app
docker compose up -d

# Run migrations
docker compose exec app bun run db:migrate
```

## Docker Compose (Development)

`docker-compose.yml` includes PostgreSQL and the app. Suitable for local development.

```bash
cp server/.env.development.example server/.env
docker compose up -d
```

## Docker Compose (Production)

`deploy/docker-compose.prod.yml` is a minimal compose for production. It assumes:
- External PostgreSQL database
- External reverse proxy (Nginx, Traefik, etc.)
- Shared Docker network named `convers-network`

### Setup

```bash
# 1. Create the shared network (if not exists)
docker network create convers-network

# 2. Set environment variables
export DATABASE_URL="postgresql://user:password@host:5432/english_companion"
export JWT_SECRET="$(openssl rand -hex 32)"
export NVIDIA_API_KEY="nvapi-..."
export CORS_ORIGIN="https://your-domain.com"

# 3. Deploy
cd deploy
docker compose -f docker-compose.prod.yml up -d
```

## AWS EC2 Deployment

### Prerequisites
- Ubuntu 22.04+ server
- Docker & Docker Compose installed
- PostgreSQL (RDS or self-managed)
- Domain with DNS pointing to server
- Nginx (or use the provided config)

### Steps

```bash
# 1. SSH into server
ssh ubuntu@your-server-ip

# 2. Clone repository
git clone https://github.com/your-org/convers.git
cd convers

# 3. Create shared network
docker network create convers-network

# 4. Set environment variables
export DATABASE_URL="postgresql://user:password@rds-endpoint:5432/english_companion"
export JWT_SECRET="$(openssl rand -hex 32)"
export NVIDIA_API_KEY="nvapi-..."
export CORS_ORIGIN="https://your-domain.com"

# 5. Deploy
cd deploy
docker compose -f docker-compose.prod.yml up -d

# 6. Set up Nginx reverse proxy
# Copy deploy/nginx.conf to /etc/nginx/nginx.conf
# Replace "your-domain.com" and SSL certificate paths
# Run deploy/init-letsencrypt.sh for SSL
```

## Nginx Reverse Proxy

The `deploy/nginx.conf` includes:
- HTTPS with SSL/TLS
- Rate limiting (30 req/s API, 10 req/m auth)
- Security headers (HSTS, X-Frame-Options, X-Content-Type-Options)
- Static file caching
- SPA fallback routing

## SSL with Let's Encrypt

```bash
cd deploy
chmod +x init-letsencrypt.sh
./init-letsencrypt.sh
```

## Health Check

The app exposes `/health` which returns:
```json
{
  "success": true,
  "status": "ok",
  "database": "connected",
  "environment": "production",
  "uptime": 12345,
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

## Logs

```bash
docker compose logs -f app
```

Logs are structured JSON via Pino.
