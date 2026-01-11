# FinTrack - Personal Finance Tracker

## Overview

FinTrack is a full-stack personal finance tracking application that allows users to track expenses, visualize spending patterns, and gain financial insights. The application features user authentication via Replit Auth, expense management with CRUD operations, statistical dashboards, and detailed financial analytics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state, React Context for local state (currency preferences)
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ES modules)
- **API Design**: RESTful endpoints under `/api/*` prefix
- **Authentication**: Replit Auth (OpenID Connect integration with Passport.js)
- **Session Management**: Express-session with PostgreSQL store (connect-pg-simple)

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema Location**: `shared/schema.ts` for shared types, `shared/models/auth.ts` for auth models
- **Migrations**: Drizzle Kit with `db:push` command

### Key Design Patterns
1. **Shared Types**: Schema definitions in `/shared` directory are imported by both frontend and backend, ensuring type safety across the stack
2. **API Contract Types**: Explicit request/response types defined alongside database schemas
3. **Storage Abstraction**: `IStorage` interface in `server/storage.ts` abstracts database operations
4. **Currency Formatting**: Client-side currency context handles multi-currency display (USD, EUR, INR)
5. **Protected Routes**: Authentication middleware (`requireAuth`) guards API endpoints

### Build System
- **Development**: Vite dev server with HMR, tsx for server
- **Production**: esbuild bundles server code, Vite builds client to `dist/public`
- **Build Script**: Custom `script/build.ts` handles both client and server builds

## External Dependencies

### Database
- PostgreSQL (required, connection via `DATABASE_URL` environment variable)
- Drizzle ORM for database operations
- connect-pg-simple for session storage

### Authentication
- Replit Auth (OpenID Connect)
- Passport.js with openid-client strategy
- Sessions stored in PostgreSQL `sessions` table

### Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session encryption
- `ISSUER_URL`: OpenID Connect issuer (defaults to Replit's OIDC)
- `REPL_ID`: Replit environment identifier

### Key NPM Packages
- Frontend: React, Wouter, TanStack Query, Recharts, date-fns, Radix UI
- Backend: Express, Passport, Drizzle ORM, pg, express-session
- Shared: Zod for validation, drizzle-zod for schema generation