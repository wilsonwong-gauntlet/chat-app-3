# Main Application Routes Analysis

## Overview
Protected routes for authenticated users containing the main application functionality.

## Structure
```
(main)/
├── layout.tsx           # Main layout wrapper
└── workspaces/         # Workspace routes
```

## Components

### layout.tsx
- Main layout wrapper
- Authentication protection
- Layout structure
- Provider integration

### workspaces/
- Workspace-specific routes
- Channel management
- Message handling
- Member management

## Architecture Pattern
1. Route group organization
2. Protected routes
3. Nested layouts
4. Authentication checks

## Implementation Details
- Next.js App Router
- Protected by Clerk auth
- Server components
- Layout composition 