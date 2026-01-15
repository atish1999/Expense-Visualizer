# Local Development Setup Guide

This guide explains how to run FinTrack on your local machine.

## Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **PostgreSQL** v14 or higher

## Step 1: Download the Code

### Option A: Download ZIP from Replit
1. In your Replit workspace, click on the three dots menu (⋮) in the Files panel
2. Select "Download as ZIP"
3. Extract the ZIP file to your desired location

### Option B: Use Git (if connected)
```bash
git clone <your-repo-url>
cd fintrack
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Set Up PostgreSQL

### Install PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE fintrack;
CREATE USER fintrack_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE fintrack TO fintrack_user;
\q
```

## Step 4: Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Database connection
DATABASE_URL="postgresql://fintrack_user:your_password@localhost:5432/fintrack"

# Session secret (generate a random string)
SESSION_SECRET="your-random-secret-key-at-least-32-characters"

# Required for local development
REPL_ID="local-dev"
NODE_ENV="development"
```

### Generate a Secure Session Secret

You can generate a random secret using:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 5: Initialize the Database

Push the database schema:

```bash
npm run db:push
```

## Step 6: Handle Authentication (Important!)

This app uses **Replit Auth** which only works within the Replit environment. For local development, you have two options:

### Option A: Bypass Authentication (Recommended for Testing)

Create a file `server/auth-local.ts` with mock authentication:

```typescript
import { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";

// Mock user for local development
const MOCK_USER = {
  id: "local-dev-user",
  email: "dev@local.test",
  firstName: "Local",
  lastName: "Developer",
  profileImageUrl: null,
};

export async function setupAuth(app: Express) {
  // Create or get the mock user
  let user = await storage.getUser(MOCK_USER.id);
  if (!user) {
    user = await storage.upsertUser(MOCK_USER);
  }

  // Middleware to attach mock user to all requests
  app.use((req: Request, res: Response, next: NextFunction) => {
    req.user = user;
    next();
  });

  // Mock login route
  app.get("/api/login", (req: Request, res: Response) => {
    res.redirect("/");
  });

  // Mock logout route
  app.get("/api/logout", (req: Request, res: Response) => {
    res.redirect("/");
  });
}
```

Then update `server/index.ts` to use this file:
```typescript
// Change this line:
import { setupAuth } from "./auth";
// To this for local development:
import { setupAuth } from "./auth-local";
```

### Option B: Set Up Alternative Auth Provider

You can integrate a different auth provider like:
- **Auth0**
- **Clerk**
- **NextAuth.js** (adapted for Express)

This requires more configuration but provides production-ready auth.

## Step 7: Run the Application

### Development Mode
```bash
npm run dev
```

The app will be available at: **http://localhost:5000**

### Production Build
```bash
npm run build
npm start
```

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running: `pg_isready`
- Check your DATABASE_URL format
- Ensure the database and user exist

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000
# Kill the process
kill -9 <PID>
```

### Missing Dependencies
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### Schema Changes
After modifying `shared/schema.ts`:
```bash
npm run db:push
```

## Project Structure

```
fintrack/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utilities
│   │   └── pages/       # Page components
├── server/              # Express backend
│   ├── auth.ts          # Replit Auth (replace for local)
│   ├── routes.ts        # API endpoints
│   ├── storage.ts       # Database operations
│   └── index.ts         # Server entry point
├── shared/              # Shared types
│   └── schema.ts        # Drizzle ORM schema
└── .env                 # Environment variables (create this)
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm run db:push` | Push schema to database |

## Notes

- The Replit-specific features (Auth, managed database) won't work locally
- You'll need to handle your own database backups
- For production deployment outside Replit, consider services like Railway, Render, or Vercel + Neon

## Need Help?

If you encounter issues:
1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure PostgreSQL is running
4. Try clearing node_modules and reinstalling
