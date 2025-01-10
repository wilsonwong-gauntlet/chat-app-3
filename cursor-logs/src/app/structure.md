# App Directory Analysis

## Directory Structure
```
src/app/
├── (auth)/           # Authentication routes and components
├── (main)/           # Main application routes
├── api/             # API routes
├── layout.tsx       # Root layout
├── page.tsx         # Root page
├── globals.css      # Global styles
├── metadata.ts      # App metadata
└── favicon.ico      # App icon
```

## Key Components

### Route Groups
1. **(auth)/**
   - Authentication-related pages
   - Sign in/up flows
   - Protected by Clerk

2. **(main)/**
   - Main application pages
   - Workspace and channel views
   - Protected routes

3. **api/**
   - Backend API endpoints
   - RESTful services
   - WebSocket endpoints

### Core Files
- `layout.tsx`: Root layout with providers
- `page.tsx`: Landing page
- `globals.css`: Global Tailwind styles
- `metadata.ts`: SEO and app metadata

## Architecture Pattern
- Uses Next.js 13+ App Router
- Route groups for organization
- Server-first approach
- API routes for backend functionality 