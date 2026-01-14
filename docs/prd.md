# MPCAS Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** January 2026  
**Status:** Draft  
**Project:** Multi-Platform Content Automation System (MPCAS)

---

## Goals and Background Context

### Goals

- Enable content creators to automate content creation and publishing across 8 major social media platforms (YouTube, Instagram, TikTok, Twitter/X, LinkedIn, Facebook, Pinterest, Threads)
- Provide agencies with white-label solution to manage 200+ client accounts from unified dashboard
- Create workflow marketplace with 1,000+ pre-built workflows for content generation
- Deliver AI-powered content optimization including title generation, trend detection, and performance prediction
- Support multi-tenant SaaS architecture with complete data isolation per tenant
- Achieve $101K MRR by Month 6 with 1,000 users
- Enable resellers to white-label platform with custom branding and domain
- Provide comprehensive analytics and reporting across all platforms
- Support IP rotation service for multi-account posting without detection
- Build scalable infrastructure supporting 10,000+ concurrent users

### Background Context

MPCAS addresses critical pain points in the social media management market. Content creators currently spend 10-15 hours per week manually posting across multiple platforms, each requiring different formats, metadata, and optimization strategies. Agencies struggle with managing multiple client accounts using 3-5 different tools, resulting in high operational overhead and client churn.

The market has a $12B addressable market (TAM) with existing tools serving 10M+ users, but none provide comprehensive multi-platform automation with white-label capabilities. MPCAS differentiates by combining 8 platform support, AI-powered content generation (80% self-hosted for cost efficiency), workflow marketplace, and complete white-label system in a single unified platform.

The solution leverages open-source technologies (n8n, ComfyUI, Ollama) to keep costs 70-90% lower than cloud-only AI solutions, enabling competitive pricing while maintaining high margins (60-75% at scale).

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2026-01-XX | 1.0 | Initial PRD creation from project brief | PM Agent |

---

## Requirements

### Functional Requirements

**FR1:** The system shall support user authentication via email/password and OAuth 2.0 (Google, Microsoft, Okta) with JWT tokens and refresh token rotation.

**FR2:** The system shall implement multi-tenant architecture with schema-per-tenant isolation ensuring complete data separation between tenants.

**FR3:** The system shall support 6 pricing tiers: Free, Creator ($29/month), Professional ($99/month), Agency ($299/month), White Label ($599/month), and Enterprise (custom pricing).

**FR4:** The system shall allow users to connect social media accounts via OAuth 2.0 for YouTube, Instagram, TikTok, Twitter/X, LinkedIn, Facebook, Pinterest, and Threads.

**FR5:** The system shall support multiple accounts per platform within tier limits (e.g., Creator: 12 accounts, Professional: 50 accounts, Agency: 200 accounts).

**FR6:** The system shall enable users to generate AI-powered video content using ComfyUI workflows with support for Stable Diffusion XL, Flux, AnimateDiff, and CogVideoX models.

**FR7:** The system shall enable users to generate AI-powered image content using Stable Diffusion XL, Flux, and other supported models via ComfyUI.

**FR8:** The system shall provide workflow marketplace with 1,000+ pre-built workflows categorized by content type, platform, and complexity.

**FR9:** The system shall allow users to activate workflows from marketplace within tier limits (Free: 3 active, Creator: 10 active, Professional: 25 active, Agency: 100 active, White Label: Unlimited).

**FR10:** The system shall enable users to create custom workflows using visual workflow builder (ReactFlow-based) or by uploading n8n/ComfyUI JSON exports.

**FR11:** The system shall support automated workflow scraping from n8n community, OpenArt, ComfyUI, and CivitAI with admin curation workflow.

**FR12:** The system shall provide AI workflow builder that creates workflows from conversations, images, videos, or URLs.

**FR13:** The system shall enable users to publish content to YouTube (videos, Shorts, community posts) with direct API upload, metadata setting, and scheduled publishing.

**FR14:** The system shall enable users to publish content to Instagram (Feed posts, Reels, Stories) with hashtag optimization, location tagging, and first comment auto-post.

**FR15:** The system shall enable users to publish content to TikTok (short videos, photo mode) with sound selection, duet/stitch settings, and trending hashtag suggestions.

**FR16:** The system shall enable users to publish content to Twitter/X (tweets, videos, threads, polls) with character limit handling and media attachment support.

**FR17:** The system shall enable users to publish content to LinkedIn (personal posts, company page posts, videos, articles) with professional tone optimization.

**FR18:** The system shall enable users to publish content to Facebook (page posts, Reels, Stories) with audience targeting and crossposting to Instagram.

**FR19:** The system shall enable users to publish content to Pinterest (pins, video pins, idea pins) with board management and Rich Pins support.

**FR20:** The system shall enable users to publish content to Threads (text, images, videos, polls) with reply control and quote post support.

**FR21:** The system shall automatically optimize content format per platform (aspect ratio, length, bitrate, resolution) based on platform requirements.

**FR22:** The system shall allow users to set custom metadata (title, description, hashtags, thumbnail) per platform for the same content.

**FR23:** The system shall support staggered posting with configurable delays (5-15 minutes) between platforms to appear more human.

**FR24:** The system shall provide visual content calendar with month, week, day, and agenda views showing scheduled posts color-coded by status.

**FR25:** The system shall enable drag-and-drop scheduling where users can drag content from library to calendar to schedule instantly.

**FR26:** The system shall provide AI-powered "best time to post" recommendations per platform based on historical performance and audience online times.

**FR27:** The system shall support recurring schedules (daily, weekly, bi-weekly, monthly) with content rotation (sequential or random).

**FR28:** The system shall detect content gaps and alert users when no posts are scheduled for upcoming days.

**FR29:** The system shall provide auto-fill gaps feature that suggests evergreen content from library to fill scheduling gaps.

**FR30:** The system shall track video performance metrics per platform including views, watch time, engagement rate, impressions, CTR, traffic sources, and audience retention.

**FR31:** The system shall provide cross-platform analytics dashboard comparing performance across all connected platforms.

**FR32:** The system shall support A/B testing for thumbnails, titles, descriptions, and hashtags with automatic winner selection based on statistical significance.

**FR33:** The system shall generate automated monthly client reports (PDF, PowerPoint, interactive dashboard) with white-label branding for agencies.

**FR34:** The system shall provide AI-powered title generator that creates 10 title variations ranked by predicted performance.

**FR35:** The system shall provide AI-powered caption generator with platform-specific optimization (Instagram: hook + body + CTA + hashtags, TikTok: short punchy, Twitter: under 280 chars).

**FR36:** The system shall provide content ideation feature generating 50 content ideas categorized by trending, evergreen, controversial, how-to, listicles, and storytelling.

**FR37:** The system shall monitor trends in real-time across YouTube, TikTok, Instagram, Twitter, and Google Trends with alerts for new trends in user's niche.

**FR38:** The system shall provide performance prediction engine that estimates expected views, engagement rate, and confidence interval before publishing.

**FR39:** The system shall enable users to monitor up to 10 competitors tracking their new posts, performance, topics, and ranking keywords.

**FR40:** The system shall provide keyword research tool integrating Google Autocomplete, Google Trends, and YouTube Autocomplete APIs.

**FR41:** The system shall calculate SEO score (0-100) analyzing title, description, tags/hashtags, and thumbnail with specific recommendations for improvement.

**FR42:** The system shall auto-generate tags/hashtags per platform (YouTube: 15 tags, Instagram: 30 hashtags, TikTok: 5-7 hashtags) with mix of broad, niche, and trending.

**FR43:** The system shall provide digital asset management (DAM) with folder organization (My Assets, Team Assets, Client Assets, Stock Content, Brand Assets).

**FR44:** The system shall auto-tag uploaded assets using AI analysis (objects, scenes, colors, mood, text OCR for images; content type, scenes, audio, faces for videos).

**FR45:** The system shall support version control for assets with automatic versioning, side-by-side comparison, and revert functionality.

**FR46:** The system shall provide brand kit management storing logos (primary, secondary, icon, variations), colors (HEX, RGB, CMYK), typography (fonts, files), templates, and guidelines.

**FR47:** The system shall check uploaded assets against brand kit flagging wrong logos, off-brand colors, or incorrect fonts with suggestions.

**FR48:** The system shall integrate with stock content providers (Pexels, Pixabay, Unsplash, Videvo, Envato Elements, Storyblocks, Adobe Stock) with unified search.

**FR49:** The system shall support Google Workspace integration with Gmail/Google OAuth, YouTube direct publishing, and Google Drive archival.

**FR50:** The system shall automatically backup generated videos to Google Drive with organized folder structure (MPCAS Archives/Year/Month/Videos/).

**FR51:** The system shall provide download protection system with 7-day, 3-day, and 1-day warnings before file deletion with one-click archive to Drive option.

**FR52:** The system shall support team collaboration with 6 roles (Owner, Admin, Manager, Editor, Viewer, Programmer) and granular permissions per feature.

**FR53:** The system shall provide real-time collaboration features showing who's online, activity feed, notifications, and shared workspace.

**FR54:** The system shall support commenting and annotations on content with @mentions, threads, and resolve/unresolve functionality.

**FR55:** The system shall provide approval workflows requiring Manager/Admin approval before publishing with configurable per-role settings.

**FR56:** The system shall enable agencies to create client portals with unique URLs, view-only access to content library and analytics, and request submission system.

**FR57:** The system shall support white-label branding allowing custom domain, logo, color scheme, login page, and email templates with complete MPCAS branding removal.

**FR58:** The system shall provide reseller dashboard showing client list, MRR, active clients, churn rate, and revenue metrics.

**FR59:** The system shall support IP rotation service with 10,000+ residential proxy IPs for multi-account posting with per-account or pay-per-post pricing.

**FR60:** The system shall provide account warming system where users can opt-in idle accounts to earn credits while admin uses them to warm admin-owned accounts.

**FR61:** The system shall provide traffic-as-a-service where users can purchase engagement (likes, comments, follows, views) using credits with campaign dashboard.

**FR62:** The system shall support P2P IP sharing network where users share residential IPs earning 10 credits per GB shared.

**FR63:** The system shall provide multi-tenant AI assistant (GPT-4 or Claude 3.5) with persistent conversation history, context-aware help, and tenant-isolated data.

**FR64:** The system shall support affiliate program automatically enabled for all users with unique codes, 30% first payment + 15% recurring commissions, and milestone bonuses.

**FR65:** The system shall provide support ticket system with categories (billing, technical, feature request), priority levels, and tier-based response time SLAs.

**FR66:** The system shall support subscription management with monthly/annual billing, tier upgrades/downgrades, overage charges, and automatic renewal.

**FR67:** The system shall track usage per tenant (videos generated, storage used, GPU minutes, API calls) and enforce tier limits with overage billing.

**FR68:** The system shall provide admin dashboard with system health metrics, user management, workflow curation, platform management, billing controls, and premium service configuration.

### Non-Functional Requirements

**NFR1:** The system shall achieve 99.9% uptime SLA for Professional tier and above with 24/7 monitoring and automatic failover.

**NFR2:** The system shall respond to API requests within 200ms for 95th percentile with horizontal scaling support for 10,000+ concurrent users.

**NFR3:** The system shall encrypt all data at rest using AES-256-GCM with per-tenant encryption keys managed via AWS KMS or HashiCorp Vault.

**NFR4:** The system shall encrypt all data in transit using TLS 1.3 with certificate management via Let's Encrypt or cloud provider.

**NFR5:** The system shall implement comprehensive audit logging for all user actions with 1-7 year retention (configurable) and searchable export functionality.

**NFR6:** The system shall achieve >98% publishing success rate with automatic retry logic, exponential backoff, and detailed error reporting.

**NFR7:** The system shall support schema-per-tenant multi-tenancy with complete data isolation, per-tenant backups, and easy tenant migration.

**NFR8:** The system shall implement rate limiting per user and per endpoint to prevent abuse with configurable limits per tier.

**NFR9:** The system shall provide DDoS protection via Cloudflare with WAF (Web Application Firewall) and rate limiting.

**NFR10:** The system shall comply with GDPR requirements including data portability (export all data), right to be forgotten (complete deletion), and privacy by design.

**NFR11:** The system shall comply with CCPA requirements including disclosure of data collection, opt-out of data sales, and access/deletion rights.

**NFR12:** The system shall support horizontal scaling of application servers (10-100+ instances), n8n workers, ComfyUI GPU instances, database read replicas, and Redis clusters.

**NFR13:** The system shall achieve <2 second page load times with CDN integration (Cloudflare), code splitting, and lazy loading.

**NFR14:** The system shall provide comprehensive monitoring via Prometheus + Grafana with custom dashboards, real-time metrics, and alerting (email, SMS, Slack, PagerDuty).

**NFR15:** The system shall implement centralized logging via ELK Stack (Elasticsearch, Logstash, Kibana) with 30-day hot retention and 1-year cold retention.

**NFR16:** The system shall provide error tracking via Sentry with real-time alerts, stack traces, and context for debugging.

**NFR17:** The system shall support automated backups with daily snapshots, point-in-time recovery, and cross-region replication for disaster recovery.

**NFR18:** The system shall achieve 80%+ workload on self-hosted AI (ComfyUI, Ollama) to reduce costs by 70-90% compared to cloud-only solutions.

**NFR19:** The system shall support mobile-responsive design with iOS Safari and Android Chrome compatibility for all core features.

**NFR20:** The system shall implement accessibility standards (WCAG AA minimum) with keyboard navigation, screen reader support, and color contrast compliance.

---

## User Interface Design Goals

### Overall UX Vision

MPCAS provides a unified, intuitive interface that enables users to manage complex multi-platform content automation workflows without technical expertise. The interface emphasizes visual workflows, drag-and-drop interactions, and AI-powered assistance to reduce cognitive load and increase productivity. The design balances power-user features (workflow builder, advanced analytics) with simplicity for non-technical users (one-click publishing, template workflows).

The platform uses a modern, clean aesthetic with clear information hierarchy, contextual help, and progressive disclosure of advanced features. Real-time feedback, status indicators, and comprehensive error messages ensure users always understand system state and can recover from issues quickly.

### Key Interaction Paradigms

- **Visual Workflow Builder:** Drag-and-drop node-based interface (ReactFlow) for creating and editing workflows with real-time validation and AI suggestions
- **Content Calendar:** Drag-and-drop scheduling from content library to calendar with visual status indicators (published, scheduled, draft, needs approval, failed)
- **Unified Publishing Interface:** Single interface for publishing to multiple platforms with platform-specific previews and optimization suggestions
- **Contextual AI Assistant:** Persistent chat interface (bottom-right corner) providing context-aware help, workflow suggestions, and content optimization
- **Approval Queue:** Grid-based interface with quick actions (approve, reject, request changes) and inline editing capabilities
- **Dashboard-First Design:** Comprehensive dashboard showing key metrics, recent activity, upcoming posts, and quick actions for common tasks

### Core Screens and Views

1. **Login/Authentication Screen:** OAuth options (Google, Microsoft, Okta), email/password, 2FA setup
2. **Main Dashboard:** Overview metrics, recent activity, upcoming posts, quick actions, AI assistant
3. **Content Library:** Grid/list view of all content (videos, images, audio) with filters, search, folders, and bulk actions
4. **Workflow Marketplace:** Browse, search, filter, and activate workflows with categories, tags, ratings, and reviews
5. **Workflow Builder:** Visual canvas for creating/editing workflows with node library sidebar and properties panel
6. **Content Calendar:** Month/week/day/agenda views with drag-and-drop scheduling and gap detection
7. **Publishing Interface:** Unified form for selecting content, platforms, metadata per platform, and scheduling options
8. **Analytics Dashboard:** Cross-platform performance metrics, charts, filters, and export options
9. **Platform Connections:** OAuth connection management for all 8 platforms with account labeling and health status
10. **Team Management:** User list, role assignment, permissions, activity logs, and collaboration features
11. **Client Portals (Agencies):** Separate portal interface for clients with view-only access to their content and analytics
12. **Settings:** User profile, billing, notifications, white-label branding (for White Label tier), API keys, integrations
13. **Admin Dashboard:** System health, user management, workflow curation, platform management, billing controls, premium services

### Accessibility: WCAG AA

The system shall comply with WCAG 2.1 Level AA standards including:
- Keyboard navigation for all interactive elements
- Screen reader support with proper ARIA labels
- Color contrast ratios of at least 4.5:1 for normal text and 3:1 for large text
- Focus indicators for keyboard navigation
- Alternative text for all images and media
- Form labels and error messages clearly associated with inputs
- Skip navigation links for main content areas

### Branding

- **Default Branding:** Modern, professional aesthetic with blue primary color (#3498db), clean typography (Inter or similar), and subtle gradients
- **White Label Support:** Complete rebranding capability for White Label tier including custom logo, color scheme, domain, and email templates
- **Responsive Design:** Mobile-first approach with breakpoints for mobile (320px+), tablet (768px+), and desktop (1024px+)
- **Dark Mode:** Optional dark theme with system preference detection and manual toggle

### Target Device and Platforms: Web Responsive

The primary interface is a responsive web application supporting:
- **Desktop:** Chrome, Firefox, Safari, Edge (latest 2 versions) on Windows, macOS, Linux
- **Tablet:** iPad (Safari), Android tablets (Chrome) with touch-optimized interactions
- **Mobile:** iPhone (Safari iOS 14+), Android (Chrome) with mobile-optimized layouts and gestures

All core features must be accessible and functional on mobile devices, with progressive enhancement for desktop-specific features (e.g., advanced workflow builder may have simplified mobile version).

---

## Technical Assumptions

### Repository Structure: Monorepo

The project uses a monorepo structure (recommended) with the following organization:
- `apps/web/` - Frontend React/Next.js application
- `apps/api/` - Backend Node.js/Express API server
- `apps/admin/` - Admin dashboard (optional separate app)
- `packages/shared/` - Shared TypeScript types, utilities, and constants
- `packages/ui/` - Shared UI components (shadcn/ui based)
- `workflows/` - n8n workflow exports and templates
- `docker/` - Docker configurations and compose files
- `docs/` - Documentation (PRD, architecture, API docs)

**Rationale:** Monorepo enables code sharing, unified versioning, atomic commits across frontend/backend, and simplified CI/CD. For a multi-tenant SaaS with tight frontend-backend coupling, monorepo reduces integration complexity.

### Service Architecture: Microservices (Modular Services)

The system uses a microservices approach with modular services within the monorepo:
- **API Gateway Service:** Authentication, rate limiting, routing, request validation
- **User Service:** User management, authentication, profiles, teams, roles
- **Tenant Service:** Multi-tenant management, schema creation, tenant settings
- **Content Service:** Content CRUD, file storage, versioning, DAM operations
- **Workflow Service:** Workflow management, marketplace, execution orchestration
- **Publishing Service:** Platform integrations, content publishing, scheduling, queue management
- **Analytics Service:** Performance tracking, metrics aggregation, reporting generation
- **AI Service:** Content generation (ComfyUI integration), AI features (title, caption, trends), LLM orchestration
- **Billing Service:** Subscriptions, usage tracking, invoicing, payment processing (Stripe)
- **Notification Service:** Email, SMS, in-app notifications, webhooks

**Rationale:** Microservices enable independent scaling (e.g., AI service can scale GPU workers separately), technology flexibility (Python for AI, Node.js for API), and team autonomy. Schema-per-tenant database provides data isolation while services share infrastructure.

### Testing Requirements: Full Testing Pyramid

The system implements comprehensive testing across all levels:
- **Unit Tests:** 80%+ coverage for business logic, utilities, and services (Jest for Node.js, Vitest for frontend)
- **Integration Tests:** API endpoints, database operations, external service integrations (n8n, ComfyUI, platform APIs)
- **E2E Tests:** Critical user journeys (Playwright or Cypress) - login, publish content, view analytics, workflow creation
- **Manual Testing:** UI/UX validation, accessibility testing, cross-browser testing, performance testing
- **Load Testing:** API performance under load (10,000+ concurrent users), database query optimization, caching effectiveness

**Rationale:** Full testing pyramid ensures reliability for a production SaaS platform. Unit tests catch logic errors early, integration tests verify service interactions, E2E tests validate user journeys, and load tests ensure scalability.

### Additional Technical Assumptions and Requests

- **Database:** PostgreSQL 15+ with schema-per-tenant architecture, read replicas for scaling, connection pooling (PgBouncer)
- **Caching:** Redis 7+ for sessions, API response caching, rate limiting, task queue (Bull)
- **Object Storage:** S3-compatible storage (AWS S3 or Cloudflare R2) for media files with CDN integration
- **Containerization:** Docker + Docker Compose for development, Kubernetes for production scaling
- **CI/CD:** GitHub Actions or GitLab CI with automated testing, Docker builds, and deployment to staging/production
- **Monitoring:** Prometheus + Grafana for metrics, ELK Stack for logging, Sentry for error tracking
- **API Documentation:** OpenAPI/Swagger specification with interactive API explorer
- **Type Safety:** TypeScript throughout (frontend and backend) with strict mode enabled
- **Code Quality:** ESLint, Prettier, Husky pre-commit hooks, automated code review (SonarQube optional)
- **Security:** OWASP Top 10 compliance, dependency scanning (Snyk or Dependabot), regular security audits
- **AI Infrastructure:** Self-hosted ComfyUI workers (GPU instances), Ollama for local LLMs, cloud LLMs (OpenAI, Anthropic) for 20% of workload
- **Workflow Engine:** Self-hosted n8n instance with multiple workers for parallel execution
- **Platform APIs:** OAuth 2.0 for all 8 platforms with token refresh, webhook support, and rate limit handling

---

## Epic List

**Epic 1: Foundation & Core Infrastructure**  
Establish project setup, multi-tenant database architecture, authentication system, and basic user management with initial health-check functionality.

**Epic 2: Platform Integrations & OAuth**  
Implement OAuth 2.0 connections for all 8 social media platforms (YouTube, Instagram, TikTok, Twitter/X, LinkedIn, Facebook, Pinterest, Threads) with token management and account management.

**Epic 3: Content Generation & Workflow System**  
Build AI-powered content generation using ComfyUI integration, workflow marketplace foundation, and basic workflow execution with n8n orchestration.

**Epic 4: Multi-Platform Publishing**  
Implement unified publishing interface with platform-specific optimization, scheduling system, and content calendar with drag-and-drop functionality.

**Epic 5: Analytics & Performance Tracking**  
Build analytics dashboard with cross-platform metrics, per-video performance tracking, and basic reporting capabilities.

**Epic 6: AI-Powered Features**  
Implement AI content assistant (title generator, caption generator, content ideation), trend detection, performance prediction, and competitor analysis.

**Epic 7: Team Collaboration & Permissions**  
Build team management system with role-based access control, real-time collaboration features, commenting, and approval workflows.

**Epic 8: White Label & Agency Features**  
Implement white-label branding system, client portals, reseller dashboard, and agency-specific features (sub-accounts, client reporting).

**Epic 9: Premium Services**  
Build IP rotation service, account warming system, traffic-as-a-service, and P2P IP sharing network.

**Epic 10: Billing & Subscription Management**  
Implement subscription tiers, usage tracking, overage billing, payment processing (Stripe), and admin billing controls.

**Epic 11: Digital Asset Management**  
Build advanced media library with AI auto-tagging, version control, brand kit management, and stock content integration.

**Epic 12: Admin Dashboard & System Management**  
Create comprehensive admin dashboard for user management, workflow curation, platform management, system monitoring, and configuration.

---

## Epic 1: Foundation & Core Infrastructure

**Goal:** Establish the foundational infrastructure for MPCAS including project setup, multi-tenant database architecture, authentication system, and basic user management. This epic delivers the core infrastructure that all subsequent features depend upon, ensuring secure, scalable, and maintainable foundation. The epic includes initial health-check functionality to validate the system is operational.

### Story 1.1: Project Setup & Repository Structure

As a developer,  
I want a properly structured monorepo with frontend, backend, shared packages, and configuration,  
so that the codebase is organized, maintainable, and supports efficient development workflows.

**Acceptance Criteria:**
1. Monorepo structure created with `apps/web/`, `apps/api/`, `packages/shared/`, `packages/ui/`, `workflows/`, `docker/`, and `docs/` directories
2. Package.json/workspace configuration enables cross-package dependencies and shared code
3. TypeScript configured with strict mode enabled across all packages
4. ESLint and Prettier configured with shared rules and pre-commit hooks (Husky)
5. Git repository initialized with .gitignore excluding node_modules, build artifacts, and environment files
6. README.md includes setup instructions, architecture overview, and development guidelines
7. Docker Compose file created for local development environment (PostgreSQL, Redis, n8n, ComfyUI)
8. CI/CD pipeline configured (GitHub Actions or GitLab CI) with automated testing and Docker builds

### Story 1.2: Multi-Tenant Database Architecture

As a system architect,  
I want a schema-per-tenant database architecture,  
so that tenant data is completely isolated and the system can scale to thousands of tenants.

**Acceptance Criteria:**
1. PostgreSQL 15+ database configured with connection pooling (PgBouncer)
2. Database migration system implemented (TypeORM, Prisma, or similar) with version control
3. Public schema created for system-wide tables (tenants, migrations, shared_data like countries, timezones)
4. Tenant schema creation function implemented that creates isolated schema per tenant on signup
5. All tenant-specific tables created in tenant schemas (users, content, workflows, social_accounts, analytics, etc.)
6. Database connection middleware automatically routes queries to correct tenant schema based on JWT token
7. Tenant schema deletion function implemented for complete data removal (GDPR compliance)
8. Database backup strategy configured with daily snapshots and point-in-time recovery capability
9. Read replica support configured for horizontal scaling of read operations
10. Migration rollback capability tested and documented

### Story 1.3: User Authentication System

As a user,  
I want to authenticate using email/password or OAuth providers,  
so that I can securely access the platform with my preferred authentication method.

**Acceptance Criteria:**
1. User registration endpoint accepts email, password, and optional tenant creation
2. Password hashing implemented using bcrypt with salt rounds (minimum 10)
3. Email verification flow implemented with verification tokens and expiration (24 hours)
4. Login endpoint validates credentials and returns JWT access token (15 min expiry) and refresh token (30 day expiry)
5. OAuth 2.0 integration implemented for Google, Microsoft, and Okta with proper scopes
6. OAuth callback handlers process authorization codes and create/update user accounts
7. JWT token generation includes user_id, tenant_id, role, and permissions
8. Refresh token endpoint validates refresh token and issues new access/refresh token pair
9. Token rotation implemented (refresh tokens are single-use, new pair issued on each refresh)
10. Logout endpoint invalidates refresh tokens and clears session
11. Password reset flow implemented with secure tokens, email delivery, and expiration (1 hour)
12. Rate limiting implemented for authentication endpoints (5 attempts per 15 minutes)
13. 2FA (TOTP) support implemented as optional security enhancement
14. Session management tracks active sessions with device information and last activity

### Story 1.4: Basic User Management

As a user,  
I want to view and edit my profile information,  
so that I can keep my account details up to date.

**Acceptance Criteria:**
1. User profile endpoint returns current user's profile (name, email, avatar, timezone, preferences)
2. Update profile endpoint allows modification of name, avatar, timezone, and preferences
3. Email change requires verification of new email address
4. Avatar upload supported with image validation (max 5MB, formats: JPG, PNG, WebP)
5. Profile picture stored in S3-compatible storage with CDN URL generation
6. User preferences stored (notifications, theme, language, date format)
7. Account deletion endpoint requires password confirmation and implements soft delete (30 day retention)
8. Activity log tracks profile changes with timestamp and IP address
9. Profile page displays account creation date, last login, and subscription tier
10. User can export their data in JSON format (GDPR compliance)

### Story 1.5: Health Check & System Status

As a system administrator,  
I want health check endpoints,  
so that I can monitor system status and diagnose issues.

**Acceptance Criteria:**
1. `/health` endpoint returns 200 OK with basic status when system is operational
2. `/health/detailed` endpoint returns database connection status, Redis connection status, external service status (S3, email)
3. Health check includes version information (API version, build number, git commit hash)
4. Database query executed to verify connectivity and response time logged
5. Redis ping executed to verify cache connectivity
6. Health check endpoint responds within 100ms for basic check, 500ms for detailed check
7. Health check results cached for 30 seconds to prevent excessive database queries
8. Monitoring integration ready (Prometheus metrics endpoint at `/metrics`)
9. Health check failures trigger alerts to monitoring system (optional integration)

---

## Epic 2: Platform Integrations & OAuth

**Goal:** Implement OAuth 2.0 connections for all 8 social media platforms enabling users to connect their accounts and manage platform-specific settings. This epic establishes the foundation for all publishing features by providing secure, token-managed connections to external platforms with proper error handling and token refresh mechanisms.

### Story 2.1: YouTube OAuth Integration

As a user,  
I want to connect my YouTube account via OAuth,  
so that I can publish videos directly to my YouTube channel.

**Acceptance Criteria:**
1. "Connect YouTube" button initiates OAuth 2.0 flow with Google OAuth
2. OAuth scopes requested: `youtube.upload`, `youtube.force-ssl`, `youtube.readonly`
3. OAuth callback handler processes authorization code and exchanges for access/refresh tokens
4. Access tokens stored encrypted (AES-256-GCM) in database with tenant isolation
5. Refresh tokens stored encrypted with single-use rotation on refresh
6. Token expiry tracked (access: 1 hour, refresh: indefinite until revoked)
7. Auto-refresh mechanism refreshes access tokens 5 minutes before expiry
8. Connected YouTube account displayed in dashboard with channel name, thumbnail, subscriber count
9. User can disconnect YouTube account which revokes tokens and removes connection
10. Multiple YouTube accounts supported (within tier limits: Creator: 3, Professional: 10, Agency: 50)
11. Account labeling supported (e.g., "Personal", "Business", "Client A")
12. Token health check validates token validity and alerts if token is invalid/expired

### Story 2.2: Instagram OAuth Integration

As a user,  
I want to connect my Instagram account via OAuth,  
so that I can publish content to Instagram Feed, Reels, and Stories.

**Acceptance Criteria:**
1. "Connect Instagram" button initiates OAuth flow via Facebook Login (Instagram requires Facebook Business Manager)
2. User must have Instagram Professional account (Business or Creator) connected to Facebook Page
3. OAuth scopes requested: `instagram_basic`, `instagram_content_publish`, `pages_read_engagement`
4. Facebook Page selection interface allows user to choose which Page's Instagram account to connect
5. Access tokens stored encrypted with long-lived tokens (60 days) and automatic refresh
6. Token refresh implemented using Facebook Graph API token exchange
7. Connected Instagram account displayed with username, profile picture, follower count, account type
8. Account verification status displayed (verified badge if applicable)
9. Multiple Instagram accounts supported with account labeling
10. Account disconnection revokes tokens and removes connection
11. Token health monitoring validates token and refreshes if needed
12. Error handling for common issues (account not professional, page not connected, permissions denied)

### Story 2.3: TikTok OAuth Integration

As a user,  
I want to connect my TikTok account via OAuth,  
so that I can publish videos to TikTok.

**Acceptance Criteria:**
1. "Connect TikTok" button initiates TikTok OAuth flow
2. User must have TikTok Creator or Business account (age 18+ required for API access)
3. OAuth scopes requested: `video.upload`, `user.info.basic`
4. Authorization code exchanged for access token with proper error handling
5. Access tokens stored encrypted with refresh token support
6. Token refresh implemented using TikTok OAuth refresh endpoint
7. Connected TikTok account displayed with username, profile picture, follower count
8. Account type displayed (Creator, Business) with verification status
9. Multiple TikTok accounts supported (within tier limits)
10. Daily upload limit displayed (20 videos per account per day)
11. Account disconnection removes connection and revokes tokens
12. Token validation and refresh handled automatically

### Story 2.4: Twitter/X OAuth Integration

As a user,  
I want to connect my Twitter/X account via OAuth,  
so that I can publish tweets, videos, and threads.

**Acceptance Criteria:**
1. "Connect Twitter/X" button initiates OAuth 2.0 flow (Twitter API v2)
2. OAuth scopes requested: `tweet.write`, `users.read`, `offline.access`
3. Authorization code exchanged for access token and refresh token
4. Access tokens stored encrypted with automatic refresh before expiry
5. Refresh token rotation implemented (new refresh token issued on each refresh)
6. Connected Twitter/X account displayed with username, handle, profile picture, follower count
7. Account verification status displayed (blue checkmark if verified)
8. Multiple Twitter/X accounts supported with account labeling
9. Account disconnection revokes tokens and removes connection
10. Token health monitoring with automatic refresh
11. Rate limit tracking displayed (tweet limits per 15-minute window)
12. Error handling for suspended accounts, rate limits, and permission issues

### Story 2.5: LinkedIn OAuth Integration

As a user,  
I want to connect my LinkedIn account via OAuth,  
so that I can publish posts to my personal profile and company pages.

**Acceptance Criteria:**
1. "Connect LinkedIn" button initiates LinkedIn OAuth 2.0 flow
2. OAuth scopes requested: `w_member_social`, `r_liteprofile`, `rw_organization_admin` (for company pages)
3. User can connect personal LinkedIn profile
4. User can connect LinkedIn Company Pages where they have admin access
5. Access tokens stored encrypted with long-lived tokens (60 days) and refresh capability
6. Token refresh implemented using LinkedIn refresh token endpoint
7. Connected accounts displayed with profile/company name, profile picture, follower count
8. Account type clearly indicated (Personal Profile vs Company Page)
9. Multiple LinkedIn accounts supported (personal + multiple company pages)
10. Account disconnection removes connection and revokes tokens
11. Token validation and automatic refresh implemented
12. Error handling for permission issues and account access problems

### Story 2.6: Facebook OAuth Integration

As a user,  
I want to connect my Facebook account via OAuth,  
so that I can publish posts to Facebook Pages and Reels.

**Acceptance Criteria:**
1. "Connect Facebook" button initiates Facebook Login OAuth flow
2. OAuth scopes requested: `pages_manage_posts`, `pages_read_engagement`, `pages_show_list`
3. User selects which Facebook Pages to connect (must have Admin or Editor role)
4. Access tokens stored encrypted with long-lived Page Access Tokens (never expire unless revoked)
5. Token exchange implemented to convert short-lived user token to long-lived page token
6. Connected Facebook Pages displayed with page name, profile picture, follower count, page category
7. Multiple Facebook Pages supported with account labeling
8. Account disconnection removes connection and revokes page tokens
9. Token health monitoring validates tokens and handles expired tokens
10. Crossposting to Instagram option displayed if Instagram account connected to same Facebook Page
11. Error handling for permission issues, page access problems, and token expiration
12. Page insights access verified (for analytics features in later epic)

### Story 2.7: Pinterest OAuth Integration

As a user,  
I want to connect my Pinterest account via OAuth,  
so that I can publish pins and video pins to Pinterest boards.

**Acceptance Criteria:**
1. "Connect Pinterest" button initiates Pinterest OAuth 2.0 flow
2. User must have Pinterest Business account (recommended) or personal account
3. OAuth scopes requested: `pins:read`, `pins:write`, `boards:read`, `boards:write`
4. Access tokens stored encrypted with refresh token support
5. Token refresh implemented using Pinterest OAuth refresh endpoint
6. Connected Pinterest account displayed with username, profile picture, follower count
7. Board list retrieved and displayed for board selection during publishing
8. Multiple Pinterest accounts supported with account labeling
9. Account disconnection removes connection and revokes tokens
10. Token validation and automatic refresh implemented
11. Error handling for business account requirements and permission issues
12. Board management interface displays user's boards with board names and pin counts

### Story 2.8: Threads OAuth Integration

As a user,  
I want to connect my Threads account via OAuth,  
so that I can publish posts to Threads.

**Acceptance Criteria:**
1. "Connect Threads" button initiates OAuth flow via Instagram (Threads uses Instagram OAuth)
2. User must have Instagram Professional account with Threads enabled
3. OAuth scopes requested: Same as Instagram (`instagram_basic`, `instagram_content_publish`)
4. Threads account automatically detected if Instagram account is connected and has Threads
5. Access tokens shared with Instagram connection (same token used for both)
6. Connected Threads account displayed with username, profile picture, follower count
7. Threads account status displayed (active, connected to Instagram account)
8. Multiple Threads accounts supported (one per connected Instagram account)
9. Account disconnection removes Threads connection (Instagram connection remains)
10. Token validation uses Instagram token health check
11. Error handling for accounts without Threads enabled or Instagram not connected
12. Threads-specific features displayed (character limit: 500, media limits: 10 images, 5 min video)

### Story 2.9: Platform Connection Management Dashboard

As a user,  
I want to view and manage all my connected platform accounts in one place,  
so that I can easily see connection status and manage my accounts.

**Acceptance Criteria:**
1. Platform connections page displays all 8 platforms with connection status (connected, not connected, error)
2. Connected accounts shown with platform icon, account name/username, profile picture, follower/subscriber count
3. Account health indicator shows green (healthy), yellow (token expiring soon), red (error/invalid)
4. "Connect" button for unconnected platforms initiates OAuth flow
5. "Disconnect" button for connected accounts with confirmation dialog
6. Account labeling interface allows custom labels (e.g., "Personal", "Client A Fashion Brand")
7. Account details modal shows connection date, last used date, token expiry, account type
8. Bulk actions supported (connect multiple accounts, disconnect multiple accounts)
9. Filter and search functionality to find specific accounts
10. Account limits displayed per tier (e.g., "3 of 12 accounts used" for Creator tier)
11. Upgrade prompt shown when account limit reached
12. Error messages displayed for failed connections with retry option
13. Token refresh status shown with last refresh time and next scheduled refresh
14. Platform-specific information displayed (rate limits, daily upload limits, account requirements)

---

## Epic 3: Content Generation & Workflow System

**Goal:** Build AI-powered content generation capabilities using ComfyUI integration, establish workflow marketplace foundation, and implement workflow execution with n8n orchestration. This epic enables users to generate videos and images using AI workflows, access pre-built workflows from marketplace, and create custom workflows for their specific needs.

### Story 3.1: ComfyUI Integration & Worker Management

As a system administrator,  
I want ComfyUI workers integrated with the platform,  
so that users can generate AI-powered content using self-hosted GPU resources.

**Acceptance Criteria:**
1. ComfyUI worker service implemented with REST API for workflow execution
2. Worker registration system tracks available GPU workers with capacity (GPU type, VRAM, queue length)
3. Worker health monitoring checks worker status every 30 seconds
4. Workflow queue system distributes generation jobs across available workers
5. Worker selection algorithm considers GPU capacity, current queue length, and worker health
6. Job status tracking implemented (queued, processing, completed, failed)
7. Result retrieval system downloads generated content from workers to S3 storage
8. Worker failure handling with automatic job retry on different worker
9. GPU utilization monitoring tracks worker usage and capacity
10. Worker scaling configuration allows adding/removing workers dynamically
11. Authentication between API and workers implemented (API keys or JWT)
12. Worker logs accessible for debugging generation issues

### Story 3.2: Basic Workflow Execution

As a user,  
I want to execute a workflow to generate content,  
so that I can create videos or images using AI.

**Acceptance Criteria:**
1. Workflow execution endpoint accepts workflow JSON and input parameters
2. Input validation ensures required parameters are provided and types are correct
3. Workflow submitted to ComfyUI worker queue with job ID returned
4. Job status endpoint returns current status (queued, processing, completed, failed)
5. Progress updates available via polling or WebSocket connection
6. Completed job returns download URLs for generated content (video/image files)
7. Failed job returns error message with details for debugging
8. Job cancellation endpoint allows user to cancel in-progress generation
9. Job history stored in database with execution time, parameters, and results
10. Generated content automatically uploaded to S3 with organized folder structure
11. Content metadata stored (workflow used, generation date, parameters, file size, duration)
12. Usage tracking increments user's GPU minutes and video count per tier limits

### Story 3.3: Workflow Marketplace Foundation

As a user,  
I want to browse and search workflows in a marketplace,  
so that I can find pre-built workflows for my content needs.

**Acceptance Criteria:**
1. Marketplace page displays workflow cards in grid layout with pagination
2. Workflow card shows preview image, name, creator, rating, downloads count, price
3. Search functionality filters workflows by name, description, tags, or creator
4. Filter system supports categories (Video, Image, Upscale, Style Transfer, etc.)
5. Filter system supports base models (SDXL, Flux, AnimateDiff, etc.)
6. Filter system supports platform compatibility (YouTube, Instagram, TikTok, etc.)
7. Sort options: Latest, Trending, Most Downloaded, Highest Rated, Price
8. Workflow detail page shows full description, features, requirements, example outputs
9. Workflow detail page shows technical details (nodes used, complexity, success rate)
10. Workflow detail page shows reviews and ratings from other users
11. "Activate Workflow" button checks tier limits and activates workflow if slot available
12. Activation limit enforcement prevents exceeding tier limits (Free: 3, Creator: 10, etc.)
13. Upgrade prompt shown when activation limit reached

### Story 3.4: Workflow Activation & Management

As a user,  
I want to activate and manage my workflows,  
so that I can use them for content generation.

**Acceptance Criteria:**
1. "My Workflows" page displays all activated workflows with status (active, inactive)
2. Active workflow count displayed with tier limit (e.g., "8 of 10 active workflows")
3. Workflow activation adds workflow to user's active list and increments count
4. Workflow deactivation removes from active list and decrements count (doesn't delete)
5. Workflow can be reactivated if slot available
6. Workflow execution uses activated workflow's JSON and parameters
7. Workflow settings allow customization of default parameters
8. Workflow usage history shows when workflow was used and results generated
9. Workflow performance metrics displayed (success rate, average generation time)
10. Bulk activation/deactivation supported for multiple workflows
11. Workflow organization with folders or tags for better management
12. Quick access to frequently used workflows from dashboard

### Story 3.5: n8n Workflow Orchestration Integration

As a system architect,  
I want n8n integrated for workflow orchestration,  
so that complex multi-step workflows can be executed reliably.

**Acceptance Criteria:**
1. n8n instance configured and accessible via API
2. n8n workflow execution endpoint accepts workflow ID and input data
3. Workflow execution triggers n8n workflow with proper authentication
4. Execution status polling checks n8n workflow completion
5. Result data retrieved from n8n workflow output
6. Error handling captures n8n execution errors and provides user-friendly messages
7. n8n workflow templates stored in database with metadata
8. Workflow import/export functionality for n8n JSON format
9. n8n worker scaling supports multiple workers for parallel execution
10. Workflow execution queue manages n8n job distribution
11. n8n webhook support for asynchronous workflow completion
12. Integration with ComfyUI via n8n workflows for complex content generation pipelines

### Story 3.6: Basic Image Generation Workflow

As a user,  
I want to generate images using AI workflows,  
so that I can create visuals for my social media posts.

**Acceptance Criteria:**
1. Image generation interface allows selection of workflow and input prompt
2. Prompt input supports text description with parameter customization
3. Image generation parameters configurable (resolution, steps, guidance scale, seed)
4. Generation job submitted and status displayed with progress indicator
5. Generated image displayed in preview with download option
6. Image automatically saved to content library with metadata
7. Image can be used immediately in publishing interface
8. Multiple image generation supported (batch generation with variations)
9. Image regeneration with same or modified parameters
10. Image upscaling option available for generated images
11. Usage tracking increments image generation count per tier limits
12. Error handling for generation failures with retry option

### Story 3.7: Basic Video Generation Workflow

As a user,  
I want to generate videos using AI workflows,  
so that I can create video content for platforms like YouTube, TikTok, and Instagram Reels.

**Acceptance Criteria:**
1. Video generation interface allows selection of workflow and input parameters
2. Video generation supports text-to-video and image-to-video workflows
3. Video parameters configurable (duration, resolution, fps, style)
4. Generation job submitted with estimated completion time
5. Progress updates show generation percentage and remaining time
6. Generated video displayed in preview player with download option
7. Video automatically saved to content library with metadata
8. Video can be used immediately in publishing interface
9. Video thumbnail automatically generated from first frame
10. Video metadata includes duration, resolution, file size, generation time
11. Usage tracking increments video generation count and GPU minutes per tier limits
12. Error handling for generation failures with detailed error messages and retry option

---

## Epic 4: Multi-Platform Publishing

**Goal:** Implement unified publishing interface enabling users to publish content to all 8 platforms with platform-specific optimization, scheduling capabilities, and content calendar management. This epic delivers the core value proposition of MPCAS by enabling one-click publishing across multiple platforms with automatic format conversion and metadata optimization.

### Story 4.1: Unified Publishing Interface

As a user,  
I want a single interface to publish content to multiple platforms,  
so that I can distribute my content efficiently without using separate tools for each platform.

**Acceptance Criteria:**
1. Publishing interface allows selection of content from library (videos, images, or both)
2. Platform selection interface shows all 8 platforms with checkboxes for multi-select
3. Platform-specific preview shows how content will appear on each selected platform
4. Metadata input form allows custom title, description, hashtags per platform
5. Default metadata option allows same metadata across all platforms or platform-specific
6. Thumbnail selection/upload supported per platform (where applicable)
7. Publishing options: Publish immediately, schedule for specific date/time, or add to calendar
8. Staggered posting option with configurable delays (5-15 minutes) between platforms
9. Publishing queue shows all pending posts with status (queued, publishing, published, failed)
10. Real-time status updates during publishing process
11. Success confirmation shows published URLs for each platform
12. Error handling displays platform-specific error messages with retry option
13. Bulk publishing supported for multiple content items to multiple platforms
14. Publishing history stored with timestamps, platforms, and results

### Story 4.2: YouTube Publishing

As a user,  
I want to publish videos directly to YouTube,  
so that I can upload content without using YouTube's interface.

**Acceptance Criteria:**
1. YouTube publishing supports regular videos (up to 12 hours) and YouTube Shorts (<60 sec, vertical)
2. Video upload uses YouTube Data API v3 with direct upload (not browser-based)
3. Metadata setting includes title, description, tags (15+), category, visibility (public/unlisted/private)
4. Thumbnail upload supported with custom thumbnail or auto-generated from video
5. Playlist assignment allows adding video to existing playlists
6. Scheduled publishing supports future date/time with timezone handling
7. YouTube Shorts auto-detection: vertical video <60 sec automatically tagged as Short
8. Community post publishing supported (text posts, polls) via YouTube API
9. Publishing success returns YouTube video URL and video ID
10. Error handling for quota limits (6 videos/day), invalid credentials, and API errors
11. Retry logic with exponential backoff for transient failures
12. Publishing status tracked and displayed in content calendar

### Story 4.3: Instagram Publishing

As a user,  
I want to publish content to Instagram (Feed, Reels, Stories),  
so that I can maintain my Instagram presence across all content types.

**Acceptance Criteria:**
1. Instagram Feed post publishing supports single image, carousel (up to 10 images), and video posts
2. Instagram Reels publishing supports vertical videos (15-90 seconds) with audio selection
3. Instagram Stories publishing supports images/videos (24-hour ephemeral content)
4. Hashtag optimization suggests and validates 20-30 hashtags per post
5. First comment auto-post feature allows posting hashtags in first comment (for cleaner caption)
6. Location tagging supported with location search and selection
7. User tagging supported with @mention functionality
8. Caption formatting supports line breaks and emoji
9. Publishing uses Instagram Graph API with proper media container workflow
10. Carousel post creation uploads multiple images in sequence
11. Reels optimization includes trending audio suggestions and hashtag recommendations
12. Stories publishing supports multiple stories in sequence with automatic 24-hour expiration tracking
13. Error handling for API limits, invalid media format, and permission issues
14. Publishing success returns Instagram post URL and post ID

### Story 4.4: TikTok Publishing

As a user,  
I want to publish videos to TikTok,  
so that I can reach TikTok's audience with my content.

**Acceptance Criteria:**
1. TikTok publishing supports short videos (15 sec - 10 min) and photo mode slideshows
2. Video upload uses TikTok Upload API with proper authentication
3. Metadata includes caption (2200 char limit), hashtags (3-5 recommended), and privacy settings
4. Sound selection allows choosing from TikTok's sound library or uploading custom audio
5. Duet and Stitch settings configurable (allow/disable duets, allow/disable stitches)
6. Comment settings configurable (allow all, friends only, no one)
7. Video optimization includes auto-crop to 9:16 aspect ratio and length trimming
8. Daily upload limit tracking (20 videos per account per day) with limit warnings
9. Publishing success returns TikTok video URL and video ID
10. Error handling for daily limits, invalid video format, and API errors
11. Retry logic for transient failures
12. Publishing status tracked in content calendar

### Story 4.5: Twitter/X Publishing

As a user,  
I want to publish tweets, videos, and threads to Twitter/X,  
so that I can engage with Twitter's audience.

**Acceptance Criteria:**
1. Twitter/X publishing supports text tweets, image tweets (up to 4 images), video tweets, and polls
2. Video upload supports 2:20 duration (free) or 10 minutes (Premium accounts)
3. Thread creation allows multiple tweets in sequence with reply threading
4. Character limit handling (280 chars) with truncation warnings
5. Image optimization includes auto-resize and format conversion
6. Video optimization includes aspect ratio conversion and length trimming
7. Hashtag support (1-3 recommended) with trending hashtag suggestions
8. Mention support with @username autocomplete
9. Poll creation supported with up to 4 options and duration setting
10. Publishing uses Twitter API v2 with proper authentication
11. Publishing success returns tweet URL and tweet ID
12. Error handling for rate limits, character limits, and API errors
13. Thread publishing tracks all tweets in thread with parent-child relationships
14. Publishing status tracked in content calendar

### Story 4.6: LinkedIn Publishing

As a user,  
I want to publish posts and videos to LinkedIn,  
so that I can maintain professional presence on LinkedIn.

**Acceptance Criteria:**
1. LinkedIn publishing supports personal profile posts and company page posts
2. Post types: text posts, image posts, video posts (up to 10 min), and long-form articles
3. Professional tone optimization suggests business-appropriate language
4. Hashtag support with industry-specific hashtag suggestions
5. Mention support with @company and @person tagging
6. Company page selection for multi-page accounts
7. Video optimization includes professional subtitles and square/16:9 aspect ratio
8. Article publishing supports long-form content with rich text formatting
9. Publishing uses LinkedIn API with proper authentication
10. Publishing success returns LinkedIn post URL and post ID
11. Error handling for API limits, permission issues, and content policy violations
12. Publishing status tracked in content calendar

### Story 4.7: Facebook Publishing

As a user,  
I want to publish posts and Reels to Facebook Pages,  
so that I can maintain Facebook presence.

**Acceptance Criteria:**
1. Facebook publishing supports page posts, Reels (90 sec), and Stories
2. Page selection interface for accounts with multiple Facebook Pages
3. Post types: text, image, video, link posts with preview
4. Audience targeting options for page posts (if available)
5. Crossposting to Instagram option if Instagram account connected to same Facebook Page
6. Reels optimization includes trending audio and hashtag suggestions
7. Stories publishing with 24-hour expiration tracking
8. Publishing uses Facebook Graph API with proper authentication
9. Publishing success returns Facebook post URL and post ID
10. Error handling for API limits, permission issues, and content policy violations
11. Publishing status tracked in content calendar

### Story 4.8: Pinterest Publishing

As a user,  
I want to publish pins and video pins to Pinterest,  
so that I can drive traffic through Pinterest.

**Acceptance Criteria:**
1. Pinterest publishing supports image pins, video pins (up to 15 min), and Idea Pins (multi-page)
2. Board selection interface shows user's boards with board organization
3. Pin description optimization with keyword-rich descriptions
4. Link attachment supported for driving traffic to external URLs
5. Rich Pins support for product pins, article pins, recipe pins (if applicable)
6. Video pin optimization includes vertical 2:3 aspect ratio preference
7. Idea Pin creation supports multiple pages with images/videos
8. Publishing uses Pinterest API with proper authentication
9. Publishing success returns Pinterest pin URL and pin ID
10. Error handling for API limits, board access issues, and content policy violations
11. Publishing status tracked in content calendar

### Story 4.9: Threads Publishing

As a user,  
I want to publish posts to Threads,  
so that I can engage with Threads' audience.

**Acceptance Criteria:**
1. Threads publishing supports text posts (500 chars), image posts (10 images), video posts (5 min), and polls
2. Publishing uses Instagram Graph API (Threads uses Instagram infrastructure)
3. Character limit handling with truncation warnings
4. Image optimization for Threads format requirements
5. Video optimization for Threads format requirements
6. Reply control settings (allow all, people you follow, mentioned users only)
7. Quote post support for sharing and commenting on other posts
8. Publishing success returns Threads post URL and post ID
9. Error handling for API limits and content policy violations
10. Publishing status tracked in content calendar

### Story 4.10: Platform-Specific Content Optimization

As a system,  
I want to automatically optimize content format per platform,  
so that content displays correctly on each platform without manual conversion.

**Acceptance Criteria:**
1. Aspect ratio conversion: 16:9 (YouTube), 9:16 (Reels/TikTok), Square (Twitter), 2:3 (Pinterest)
2. Video length trimming: 90 sec (Reels), 60 sec (Shorts), 2:20 (Twitter free), 10 min (Twitter Premium)
3. Resolution optimization: Platform-specific optimal resolutions (1080p, 720p, etc.)
4. Bitrate optimization: Platform-specific bitrate requirements
5. Format conversion: MP4, MOV, or platform-preferred formats
6. Thumbnail generation: Platform-specific cover images from video frames
7. Metadata optimization: Character limits, hashtag counts, description length per platform
8. Silent viewing optimization: Ensures content works without sound (captions, text overlays)
9. Optimization preview shows before/after comparison per platform
10. Manual override allows user to skip optimization or customize settings
11. Batch optimization for multiple content items
12. Optimization settings saved as presets for future use

### Story 4.11: Content Scheduling System

As a user,  
I want to schedule content for future publishing,  
so that I can plan my content calendar in advance.

**Acceptance Criteria:**
1. Scheduling interface allows date and time selection with timezone handling
2. Per-platform scheduling allows different publish times for each platform
3. Staggered scheduling automatically distributes posts with delays (5-15 min) between platforms
4. Scheduling queue displays all scheduled posts with countdown timers
5. Scheduled post editing allows modification of content, metadata, or schedule time
6. Scheduled post cancellation removes from queue with confirmation
7. Bulk scheduling supports scheduling multiple content items at once
8. Recurring schedule creation for series (daily, weekly, bi-weekly, monthly)
9. Schedule validation prevents scheduling in the past
10. Schedule conflict detection warns if multiple posts scheduled for same account at same time
11. Timezone conversion displays local time and platform timezone correctly
12. Schedule notifications alert user before scheduled publish time (optional)

### Story 4.12: Content Calendar Interface

As a user,  
I want a visual calendar to view and manage my scheduled content,  
so that I can see my content plan at a glance.

**Acceptance Criteria:**
1. Calendar view supports month, week, day, and agenda (list) views
2. Month view shows post counts per day with color coding by status
3. Week view shows hour-by-hour timeline with drag-and-drop scheduling
4. Day view shows detailed hourly breakdown with post details
5. Agenda view shows list format with sorting and filtering options
6. Status color coding: Green (published), Blue (scheduled), Yellow (draft), Orange (needs approval), Red (failed)
7. Drag-and-drop allows moving scheduled posts to new date/time
8. Click on calendar item opens post details modal with edit options
9. Filter options: By platform, by account, by status, by content type
10. Search functionality finds posts by title, description, or metadata
11. Bulk actions: Select multiple posts for bulk reschedule, cancel, or delete
12. Calendar export: Export calendar view as image or PDF
13. Gap detection highlights days with no scheduled posts
14. AI "best time to post" suggestions displayed on calendar

---

## Epic 5: Analytics & Performance Tracking

**Goal:** Build comprehensive analytics dashboard enabling users to track content performance across all platforms, compare metrics, conduct A/B tests, and generate reports. This epic delivers the insights users need to optimize their content strategy and demonstrate ROI to stakeholders.

### Story 5.1: Platform Analytics Data Collection

As a system,  
I want to collect performance metrics from all connected platforms,  
so that users can view comprehensive analytics in one dashboard.

**Acceptance Criteria:**
1. Analytics collection service polls platform APIs for performance metrics on scheduled intervals
2. YouTube Analytics API integration collects views, watch time, impressions, CTR, traffic sources, audience retention
3. Instagram Graph API integration collects reach, impressions, engagement, saves, shares, profile visits
4. TikTok API integration collects views, likes, comments, shares, completion rate, traffic source
5. Twitter API v2 integration collects impressions, engagements, retweets, likes, replies, profile clicks
6. LinkedIn API integration collects impressions, engagement rate, reactions, comments, shares, click-through rate
7. Facebook Graph API integration collects reach, impressions, engagement, page views, post clicks
8. Pinterest API integration collects impressions, saves, clicks, outbound clicks
9. Threads metrics collected via Instagram API (shared infrastructure)
10. Data collection runs daily with historical data backfill capability
11. Error handling for API failures with retry logic and data gap detection
12. Metrics stored in time-series format for efficient querying and aggregation
13. Data retention policy: 2 years of historical data with archival for older data

### Story 5.2: Cross-Platform Analytics Dashboard

As a user,  
I want to view aggregated analytics across all platforms,  
so that I can understand my overall content performance.

**Acceptance Criteria:**
1. Dashboard displays overview metrics: total views, total engagement, engagement rate, follower growth
2. Time range selector supports last 7 days, 30 days, 90 days, custom range
3. Platform comparison chart shows performance metrics side-by-side for all connected platforms
4. Top performing content widget displays best performing videos/posts across all platforms
5. Engagement trend chart shows engagement rate over time with platform breakdown
6. Follower/subscriber growth chart displays growth trends per platform
7. Best performing platform indicator highlights platform with highest engagement
8. Metric cards show key numbers with percentage change vs previous period
9. Export functionality allows downloading dashboard data as CSV or PDF
10. Real-time updates refresh data automatically or on manual refresh
11. Filter options: by platform, by account, by content type, by date range
12. Responsive design works on mobile, tablet, and desktop
13. Loading states and error handling for failed data loads

### Story 5.3: Per-Video Performance Analytics

As a user,  
I want to view detailed analytics for individual videos/posts,  
so that I can understand what content performs best.

**Acceptance Criteria:**
1. Content detail page displays comprehensive metrics for single video/post
2. Platform-specific metrics shown: views, watch time, engagement, impressions, CTR (YouTube)
3. Platform-specific metrics shown: reach, saves, shares, profile visits (Instagram)
4. Platform-specific metrics shown: completion rate, traffic source, followers gained (TikTok)
5. Audience retention graph displayed for video content (YouTube)
6. Traffic sources breakdown shows where views came from (browse, search, suggested, external)
7. Engagement breakdown shows likes, comments, shares, saves by type
8. Performance comparison shows this content vs channel average, vs previous 10 posts
9. Timeline view shows performance over first 24 hours, 7 days, 30 days
10. Export functionality allows downloading detailed analytics as CSV
11. Share analytics link allows sharing analytics view with team members
12. Performance insights displayed with AI-generated recommendations
13. Related content suggestions based on similar performing content

### Story 5.4: A/B Testing System

As a user,  
I want to test different thumbnails, titles, and metadata,  
so that I can optimize my content performance.

**Acceptance Criteria:**
1. A/B test creation interface allows uploading 2-3 thumbnail variants
2. A/B test creation allows creating multiple title/description variations
3. Test configuration: select metric to optimize (CTR, watch time, engagement), test duration, traffic split
4. YouTube native Test & Compare integration for thumbnail testing
5. For other platforms, same content posted with different metadata tracked separately
6. Test execution tracks performance metrics for each variant
7. Statistical significance calculation determines when winner can be declared
8. Winner declaration: automatic when significance reached or manual override
9. Test results display: performance comparison, winner identification, insights
10. Test history shows all past A/B tests with results
11. Test templates allow saving common test configurations
12. Bulk A/B testing supports testing multiple content items simultaneously
13. Test recommendations suggest what to test based on content type and platform

### Story 5.5: Client Reporting (Agencies)

As an agency user,  
I want to generate automated reports for my clients,  
so that I can demonstrate value and maintain client relationships.

**Acceptance Criteria:**
1. Report generation interface allows selecting client, date range, and report type
2. Monthly report template includes: executive summary, platform performance, top 10 content, growth metrics
3. Report generation uses AI to create executive summary from data
4. PDF export generates branded report with agency/client branding (white-label support)
5. PowerPoint/Google Slides export available for presentations
6. Interactive dashboard link allows clients to view live data
7. Automated report scheduling: monthly reports auto-generated on 1st of month
8. Report delivery: auto-emailed to client with download link
9. Report customization: add/remove sections, customize branding, add custom insights
10. Historical reports archive stores all past reports for client access
11. Report sharing: generate shareable link with expiration date
12. Report analytics: track which clients view reports and when
13. White-label reports remove all MPCAS branding for White Label tier

---

## Epic 6: AI-Powered Features

**Goal:** Implement AI-powered content optimization features including title generation, caption generation, content ideation, trend detection, performance prediction, and competitor analysis. This epic leverages AI to help users create better content and optimize their strategy.

### Story 6.1: AI Title Generator

As a user,  
I want AI to generate multiple title variations,  
so that I can choose the best title for maximum engagement.

**Acceptance Criteria:**
1. Title generator interface accepts video description or topic as input
2. AI generates 10 title variations using GPT-4 or Claude 3.5
3. Titles ranked by predicted performance score (0-10 scale)
4. Title tags displayed: Clickbait, SEO, Educational, Story-driven, Question-based
5. Character count validation ensures titles fit platform limits
6. Keyword optimization includes relevant keywords in titles
7. Title preview shows how title will appear on platform
8. Title selection allows user to choose preferred title or edit generated titles
9. Title history saves previously generated titles for reference
10. Batch title generation supports generating titles for multiple videos
11. Title templates allow saving successful title patterns
12. Performance tracking compares generated titles vs manually created titles

### Story 6.2: AI Caption Generator

As a user,  
I want AI to generate platform-specific captions,  
so that I can create engaging captions optimized for each platform.

**Acceptance Criteria:**
1. Caption generator interface accepts content description and platform selection
2. Instagram caption generation: hook (first line), body (1-3 paragraphs), CTA, 20-30 hashtags
3. TikTok caption generation: short punchy (1-2 sentences), 3-5 trending hashtags
4. Twitter caption generation: under 280 characters, 1-2 hashtags, clear value proposition
5. LinkedIn caption generation: professional tone, industry hashtags, tag relevant people/companies
6. Caption preview shows how caption will appear on platform
7. Caption editing allows user to modify generated captions
8. Hashtag suggestions include mix of popular, medium, and niche hashtags
9. Caption templates allow saving successful caption patterns
10. Batch caption generation supports generating captions for multiple posts
11. Caption performance tracking compares AI-generated vs manually created captions
12. Tone adjustment: professional, casual, humorous, inspirational

### Story 6.3: Content Ideation

As a user,  
I want AI to suggest content ideas,  
so that I never run out of content inspiration.

**Acceptance Criteria:**
1. Content ideation interface accepts niche, target audience, and recent videos as input
2. AI generates 50 content ideas categorized: Trending, Evergreen, Controversial, How-to, Listicles, Storytelling
3. Each idea includes: title suggestion, description, estimated duration, platform recommendations
4. Idea filtering: by category, by platform, by content type (video, image, text)
5. Idea saving: save ideas to content queue for later generation
6. Idea to content: one-click generation from idea to content creation workflow
7. Trending ideas highlighted with trend growth rate and opportunity score
8. Evergreen ideas marked for long-term value
9. Idea performance prediction estimates expected views/engagement
10. Idea history tracks which ideas were used and their performance
11. Idea templates allow saving successful idea patterns
12. Bulk idea generation supports generating ideas for content series

### Story 6.4: Trend Detection

As a user,  
I want to be alerted about trending topics in my niche,  
so that I can capitalize on trends quickly.

**Acceptance Criteria:**
1. Trend monitoring service continuously monitors YouTube trending, TikTok For You, Instagram Explore, Twitter trending
2. Trend analysis identifies topics relevant to user's niche and content history
3. Trend alerts displayed in dashboard with growth rate, competition level, opportunity score
4. Alert details: trend description, growth rate (e.g., +350% in 7 days), competition (low/medium/high)
5. Recommendation engine suggests: "Create video in next 48 hours", format suggestions (60-sec Reel)
6. Trend dashboard shows all active trends with filtering and sorting
7. Trend history tracks past trends and user's response (created content or ignored)
8. Trend performance tracking shows how trend-based content performed
9. Custom trend monitoring: user can add specific keywords or topics to monitor
10. Trend notifications: email/push notifications for high-opportunity trends
11. Trend calendar shows trending topics over time
12. Trend insights: AI explains why trend is growing and how to capitalize

### Story 6.5: Performance Prediction

As a user,  
I want AI to predict content performance before publishing,  
so that I can optimize content before it goes live.

**Acceptance Criteria:**
1. Performance prediction interface accepts video metadata, thumbnail, and publishing time
2. AI model analyzes: title, description, thumbnail, historical performance, publishing time, platform
3. Prediction output: expected views range (e.g., 5,000-15,000), confidence level (%), engagement rate range
4. Low prediction alert: if predicted views below user's average, system flags and suggests improvements
5. Improvement suggestions: "Thumbnail CTR low, try thumbnail B", "Title lacks hook, add number"
6. Revised prediction: after applying suggestions, new prediction generated
7. Prediction accuracy tracking: compares predictions vs actual performance over time
8. Prediction history shows all predictions with actual results
9. Model improvement: prediction model learns from historical data to improve accuracy
10. Batch prediction supports predicting performance for multiple content items
11. Prediction confidence indicators: high (80%+), medium (50-80%), low (<50%)
12. Performance benchmarks: compares prediction to channel/platform averages

### Story 6.6: Competitor Analysis

As a user,  
I want to monitor my competitors' content and performance,  
so that I can learn from their strategies.

**Acceptance Criteria:**
1. Competitor management interface allows adding up to 10 competitors by platform handle/URL
2. Competitor tracking: monitors new posts, performance metrics, topics, posting frequency
3. Competitor dashboard displays all competitors with recent activity and top performing content
4. Performance comparison: user's content vs competitor content on similar topics
5. Topic analysis: identifies topics competitors cover that user doesn't
6. Keyword analysis: extracts keywords competitors rank for
7. Posting schedule analysis: shows when competitors post and frequency
8. Content gap analysis: identifies content types user is missing compared to competitors
9. Alert system: notifies when competitor gains significant views/engagement on specific topic
10. Competitor insights: AI-generated recommendations based on competitor analysis
11. Export functionality: download competitor analysis as report
12. Competitor performance trends: charts showing competitor growth over time

---

## Epic 7: Team Collaboration & Permissions

**Goal:** Build team management system with role-based access control, real-time collaboration features, commenting, and approval workflows. This epic enables agencies and teams to work together efficiently while maintaining proper access controls.

### Story 7.1: Role-Based Access Control (RBAC)

As a tenant owner,  
I want to assign roles to team members,  
so that I can control what each person can access and modify.

**Acceptance Criteria:**
1. Role management interface displays 6 roles: Owner, Admin, Manager, Editor, Viewer, Programmer
2. Role assignment: owner/admin can assign roles to team members
3. Permission matrix enforced: each role has specific permissions per feature
4. Owner role: full access including billing, user management, tenant deletion
5. Admin role: all features except billing, can manage users
6. Manager role: content creation, publishing, workflow management, analytics viewing
7. Editor role: content creation, publishing (with or without approval), analytics viewing
8. Viewer role: read-only access to content, analytics, reports
9. Programmer role: direct n8n/ComfyUI access, API access, workflow management
10. Permission inheritance: permissions cascade appropriately (e.g., can publish if can create)
11. Permission override: owner can grant specific permissions outside role defaults
12. Role audit log: tracks all role changes with timestamp and user
13. Permission testing: interface shows what current user can/cannot do

### Story 7.2: Team Member Management

As a tenant owner/admin,  
I want to invite and manage team members,  
so that I can build my team and control access.

**Acceptance Criteria:**
1. Team management page displays all team members with roles, status, last activity
2. Invite team member: email invitation with role assignment and expiration (7 days)
3. Invitation acceptance: user creates account or links existing account
4. Team member list shows: name, email, role, status (active, pending, inactive), join date
5. Role modification: owner/admin can change team member roles
6. Team member removal: owner/admin can remove team members with confirmation
7. Team member deactivation: temporarily disable access without removing
8. Team size limits enforced per tier (Creator: 2, Professional: 5, Agency: 20, White Label: 50)
9. Upgrade prompt shown when team limit reached
10. Team activity log: tracks all team member actions
11. Bulk actions: invite multiple members, change roles for multiple members
12. Team member search and filtering functionality

### Story 7.3: Real-Time Collaboration Features

As a team member,  
I want to see what my teammates are doing,  
so that we can collaborate effectively.

**Acceptance Criteria:**
1. Online status indicator shows who's currently active (green dot next to avatar)
2. Activity feed displays: "John created workflow X", "Sarah published 5 videos", "Mike approved content"
3. Activity filtering: filter by user, by action type, by date range
4. Real-time updates: activity feed updates automatically without page refresh
5. @mention support: mention team members in comments and activity feed
6. Notification system: alerts for @mentions, task assignments, approval requests
7. Shared workspace: all team members access same content library and workflows
8. Concurrent editing: multiple users can work on different content simultaneously
9. Conflict resolution: handles simultaneous edits gracefully
10. Collaboration indicators: show who's viewing/editing specific content
11. Team presence: see who's online in real-time
12. Activity export: download activity log as CSV

### Story 7.4: Content Commenting & Annotations

As a team member,  
I want to comment on content before publishing,  
so that I can provide feedback and collaborate.

**Acceptance Criteria:**
1. Commenting interface allows adding comments to content items
2. Comment display: shows comment author, timestamp, and content
3. @mention support: mention team members in comments with notification
4. Comment threads: reply to comments creating threaded discussions
5. Comment resolution: mark comments as resolved/unresolved
6. Timeline comments: for videos, comments can be timestamped to specific moments
7. Comment editing: users can edit their own comments
8. Comment deletion: comment author or admin can delete comments
9. Comment notifications: email/in-app notifications for new comments and @mentions
10. Comment filtering: filter by author, by resolved status, by date
11. Comment export: download comments as part of content metadata
12. Comment moderation: admin can moderate all comments

### Story 7.5: Approval Workflow System

As a manager/admin,  
I want to review and approve content before publishing,  
so that I can ensure quality and brand compliance.

**Acceptance Criteria:**
1. Approval queue displays all content pending approval with status indicators
2. Approval settings: configurable per role (require approval for Editor, auto-approve for Manager)
3. Approval request: content creator submits for approval with optional notes
4. Approval interface: manager/admin can view content, metadata, and approve/reject/request changes
5. Approval actions: approve (proceeds to publishing), reject (archived), request changes (returns to creator)
6. Change requests: manager can add comments explaining requested changes
7. Approval history: tracks all approval actions with timestamps and users
8. Approval timeout: auto-approve if not reviewed within X hours (configurable)
9. Mobile approval: swipe-to-approve interface for mobile devices
10. Bulk approval: approve/reject multiple content items at once
11. Approval statistics: tracks approval rate, average approval time, rework rate
12. Approval notifications: email/push notifications for approval requests and decisions

---

## Epic 8: White Label & Agency Features

**Goal:** Implement white-label branding system, client portals, reseller dashboard, and agency-specific features enabling agencies to rebrand the platform and manage multiple client accounts efficiently. This epic delivers the premium value proposition for agencies and resellers.

### Story 8.1: White-Label Branding System

As a White Label tier user,  
I want to customize all branding elements,  
so that the platform appears as my own product.

**Acceptance Criteria:**
1. Branding settings page allows customization of: company name, logo (light/dark versions), colors (primary, secondary, accent), tagline
2. Logo upload supports SVG, PNG formats with validation (max 2MB, recommended dimensions)
3. Color picker with HEX code input for primary, secondary, and accent colors
4. Branding preview shows how changes will appear across platform
5. Custom domain setup: user can configure custom domain (app.youragency.com) with DNS instructions
6. DNS validation checks CNAME records and verifies domain ownership
7. SSL certificate auto-issued via Let's Encrypt for custom domains
8. Login page customization: custom background, logo, welcome message
9. Email template customization: all system emails use custom branding
10. Invoice customization: branded invoices with company logo and colors
11. Complete MPCAS branding removal: all references to MPCAS removed for White Label tier
12. Branding changes apply immediately across all interfaces
13. Branding export: download branding assets for use outside platform

### Story 8.2: Client Portal System

As an agency user,  
I want to create client portals,  
so that my clients can view their content and analytics without accessing my agency account.

**Acceptance Criteria:**
1. Client creation interface: add new client with name, email, and permissions
2. Client portal generation: unique URL created (app.agency.com/client/{client-id} or custom domain)
3. Client login: separate login system for clients with email/password or SSO (Google, Microsoft, Okta)
4. Client dashboard: view-only access to their content library, analytics, and publishing schedule
5. Client permissions: configurable per client (view analytics, approve content, download reports)
6. Content filtering: clients only see content assigned to their accounts
7. Analytics filtering: clients only see analytics for their accounts
8. Client request system: clients can submit content requests with messaging thread
9. Client reporting: clients can download monthly reports (white-label branded)
10. Client activity log: track what clients view and when
11. Client management: list all clients with status, MRR, last activity
12. Client portal customization: customize portal appearance per client (optional)
13. Client portal deactivation: disable client access without deleting data

### Story 8.3: Reseller Dashboard

As a reseller,  
I want to manage all my sub-accounts and revenue,  
so that I can run my white-label business efficiently.

**Acceptance Criteria:**
1. Reseller dashboard displays: total clients, active clients, trial clients, total MRR, churn rate
2. Client list shows: client name, status, plan, MRR, accounts managed, videos published, last activity
3. Client metrics: per-client analytics, revenue, usage statistics
4. Revenue tracking: total MRR, average MRR per client, revenue trends
5. Churn analysis: churn rate, churned clients list, churn reasons
6. Client onboarding: streamlined process for adding new clients
7. Client billing management: view client subscriptions, handle billing issues
8. Usage monitoring: track client usage against limits
9. Client communication: messaging system for client support
10. Reseller analytics: performance metrics for reseller business
11. Export functionality: download client list, revenue reports, usage reports
12. White-label management: manage branding for all client portals

---

## Epic 9: Premium Services

**Goal:** Build premium services including IP rotation, account warming, traffic-as-a-service, and P2P IP sharing network. These services provide additional value for agencies managing multiple accounts and users seeking engagement growth.

### Story 9.1: IP Rotation Service

As an agency user,  
I want to use IP rotation for multi-account posting,  
so that my accounts don't get flagged for posting from the same IP.

**Acceptance Criteria:**
1. IP rotation service configuration: enable/disable per account, target location, session persistence
2. Proxy provider integration: BrightData, Smartproxy, Oxylabs with API integration
3. IP pool management: 10,000+ residential IPs with geographic distribution
4. IP rotation logic: different IP per account, session persistence (10-30 min), automatic rotation
5. Account dashboard: shows current IP, expiry time, posts with rotation, success rate, bandwidth usage
6. Pricing models: per-account ($5/month), pay-per-post ($0.10/post), hybrid ($10/month + $0.05/post)
7. Usage tracking: tracks bandwidth, posts, success rate per account
8. Error handling: automatic IP rotation on failure, blacklist management
9. Cost tracking: displays current month cost with billing integration
10. Service status: shows IP pool health, success rate, geographic distribution
11. Test functionality: test IP rotation before enabling for production
12. Service activation: enable IP rotation for specific accounts with tier verification

### Story 9.2: Account Warming System

As a system administrator,  
I want to use idle user accounts to warm admin accounts,  
so that new accounts build engagement organically.

**Acceptance Criteria:**
1. User opt-in interface: users can opt-in to account warming participation
2. Opt-in requirements: minimum Creator tier, accounts in good standing, no recent warnings
3. Incentive system: users earn 10 credits per account per day used
4. Idle account detection: identifies accounts with no posts scheduled for next 48 hours
5. Warming campaign creation: admin selects target account, goals (followers, engagement), duration
6. Warming actions: idle accounts perform benign actions (likes, comments, follows, views)
7. Action pacing: max 5 actions per account per day, natural timing distribution
8. Campaign dashboard: shows progress, idle accounts used, actions completed, estimated completion
9. Safety controls: max warming speed, warm-up period, cooldown on suspicious activity
10. Activity logging: tracks all warming actions with transparency for users
11. User controls: users can pause warming, view activity log, opt out anytime
12. Campaign management: create, pause, resume, cancel warming campaigns

### Story 9.3: Traffic-as-a-Service

As a user,  
I want to purchase engagement for my accounts,  
so that I can boost my content performance.

**Acceptance Criteria:**
1. Traffic service interface: select accounts to boost, set goals (followers, engagement, views)
2. Service packages: Starter ($50), Growth ($200), Pro ($500), Custom budget
3. Action types: likes (1 credit), comments (5 credits), follows (10 credits), views (2 credits), shares (20 credits)
4. Campaign configuration: speed, comment style, geographic preference
5. Payment processing: credits or credit card payment
6. Campaign dashboard: shows status, progress, actions completed, actions remaining, estimated completion
7. Campaign execution: uses idle accounts from opted-in users
8. Real engagement: all actions from real user accounts, not bots
9. Campaign monitoring: tracks performance, engagement rate improvement
10. Campaign completion: automatic when goals reached or budget exhausted
11. Performance reporting: shows engagement improvement, ROI
12. Service activation: campaign starts within 1 hour of purchase

### Story 9.4: P2P IP Sharing Network

As a user,  
I want to share my residential IP and earn credits,  
so that I can offset my platform costs.

**Acceptance Criteria:**
1. P2P opt-in interface: users can opt-in to share residential IP
2. Opt-in requirements: residential internet (not VPN/datacenter), stable connection (10 Mbps+), Creator tier+
3. Desktop agent: lightweight app runs in system tray showing status, bandwidth shared, earnings
4. Mobile app: iOS/Android support with background operation
5. Bandwidth tracking: tracks GB shared today, week, month, all-time
6. Credit earning: 10 credits per GB shared with real-time updates
7. User controls: pause, set daily/monthly limits, set hours of operation, exit
8. Privacy protection: only MPCAS platform traffic routed, no personal browsing affected
9. Earnings dashboard: shows bandwidth shared, credits earned, estimated monthly earnings
10. Payout system: credits added to user account, can cash out or use for services
11. Network status: shows total opted-in users, active users, geographic distribution
12. Cost savings display: shows platform cost savings from P2P network

---

## Epic 10: Billing & Subscription Management

**Goal:** Implement subscription tier management, usage tracking, overage billing, payment processing, and admin billing controls. This epic enables the business model and ensures accurate billing for all services.

### Story 10.1: Subscription Tier Management

As a user,  
I want to subscribe to a pricing tier,  
so that I can access features appropriate for my needs.

**Acceptance Criteria:**
1. Pricing page displays all 6 tiers (Free, Creator, Professional, Agency, White Label, Enterprise) with feature comparison
2. Tier selection: user can select tier and see feature differences
3. Subscription creation: monthly or annual billing with 16.7% annual discount
4. Payment processing: Stripe integration for credit card and ACH payments
5. Subscription activation: immediate access to tier features upon successful payment
6. Subscription management: user can view current tier, billing date, payment method
7. Tier upgrade: instant upgrade with pro-rated billing (credit unused portion)
8. Tier downgrade: takes effect at next billing cycle with data preservation warning
9. Subscription cancellation: cancel anytime with access until end of billing period
10. Free trial: Creator tier offers free trial (no credit card required for Free tier)
11. Subscription history: view all past subscriptions and payments
12. Invoice generation: automatic invoice generation and email delivery
13. Payment method management: add, update, remove payment methods

### Story 10.2: Usage Tracking & Limits

As a system,  
I want to track user usage against tier limits,  
so that I can enforce limits and bill overages accurately.

**Acceptance Criteria:**
1. Usage tracking: videos generated, storage used, GPU minutes, API calls, social accounts
2. Real-time usage display: dashboard shows current usage vs tier limits with progress bars
3. Limit enforcement: prevents actions that would exceed tier limits
4. Overage detection: tracks usage beyond tier limits for billing
5. Usage alerts: email notification at 80% of limit with upgrade suggestion
6. Hard caps: optional setting to prevent overage (blocks actions at limit)
7. Usage history: tracks usage over time with charts and trends
8. Per-resource tracking: separate tracking for videos, storage, GPU, API calls
9. Usage reset: monthly reset on billing date
10. Usage export: download usage data as CSV
11. Usage API: programmatic access to usage data
12. Usage forecasting: predicts if user will exceed limits based on current usage rate

### Story 10.3: Overage Billing

As a system,  
I want to bill users for usage beyond tier limits,  
so that I can monetize heavy usage appropriately.

**Acceptance Criteria:**
1. Overage calculation: tracks usage beyond tier limits per resource type
2. Overage pricing: videos ($0.10), storage ($0.03/GB), GPU minutes ($0.20/min), API calls ($0.10/1K)
3. Overage tracking: real-time tracking with running total
4. Overage alerts: email notification at 80% of limit and when overage occurs
5. Overage billing: automatic billing at end of month with itemized invoice
6. Overage invoice: separate line items for each resource type overage
7. Overage history: view all past overage charges
8. Overage prevention: hard cap option to prevent overage (blocks actions)
9. Overage estimates: shows projected overage cost based on current usage rate
10. Overage reporting: admin dashboard shows overage revenue and top overage users
11. Overage waivers: admin can waive overage charges for specific users
12. Overage disputes: users can dispute overage charges with support

### Story 10.4: Credit System

As a user,  
I want to earn and use credits,  
so that I can access premium features and offset costs.

**Acceptance Criteria:**
1. Credit balance display: shows current credit balance with value ($0.01 per credit)
2. Credit earning: workflow submissions (10 credits/download), paid workflow sales (70% in credits), account warming (10 credits/day), traffic service (20 credits/day), P2P IP sharing (10 credits/GB), affiliate bonuses
3. Credit usage: activate premium workflows, purchase GPU minutes, purchase storage, IP rotation, traffic service, tier upgrades (discount)
4. Credit purchase: minimum 1,000 credits ($10) with credit card payment
5. Credit history: view all credit transactions (earned, spent, purchased)
6. Credit expiration: credits never expire (or configurable expiration)
7. Credit conversion: 1,000 credits = $10 minimum cash out
8. Credit payout: Stripe Connect, PayPal, or platform credits
9. Credit dashboard: shows earnings breakdown, usage breakdown, pending payouts
10. Credit notifications: alerts for credit milestones and payouts
11. Credit API: programmatic access to credit balance and transactions
12. Credit reporting: admin dashboard shows credit system usage and payouts

---

## Epic 11: Digital Asset Management

**Goal:** Build advanced media library with AI auto-tagging, version control, brand kit management, and stock content integration. This epic enables users to organize, manage, and efficiently use their media assets.

### Story 11.1: Advanced Media Library

As a user,  
I want to organize my media files in folders,  
so that I can efficiently manage my content assets.

**Acceptance Criteria:**
1. Media library interface: grid/list view with folder navigation
2. Folder structure: My Assets, Team Assets, Client Assets, Stock Content, Brand Assets
3. Folder creation: create nested folders with custom names
4. File upload: drag-and-drop or file picker with progress indicator
5. File types supported: videos (MP4, MOV), images (PNG, JPG, WebP), audio (MP3, WAV), documents (PDF, DOCX)
6. File metadata: name, type, size, upload date, uploaded by, tags, description
7. File search: full-text search by name, description, tags
8. File filtering: by type, by date, by uploader, by tags, by usage status
9. File preview: preview images/videos in modal with download option
10. File download: single file or bulk download as ZIP
11. File deletion: soft delete with 30-day recovery period
12. File sharing: share files with team members or clients with permissions
13. File organization: move files between folders, bulk operations

### Story 11.2: AI Auto-Tagging

As a user,  
I want AI to automatically tag my uploaded assets,  
so that I can find them easily later.

**Acceptance Criteria:**
1. Auto-tagging service: analyzes uploaded images/videos using AI
2. Image analysis: objects (person, laptop, coffee), scene (office, outdoor, studio), colors, mood, text (OCR)
3. Video analysis: content type (talking head, b-roll), scenes, audio type, face detection, actions
4. Audio analysis: type (music, sound effect, voiceover), genre, mood, BPM
5. Tag suggestions: AI suggests tags with confidence scores
6. Tag approval: user can accept/reject/modify suggested tags
7. Tag learning: system learns from user corrections to improve accuracy
8. Custom tags: user can add custom tags beyond AI suggestions
9. Tag management: edit, remove, merge tags across assets
10. Tag search: search assets by tags with autocomplete
11. Tag statistics: shows most used tags, tag distribution
12. Batch tagging: apply tags to multiple assets at once

### Story 11.3: Version Control

As a user,  
I want version control for my assets,  
so that I can track changes and revert if needed.

**Acceptance Criteria:**
1. Automatic versioning: each upload of same filename creates new version
2. Version history: displays all versions with version number, upload date, uploaded by
3. Version comparison: side-by-side view for images with diff highlighting
4. Version metadata: compare metadata between versions
5. Version revert: revert to any previous version with confirmation
6. Latest version: always shows latest version by default with version indicator
7. Version download: download specific version or all versions
8. Version deletion: delete specific versions (latest version cannot be deleted if only version)
9. Version usage tracking: shows which versions used in which content
10. Version comments: add notes to versions explaining changes
11. Version limit: configurable max versions per file (default: 10, keep latest 10)
12. Version export: export version history as report

### Story 11.4: Brand Kit Management

As a user,  
I want to store my brand assets in a brand kit,  
so that I can maintain brand consistency across content.

**Acceptance Criteria:**
1. Brand kit interface: organized sections for logos, colors, typography, templates, guidelines
2. Logo management: upload primary (full color), secondary (black/white), icon, variations (horizontal, vertical, square)
3. Logo formats: SVG, PNG, JPG with format recommendations
4. Color management: primary, secondary, accent colors with HEX, RGB, CMYK codes
5. Color usage notes: document when to use each color (e.g., "Primary for CTAs")
6. Typography management: heading font, body font with file uploads (TTF, OTF, WOFF)
7. Typography usage notes: document font usage rules (e.g., "Headings all caps")
8. Template storage: thumbnail templates, social media templates, video intro/outro
9. Brand guidelines: logo usage dos/don'ts, color combinations, spacing rules, voice/tone
10. Brand consistency checking: AI checks uploaded assets against brand kit and flags violations
11. Brand kit export: download brand kit as package for external use
12. Brand kit sharing: share brand kit with team members

### Story 11.5: Stock Content Integration

As a user,  
I want to search and download stock content,  
so that I can access professional media without creating it myself.

**Acceptance Criteria:**
1. Stock content interface: unified search across all providers
2. Provider integration: Pexels, Pixabay, Unsplash, Videvo (free), Envato Elements, Storyblocks, Adobe Stock (paid)
3. Search functionality: search all providers simultaneously with filters (type, license, price)
4. Results display: grid view with preview, source, license type, price
5. Preview functionality: preview images/videos before download
6. Download functionality: download directly to media library with attribution
7. License tracking: tracks downloads with license type, expiration, attribution requirements
8. Usage tracking: tracks which stock content used in which projects
9. License compliance: alerts for expiring licenses and attribution requirements
10. Cost tracking: tracks paid stock content purchases
11. Favorites: save stock content for later download
12. Attribution generator: auto-generates attribution text for downloaded content

---

## Epic 12: Admin Dashboard & System Management

**Goal:** Create comprehensive admin dashboard for user management, workflow curation, platform management, system monitoring, and configuration. This epic enables platform administrators to manage the entire system effectively.

### Story 12.1: Admin Dashboard Overview

As a system administrator,  
I want a dashboard showing system health and key metrics,  
so that I can monitor platform status at a glance.

**Acceptance Criteria:**
1. Dashboard displays: uptime percentage, error rate, average response time, active users (30 days), concurrent users
2. User metrics: total users, users by tier, new signups (month), churn rate, trial-to-paid conversion
3. Revenue metrics: MRR, ARR, overage revenue, IP rotation revenue, marketplace revenue, growth rate
4. Usage metrics: videos generated, posts published, GPU utilization, storage used, API calls
5. Real-time updates: metrics refresh automatically or on manual refresh
6. Time range selector: view metrics for different time periods (today, week, month, quarter, year)
7. Metric cards: key numbers with percentage change vs previous period
8. Charts and graphs: visualize trends over time
9. Alert indicators: highlight issues requiring attention (high error rate, low uptime, etc.)
10. Quick actions: common admin tasks accessible from dashboard
11. Export functionality: download dashboard data as CSV or PDF
12. Customizable widgets: admin can customize dashboard layout

### Story 12.2: User Management

As a system administrator,  
I want to manage all users,  
so that I can provide support and maintain platform quality.

**Acceptance Criteria:**
1. User list: displays all users with search, filter, sort functionality
2. User details: view user profile, subscription, usage, activity, billing history
3. User actions: suspend/reactivate, change tier/limits, login as user (with permission), delete user
4. User search: search by email, name, tenant ID, tier
5. User filtering: filter by tier, status (active, suspended, trial), signup date
6. Bulk actions: suspend multiple users, change tier for multiple users, export user list
7. User activity log: view all user actions with timestamps
8. User support: access user's support tickets and communication history
9. User analytics: view user's usage trends, engagement, retention metrics
10. User export: download user data as CSV
11. User import: bulk import users from CSV (for enterprise onboarding)
12. User communication: send system messages to users

### Story 12.3: Workflow Curation

As a system administrator,  
I want to curate workflows from automated scraping,  
so that the marketplace has high-quality, relevant workflows.

**Acceptance Criteria:**
1. Scraped workflows queue: displays all workflows from automated scraping awaiting review
2. Workflow status: pending, reviewing, approved, rejected, duplicate
3. Workflow review interface: view workflow JSON, metadata, example outputs, source
4. Admin actions: approve, reject, mark as featured, mark as premium, assign category/tags
5. Bulk actions: approve/reject multiple workflows, assign category/tags in bulk
6. Quality control: test workflow before approval, generate sample outputs
7. Workflow editing: admin can edit workflow metadata, description, tags
8. Duplicate detection: identifies duplicate workflows and suggests merging
9. Workflow analytics: view workflow performance (downloads, ratings, usage)
10. Workflow moderation: remove inappropriate workflows, handle user reports
11. Workflow promotion: feature workflows on homepage, editor's choice badges
12. Workflow export: export workflow list and metadata

### Story 12.4: Platform Management

As a system administrator,  
I want to manage platform integrations,  
so that I can ensure all platform APIs are functioning correctly.

**Acceptance Criteria:**
1. Platform status dashboard: shows health status for all 8 platforms
2. API key management: configure API keys for all platforms with rotation capability
3. Quota monitoring: track API quota usage per platform with alerts at 80%
4. Rate limit tracking: monitor rate limit usage and violations
5. Platform enable/disable: temporarily disable platforms for maintenance
6. Platform health checks: automated tests verify API connectivity and functionality
7. Error monitoring: track API errors and failures with alerting
8. Platform usage stats: view usage statistics per platform
9. Platform configuration: configure platform-specific settings and limits
10. Platform testing: test platform connections and publishing functionality
11. Platform documentation: maintain platform-specific documentation and requirements
12. Platform updates: track platform API changes and deprecations

### Story 12.5: System Configuration

As a system administrator,  
I want to configure system-wide settings,  
so that I can customize platform behavior and features.

**Acceptance Criteria:**
1. General settings: enable/disable platform features, configure tier limits and pricing
2. Email settings: configure email templates, SMTP settings, email delivery
3. Notification settings: configure notification preferences and delivery methods
4. Maintenance mode: enable maintenance mode with custom message
5. Security settings: encryption settings, audit log retention, session timeout, 2FA enforcement, IP whitelist/blacklist
6. Feature flags: enable/disable features for testing or gradual rollout
7. System limits: configure global limits (max file size, max workflow nodes, etc.)
8. Integration settings: configure external service integrations (Stripe, SendGrid, etc.)
9. Backup settings: configure backup frequency, retention, and restoration
10. Monitoring settings: configure alerting thresholds and notification channels
11. System logs: view system logs with filtering and search
12. Configuration export: export system configuration for backup

---

## Checklist Results Report

*[PM Checklist will be executed and results populated here after PRD completion]*

---

## Next Steps

### UX Expert Prompt

The PRD for MPCAS is complete. Please create a comprehensive front-end specification document using the front-end-spec-tmpl.yaml template. Focus on the unified publishing interface, workflow builder, content calendar, analytics dashboard, and white-label customization capabilities. Ensure the spec addresses responsive design, accessibility (WCAG AA), and the multi-platform nature of the application.

### Architect Prompt

The PRD for MPCAS is complete with 12 epics and detailed user stories. Please create a comprehensive fullstack architecture document using the fullstack-architecture-tmpl.yaml template. Key architectural considerations: multi-tenant schema-per-tenant database, microservices architecture, ComfyUI/n8n integration, 8 platform API integrations, self-hosted AI (80% workload), and horizontal scaling requirements. Ensure the architecture supports 10,000+ concurrent users and 99.9% uptime SLA.

---

**Document Status:** ✅ Complete  
**Version:** 1.0  
**Total Epics:** 12  
**Total Stories:** 100+  
**Total Requirements:** 88 (68 Functional + 20 Non-Functional)  
**Next Documents:** Front-End Specification, Fullstack Architecture
