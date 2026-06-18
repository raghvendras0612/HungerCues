# Baby Tracker

A comprehensive baby tracking application for families — track feedings, sleep, growth, and more.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python 3.12) |
| Database | PostgreSQL 16 |
| Mobile | React Native (Expo SDK 52) |
| Auth | Firebase Authentication |
| Storage | Cloudflare R2 |
| AI | Gemma 4 (behind abstraction layer) |
| Infra | Docker, Hetzner VPS |

## Project Structure

```
apps/
├── backend/       # FastAPI REST API
├── mobile-app/    # Expo React Native app
└── web/           # Future web application

packages/
└── shared-types/  # TypeScript type definitions

docs/              # Architecture, API, and roadmap documentation
```

## Prerequisites

- **Node.js** >= 18
- **pnpm** >= 8
- **Python** >= 3.12
- **uv** (Python package manager)
- **Docker** & **Docker Compose**

## Quick Start

### 1. Install JS dependencies

```bash
pnpm install
```

### 2. Set up the backend

```bash
cd apps/backend
cp .env.example .env
uv sync
```

### 3. Start PostgreSQL

```bash
docker compose up db -d
```

### 4. Run the backend

```bash
cd apps/backend
uv run uvicorn app.main:app --reload
```

### 5. Run the mobile app

```bash
pnpm dev:mobile
```

## Documentation

- [Architecture](docs/architecture.md)
- [API Reference](docs/api.md)
- [Security](docs/security.md)
- [Product Roadmap](docs/product-roadmap.md)
