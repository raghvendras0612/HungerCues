# Architecture

This document tracks the core architectural decisions for the Baby Tracker application.

## Tech Stack

| Layer | Choice |
|---|---|
| Backend | FastAPI (Python 3.12) |
| Python deps | uv |
| ORM / Migrations | SQLAlchemy + Alembic |
| Database | PostgreSQL |
| Mobile | React Native — Expo SDK 52 (managed) |
| JS package manager | pnpm workspaces |
| Auth | Firebase Authentication |
| Object storage | Cloudflare R2 |
| Push notifications | FCM |
| AI service | Gemma 4 (behind abstraction layer) |
| Infra | Docker + docker-compose, Hetzner VPS |
| Shared types | TypeScript interfaces in `packages/shared-types/` |
| Python linting | Ruff |
| JS/TS linting | ESLint + Prettier |

## Monorepo Layout

```
Baby-Tracker/
├── apps/
│   ├── backend/         # Python / FastAPI
│   ├── mobile-app/      # TS / Expo
│   └── web/             # Future web app
├── packages/
│   └── shared-types/    # TS interfaces mapped to Python Pydantic models
└── docs/                # Architecture and API documentation
```

## Core Principles

1. **Fast Iteration**: Prefer simple structures that are easy to work with over complex abstractions.
2. **AI-Assisted Development**: Architecture is structured to be easily understood and modified by AI coding tools.
3. **Low Cognitive Overhead**: Minimal tooling (Ruff + ESLint), minimal Docker (just DB + Backend).
4. **MVP Delivery Speed**: Only build what is needed for the first production release.
