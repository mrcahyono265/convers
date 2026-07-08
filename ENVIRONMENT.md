# Environment Variables

## Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | JWT signing key (min 32 chars) | Generate with `openssl rand -hex 32` |
| `NVIDIA_API_KEY` | NVIDIA NIM API key | `nvapi-...` |

## Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Environment (`development`, `production`, `test`) |
| `NVIDIA_BASE_URL` | `https://integrate.api.nvidia.com/v1` | NVIDIA API base URL |
| `CORS_ORIGIN` | `*` | CORS allowed origin |

## File Locations

| File | Location | Purpose |
|------|----------|---------|
| `.env` | `server/` | Local development (gitignored) |
| `.env.example` | `server/` | Required variables template |
| `.env.development.example` | `server/` | Development defaults |
| `.env.production.example` | root | Production template (used with Docker) |

## Validation

Environment variables are validated at startup using Zod. If validation fails, the server exits with descriptive error messages listing all invalid/missing variables.

### JWT_SECRET Requirements

- Must be at least 32 characters
- Generate with: `openssl rand -hex 32`
- Use different secrets for development and production

## Docker Compose

### Development (`docker-compose.yml`)
- Uses `DB_PASSWORD` from environment (default: `postgres`)
- Requires `JWT_SECRET` and `NVIDIA_API_KEY`

### Production (`deploy/docker-compose.prod.yml`)
- All variables must be set explicitly
- `DATABASE_URL` must point to external PostgreSQL
- `CORS_ORIGIN` must be the production domain
