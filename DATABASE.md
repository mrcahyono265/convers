# Database Guide

## Stack

- **Database**: PostgreSQL 16
- **ORM**: Drizzle ORM v0.45
- **Migration**: Drizzle Kit
- **Connection**: postgres.js (via drizzle-orm/postgres-js)

## Schema

Located at `server/src/database/schema.ts`.

### Tables

| Table | Purpose |
|-------|---------|
| `users` | Registered and guest users |
| `conversation_sessions` | Chat sessions |
| `messages` | Individual messages in sessions |
| `conversation_memories` | User-specific AI memories |
| `vocabularies` | Words extracted from conversations |
| `journals` | Daily journal entries |
| `daily_progress` | Per-day learning metrics |

### Indexes
- `conversation_sessions`: userId
- `messages`: sessionId
- `conversation_memories`: userId
- `vocabularies`: (userId, word)
- `journals`: userId
- `daily_progress`: (userId, date)

## Migration Workflow

```bash
# 1. Make schema changes in schema.ts

# 2. Generate migration SQL
bun run db:generate
# Creates a new file in drizzle/ with timestamp prefix

# 3. Review the generated SQL
cat drizzle/0002_*.sql

# 4. Apply migration
bun run db:migrate
```

## Key Rules

- **Migrations never run automatically** on server startup
- Use `drizzle-kit generate` + `drizzle-kit migrate` only
- **Never use `drizzle-kit push`** in production — it's unsafe for existing databases
- Review generated SQL before applying

## Rollback

Drizzle Kit does not support automatic rollback. To revert:

1. Create a new migration that reverses the changes
2. Apply it with `bun run db:migrate`

Or restore from database backup.

## Backup

```bash
pg_dump -h localhost -U postgres english_companion > backup_$(date +%Y%m%d).sql
```

## Migration Safety

- All migrations are additive (no destructive changes unless explicitly written)
- The first migration (`0000_broad_lifeguard.sql`) creates the initial schema
- Foreign keys are indexed
- UUID primary keys prevent ID collision
