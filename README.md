# English Companion

AI-powered English learning app. Practice conversations, build vocabulary, and write journals with real-time AI feedback.

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Tanstack Query
- **Backend**: Hono (Bun), PostgreSQL (Drizzle ORM)
- **AI**: NVIDIA NIM (Llama 3.1)
- **Auth**: JWT (guest session or email/password registration, Bun.password bcrypt)

## Architecture

```
client/         → React SPA (components/, api/, types/)
server/         → Hono API (router → controller → service → repository)
  src/modules/  → auth, conversation, vocabulary, journal, dashboard
deploy/         → Nginx + certbot + production docker-compose
```

## Local Development

### Prerequisites
- PostgreSQL running locally
- Bun
- Node.js (for client)

### Setup

```bash
# Server env
cp server/.env.example server/.env
# Edit server/.env with DATABASE_URL and NVIDIA_API_KEY

# Install & run
cd server && bun install && bun run dev
cd client && npm install && npm run dev
```

Database migrations run automatically on server startup.

## Docker

```bash
docker compose up -d
```

## Production Deployment

```bash
# 1. Set up server with Docker + Nginx
cd deploy
cp .env.production.example .env
# Edit .env with production values

# 2. Run with SSL
docker compose -f docker-compose.prod.yml up -d
# Or manually: ./init-letsencrypt.sh
```

See `deploy/` for Nginx config (rate limiting, HTTPS, security headers) and init-letsencrypt script.
