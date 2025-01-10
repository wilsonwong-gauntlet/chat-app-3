# Lib Directory Analysis

## Overview
Utility functions, configurations, and shared business logic.

## Core Files

### Database
- `db.ts`: Database client configuration
- `db/`: Database utilities and helpers
- `current-profile.ts`: User profile management
- `current-user.ts`: Current user utilities

### External Services
- `s3.ts`: AWS S3 configuration and utilities
- `pusher.ts`: Pusher real-time configuration

### Utilities
- `utils.ts`: Shared utility functions
- Database helpers in db/ directory

## Architecture Pattern
1. Centralized configuration
2. Service abstractions
3. Utility function organization
4. Clean separation of concerns

## Key Features
1. Database Management
   - Prisma client configuration
   - Database utilities
   - User management

2. External Services
   - S3 file storage
   - Pusher real-time
   - Service configuration

3. Utilities
   - Helper functions
   - Shared logic
   - Type utilities 