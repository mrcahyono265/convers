# English Companion

AI-powered English learning app. Practice conversations, build vocabulary, and write journals with real-time AI feedback.

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Tanstack Query
- **Backend**: Hono (Bun), PostgreSQL (Drizzle ORM)
- **AI**: NVIDIA NIM (Llama 3.1) — provider abstraction allows other providers
- **Auth**: JWT (guest session or email/password, Bun.password bcrypt)
- **Logging**: Pino structured logging

## Quick Start

### Prerequisites
- [Bun](https://bun.sh) >= 1.3
- [Node.js](https://nodejs.org) >= 20
- PostgreSQL running locally (or Docker)

### Setup

```bash
# 1. Server environment
cp server/.env.development.example server/.env
# Edit server/.env with DATABASE_URL and NVIDIA_API_KEY

# 2. Install & run migrations
cd server && bun install
bun run db:migrate

# 3. Start backend
bun run dev

# 4. In another terminal — start frontend
cd client && npm install && npm run dev
```

Open http://localhost:5173

## Project Structure

```
├── client/                 # React SPA
│   ├── src/
│   │   ├── api/            # API client + endpoint modules
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Custom hooks
│   │   └── types/          # TypeScript types
│   └── package.json
├── server/                 # Hono API backend
│   ├── src/
│   │   ├── config/         # Environment validation (Zod)
│   │   ├── database/       # Schema, migration, connection
│   │   ├── middleware/     # JWT auth middleware
│   │   ├── modules/
│   │   │   ├── ai/         # AI provider abstraction
│   │   │   ├── auth/       # Authentication (guest, register, login)
│   │   │   ├── conversation/ # Chat sessions & messages
│   │   │   ├── dashboard/  # Progress metrics
│   │   │   ├── journal/    # Daily journal with AI feedback
│   │   │   └── vocabulary/ # Word management
│   │   └── utils/          # Errors, response helpers, logger
│   └── package.json
├── deploy/                 # Production deployment files
│   ├── docker-compose.prod.yml
│   ├── nginx.conf
│   └── init-letsencrypt.sh
├── docker-compose.yml      # Development compose (includes PostgreSQL)
└── Dockerfile              # Multi-stage production build
```

## Scripts

### Server (cd server)

| Script | Description |
|--------|-------------|
| `bun run dev` | Start dev server with hot reload |
| `bun run test` | Run tests (Vitest) |
| `bun run db:generate` | Generate Drizzle migration SQL |
| `bun run db:migrate` | Apply Drizzle migrations |
| `bun run db:migrate:run` | Run migrations programmatically |

### Client (cd client)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Typecheck + build for production |
| `npm run lint` | Run oxlint |

## Environment Files

| File | Purpose |
|------|---------|
| `server/.env` | Local development (gitignored) |
| `server/.env.example` | Required variables template |
| `server/.env.development.example` | Development defaults |
| `.env.production.example` | Production environment template |

## Migration Workflow

```bash
# After changing schema.ts:
bun run db:generate     # Generate SQL in drizzle/
bun run db:migrate      # Apply to database
```

Migrations are never run automatically on server startup.
