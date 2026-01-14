# Environment Setup Instructions

## Step 1: Create .env File

Since `.env` files are gitignored, you need to create it manually. Copy the content below into a new file named `.env` in the root directory:

```env
# Database
POSTGRES_USER=mpcas2
POSTGRES_PASSWORD=mpcas2_dev_password
POSTGRES_DB=mpcas2_dev
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
DATABASE_URL=postgresql://mpcas2:mpcas2_dev_password@localhost:5432/mpcas2_dev

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379

# API
API_PORT=3001
API_URL=http://localhost:3001
NODE_ENV=development

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3001

# JWT
JWT_SECRET=mpcas2-dev-jwt-secret-change-in-production-min-32-chars
JWT_REFRESH_SECRET=mpcas2-dev-refresh-secret-change-in-production-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# OAuth (Google) - Add your credentials when ready
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google

# OAuth (Other platforms - add as needed)
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=

# OpenAI (for content generation)
OPENAI_API_KEY=your-openai-api-key

# AWS (for S3 storage)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET=

# Sentry (error tracking)
SENTRY_DSN=

# App
APP_URL=http://localhost:3000
```

## Step 2: Start Docker Desktop

1. Open Docker Desktop application
2. Wait for it to fully start (whale icon in system tray should be steady)
3. Verify Docker is running: `docker ps` should work without errors

## Step 3: Start Docker Services

Once Docker Desktop is running:

```bash
docker-compose up -d
```

This will start:

- PostgreSQL 15 on port 5432
- Redis 7 on port 6379

## Step 4: Verify Services

```bash
docker-compose ps
```

You should see both `mpcas2-postgres` and `mpcas2-redis` running.

## Step 5: Run Development Servers

```bash
npm run dev
```

This will start:

- Next.js frontend on http://localhost:3000
- Express API on http://localhost:3001
