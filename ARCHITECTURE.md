# Architecture

## Overview

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Browser    │────▶│  Nginx Proxy │────▶│  Hono/App    │
│ React + Vite │     │  (optional)  │     │  Bun Runtime  │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                 │
                                          ┌──────▼───────┐
                                          │  PostgreSQL   │
                                          └──────────────┘
```

## Backend Architecture

```
server/src/
├── config/           # Environment validation (Zod)
├── database/         # Schema, connection, migrations
├── middleware/       # JWT authentication
├── modules/         # Feature modules
│   ├── ai/          # AI provider abstraction
│   │   └── providers/
│   │       ├── types.ts    # AiProvider interface
│   │       ├── nvidia.ts   # NVIDIA NIM implementation
│   │       └── registry.ts # Provider registry
│   ├── auth/        # Guest + email/password auth
│   ├── conversation/ # Chat sessions
│   ├── dashboard/   # Progress metrics
│   ├── journal/     # Daily journal + AI feedback
│   └── vocabulary/  # Word management
└── utils/           # Errors, response helpers, logger
```

### Module Pattern

Each module follows `Router → Service → Repository`:

- **Router**: Defines routes, validates input (Zod), calls service
- **Service**: Business logic, orchestrates operations
- **Repository**: Database queries (only for complex/reusable queries)

Controllers are only used when they add meaningful logic (request transformation, multi-service orchestration).

### AI Provider Abstraction

```typescript
interface AiProvider {
  name: string;
  chat(messages, options?): Promise<ChatResponse>;
  evaluatePractice(word, sentence): Promise<PracticeEvaluation>;
  evaluateJournal(content, prompt): Promise<JournalFeedback>;
}
```

NVIDIA is the default provider. Additional providers (OpenAI, Anthropic, etc.) can be added by implementing the `AiProvider` interface and registering in the registry.

## Frontend Architecture

```
client/src/
├── api/            # API client + endpoint modules
│   ├── client.ts   # Base fetch wrapper
│   ├── keys.ts     # React Query key constants
│   ├── auth.ts     # Auth endpoints
│   ├── chat.ts     # Chat endpoints
│   ├── journal.ts  # Journal endpoints
│   └── vocabulary.ts # Vocabulary endpoints
├── components/     # UI components
├── hooks/         # Custom hooks (useAuth)
├── types/         # TypeScript interfaces
└── App.tsx        # Root component + routing
```

## Data Flow

1. User interacts with React UI
2. API client sends request with JWT token
3. Hono middleware validates JWT
4. Router parses + validates input (Zod)
5. Service executes business logic
6. Repository queries database (Drizzle ORM)
7. AI provider generates responses (if needed)
8. Response returned with standard format: `{ success, ...data }`
