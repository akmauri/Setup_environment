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

3. Start local services (PostgreSQL, Redis):

```bash
docker-compose up -d
```

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

## Development

### Tech Stack

- **Frontend**: Next.js 14+ (App Router), React 18, TypeScript
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL 15+
- **Cache/Queue**: Redis 7+
- **Monorepo**: Turborepo
- **Testing**: Jest
- **Linting**: ESLint + Prettier

### Environment Variables

See `.env.example` for required environment variables.

## Project Status

🚧 **In Development** - Currently setting up development environment and infrastructure.

## License

Private - All rights reserved
