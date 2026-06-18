# Baby Tracker — Backend

FastAPI REST API for the Baby Tracker application.

## Stack

- **Runtime**: Python 3.12
- **Framework**: FastAPI
- **ORM**: SQLAlchemy (async)
- **Migrations**: Alembic
- **Database**: PostgreSQL 16
- **Auth**: Firebase Admin SDK (server-side JWT verification)
- **Package Manager**: uv

## Setup

```bash
# Install dependencies
uv sync

# Copy environment variables
cp .env.example .env

# Run database migrations
uv run alembic upgrade head

# Start development server
uv run uvicorn app.main:app --reload
```

## Project Structure

```
app/
├── main.py           # FastAPI app factory
├── config.py         # Environment configuration
├── database.py       # Database connection
├── dependencies/     # Request dependencies (auth, etc.)
├── models/           # SQLAlchemy models
├── schemas/          # Pydantic request/response schemas
├── routers/          # API route handlers
│   └── v1/           # Versioned endpoints (/api/v1/*)
├── services/         # Business logic
│   ├── ai/           # AI integration layer
│   └── domain/       # Domain services
├── jobs/             # Background tasks
└── utils/            # Helper utilities
```

## API Versioning

All endpoints are mounted under `/api/v1/`:

```
/api/v1/auth
/api/v1/families
/api/v1/babies
/api/v1/feedings
/api/v1/sleep
```
