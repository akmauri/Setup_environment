# Development Environment Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy the example (you'll need to create this manually)
# The .env file should contain:
POSTGRES_USER=mpcas2
POSTGRES_PASSWORD=mpcas2_dev_password
POSTGRES_DB=mpcas2_dev
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
DATABASE_URL=postgresql://mpcas2:mpcas2_dev_password@localhost:5432/mpcas2_dev

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379

API_PORT=3001
API_URL=http://localhost:3001
NODE_ENV=development

NEXT_PUBLIC_API_URL=http://localhost:3001

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### 3. Start Local Services

Start PostgreSQL and Redis using Docker Compose:

```bash
docker-compose up -d
```

Verify services are running:

```bash
docker-compose ps
```

### 4. Run Development Servers

Start all apps in development mode:

```bash
npm run dev
```

Or start individually:

```bash
# Frontend (Next.js)
npm run dev --workspace=@mpcas2/web

# Backend (Express API)
npm run dev --workspace=@mpcas2/api
```

### 5. Verify Setup

- Frontend: http://localhost:3000
- API: http://localhost:3001
- API Health Check: http://localhost:3001/health

## Project Structure

```
mpcas2/
├── apps/
│   ├── web/              # Next.js frontend
│   │   ├── src/
│   │   │   └── app/      # Next.js App Router
│   │   └── package.json
│   └── api/              # Express API
│       ├── src/
│       │   └── index.ts
│       └── package.json
├── packages/
│   ├── shared/           # Shared types & utilities
│   ├── ui/               # Shared UI components
│   ├── config/           # Shared configs
│   └── db/               # Database client
├── docker-compose.yml     # Local services
├── package.json          # Root workspace config
├── turbo.json            # Turborepo config
└── tsconfig.json         # Root TypeScript config
```

## Available Commands

### Root Level

- `npm run dev` - Start all apps
- `npm run build` - Build all apps
- `npm run lint` - Lint all code
- `npm run test` - Run all tests
- `npm run type-check` - Type check TypeScript
- `npm run format` - Format with Prettier

### Individual Workspaces

- `npm run <script> --workspace=@mpcas2/web` - Run script in web app
- `npm run <script> --workspace=@mpcas2/api` - Run script in API

## Next Steps

1. ✅ Development environment set up
2. ⏭️ Begin Epic 1: User Authentication
3. ⏭️ Set up database schema (Prisma/TypeORM)
4. ⏭️ Implement OAuth flows
5. ⏭️ Build frontend components

## Troubleshooting

### Port Already in Use

If ports 3000 or 3001 are already in use:

- Change `PORT` in `.env` for API
- Change port in `apps/web/package.json` scripts for Next.js

### Docker Services Not Starting

```bash
# Check Docker is running
docker ps

# View logs
docker-compose logs

# Restart services
docker-compose restart
```

### TypeScript Errors

```bash
# Clean and rebuild
npm run clean
npm run build
```
