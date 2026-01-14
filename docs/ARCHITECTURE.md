# MPCAS2 Fullstack Architecture Document

**Version:** 1.0  
**Date:** January 2026  
**Status:** Draft  
**Project:** Multi-Platform Content Automation System (MPCAS2)

---

## Introduction

This document outlines the complete fullstack architecture for MPCAS2, including backend systems, frontend implementation, and their integration. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack.

This unified approach combines what would traditionally be separate backend and frontend architecture documents, streamlining the development process for modern fullstack applications where these concerns are increasingly intertwined.

### Starter Template or Existing Project

**Status:** Greenfield project - No existing starter template

**Recommendation:** Consider using a modern fullstack starter template to accelerate development:

1. **T3 Stack (Recommended):** Next.js 14+ (App Router), tRPC, Prisma, NextAuth.js, Tailwind CSS
   - Pros: Type-safe end-to-end, excellent DX, built-in auth, monorepo support
   - Cons: Learning curve for tRPC, requires TypeScript expertise

2. **Next.js + Express Monorepo:** Next.js frontend, Express backend, shared TypeScript types
   - Pros: Familiar stack, flexible, easy to customize
   - Cons: More manual setup, no built-in type safety between frontend/backend

3. **NestJS + Next.js:** NestJS backend (Node.js), Next.js frontend
   - Pros: Enterprise-grade backend, excellent for microservices, strong TypeScript support
   - Cons: More complex, steeper learning curve

**Decision:** Proceed with custom monorepo setup based on PRD requirements (Next.js frontend, Node.js/Express backend) to maintain full control over architecture decisions.

### Change Log

| Date       | Version | Description                            | Author          |
| ---------- | ------- | -------------------------------------- | --------------- |
| 2026-01-XX | 1.0     | Initial architecture document creation | Architect Agent |

---

## High Level Architecture

### Technical Summary

MPCAS2 is built as a modern, scalable SaaS platform using a microservices architecture within a monorepo structure. The frontend is a Next.js 14+ React application with TypeScript, using the App Router for server-side rendering and client-side interactivity. The backend consists of modular Node.js/Express services with a Python-based AI service for ComfyUI integration. The system uses PostgreSQL 15+ with schema-per-tenant architecture for complete data isolation, Redis 7+ for caching and task queues, and S3-compatible storage for media assets. The architecture supports horizontal scaling across all services, with self-hosted AI infrastructure (ComfyUI, Ollama) handling 80% of AI workloads to reduce costs by 70-90% compared to cloud-only solutions. The platform integrates with 8 social media platforms via OAuth 2.0, uses n8n for workflow orchestration, and implements comprehensive monitoring, logging, and error tracking for production-grade reliability.

### Platform and Infrastructure Choice

**Selected Platform:** AWS (Primary) with Multi-Cloud Strategy

**Rationale:**

- **AWS** provides comprehensive services for enterprise SaaS (EC2, RDS, S3, Lambda, ECS/EKS)
- **Multi-cloud** approach: AWS for primary infrastructure, Cloudflare for CDN/DDoS protection, optional GCP for AI workloads
- **Self-hosted GPU instances** (EC2 GPU instances or on-premise) for ComfyUI to reduce AI costs
- **Kubernetes (EKS)** for container orchestration and auto-scaling
- **Cloudflare CDN** for global content delivery and edge caching

**Key Services:**

- **Compute:** AWS ECS/EKS (Kubernetes) for containerized services, EC2 for GPU instances (ComfyUI)
- **Database:** AWS RDS PostgreSQL 15+ (Multi-AZ for HA), ElastiCache Redis 7+
- **Storage:** AWS S3 for media files, Cloudflare R2 as backup/alternative
- **CDN:** Cloudflare CDN for static assets and media delivery
- **Load Balancing:** AWS Application Load Balancer (ALB) for API Gateway
- **Monitoring:** Prometheus + Grafana (self-hosted or AWS Managed), CloudWatch for AWS-native metrics
- **Logging:** ELK Stack (Elasticsearch, Logstash, Kibana) on EC2 or AWS OpenSearch
- **Error Tracking:** Sentry (SaaS or self-hosted)
- **CI/CD:** GitHub Actions or GitLab CI

**Deployment Host and Regions:**

- **Primary Region:** us-east-1 (Virginia) - Lowest latency for US users
- **Secondary Region:** eu-west-1 (Ireland) - GDPR compliance, EU users
- **CDN:** Cloudflare global network (200+ edge locations)
- **Future Expansion:** us-west-2 (Oregon), ap-southeast-1 (Singapore) as user base grows

### Repository Structure

**Structure:** Monorepo using Turborepo

**Monorepo Tool:** Turborepo (recommended) or Nx

**Rationale:**

- Turborepo provides excellent caching and parallel execution for faster builds
- Supports TypeScript workspaces natively
- Easy to add new apps/packages as system grows
- Unified dependency management and versioning

**Package Organization:**

```
mpcas2/
├── apps/
│   ├── web/              # Next.js frontend
│   ├── api/              # Express API Gateway
│   ├── admin/            # Admin dashboard (optional separate app)
│   └── ai-service/       # Python FastAPI service for ComfyUI
├── packages/
│   ├── shared/           # Shared TypeScript types, constants, utilities
│   ├── ui/               # shadcn/ui components
│   ├── config/           # Shared configs (ESLint, TypeScript, etc.)
│   └── db/               # Database client, migrations (Prisma/TypeORM)
├── services/             # Microservices (if separate repos later)
│   ├── user-service/
│   ├── content-service/
│   └── ...
├── infrastructure/       # IaC (Terraform, CDK)
├── workflows/            # n8n workflow exports
├── docker/               # Docker configs
└── docs/                 # Documentation
```

### High Level Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Browser]
        MOBILE[Mobile Browser]
    end

    subgraph "CDN & Edge"
        CF[Cloudflare CDN]
        CF --> WEB
        CF --> MOBILE
    end

    subgraph "Load Balancer"
        ALB[AWS ALB]
        CF --> ALB
    end

    subgraph "API Gateway"
        GATEWAY[API Gateway Service<br/>Auth, Rate Limiting, Routing]
        ALB --> GATEWAY
    end

    subgraph "Frontend Services"
        NEXT[Next.js App<br/>SSR/SSG/CSR]
        ADMIN[Admin Dashboard<br/>Next.js]
        ALB --> NEXT
        ALB --> ADMIN
    end

    subgraph "Backend Microservices"
        USER[User Service<br/>Node.js/Express]
        TENANT[Tenant Service<br/>Node.js/Express]
        CONTENT[Content Service<br/>Node.js/Express]
        WORKFLOW[Workflow Service<br/>Node.js/Express]
        PUBLISH[Publishing Service<br/>Node.js/Express]
        ANALYTICS[Analytics Service<br/>Node.js/Express]
        BILLING[Billing Service<br/>Node.js/Express]
        NOTIFY[Notification Service<br/>Node.js/Express]
        GATEWAY --> USER
        GATEWAY --> TENANT
        GATEWAY --> CONTENT
        GATEWAY --> WORKFLOW
        GATEWAY --> PUBLISH
        GATEWAY --> ANALYTICS
        GATEWAY --> BILLING
        GATEWAY --> NOTIFY
    end

    subgraph "AI Services"
        AI[AI Service<br/>Python/FastAPI]
        COMFY[ComfyUI Workers<br/>GPU Instances]
        OLLAMA[Ollama LLM<br/>Self-hosted]
        GATEWAY --> AI
        AI --> COMFY
        AI --> OLLAMA
        AI --> OPENAI[OpenAI API<br/>20% workload]
        AI --> ANTHROPIC[Anthropic API<br/>20% workload]
    end

    subgraph "Workflow Engine"
        N8N[n8n Instance<br/>Self-hosted]
        WORKFLOW --> N8N
        N8N --> COMFY
        N8N --> PUBLISH
    end

    subgraph "Data Layer"
        PG[(PostgreSQL 15+<br/>Schema-per-Tenant)]
        REDIS[(Redis 7+<br/>Cache & Queue)]
        S3[(S3 Storage<br/>Media Files)]
        USER --> PG
        TENANT --> PG
        CONTENT --> PG
        CONTENT --> S3
        WORKFLOW --> PG
        PUBLISH --> PG
        ANALYTICS --> PG
        BILLING --> PG
        USER --> REDIS
        PUBLISH --> REDIS
        NOTIFY --> REDIS
    end

    subgraph "External APIs"
        YT[YouTube API]
        IG[Instagram API]
        TT[TikTok API]
        TW[Twitter/X API]
        LI[LinkedIn API]
        FB[Facebook API]
        PIN[Pinterest API]
        TH[Threads API]
        PUBLISH --> YT
        PUBLISH --> IG
        PUBLISH --> TT
        PUBLISH --> TW
        PUBLISH --> LI
        PUBLISH --> FB
        PUBLISH --> PIN
        PUBLISH --> TH
    end

    subgraph "External Services"
        STRIPE[Stripe<br/>Payments]
        SENDGRID[SendGrid<br/>Email]
        TWILIO[Twilio<br/>SMS]
        BILLING --> STRIPE
        NOTIFY --> SENDGRID
        NOTIFY --> TWILIO
    end

    subgraph "Monitoring & Observability"
        PROM[Prometheus]
        GRAFANA[Grafana]
        ELK[ELK Stack]
        SENTRY[Sentry]
        USER --> PROM
        CONTENT --> PROM
        PUBLISH --> PROM
        PROM --> GRAFANA
        USER --> ELK
        CONTENT --> ELK
        PUBLISH --> ELK
        USER --> SENTRY
        CONTENT --> SENTRY
        PUBLISH --> SENTRY
    end
```

### Architectural Patterns

- **Microservices Architecture:** Modular services within monorepo enable independent scaling, technology flexibility (Python for AI, Node.js for API), and team autonomy. Each service has clear boundaries and communicates via well-defined APIs.

- **Schema-Per-Tenant Multi-Tenancy:** Each tenant gets isolated PostgreSQL schema ensuring complete data separation, GDPR compliance, and independent scaling. Public schema stores tenant metadata and shared data.

- **API Gateway Pattern:** Single entry point (API Gateway Service) handles authentication, rate limiting, request routing, and validation. Simplifies client interactions and centralizes cross-cutting concerns.

- **Event-Driven Architecture:** Async operations (content generation, publishing, notifications) use Redis-based message queues (Bull) and event streams. Enables decoupling and horizontal scaling.

- **BFF (Backend for Frontend) Pattern:** Next.js API routes act as BFF layer, aggregating data from multiple microservices and optimizing responses for frontend needs. Reduces client complexity.

- **CQRS (Command Query Responsibility Segregation):** Separate read/write paths for analytics (read-optimized views) and content management (write-optimized). Improves performance for analytics queries.

- **Repository Pattern:** Abstract data access logic in services layer. Enables testing with mocks, future database migration flexibility, and consistent data access patterns.

- **Component-Based UI:** React components with TypeScript provide type safety, reusability, and maintainability. shadcn/ui provides accessible base components.

- **Server-Side Rendering (SSR):** Next.js App Router enables SSR for SEO, initial load performance, and dynamic content. Hybrid approach with SSR for public pages, CSR for authenticated pages.

- **Progressive Enhancement:** Core functionality works without JavaScript, enhanced with JS for better UX. Ensures accessibility and resilience.

---

## Tech Stack

| Category             | Technology                                  | Version          | Purpose                        | Rationale                                                                               |
| -------------------- | ------------------------------------------- | ---------------- | ------------------------------ | --------------------------------------------------------------------------------------- |
| Frontend Language    | TypeScript                                  | 5.3+             | Type-safe frontend development | Prevents runtime errors, improves DX, enables shared types with backend                 |
| Frontend Framework   | Next.js                                     | 14+ (App Router) | React framework with SSR/SSG   | Excellent performance, SEO, built-in routing, API routes, optimal for SaaS              |
| UI Component Library | shadcn/ui                                   | Latest           | Accessible UI components       | Radix UI primitives, Tailwind CSS, fully customizable, excellent DX                     |
| State Management     | Zustand + React Query                       | 4.x / 5.x        | Client state + server state    | Zustand for UI state (simple, performant), React Query for server state (caching, sync) |
| CSS Framework        | Tailwind CSS                                | 3.4+             | Utility-first CSS              | Rapid development, consistent design system, excellent performance                      |
| Backend Language     | TypeScript                                  | 5.3+             | Type-safe backend development  | Shared types with frontend, type safety across stack                                    |
| Backend Framework    | Express.js                                  | 4.18+            | Node.js web framework          | Mature, flexible, large ecosystem, excellent middleware support                         |
| API Style            | REST API                                    | OpenAPI 3.0      | Standard HTTP API              | Simple, well-understood, excellent tooling, easy to document                            |
| Database             | PostgreSQL                                  | 15+              | Primary database               | ACID compliance, JSON support, excellent performance, schema-per-tenant support         |
| Cache                | Redis                                       | 7+               | Caching and queues             | Fast in-memory storage, pub/sub, Bull queue support                                     |
| File Storage         | S3-compatible (AWS S3 / Cloudflare R2)      | -                | Media file storage             | Scalable, CDN integration, cost-effective                                               |
| Authentication       | NextAuth.js / Passport.js                   | 5.x / 0.7+       | Auth framework                 | OAuth 2.0 support, JWT tokens, session management                                       |
| Frontend Testing     | Vitest + React Testing Library              | 1.x / 14.x       | Unit and component tests       | Fast, Vite-based, excellent React testing utilities                                     |
| Backend Testing      | Jest + Supertest                            | 29.x / 6.x       | Unit and integration tests     | Mature, excellent mocking, API testing support                                          |
| E2E Testing          | Playwright                                  | 1.40+            | End-to-end tests               | Cross-browser, reliable, excellent debugging                                            |
| Build Tool           | Turborepo                                   | 1.x              | Monorepo build system          | Fast builds, caching, parallel execution                                                |
| Bundler              | Next.js (built-in) / Vite                   | -                | Frontend bundling              | Next.js handles bundling, Vite for admin app if separate                                |
| IaC Tool             | Terraform                                   | 1.6+             | Infrastructure as Code         | Declarative, provider-agnostic, excellent AWS support                                   |
| CI/CD                | GitHub Actions                              | -                | Continuous integration         | Native GitHub integration, excellent workflow support                                   |
| Monitoring           | Prometheus + Grafana                        | 2.x / 10.x       | Metrics and dashboards         | Industry standard, flexible, self-hosted option                                         |
| Logging              | ELK Stack (Elasticsearch, Logstash, Kibana) | 8.x              | Centralized logging            | Powerful search, visualization, log aggregation                                         |
| Error Tracking       | Sentry                                      | Latest           | Error monitoring               | Real-time alerts, stack traces, performance monitoring                                  |
| AI Service Language  | Python                                      | 3.11+            | AI/ML service                  | Best ecosystem for AI (ComfyUI, Ollama, ML libraries)                                   |
| AI Service Framework | FastAPI                                     | 0.104+           | Python web framework           | Fast, async, automatic OpenAPI docs, excellent for AI services                          |

---

## Data Models

### Tenant

**Purpose:** Represents a multi-tenant organization. Each tenant has isolated schema and settings.

**Key Attributes:**

- `id`: UUID - Unique tenant identifier
- `name`: string - Tenant/organization name
- `subdomain`: string - Optional subdomain for white-label (e.g., "client1")
- `tier`: enum - Subscription tier (Free, Creator, Professional, Agency, White Label, Enterprise)
- `status`: enum - Active, Suspended, Deleted
- `created_at`: timestamp - Tenant creation date
- `settings`: JSONB - Tenant-specific settings (branding, features, limits)

**TypeScript Interface:**

```typescript
interface Tenant {
  id: string;
  name: string;
  subdomain: string | null;
  tier: 'free' | 'creator' | 'professional' | 'agency' | 'white_label' | 'enterprise';
  status: 'active' | 'suspended' | 'deleted';
  createdAt: Date;
  updatedAt: Date;
  settings: {
    branding?: {
      logo?: string;
      primaryColor?: string;
      domain?: string;
    };
    features?: Record<string, boolean>;
    limits?: Record<string, number>;
  };
}
```

**Relationships:**

- One-to-many with User (users belong to tenant)
- One-to-many with Content (content belongs to tenant)
- One-to-many with Workflow (workflows belong to tenant)
- One-to-many with SocialAccount (social accounts belong to tenant)

### User

**Purpose:** Represents a user account within a tenant. Supports team collaboration with roles.

**Key Attributes:**

- `id`: UUID - Unique user identifier
- `tenant_id`: UUID - Foreign key to tenant
- `email`: string - User email (unique per tenant)
- `password_hash`: string - Bcrypt hashed password (nullable for OAuth users)
- `name`: string - User display name
- `role`: enum - Owner, Admin, Manager, Editor, Viewer, Programmer
- `avatar_url`: string - Optional avatar image URL
- `email_verified`: boolean - Email verification status
- `two_factor_enabled`: boolean - 2FA status
- `last_login_at`: timestamp - Last login timestamp
- `created_at`: timestamp - Account creation date

**TypeScript Interface:**

```typescript
interface User {
  id: string;
  tenantId: string;
  email: string;
  passwordHash: string | null;
  name: string;
  role: 'owner' | 'admin' | 'manager' | 'editor' | 'viewer' | 'programmer';
  avatarUrl: string | null;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

**Relationships:**

- Many-to-one with Tenant (user belongs to tenant)
- One-to-many with Content (user creates content)
- One-to-many with Comment (user makes comments)
- Many-to-many with Team (users can be in multiple teams)

### Content

**Purpose:** Represents media content (videos, images, audio) stored in the system.

**Key Attributes:**

- `id`: UUID - Unique content identifier
- `tenant_id`: UUID - Foreign key to tenant
- `user_id`: UUID - Foreign key to user (creator)
- `type`: enum - Video, Image, Audio, Document
- `title`: string - Content title
- `file_url`: string - S3 URL to media file
- `thumbnail_url`: string - Optional thumbnail URL
- `duration`: number - Duration in seconds (for video/audio)
- `file_size`: number - File size in bytes
- `mime_type`: string - MIME type (video/mp4, image/png, etc.)
- `metadata`: JSONB - Platform-specific metadata, tags, descriptions
- `status`: enum - Draft, Processing, Ready, Published, Archived
- `created_at`: timestamp - Content creation date

**TypeScript Interface:**

```typescript
interface Content {
  id: string;
  tenantId: string;
  userId: string;
  type: 'video' | 'image' | 'audio' | 'document';
  title: string;
  fileUrl: string;
  thumbnailUrl: string | null;
  duration: number | null;
  fileSize: number;
  mimeType: string;
  metadata: {
    description?: string;
    tags?: string[];
    platformSpecific?: Record<string, any>;
  };
  status: 'draft' | 'processing' | 'ready' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}
```

**Relationships:**

- Many-to-one with Tenant (content belongs to tenant)
- Many-to-one with User (content created by user)
- One-to-many with PublishJob (content can be published multiple times)
- Many-to-many with Workflow (content generated by workflows)

### SocialAccount

**Purpose:** Represents a connected social media platform account (YouTube, Instagram, etc.).

**Key Attributes:**

- `id`: UUID - Unique account identifier
- `tenant_id`: UUID - Foreign key to tenant
- `user_id`: UUID - Foreign key to user (account owner)
- `platform`: enum - YouTube, Instagram, TikTok, Twitter, LinkedIn, Facebook, Pinterest, Threads
- `platform_account_id`: string - Platform's user/account ID
- `username`: string - Platform username/handle
- `display_name`: string - Account display name
- `avatar_url`: string - Account avatar URL
- `access_token`: string - Encrypted OAuth access token
- `refresh_token`: string - Encrypted OAuth refresh token
- `token_expires_at`: timestamp - Token expiration
- `status`: enum - Connected, Disconnected, Error, Expired
- `connected_at`: timestamp - Connection date

**TypeScript Interface:**

```typescript
interface SocialAccount {
  id: string;
  tenantId: string;
  userId: string;
  platform:
    | 'youtube'
    | 'instagram'
    | 'tiktok'
    | 'twitter'
    | 'linkedin'
    | 'facebook'
    | 'pinterest'
    | 'threads';
  platformAccountId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  accessToken: string; // Encrypted
  refreshToken: string; // Encrypted
  tokenExpiresAt: Date;
  status: 'connected' | 'disconnected' | 'error' | 'expired';
  connectedAt: Date;
  updatedAt: Date;
}
```

**Relationships:**

- Many-to-one with Tenant (account belongs to tenant)
- Many-to-one with User (account owned by user)
- One-to-many with PublishJob (account used for publishing)

### Workflow

**Purpose:** Represents a content generation workflow (n8n/ComfyUI workflow).

**Key Attributes:**

- `id`: UUID - Unique workflow identifier
- `tenant_id`: UUID - Foreign key to tenant (null for marketplace workflows)
- `user_id`: UUID - Foreign key to user (creator, null for marketplace)
- `name`: string - Workflow name
- `description`: string - Workflow description
- `type`: enum - n8n, ComfyUI, Custom
- `workflow_json`: JSONB - Workflow definition (nodes, connections, parameters)
- `category`: string - Workflow category (video, image, automation, etc.)
- `tags`: string[] - Workflow tags
- `status`: enum - Draft, Active, Inactive, Archived
- `marketplace_status`: enum - Private, Pending, Approved, Rejected, Featured
- `usage_count`: number - Number of times workflow executed
- `rating`: number - Average rating (1-5)
- `created_at`: timestamp - Workflow creation date

**TypeScript Interface:**

```typescript
interface Workflow {
  id: string;
  tenantId: string | null;
  userId: string | null;
  name: string;
  description: string;
  type: 'n8n' | 'comfyui' | 'custom';
  workflowJson: Record<string, any>;
  category: string;
  tags: string[];
  status: 'draft' | 'active' | 'inactive' | 'archived';
  marketplaceStatus: 'private' | 'pending' | 'approved' | 'rejected' | 'featured';
  usageCount: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}
```

**Relationships:**

- Many-to-one with Tenant (workflow belongs to tenant, null for marketplace)
- Many-to-one with User (workflow created by user, null for marketplace)
- One-to-many with WorkflowExecution (workflow executed multiple times)

### PublishJob

**Purpose:** Represents a scheduled or executed content publishing job to social platforms.

**Key Attributes:**

- `id`: UUID - Unique job identifier
- `tenant_id`: UUID - Foreign key to tenant
- `user_id`: UUID - Foreign key to user (publisher)
- `content_id`: UUID - Foreign key to content
- `social_account_id`: UUID - Foreign key to social account
- `platform`: enum - Platform name
- `scheduled_at`: timestamp - Scheduled publish time
- `published_at`: timestamp - Actual publish time (null if not published)
- `status`: enum - Scheduled, Processing, Published, Failed, Cancelled
- `metadata`: JSONB - Platform-specific metadata (title, description, hashtags, etc.)
- `error_message`: string - Error message if failed
- `platform_post_id`: string - Platform's post ID after publishing
- `platform_post_url`: string - URL to published post

**TypeScript Interface:**

```typescript
interface PublishJob {
  id: string;
  tenantId: string;
  userId: string;
  contentId: string;
  socialAccountId: string;
  platform:
    | 'youtube'
    | 'instagram'
    | 'tiktok'
    | 'twitter'
    | 'linkedin'
    | 'facebook'
    | 'pinterest'
    | 'threads';
  scheduledAt: Date;
  publishedAt: Date | null;
  status: 'scheduled' | 'processing' | 'published' | 'failed' | 'cancelled';
  metadata: {
    title?: string;
    description?: string;
    hashtags?: string[];
    thumbnail?: string;
    [key: string]: any; // Platform-specific fields
  };
  errorMessage: string | null;
  platformPostId: string | null;
  platformPostUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

**Relationships:**

- Many-to-one with Tenant (job belongs to tenant)
- Many-to-one with User (job created by user)
- Many-to-one with Content (job publishes content)
- Many-to-one with SocialAccount (job uses account)

### Analytics

**Purpose:** Stores aggregated analytics data for published content across platforms.

**Key Attributes:**

- `id`: UUID - Unique analytics record identifier
- `tenant_id`: UUID - Foreign key to tenant
- `publish_job_id`: UUID - Foreign key to publish job
- `content_id`: UUID - Foreign key to content
- `platform`: enum - Platform name
- `platform_post_id`: string - Platform's post ID
- `views`: number - Total views
- `likes`: number - Total likes
- `comments`: number - Total comments
- `shares`: number - Total shares
- `engagement_rate`: number - Calculated engagement rate
- `metrics`: JSONB - Platform-specific metrics (watch time, retention, etc.)
- `collected_at`: timestamp - When metrics were collected
- `period`: enum - Hourly, Daily, Weekly, Monthly

**TypeScript Interface:**

```typescript
interface Analytics {
  id: string;
  tenantId: string;
  publishJobId: string;
  contentId: string;
  platform:
    | 'youtube'
    | 'instagram'
    | 'tiktok'
    | 'twitter'
    | 'linkedin'
    | 'facebook'
    | 'pinterest'
    | 'threads';
  platformPostId: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  metrics: Record<string, any>; // Platform-specific metrics
  collectedAt: Date;
  period: 'hourly' | 'daily' | 'weekly' | 'monthly';
  createdAt: Date;
}
```

**Relationships:**

- Many-to-one with Tenant (analytics belong to tenant)
- Many-to-one with PublishJob (analytics for publish job)
- Many-to-one with Content (analytics for content)

---

## API Specification

### REST API Specification

**API Title:** MPCAS2 API  
**API Version:** 1.0.0  
**API Description:** RESTful API for Multi-Platform Content Automation System

**Base URL:** `https://api.mpcas2.com/v1`

**Authentication:** Bearer JWT token in Authorization header

**OpenAPI 3.0 Specification:**

```yaml
openapi: 3.0.0
info:
  title: MPCAS2 API
  version: 1.0.0
  description: |
    RESTful API for Multi-Platform Content Automation System.
    All endpoints require authentication via JWT token.
    Multi-tenant architecture: tenant context determined from JWT token.
  contact:
    name: MPCAS2 API Support
    email: api@mpcas2.com
  license:
    name: Proprietary

servers:
  - url: https://api.mpcas2.com/v1
    description: Production server
  - url: https://api-staging.mpcas2.com/v1
    description: Staging server
  - url: http://localhost:3001/api/v1
    description: Local development server

security:
  - bearerAuth: []

paths:
  /auth/register:
    post:
      summary: Register new user and tenant
      tags: [Authentication]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password, name, tenantName]
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  minLength: 8
                name:
                  type: string
                tenantName:
                  type: string
      responses:
        '201':
          description: User and tenant created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        '400':
          $ref: '#/components/responses/BadRequest'
        '409':
          description: Email already exists

  /auth/login:
    post:
      summary: Login user
      tags: [Authentication]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password]
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /auth/refresh:
    post:
      summary: Refresh access token
      tags: [Authentication]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [refreshToken]
              properties:
                refreshToken:
                  type: string
      responses:
        '200':
          description: Token refreshed
          content:
            application/json:
              schema:
                type: object
                properties:
                  accessToken:
                    type: string
                  expiresIn:
                    type: integer

  /content:
    get:
      summary: List content
      tags: [Content]
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
        - name: type
          in: query
          schema:
            type: string
            enum: [video, image, audio, document]
        - name: status
          in: query
          schema:
            type: string
            enum: [draft, processing, ready, published, archived]
      responses:
        '200':
          description: Content list
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Content'
                  pagination:
                    $ref: '#/components/schemas/Pagination'

    post:
      summary: Create content
      tags: [Content]
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              required: [file, title, type]
              properties:
                file:
                  type: string
                  format: binary
                title:
                  type: string
                type:
                  type: string
                  enum: [video, image, audio, document]
                description:
                  type: string
                tags:
                  type: array
                  items:
                    type: string
      responses:
        '201':
          description: Content created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Content'

  /content/{id}:
    get:
      summary: Get content by ID
      tags: [Content]
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Content details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Content'
        '404':
          $ref: '#/components/responses/NotFound'

  /social-accounts:
    get:
      summary: List connected social accounts
      tags: [Social Accounts]
      parameters:
        - name: platform
          in: query
          schema:
            type: string
            enum: [youtube, instagram, tiktok, twitter, linkedin, facebook, pinterest, threads]
      responses:
        '200':
          description: Social accounts list
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/SocialAccount'

    post:
      summary: Initiate OAuth connection
      tags: [Social Accounts]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [platform]
              properties:
                platform:
                  type: string
                  enum:
                    [youtube, instagram, tiktok, twitter, linkedin, facebook, pinterest, threads]
      responses:
        '200':
          description: OAuth URL returned
          content:
            application/json:
              schema:
                type: object
                properties:
                  authUrl:
                    type: string
                    format: uri

  /publish:
    post:
      summary: Publish content to platforms
      tags: [Publishing]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [contentId, accounts, metadata]
              properties:
                contentId:
                  type: string
                  format: uuid
                accounts:
                  type: array
                  items:
                    type: object
                    required: [socialAccountId, platform]
                    properties:
                      socialAccountId:
                        type: string
                        format: uuid
                      platform:
                        type: string
                      metadata:
                        type: object
                scheduleAt:
                  type: string
                  format: date-time
                publishNow:
                  type: boolean
      responses:
        '202':
          description: Publish jobs created
          content:
            application/json:
              schema:
                type: object
                properties:
                  jobs:
                    type: array
                    items:
                      $ref: '#/components/schemas/PublishJob'

  /workflows:
    get:
      summary: List workflows (marketplace or user's workflows)
      tags: [Workflows]
      parameters:
        - name: marketplace
          in: query
          schema:
            type: boolean
            default: false
        - name: category
          in: query
          schema:
            type: string
        - name: search
          in: query
          schema:
            type: string
      responses:
        '200':
          description: Workflows list
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Workflow'

    post:
      summary: Create workflow
      tags: [Workflows]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/WorkflowCreate'
      responses:
        '201':
          description: Workflow created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Workflow'

  /workflows/{id}/execute:
    post:
      summary: Execute workflow
      tags: [Workflows]
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                parameters:
                  type: object
      responses:
        '202':
          description: Workflow execution started
          content:
            application/json:
              schema:
                type: object
                properties:
                  executionId:
                    type: string
                    format: uuid
                  status:
                    type: string

  /analytics:
    get:
      summary: Get analytics data
      tags: [Analytics]
      parameters:
        - name: contentId
          in: query
          schema:
            type: string
            format: uuid
        - name: platform
          in: query
          schema:
            type: string
        - name: startDate
          in: query
          schema:
            type: string
            format: date
        - name: endDate
          in: query
          schema:
            type: string
            format: date
      responses:
        '200':
          description: Analytics data
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Analytics'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    AuthResponse:
      type: object
      properties:
        accessToken:
          type: string
        refreshToken:
          type: string
        expiresIn:
          type: integer
        user:
          $ref: '#/components/schemas/User'

    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        name:
          type: string
        role:
          type: string
          enum: [owner, admin, manager, editor, viewer, programmer]
        avatarUrl:
          type: string
          nullable: true

    Content:
      type: object
      properties:
        id:
          type: string
          format: uuid
        type:
          type: string
          enum: [video, image, audio, document]
        title:
          type: string
        fileUrl:
          type: string
        thumbnailUrl:
          type: string
          nullable: true
        status:
          type: string
        createdAt:
          type: string
          format: date-time

    SocialAccount:
      type: object
      properties:
        id:
          type: string
          format: uuid
        platform:
          type: string
        username:
          type: string
        displayName:
          type: string
        status:
          type: string

    PublishJob:
      type: object
      properties:
        id:
          type: string
          format: uuid
        contentId:
          type: string
          format: uuid
        platform:
          type: string
        scheduledAt:
          type: string
          format: date-time
        status:
          type: string

    Workflow:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        description:
          type: string
        type:
          type: string
        category:
          type: string
        status:
          type: string

    WorkflowCreate:
      type: object
      required: [name, type, workflowJson]
      properties:
        name:
          type: string
        description:
          type: string
        type:
          type: string
          enum: [n8n, comfyui, custom]
        workflowJson:
          type: object
        category:
          type: string
        tags:
          type: array
          items:
            type: string

    Analytics:
      type: object
      properties:
        id:
          type: string
          format: uuid
        platform:
          type: string
        views:
          type: integer
        likes:
          type: integer
        comments:
          type: integer
        shares:
          type: integer
        engagementRate:
          type: number
        collectedAt:
          type: string
          format: date-time

    Pagination:
      type: object
      properties:
        page:
          type: integer
        limit:
          type: integer
        total:
          type: integer
        totalPages:
          type: integer

  responses:
    BadRequest:
      description: Bad request
      content:
        application/json:
          schema:
            type: object
            properties:
              error:
                type: object
                properties:
                  code:
                    type: string
                  message:
                    type: string

    Unauthorized:
      description: Unauthorized
      content:
        application/json:
          schema:
            type: object
            properties:
              error:
                type: object
                properties:
                  code:
                    type: string
                  message:
                    type: string

    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            type: object
            properties:
              error:
                type: object
                properties:
                  code:
                    type: string
                  message:
                    type: string
```

---

## Components

### API Gateway Service

**Responsibility:** Central entry point for all API requests. Handles authentication, authorization, rate limiting, request validation, routing to microservices, and tenant context resolution.

**Key Interfaces:**

- `POST /api/v1/auth/*` - Authentication endpoints
- `GET/POST/PUT/DELETE /api/v1/*` - All API endpoints with tenant routing
- Internal service-to-service communication

**Dependencies:** User Service (for auth validation), Tenant Service (for tenant context), Redis (for rate limiting, sessions)

**Technology Stack:** Node.js/Express, JWT validation, Redis, OpenAPI validation middleware

### User Service

**Responsibility:** User management, authentication, user profiles, team management, role-based access control.

**Key Interfaces:**

- User CRUD operations
- Authentication (login, register, OAuth)
- Team management (create teams, assign roles)
- Permission checking

**Dependencies:** Tenant Service (tenant context), PostgreSQL (user data), Redis (sessions)

**Technology Stack:** Node.js/Express, bcrypt (password hashing), JWT (token generation), PostgreSQL

### Tenant Service

**Responsibility:** Multi-tenant management, schema creation/deletion, tenant settings, tenant context resolution.

**Key Interfaces:**

- Tenant CRUD operations
- Schema creation/deletion (PostgreSQL)
- Tenant settings management
- Tenant context resolution from JWT

**Dependencies:** PostgreSQL (tenant metadata, schema management)

**Technology Stack:** Node.js/Express, PostgreSQL (schema management), TypeORM/Prisma migrations

### Content Service

**Responsibility:** Content CRUD operations, file upload/download, versioning, Digital Asset Management (DAM), content metadata.

**Key Interfaces:**

- Content CRUD (create, read, update, delete)
- File upload (multipart/form-data)
- File download (signed URLs)
- Content versioning
- Content search and filtering

**Dependencies:** S3 (file storage), PostgreSQL (content metadata), Redis (caching)

**Technology Stack:** Node.js/Express, AWS SDK (S3), PostgreSQL, Redis

### Workflow Service

**Responsibility:** Workflow management, marketplace, workflow execution orchestration, workflow scraping and curation.

**Key Interfaces:**

- Workflow CRUD operations
- Marketplace browsing/searching
- Workflow activation/deactivation
- Workflow execution triggering
- Workflow scraping from external sources

**Dependencies:** n8n (workflow execution), ComfyUI (AI workflows), PostgreSQL (workflow data), Redis (execution queue)

**Technology Stack:** Node.js/Express, n8n API, ComfyUI API, PostgreSQL, Bull (Redis queue)

### Publishing Service

**Responsibility:** Platform integrations, content publishing to social platforms, scheduling, queue management, OAuth token management.

**Key Interfaces:**

- Publish content to platforms
- Schedule publishing jobs
- Manage OAuth tokens (refresh, validate)
- Platform-specific content optimization
- Publish job status tracking

**Dependencies:** All 8 platform APIs, SocialAccount data, Content Service, Redis (job queue), PostgreSQL (job tracking)

**Technology Stack:** Node.js/Express, Platform-specific SDKs, Bull (Redis queue), PostgreSQL

### Analytics Service

**Responsibility:** Performance tracking, metrics aggregation, reporting generation, analytics data collection from platforms.

**Key Interfaces:**

- Analytics data collection (from platforms)
- Metrics aggregation (views, engagement, etc.)
- Report generation (CSV, PDF)
- Analytics dashboard data
- A/B test tracking

**Dependencies:** Platform APIs (analytics endpoints), PublishJob data, PostgreSQL (analytics storage), Redis (caching)

**Technology Stack:** Node.js/Express, Platform APIs, PostgreSQL (time-series optimized), Redis

### AI Service

**Responsibility:** Content generation via ComfyUI, AI features (title generation, caption generation, trend detection), LLM orchestration.

**Key Interfaces:**

- Content generation (video, image)
- AI feature endpoints (title, caption, trends)
- Workflow execution (ComfyUI)
- LLM orchestration (Ollama, OpenAI, Anthropic)

**Dependencies:** ComfyUI (GPU workers), Ollama (local LLMs), OpenAI/Anthropic APIs, Workflow Service

**Technology Stack:** Python/FastAPI, ComfyUI SDK, Ollama API, OpenAI SDK, Anthropic SDK

### Billing Service

**Responsibility:** Subscription management, usage tracking, overage billing, payment processing (Stripe), invoicing.

**Key Interfaces:**

- Subscription CRUD
- Usage tracking and aggregation
- Overage calculation
- Payment processing (Stripe)
- Invoice generation

**Dependencies:** Stripe API, Tenant Service (tier management), PostgreSQL (billing data)

**Technology Stack:** Node.js/Express, Stripe SDK, PostgreSQL

### Notification Service

**Responsibility:** Email, SMS, in-app notifications, webhooks, notification preferences.

**Key Interfaces:**

- Send email (SendGrid/AWS SES)
- Send SMS (Twilio)
- In-app notifications
- Webhook delivery
- Notification preferences management

**Dependencies:** SendGrid/AWS SES, Twilio, Redis (notification queue), PostgreSQL (preferences)

**Technology Stack:** Node.js/Express, SendGrid SDK, Twilio SDK, Bull (Redis queue)

### Component Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Next.js Frontend]
    end

    subgraph "API Gateway"
        GATEWAY[API Gateway Service]
        WEB --> GATEWAY
    end

    subgraph "Core Services"
        USER[User Service]
        TENANT[Tenant Service]
        CONTENT[Content Service]
        WORKFLOW[Workflow Service]
        PUBLISH[Publishing Service]
        ANALYTICS[Analytics Service]
        BILLING[Billing Service]
        NOTIFY[Notification Service]
        GATEWAY --> USER
        GATEWAY --> TENANT
        GATEWAY --> CONTENT
        GATEWAY --> WORKFLOW
        GATEWAY --> PUBLISH
        GATEWAY --> ANALYTICS
        GATEWAY --> BILLING
        GATEWAY --> NOTIFY
    end

    subgraph "AI Services"
        AI[AI Service]
        GATEWAY --> AI
        WORKFLOW --> AI
    end

    subgraph "Data Layer"
        PG[(PostgreSQL)]
        REDIS[(Redis)]
        S3[(S3 Storage)]
        USER --> PG
        TENANT --> PG
        CONTENT --> PG
        CONTENT --> S3
        WORKFLOW --> PG
        PUBLISH --> PG
        ANALYTICS --> PG
        BILLING --> PG
        USER --> REDIS
        PUBLISH --> REDIS
        NOTIFY --> REDIS
    end

    subgraph "External Services"
        N8N[n8n]
        COMFY[ComfyUI]
        PLATFORMS[8 Platform APIs]
        STRIPE[Stripe]
        SENDGRID[SendGrid]
        WORKFLOW --> N8N
        AI --> COMFY
        PUBLISH --> PLATFORMS
        BILLING --> STRIPE
        NOTIFY --> SENDGRID
    end
```

---

## External APIs

### YouTube Data API v3

- **Purpose:** Upload videos, manage playlists, retrieve analytics, manage channel settings
- **Documentation:** https://developers.google.com/youtube/v3
- **Base URL(s):** `https://www.googleapis.com/youtube/v3`
- **Authentication:** OAuth 2.0 with scopes: `youtube.upload`, `youtube.readonly`, `youtube.force-ssl`
- **Rate Limits:** 10,000 units per day (quota), 6 videos per day per account
- **Key Endpoints Used:**
  - `POST /videos` - Upload video
  - `GET /videos` - Get video details
  - `GET /analytics/reports` - Get analytics data
  - `POST /playlists` - Create playlist
- **Integration Notes:** OAuth tokens must be refreshed before expiration. Video uploads require resumable upload protocol for large files.

### Instagram Graph API

- **Purpose:** Upload photos/videos, manage Instagram Business accounts, retrieve insights
- **Documentation:** https://developers.facebook.com/docs/instagram-api
- **Base URL(s):** `https://graph.facebook.com/v18.0`
- **Authentication:** OAuth 2.0 with scopes: `instagram_basic`, `instagram_content_publish`, `pages_read_engagement`
- **Rate Limits:** 200 requests per hour per user, 25 posts per day per account
- **Key Endpoints Used:**
  - `POST /{ig-user-id}/media` - Create media container
  - `POST /{ig-user-id}/media_publish` - Publish media
  - `GET /{ig-user-id}/insights` - Get insights
- **Integration Notes:** Requires Instagram Business account. Two-step process: create media container, then publish. Media must be hosted on publicly accessible URL.

### TikTok for Developers API

- **Purpose:** Upload videos, manage TikTok Business accounts, retrieve analytics
- **Documentation:** https://developers.tiktok.com/
- **Base URL(s):** `https://open.tiktokapis.com/v2`
- **Authentication:** OAuth 2.0 with scopes: `video.upload`, `video.publish`, `user.info.basic`
- **Rate Limits:** 20 videos per day per account, 100 requests per hour
- **Key Endpoints Used:**
  - `POST /post/publish/video/init/` - Initialize video upload
  - `POST /post/publish/video/upload/` - Upload video chunks
  - `POST /post/publish/status/fetch/` - Check upload status
  - `GET /video/query/` - Get video analytics
- **Integration Notes:** Requires TikTok Business account. Uses chunked upload for videos. Must poll for upload completion.

### Twitter/X API v2

- **Purpose:** Post tweets, manage Twitter accounts, retrieve analytics
- **Documentation:** https://developer.twitter.com/en/docs/twitter-api
- **Base URL(s):** `https://api.twitter.com/2`
- **Authentication:** OAuth 2.0 with scopes: `tweet.read`, `tweet.write`, `users.read`
- **Rate Limits:** 300 tweets per 3 hours per account, 75 requests per 15 minutes
- **Key Endpoints Used:**
  - `POST /tweets` - Create tweet
  - `GET /tweets/{id}` - Get tweet details
  - `GET /tweets/search/recent` - Search tweets
  - `GET /users/{id}/tweets` - Get user tweets
- **Integration Notes:** Requires Twitter Developer account. Media uploads use separate media endpoint. Rate limits are strict.

### LinkedIn API v2

- **Purpose:** Share posts, manage LinkedIn Company Pages, retrieve analytics
- **Documentation:** https://docs.microsoft.com/en-us/linkedin/
- **Base URL(s):** `https://api.linkedin.com/v2`
- **Authentication:** OAuth 2.0 with scopes: `w_member_social`, `r_liteprofile`, `rw_organization_admin`
- **Rate Limits:** 100 requests per day per user, 5 posts per day per account
- **Key Endpoints Used:**
  - `POST /ugcPosts` - Create post
  - `GET /organizations/{id}/posts` - Get organization posts
  - `GET /networkSizes` - Get network size
- **Integration Notes:** Requires LinkedIn Company Page for organization posts. UGC (User Generated Content) API for posts. Limited rate limits.

### Facebook Graph API

- **Purpose:** Post to Facebook Pages, manage pages, retrieve insights
- **Documentation:** https://developers.facebook.com/docs/graph-api
- **Base URL(s):** `https://graph.facebook.com/v18.0`
- **Authentication:** OAuth 2.0 with scopes: `pages_manage_posts`, `pages_read_engagement`, `pages_show_list`
- **Rate Limits:** 200 requests per hour per user, 25 posts per day per page
- **Key Endpoints Used:**
  - `POST /{page-id}/feed` - Create post
  - `POST /{page-id}/photos` - Upload photo
  - `GET /{page-id}/insights` - Get insights
- **Integration Notes:** Requires Facebook Page. User must have Admin or Editor role. Photos must be publicly accessible URL.

### Pinterest API v5

- **Purpose:** Create pins, manage boards, retrieve analytics
- **Documentation:** https://developers.pinterest.com/docs/api/v5/
- **Base URL(s):** `https://api.pinterest.com/v5`
- **Authentication:** OAuth 2.0 with scopes: `boards:read`, `pins:read`, `pins:write`
- **Rate Limits:** 200 requests per hour per user, 50 pins per day per account
- **Key Endpoints Used:**
  - `POST /pins` - Create pin
  - `GET /pins/{id}` - Get pin details
  - `GET /boards/{id}/pins` - Get board pins
  - `GET /user_account/analytics` - Get analytics
- **Integration Notes:** Requires Pinterest Business account. Pins must include board_id. Media must be publicly accessible URL.

### Threads API (Meta)

- **Purpose:** Post to Threads, manage Threads accounts
- **Documentation:** https://developers.facebook.com/docs/threads
- **Base URL(s):** `https://graph.threads.net/v1.0`
- **Authentication:** OAuth 2.0 with scopes: `threads_basic`, `threads_content_publish`
- **Rate Limits:** Similar to Instagram (200 requests per hour, 25 posts per day)
- **Key Endpoints Used:**
  - `POST /{threads-user-id}/threads` - Create thread
  - `GET /{threads-user-id}/threads` - Get threads
- **Integration Notes:** New API, requires Instagram Business account. Similar to Instagram Graph API structure.

### ComfyUI API

- **Purpose:** Execute AI workflows for content generation (video, image)
- **Documentation:** https://github.com/comfyanonymous/ComfyUI (API docs)
- **Base URL(s):** `http://comfyui-worker:8188` (internal)
- **Authentication:** API key or internal network (no auth for internal)
- **Rate Limits:** GPU-dependent, queue-based
- **Key Endpoints Used:**
  - `POST /prompt` - Execute workflow
  - `GET /queue` - Check queue status
  - `GET /history/{run_id}` - Get execution results
  - `GET /view` - Download generated content
- **Integration Notes:** Self-hosted ComfyUI workers on GPU instances. Queue system handles multiple requests. Workflows defined as JSON.

### n8n API

- **Purpose:** Execute n8n workflows, manage workflow definitions
- **Documentation:** https://docs.n8n.io/api/
- **Base URL(s):** `http://n8n:5678/api/v1` (internal)
- **Authentication:** API key (n8n API key)
- **Rate Limits:** Worker-dependent, queue-based
- **Key Endpoints Used:**
  - `POST /workflows/{id}/execute` - Execute workflow
  - `GET /executions` - Get execution history
  - `POST /workflows` - Create workflow
  - `GET /workflows` - List workflows
- **Integration Notes:** Self-hosted n8n instance with multiple workers. Workflows can call ComfyUI, platform APIs, and internal services.

### Stripe API

- **Purpose:** Payment processing, subscription management, invoicing
- **Documentation:** https://stripe.com/docs/api
- **Base URL(s):** `https://api.stripe.com/v1`
- **Authentication:** API key (secret key)
- **Rate Limits:** 100 requests per second
- **Key Endpoints Used:**
  - `POST /customers` - Create customer
  - `POST /subscriptions` - Create subscription
  - `POST /invoices` - Create invoice
  - `POST /payment_intents` - Process payment
  - `GET /events` - Webhook events
- **Integration Notes:** Webhooks for subscription events (created, updated, cancelled). Use idempotency keys for retries.

### SendGrid API

- **Purpose:** Email delivery for notifications, transactional emails
- **Documentation:** https://docs.sendgrid.com/api-reference
- **Base URL(s):** `https://api.sendgrid.com/v3`
- **Authentication:** API key
- **Rate Limits:** 100 emails per second (free tier), higher on paid
- **Key Endpoints Used:**
  - `POST /mail/send` - Send email
  - `GET /suppression/bounces` - Get bounces
- **Integration Notes:** Template-based emails. Webhooks for delivery status. Alternative: AWS SES for cost savings at scale.

### Twilio API

- **Purpose:** SMS notifications, 2FA codes
- **Documentation:** https://www.twilio.com/docs/usage/api
- **Base URL(s):** `https://api.twilio.com/2010-04-01`
- **Authentication:** Account SID + Auth Token
- **Rate Limits:** Account-dependent
- **Key Endpoints Used:**
  - `POST /Accounts/{AccountSid}/Messages.json` - Send SMS
- **Integration Notes:** Cost per SMS. Use for critical notifications only. Consider alternatives for high volume.

---

## Core Workflows

### Workflow 1: User Registration and Tenant Creation

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API Gateway
    participant User Service
    participant Tenant Service
    participant Database
    participant Email Service

    User->>Frontend: Submit registration form
    Frontend->>API Gateway: POST /auth/register
    API Gateway->>User Service: Validate request
    User Service->>Database: Check email exists
    Database-->>User Service: Email available
    User Service->>Database: Create tenant schema
    Database-->>User Service: Schema created
    User Service->>Tenant Service: Create tenant record
    Tenant Service->>Database: Insert tenant (public schema)
    Database-->>Tenant Service: Tenant created
    Tenant Service-->>User Service: Tenant ID
    User Service->>Database: Create user (tenant schema)
    Database-->>User Service: User created
    User Service->>Email Service: Send verification email
    Email Service-->>User: Verification email
    User Service-->>API Gateway: Success response
    API Gateway-->>Frontend: 201 Created
    Frontend-->>User: Registration success
```

### Workflow 2: Multi-Platform Content Publishing

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API Gateway
    participant Publishing Service
    participant Content Service
    participant Platform APIs
    participant Redis Queue
    participant Worker

    User->>Frontend: Select content + platforms
    Frontend->>API Gateway: POST /publish
    API Gateway->>Publishing Service: Create publish jobs
    Publishing Service->>Content Service: Validate content
    Content Service-->>Publishing Service: Content valid
    Publishing Service->>Database: Create publish jobs
    Publishing Service->>Redis Queue: Queue jobs
    Publishing Service-->>API Gateway: Jobs queued
    API Gateway-->>Frontend: 202 Accepted

    Worker->>Redis Queue: Poll for jobs
    Redis Queue-->>Worker: Publish job
    Worker->>Publishing Service: Get job details
    Worker->>Platform APIs: Publish content
    Platform APIs-->>Worker: Publish success
    Worker->>Database: Update job status
    Worker->>Frontend: WebSocket notification
    Frontend-->>User: Publish complete
```

### Workflow 3: AI Content Generation via Workflow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API Gateway
    participant Workflow Service
    participant AI Service
    participant ComfyUI
    participant n8n
    participant Content Service

    User->>Frontend: Select workflow + parameters
    Frontend->>API Gateway: POST /workflows/{id}/execute
    API Gateway->>Workflow Service: Execute workflow
    Workflow Service->>Database: Get workflow definition
    Workflow Service->>AI Service: Trigger content generation
    AI Service->>ComfyUI: Execute workflow JSON
    ComfyUI->>ComfyUI: Generate content (GPU)
    ComfyUI-->>AI Service: Content ready
    AI Service->>S3: Upload generated content
    S3-->>AI Service: Content URL
    AI Service->>n8n: Trigger post-processing
    n8n->>n8n: Process content
    n8n-->>AI Service: Processing complete
    AI Service->>Content Service: Create content record
    Content Service-->>Workflow Service: Content created
    Workflow Service-->>API Gateway: Execution complete
    API Gateway-->>Frontend: 202 Accepted
    Frontend->>Frontend: Poll for completion
    Frontend-->>User: Content ready
```

### Workflow 4: OAuth Platform Connection

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API Gateway
    participant Publishing Service
    participant Platform OAuth
    participant Database

    User->>Frontend: Connect platform
    Frontend->>API Gateway: POST /social-accounts
    API Gateway->>Publishing Service: Initiate OAuth
    Publishing Service->>Platform OAuth: Generate auth URL
    Platform OAuth-->>Publishing Service: Auth URL
    Publishing Service-->>API Gateway: Auth URL
    API Gateway-->>Frontend: Auth URL
    Frontend-->>User: Redirect to platform

    User->>Platform OAuth: Authorize app
    Platform OAuth-->>Frontend: OAuth callback (code)
    Frontend->>API Gateway: GET /auth/callback?code=xxx
    API Gateway->>Publishing Service: Exchange code for token
    Publishing Service->>Platform OAuth: Exchange code
    Platform OAuth-->>Publishing Service: Access token + refresh token
    Publishing Service->>Database: Store encrypted tokens
    Publishing Service->>Platform OAuth: Get account info
    Platform OAuth-->>Publishing Service: Account details
    Publishing Service->>Database: Create social account record
    Publishing Service-->>API Gateway: Account connected
    API Gateway-->>Frontend: Success
    Frontend-->>User: Platform connected
```

---

## Database Schema

### Schema-Per-Tenant Architecture

**Public Schema (System-Wide):**

- `tenants` - Tenant metadata and settings
- `migrations` - Database migration history
- `shared_data` - Countries, timezones, platform metadata

**Tenant Schema (Per Tenant):**
Each tenant has isolated schema with tables:

- `users` - User accounts
- `content` - Media content
- `social_accounts` - Connected platform accounts
- `workflows` - Workflow definitions
- `publish_jobs` - Publishing jobs
- `analytics` - Performance metrics
- `teams` - Team management
- `comments` - Content comments
- `notifications` - In-app notifications

### Key Tables (Tenant Schema)

**Users Table:**

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  avatar_url TEXT,
  email_verified BOOLEAN DEFAULT false,
  two_factor_enabled BOOLEAN DEFAULT false,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, email)
);

CREATE INDEX idx_users_tenant_email ON users(tenant_id, email);
CREATE INDEX idx_users_role ON users(tenant_id, role);
```

**Content Table:**

```sql
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(500) NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  metadata JSONB DEFAULT '{}',
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_content_tenant_user ON content(tenant_id, user_id);
CREATE INDEX idx_content_type_status ON content(tenant_id, type, status);
CREATE INDEX idx_content_created ON content(tenant_id, created_at DESC);
```

**Publish Jobs Table:**

```sql
CREATE TABLE publish_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  content_id UUID NOT NULL REFERENCES content(id),
  social_account_id UUID NOT NULL REFERENCES social_accounts(id),
  platform VARCHAR(50) NOT NULL,
  scheduled_at TIMESTAMP NOT NULL,
  published_at TIMESTAMP,
  status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
  metadata JSONB DEFAULT '{}',
  error_message TEXT,
  platform_post_id VARCHAR(255),
  platform_post_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_publish_jobs_tenant_status ON publish_jobs(tenant_id, status);
CREATE INDEX idx_publish_jobs_scheduled ON publish_jobs(tenant_id, scheduled_at);
CREATE INDEX idx_publish_jobs_content ON publish_jobs(tenant_id, content_id);
```

---

## Frontend Architecture

### Component Architecture

**Component Organization:**

```
apps/web/src/
├── components/
│   ├── ui/              # shadcn/ui base components
│   ├── layout/           # Layout components (Header, Sidebar, Footer)
│   ├── features/          # Feature-specific components
│   │   ├── content/      # Content library components
│   │   ├── publishing/   # Publishing interface
│   │   ├── calendar/     # Content calendar
│   │   ├── workflows/    # Workflow builder
│   │   └── analytics/    # Analytics components
│   └── shared/           # Shared components
├── app/                  # Next.js App Router pages
│   ├── (auth)/           # Auth routes
│   ├── (dashboard)/     # Dashboard routes
│   └── api/              # API routes (BFF)
├── hooks/                # Custom React hooks
├── services/             # API client services
├── stores/               # Zustand stores
├── lib/                  # Utilities, configs
└── types/                # TypeScript types (from packages/shared)
```

**Component Template:**

```typescript
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ComponentProps {
  // Props definition
}

export function Component({ ...props }: ComponentProps) {
  const [state, setState] = useState();

  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

### State Management Architecture

**State Structure:**

- **Zustand Stores:** UI state (modals, sidebar, theme)
- **React Query:** Server state (content, workflows, analytics)
- **URL State:** Filters, pagination, search queries

**State Management Patterns:**

- Use React Query for all server data (caching, sync, background updates)
- Use Zustand for global UI state (minimal, only when needed)
- Use local state (useState) for component-specific state
- Use URL search params for shareable/filterable state

### Routing Architecture

**Route Organization:**

```
app/
├── (auth)/
│   ├── login/
│   ├── register/
│   └── callback/
├── (dashboard)/
│   ├── dashboard/
│   ├── content/
│   ├── workflows/
│   ├── calendar/
│   ├── analytics/
│   ├── team/
│   └── settings/
└── api/              # BFF routes
    ├── auth/
    └── webhooks/
```

**Protected Route Pattern:**

```typescript
// app/(dashboard)/layout.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';

export default async function DashboardLayout({ children }) {
  const session = await getServerSession();
  if (!session) redirect('/login');
  return <>{children}</>;
}
```

### Frontend Services Layer

**API Client Setup:**

```typescript
// lib/api-client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

**Service Example:**

```typescript
// services/content-service.ts
import apiClient from '@/lib/api-client';
import { Content } from '@/types';

export const contentService = {
  async list(params?: { page?: number; limit?: number }) {
    const { data } = await apiClient.get('/content', { params });
    return data;
  },

  async getById(id: string): Promise<Content> {
    const { data } = await apiClient.get(`/content/${id}`);
    return data;
  },

  async create(formData: FormData): Promise<Content> {
    const { data } = await apiClient.post('/content', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
```

---

## Backend Architecture

### Service Architecture

**Controller/Route Organization:**

```
apps/api/src/
├── routes/
│   ├── auth.routes.ts
│   ├── content.routes.ts
│   ├── workflows.routes.ts
│   ├── publish.routes.ts
│   └── analytics.routes.ts
├── controllers/
│   ├── auth.controller.ts
│   ├── content.controller.ts
│   └── ...
├── services/
│   ├── user.service.ts
│   ├── content.service.ts
│   └── ...
├── repositories/
│   ├── user.repository.ts
│   ├── content.repository.ts
│   └── ...
├── middleware/
│   ├── auth.middleware.ts
│   ├── tenant.middleware.ts
│   └── error.middleware.ts
└── utils/
```

**Controller Template:**

```typescript
// controllers/content.controller.ts
import { Request, Response } from 'express';
import { contentService } from '../services/content.service';

export const contentController = {
  async list(req: Request, res: Response) {
    const { tenantId } = req.tenant;
    const { page, limit } = req.query;
    const content = await contentService.list(tenantId, { page, limit });
    res.json(content);
  },

  async create(req: Request, res: Response) {
    const { tenantId } = req.tenant;
    const content = await contentService.create(tenantId, req.body);
    res.status(201).json(content);
  },
};
```

### Database Architecture

**Data Access Layer (Repository Pattern):**

```typescript
// repositories/content.repository.ts
import { db } from '../db';
import { Content } from '../types';

export class ContentRepository {
  async findByTenant(tenantId: string, filters?: any): Promise<Content[]> {
    // Set search_path to tenant schema
    await db.query(`SET search_path TO tenant_${tenantId}`);
    const result = await db.query('SELECT * FROM content WHERE ...');
    return result.rows;
  }

  async create(tenantId: string, data: Partial<Content>): Promise<Content> {
    await db.query(`SET search_path TO tenant_${tenantId}`);
    const result = await db.query(
      'INSERT INTO content (...) VALUES (...) RETURNING *',
      [...]
    );
    return result.rows[0];
  }
}
```

### Authentication and Authorization

**Auth Flow:**

```mermaid
sequenceDiagram
    participant Client
    participant API Gateway
    participant Auth Middleware
    participant User Service
    participant Database

    Client->>API Gateway: Request with JWT
    API Gateway->>Auth Middleware: Validate token
    Auth Middleware->>Auth Middleware: Decode JWT
    Auth Middleware->>Database: Get user + tenant
    Database-->>Auth Middleware: User data
    Auth Middleware->>Auth Middleware: Set req.user, req.tenant
    Auth Middleware-->>API Gateway: Authenticated
    API Gateway->>User Service: Process request
```

**Middleware/Guards:**

```typescript
// middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded.user;
    req.tenant = decoded.tenant;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

---

## Unified Project Structure

```
mpcas2/
├── .github/
│   └── workflows/
│       ├── ci.yaml
│       └── deploy.yaml
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/            # App Router pages
│   │   │   ├── components/     # React components
│   │   │   ├── hooks/          # Custom hooks
│   │   │   ├── services/       # API services
│   │   │   ├── stores/         # Zustand stores
│   │   │   ├── lib/            # Utilities
│   │   │   └── types/          # Types (from shared)
│   │   ├── public/
│   │   ├── tests/
│   │   └── package.json
│   ├── api/                    # Express API Gateway
│   │   ├── src/
│   │   │   ├── routes/         # API routes
│   │   │   ├── controllers/    # Route handlers
│   │   │   ├── services/       # Business logic
│   │   │   ├── repositories/   # Data access
│   │   │   ├── middleware/     # Express middleware
│   │   │   └── utils/
│   │   ├── tests/
│   │   └── package.json
│   └── ai-service/             # Python FastAPI AI service
│       ├── src/
│       │   ├── routers/        # FastAPI routes
│       │   ├── services/       # AI services
│       │   └── models/
│       ├── tests/
│       └── requirements.txt
├── packages/
│   ├── shared/                 # Shared TypeScript
│   │   ├── src/
│   │   │   ├── types/          # TypeScript interfaces
│   │   │   ├── constants/      # Shared constants
│   │   │   └── utils/         # Shared utilities
│   │   └── package.json
│   ├── ui/                     # shadcn/ui components
│   │   ├── src/
│   │   └── package.json
│   └── config/                 # Shared configs
│       ├── eslint/
│       ├── typescript/
│       └── jest/
├── infrastructure/             # IaC
│   ├── terraform/
│   └── kubernetes/
├── workflows/                  # n8n exports
├── docker/                     # Docker configs
│   ├── docker-compose.yml
│   └── Dockerfile.*
├── docs/                       # Documentation
│   ├── prd.md
│   ├── front-end-spec.md
│   └── architecture.md
├── .env.example
├── package.json                # Root package.json
├── turbo.json                  # Turborepo config
└── README.md
```

---

## Development Workflow

### Local Development Setup

**Prerequisites:**

```bash
# Required
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose
- Python 3.11+ (for AI service)

# Optional
- n8n (Docker)
- ComfyUI (Docker or local GPU setup)
```

**Initial Setup:**

```bash
# Clone repository
git clone <repo-url>
cd mpcas2

# Install dependencies
npm install

# Copy environment files
cp .env.example .env
cp apps/api/.env.example apps/api/.env

# Start local services (PostgreSQL, Redis)
docker-compose up -d

# Run database migrations
npm run db:migrate

# Start development servers
npm run dev
```

**Development Commands:**

```bash
# Start all services (frontend + backend)
npm run dev

# Start frontend only
npm run dev:web

# Start backend only
npm run dev:api

# Run tests
npm run test

# Run linting
npm run lint

# Build for production
npm run build
```

### Environment Configuration

**Required Environment Variables:**

```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Backend (.env)
DATABASE_URL=postgresql://user:pass@localhost:5432/mpcas2
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# S3 Storage
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=mpcas2-media
AWS_REGION=us-east-1

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# SendGrid
SENDGRID_API_KEY=SG...

# Platform OAuth (example)
YOUTUBE_CLIENT_ID=...
YOUTUBE_CLIENT_SECRET=...

# AI Services
COMFYUI_URL=http://localhost:8188
OLLAMA_URL=http://localhost:11434
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-...
```

---

## Deployment Architecture

### Deployment Strategy

**Frontend Deployment:**

- **Platform:** Vercel (recommended) or AWS CloudFront + S3
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **CDN/Edge:** Vercel Edge Network or Cloudflare CDN

**Backend Deployment:**

- **Platform:** AWS ECS/EKS (Kubernetes)
- **Build Command:** Docker build
- **Deployment Method:** Containerized services, auto-scaling

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          # Deployment steps
```

### Environments

| Environment | Frontend URL               | Backend URL                    | Purpose                |
| ----------- | -------------------------- | ------------------------------ | ---------------------- |
| Development | http://localhost:3000      | http://localhost:3001          | Local development      |
| Staging     | https://staging.mpcas2.com | https://api-staging.mpcas2.com | Pre-production testing |
| Production  | https://app.mpcas2.com     | https://api.mpcas2.com         | Live environment       |

---

## Security and Performance

### Security Requirements

**Frontend Security:**

- CSP Headers: Strict Content Security Policy
- XSS Prevention: React's built-in escaping, sanitize user input
- Secure Storage: HTTP-only cookies for tokens, no localStorage for sensitive data

**Backend Security:**

- Input Validation: Zod schemas for all inputs
- Rate Limiting: 100 requests/minute per user, 1000/minute per IP
- CORS Policy: Whitelist frontend domains only

**Authentication Security:**

- Token Storage: HTTP-only cookies (recommended) or secure localStorage
- Session Management: JWT with 15min expiry, refresh tokens with 30-day expiry
- Password Policy: Min 8 chars, require uppercase, lowercase, number, special char

### Performance Optimization

**Frontend Performance:**

- Bundle Size Target: <200KB initial bundle (gzipped)
- Loading Strategy: Code splitting, lazy loading, SSR for critical pages
- Caching Strategy: React Query caching, CDN for static assets

**Backend Performance:**

- Response Time Target: <200ms for 95th percentile
- Database Optimization: Indexes on foreign keys, query optimization, connection pooling
- Caching Strategy: Redis for frequently accessed data, 5min TTL default

---

## Testing Strategy

### Testing Pyramid

```
        E2E Tests (10%)
       /            \
      Integration Tests (20%)
     /                    \
    Frontend Unit          Backend Unit
    Tests (35%)            Tests (35%)
```

### Test Organization

**Frontend Tests:**

```
apps/web/tests/
├── unit/
│   ├── components/
│   └── utils/
├── integration/
│   └── api/
└── e2e/
    └── user-flows.spec.ts
```

**Backend Tests:**

```
apps/api/tests/
├── unit/
│   ├── services/
│   └── utils/
├── integration/
│   ├── routes/
│   └── repositories/
└── e2e/
    └── api-flows.spec.ts
```

**E2E Tests:**

```
tests/e2e/
├── auth.spec.ts
├── publishing.spec.ts
└── workflows.spec.ts
```

### Test Examples

**Frontend Component Test:**

```typescript
import { render, screen } from '@testing-library/react';
import { ContentCard } from '@/components/content/ContentCard';

describe('ContentCard', () => {
  it('renders content title', () => {
    render(<ContentCard title="Test Video" />);
    expect(screen.getByText('Test Video')).toBeInTheDocument();
  });
});
```

**Backend API Test:**

```typescript
import request from 'supertest';
import { app } from '../src/app';

describe('POST /api/v1/content', () => {
  it('creates content', async () => {
    const response = await request(app)
      .post('/api/v1/content')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test', type: 'video' });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe('Test');
  });
});
```

---

## Coding Standards

### Critical Fullstack Rules

- **Type Sharing:** Always define types in `packages/shared/src/types` and import from there. Never duplicate type definitions.
- **API Calls:** Never make direct HTTP calls in components. Always use service layer (`services/*.ts`).
- **Environment Variables:** Access only through config objects (`lib/config.ts`), never `process.env` directly.
- **Error Handling:** All API routes must use the standard error handler middleware. All frontend API calls must handle errors gracefully.
- **State Updates:** Never mutate state directly. Use proper state management patterns (React Query, Zustand, useState).
- **Database Queries:** Always use repository pattern. Never write raw SQL in controllers or services.
- **Tenant Context:** Always set tenant context from JWT token. Never trust client-provided tenant ID.

### Naming Conventions

| Element          | Frontend             | Backend    | Example             |
| ---------------- | -------------------- | ---------- | ------------------- |
| Components       | PascalCase           | -          | `UserProfile.tsx`   |
| Hooks            | camelCase with 'use' | -          | `useAuth.ts`        |
| API Routes       | -                    | kebab-case | `/api/user-profile` |
| Database Tables  | -                    | snake_case | `user_profiles`     |
| Services         | camelCase            | camelCase  | `contentService.ts` |
| Types/Interfaces | PascalCase           | PascalCase | `Content`           |

---

## Error Handling Strategy

### Error Flow

```mermaid
sequenceDiagram
    participant Client
    participant API Gateway
    participant Service
    participant Database

    Client->>API Gateway: Request
    API Gateway->>Service: Process
    Service->>Database: Query
    Database-->>Service: Error
    Service-->>API Gateway: Error
    API Gateway->>API Gateway: Format error
    API Gateway-->>Client: Error response
    Client->>Client: Display error
```

### Error Response Format

```typescript
interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId: string;
  };
}
```

### Frontend Error Handling

```typescript
// lib/error-handler.ts
export function handleApiError(error: unknown) {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data?.error;
    if (apiError) {
      toast.error(apiError.message);
      return apiError;
    }
  }
  toast.error('An unexpected error occurred');
}
```

### Backend Error Handling

```typescript
// middleware/error.middleware.ts
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  const error = {
    code: err.name || 'INTERNAL_ERROR',
    message: err.message || 'Internal server error',
    timestamp: new Date().toISOString(),
    requestId: req.id,
  };

  res.status(err.statusCode || 500).json({ error });
}
```

---

## Monitoring and Observability

### Monitoring Stack

- **Frontend Monitoring:** Sentry (error tracking), Vercel Analytics (performance)
- **Backend Monitoring:** Prometheus (metrics), Grafana (dashboards)
- **Error Tracking:** Sentry (real-time alerts, stack traces)
- **Performance Monitoring:** Prometheus metrics, APM (Application Performance Monitoring)

### Key Metrics

**Frontend Metrics:**

- Core Web Vitals (LCP, FID, CLS)
- JavaScript errors
- API response times
- User interactions (clicks, page views)

**Backend Metrics:**

- Request rate (requests/second)
- Error rate (errors/second)
- Response time (p50, p95, p99)
- Database query performance
- Queue depth (Redis/Bull)

---

**Document Status:** ✅ Complete  
**Version:** 1.0  
**Next Steps:**

1. Review architecture with team
2. Set up development environment
3. Begin Epic 1 implementation (Foundation & Core Infrastructure)
