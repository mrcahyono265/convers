# Architecture Document

# English Companion

Version: 1.0 (MVP)

---

# Purpose

This document defines the technical architecture of English Companion.

The architecture should prioritize:

* Simplicity
* Maintainability
* Scalability
* Developer Experience
* Strong TypeScript support
* Clear separation of responsibilities

The MVP is developed by a single developer.

The architecture should remain easy to understand and easy to extend.

---

# Architecture Principles

## Keep It Simple

Always prefer simple solutions over complex abstractions.

Avoid unnecessary design patterns.

Avoid premature optimization.

---

## Feature First

Organize code by business features instead of technical layers.

Avoid creating generic folders that grow without ownership.

---

## AI is a Core Engine

AI is not a standalone feature.

Conversation, vocabulary, writing, journal, and recommendations all use the same AI Engine.

Business logic should never directly communicate with the AI provider.

---

## Business Logic First

Business rules belong inside services.

Controllers should only receive requests and return responses.

Repositories should only communicate with the database.

---

# Technology Stack

## Frontend

* React
* TypeScript
* Vite
* React Router
* Tailwind CSS
* shadcn/ui
* Zustand
* TanStack Query
* Motion
* Lucide Icons
* vite-plugin-pwa

---

## Backend

* Bun
* Hono

---

## Database

PostgreSQL

Hosted on Render.

---

## ORM

Drizzle ORM

---

## AI Provider

Primary

NVIDIA NIM

The provider implementation must remain replaceable.

Future providers may include

* OpenAI
* Gemini
* OpenRouter

without changing application logic.

---

## Deployment

Render

Services

* Static Site
* Web Service
* PostgreSQL

Everything should be deployed from Render for operational simplicity.

---

# Project Structure

```text
english-companion/

client/
│
├── src/
│
├── public/
│
└── vite.config.ts

server/
│
├── src/
│
├── drizzle/
│
└── package.json

docs/

README.md
```

---

# Frontend Structure

```text
src/

app/

assets/

components/

hooks/

layouts/

lib/

providers/

routes/

stores/

types/

utils/

features/

    home/

    conversation/

    vocabulary/

    journal/

    progress/

    settings/
```

Every feature owns its own

* components
* hooks
* services
* types
* pages

Example

```text
conversation/

components/

hooks/

services/

types/

pages/
```

Avoid putting feature-specific code inside global folders.

---

# Backend Structure

```text
src/

config/

database/

middlewares/

modules/

shared/

types/

utils/
```

Each module owns its own logic.

Example

```text
conversation/

controller.ts

service.ts

repository.ts

router.ts

schema.ts

types.ts
```

Modules

* conversation
* vocabulary
* journal
* progress
* learning
* ai
* user
* settings

---

# High-Level Architecture

```text
                React PWA
                     │
                     │
              REST API (HTTPS)
                     │
                     ▼
              Bun + Hono Server
                     │
      ┌──────────────┴──────────────┐
      │                             │
      ▼                             ▼
 PostgreSQL                  NVIDIA NIM
```

---

# Backend Layer

Every request follows the same architecture.

```text
Request

↓

Router

↓

Controller

↓

Service

↓

Repository / AI Engine

↓

Response
```

Responsibilities

Router

Maps HTTP routes.

Controller

Handles HTTP requests and responses.

Service

Contains business logic.

Repository

Handles database operations.

AI Engine

Communicates with NVIDIA NIM.

---

# Feature Modules

## Conversation

Responsible for

* chat sessions
* message history
* conversation feedback
* AI interaction

---

## Vocabulary

Responsible for

* vocabulary management
* review sessions
* mastery tracking

---

## Journal

Responsible for

* journal entries
* AI review
* writing history

---

## Progress

Responsible for

* streaks
* statistics
* dashboards
* learning metrics

---

## Learning

Responsible for

* grammar analysis
* recommendation generation
* adaptive learning

---

## AI

Responsible for

* provider integration
* prompt composition
* response parsing
* metadata extraction

---

# AI Engine

Business modules never communicate directly with NVIDIA NIM.

Flow

```text
Conversation Service

↓

AI Engine

↓

Prompt Builder

↓

NVIDIA NIM

↓

Response Parser

↓

Conversation Service
```

This allows changing providers without changing application logic.

---

# Database Tables

users

conversation_sessions

messages

conversation_memories

journals

vocabularies

vocabulary_reviews

daily_progress

settings

learning_reports

---

# API Design

Use REST.

Response format

Success

```json
{
    "success": true,
    "data": {}
}
```

Failure

```json
{
    "success": false,
    "message": "",
    "errors": []
}
```

---

# API Endpoints

Conversation

POST /conversation

POST /conversation/feedback

GET /conversation/history

Vocabulary

GET /vocabulary

POST /vocabulary/review

Journal

GET /journal

POST /journal

Progress

GET /progress

GET /dashboard

Settings

GET /settings

PATCH /settings

---

# State Management

Use Zustand for

* UI state
* Theme
* Current conversation
* Local preferences

Use TanStack Query for

* API requests
* Server cache
* Mutations

Never store server state inside Zustand.

---

# Validation

Use Zod

Frontend

* Form validation

Backend

* Request validation
* Response validation

Never trust client input.

---

# Offline Strategy

The application should remain usable without internet.

Offline

* Dashboard
* Vocabulary
* Progress
* Journal history
* Cached conversations

Online

* AI Conversation
* Grammar Feedback
* Journal Review
* Learning Recommendation

Display graceful fallback messages when AI is unavailable.

---

# Error Handling

Every endpoint should

* return proper HTTP status
* return structured errors
* avoid exposing internal exceptions

Log errors internally.

Never expose stack traces.

---

# Logging

Development

Readable logs.

Production

Structured logs.

Never log

* API keys
* Database credentials
* Sensitive user data

---

# Environment Variables

Backend

```env
DATABASE_URL=

NVIDIA_API_KEY=

NVIDIA_BASE_URL=

NODE_ENV=
```

Frontend

```env
VITE_API_URL=
```

Secrets must never be exposed to the frontend.

---

# Performance

Use route-based code splitting.

Lazy load pages.

Cache API requests when appropriate.

Avoid unnecessary re-renders.

Optimize PWA assets.

---

# Coding Standards

* Strict TypeScript
* Functional components
* Small reusable components
* Custom hooks
* Feature isolation
* Strong typing
* No duplicated logic

Avoid

* any
* giant components
* magic strings
* deeply nested conditionals

---

# Naming Convention

Components

ConversationCard.tsx

Hooks

useConversation.ts

Stores

useConversationStore.ts

Services

conversation.service.ts

Repositories

conversation.repository.ts

---

# Scalability

Future features should become new modules instead of modifying existing ones.

Examples

* Voice Conversation
* Speech-to-Text
* Listening Practice
* Reading Practice
* Grammar Lessons
* AI Quiz Generator

The architecture should evolve by adding modules, not rewriting existing ones.

---

# Engineering Principles

Prefer readability over cleverness.

Keep modules loosely coupled.

Keep responsibilities focused.

Separate business logic from infrastructure.

Treat AI as an application engine, not as application logic.

Every architectural decision should support one goal:

**Make English Companion easy to maintain, easy to extend, and enjoyable to build over time.**
