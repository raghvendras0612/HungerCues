# Security Architecture

## Authentication

- **Provider**: Firebase Authentication is the sole source of truth for identity.
- **Tokens**: Clients obtain Firebase ID tokens.
- **Backend Verification**: The FastAPI backend verifies tokens using the Firebase Admin SDK.
- **User Sync**: A `firebase_uid` field in the PostgreSQL `User` table links the systems. This field must be unique and indexed.

## Authorization

- **Family Model**: All baby data belongs to a `Family`.
- **FamilyMember**: Users access a Family via the `FamilyMember` bridge table.
- **Roles**: `owner` or `member`. Determines permissions within the family context.
- **IDOR Prevention**: All API routes must verify the authenticated user has an active `FamilyMember` record for the requested resources.

## AI Service Security

- **Isolation**: AI services (Gemma) are placed behind an abstraction layer (`services/ai/`).
- **Validation**: All data sent to and received from the AI service must pass through strict Pydantic model validation to prevent injection or leaking of sensitive data.
