# API Documentation

## Overview

The backend provides a RESTful API mounted at `/api/v1`.

## Authentication

All protected routes require a Bearer token in the Authorization header:
`Authorization: Bearer <firebase-id-token>`

## Endpoints (Placeholder)

Detailed endpoint documentation will be added here as features are implemented.

- `/api/v1/auth`
- `/api/v1/families`
- `/api/v1/babies`
- `/api/v1/feedings`
- `/api/v1/sleep`

## Error Handling

Standard HTTP status codes are used:
- `400 Bad Request` (Validation errors)
- `401 Unauthorized` (Missing or invalid token)
- `403 Forbidden` (Insufficient permissions)
- `404 Not Found`
- `500 Internal Server Error`
