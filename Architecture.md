# Ecosystem Architecture Blueprint

## Workspace Structure
- `/backend`: Decoupled business logic, Firebase configurations, and Gemma 4 service wrappers.
- `/mobile-app`: React Native cross-platform frontend targeting Android and iOS.
- `/web-platform`: Next.js / React web frontend application.

## Core Directives
1. Strictly decoupled layered architecture (UI must never talk directly to databases without a service wrapper).
2. Prioritize Expo/React Native packages with robust auto-linking to avoid breaking native build folders.
3. Enforce strict authorization checks on all data fetching (cross-reference session ID with resource owner ID).
4. **API Consistency:** All services must expose a standardized `query(params)` interface for data retrieval and `mutate(data)` for writes.