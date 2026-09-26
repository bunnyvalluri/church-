# KCM Frontend State Management Architecture

## 1. State Boundaries & Scopes
- **Server State**: Managed via SWR and React Server Components for declarative caching, optimistic UI mutations, and automatic revalidation on focus.
- **Authentication State**: Encapsulated within [`useAuth`](file:///c:/K.C.M-Portal/frontend/hooks/useAuth.ts) providing unified session status (`loading`, `authenticated`, `unauthenticated`) across pages.
- **Offline Sync State**: Stored in IndexedDB and coordinated via [`useSync`](file:///c:/K.C.M-Portal/frontend/hooks/useSync.ts).
- **Transient UI State**: Isolated locally in React component hooks (`useState`, `useReducer`) to avoid unnecessary global re-renders.
