# MPCAS2 - Multi-Platform Content Automation System

Enterprise-grade SaaS platform for automating content creation and distribution across 8 major social media platforms.

## Project Structure

This is a monorepo using Turborepo with the following structure:

```
mpcas2/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Express API Gateway
├── packages/
│   ├── shared/       # Shared TypeScript types and utilities
│   ├── ui/           # Shared UI components
│   ├── config/       # Shared configurations
│   └── db/           # Database client and migrations
└── docs/             # Documentation
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Docker and Docker Compose (for local services)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start local services (PostgreSQL, Redis, n8n, ComfyUI):

```bash
docker-compose up -d
```

This starts:

- PostgreSQL 15+ on port 5432
- Redis 7+ on port 6379
- n8n workflow automation on http://localhost:5678
- ComfyUI AI service on http://localhost:8188

4. Run development servers:

```bash
npm run dev
```

This will start:

- Next.js frontend on http://localhost:3000
- Express API on http://localhost:3001

## Available Scripts

### Root Level

- `npm run dev` - Start all apps in development mode
- `npm run build` - Build all apps and packages
- `npm run lint` - Lint all code
- `npm run test` - Run all tests
- `npm run type-check` - Type check all TypeScript
- `npm run format` - Format code with Prettier

### Individual Apps

- `npm run dev --workspace=@mpcas2/web` - Start Next.js frontend
- `npm run dev --workspace=@mpcas2/api` - Start Express API

## Architecture Overview

MPCAS2 is built as a modern, scalable SaaS platform using a microservices architecture within a monorepo structure. The system uses:

- **Schema-per-tenant** PostgreSQL architecture for complete data isolation
- **Self-hosted AI infrastructure** (ComfyUI, Ollama) to reduce costs by 70-90%
- **n8n workflow orchestration** for content generation and automation
- **Multi-platform OAuth 2.0** integration for 8 social media platforms
- **Horizontal scaling** across all services for enterprise-grade reliability

### System Components

- **Frontend**: Next.js 14+ (App Router) with TypeScript and React 18
- **Backend**: Express.js API Gateway with TypeScript
- **Database**: PostgreSQL 15+ with schema-per-tenant isolation
- **Cache/Queue**: Redis 7+ for caching and task queues
- **Workflow Engine**: n8n for workflow automation
- **AI Services**: ComfyUI for image/video generation, Ollama for LLM workloads
- **Monorepo**: Turborepo for efficient builds and dependency management

For detailed architecture documentation, see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Development

### Tech Stack

- **Frontend**: Next.js 14+ (App Router), React 18, TypeScript
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL 15+ (schema-per-tenant)
- **Cache/Queue**: Redis 7+
- **Workflow**: n8n (self-hosted)
- **AI**: ComfyUI, Ollama (self-hosted)
- **Monorepo**: Turborepo
- **Testing**: Jest
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript (strict mode enabled)

### Development Guidelines

#### Code Standards

- **TypeScript**: Strict mode enabled across all packages
- **Linting**: ESLint with shared rules across workspace
- **Formatting**: Prettier with consistent configuration
- **Pre-commit Hooks**: Husky runs lint, format check, and type-check before commits

#### Project Structure

```
mpcas2/
├── apps/
│   ├── web/          # Next.js frontend application
│   └── api/          # Express API Gateway
├── packages/
│   ├── shared/       # Shared TypeScript types and utilities
│   ├── ui/           # Shared UI components
│   ├── config/       # Shared configurations
│   └── db/           # Database client and migrations
├── docs/             # Documentation
├── scripts/          # Utility scripts
└── workflows/        # n8n workflow exports
```

#### Adding New Packages

1. Create package directory in `packages/`
2. Add `package.json` with proper workspace configuration
3. Extend root `tsconfig.json` for TypeScript settings
4. Update root `package.json` workspaces array if needed
5. Add package to relevant apps' dependencies

#### Running Services Locally

```bash
# Start all Docker services
docker-compose up -d

# Start development servers
npm run dev

# Run specific workspace
npm run dev --workspace=@mpcas2/web
npm run dev --workspace=@mpcas2/api
```

#### Testing

```bash
# Run all tests
npm run test

# Run tests for specific workspace
npm run test --workspace=@mpcas2/api
```

#### Code Quality

```bash
# Type check all packages
npm run type-check

# Lint all code
npm run lint

# Format code
npm run format

# Check formatting (CI)
npm run format:check
```

### Environment Variables

See `.env.example` for required environment variables. Key variables:

- `POSTGRES_*`: Database connection settings
- `REDIS_*`: Redis connection settings
- `N8N_*`: n8n configuration
- `COMFYUI_*`: ComfyUI service settings
- `JWT_SECRET`: JWT token signing secret
- `OAUTH_*`: OAuth provider credentials
- `DATABASE_URL`: PostgreSQL connection string (primary)
- `DATABASE_READ_URL`: PostgreSQL connection string (read replica, optional)
- `PGBOUNCER_PORT`: PgBouncer port (default: 6432)

### Database Management

- **Migrations**: `cd packages/db && npm run db:migrate`
- **Studio**: `cd packages/db && npm run db:studio`
- **Backup Strategy**: See [`docs/DATABASE_BACKUP_STRATEGY.md`](docs/DATABASE_BACKUP_STRATEGY.md)
- **Read Replicas**: See [`docs/DATABASE_READ_REPLICA.md`](docs/DATABASE_READ_REPLICA.md)
- **Migration Rollback**: See [`packages/db/docs/MIGRATION_ROLLBACK.md`](packages/db/docs/MIGRATION_ROLLBACK.md)

## Project Status

🚧 **In Development** - Currently setting up development environment and infrastructure.

## License

Private - All rights reserved
