# AI Service Abstraction Layer

## Purpose

All AI integrations **must** go through this abstraction layer. This ensures that
the underlying AI provider can be replaced without changing business logic.

## Architecture

```
Mobile App
    ↓
FastAPI Backend (routers → services/domain)
    ↓
services/ai/ (this layer)
    ↓
AI Provider (Gemma 4, Llama, GPT, Claude, etc.)
```

## Rules

1. **No direct AI calls from routers or domain services.** All AI communication
   flows through modules in this directory.

2. **All inputs and outputs must be validated** using Pydantic models defined in
   `schemas.py`. Never pass raw/unvalidated data to or from an AI provider.

3. **Provider-specific code stays isolated.** If switching from Gemma to another
   provider, only files in this directory should need to change.

4. **Use `tenacity` for retry logic.** External AI services can fail — wrap calls
   with appropriate retry/backoff strategies.

5. **Use `httpx` for HTTP communication.** All external API calls should use the
   async httpx client.

## Future Files

```
ai/
├── __init__.py
├── schemas.py       # Input/output Pydantic models
├── client.py        # AI provider HTTP client
├── service.py       # High-level AI service methods
└── prompts.py       # Prompt templates (if needed)
```
