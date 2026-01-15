# Implementation Plan

**Last Updated**: 2026-01-15
**Status**: In Progress

This is a living document that tracks the prioritized TODO list for implementation.

## How to Use This Plan

1. **Planning Phase**: This plan is created/updated during the planning phase
2. **Building Phase**: Tasks are selected from this plan during the building phase
3. **Updates**: Tasks are marked complete as they're finished
4. **Priority**: Tasks are ordered by priority (1 = highest)

## Priority 1: Foundation & Infrastructure

### Story 1.5: Health Check & System Status

**Story ID**: 1.5  
**Epic**: Foundation & Core Infrastructure  
**Status**: In Progress

#### Basic Health Check Endpoint

- [x] Task 1.5.1: Create health check route handler for GET /health [Complexity: low] [Dependencies: none]
- [x] Task 1.5.2: Return 200 OK status with timestamp in health endpoint [Complexity: low] [Dependencies: Task 1.5.1]
- [ ] Task 1.5.3: Verify health endpoint responds within 100ms [Complexity: low] [Dependencies: Task 1.5.2]

#### Version Information

- [ ] Task 1.5.4: Extract API version from package.json [Complexity: low] [Dependencies: none]
- [ ] Task 1.5.5: Get git commit hash at build time [Complexity: low] [Dependencies: none]
- [ ] Task 1.5.6: Create version info service to aggregate version data [Complexity: low] [Dependencies: Task 1.5.4, Task 1.5.5]
- [ ] Task 1.5.7: Include version information in health check response [Complexity: low] [Dependencies: Task 1.5.6]

#### Database Health Check

- [x] Task 1.5.8: Create database health check function that executes SELECT 1 query [Complexity: low] [Dependencies: none]
- [x] Task 1.5.9: Measure database query response time in health check [Complexity: low] [Dependencies: Task 1.5.8]
- [x] Task 1.5.10: Return database connection status in health check response [Complexity: low] [Dependencies: Task 1.5.8]

#### Redis Health Check

- [x] Task 1.5.11: Create Redis client connection utility [Complexity: medium] [Dependencies: none]
- [x] Task 1.5.12: Implement Redis PING command in health check [Complexity: low] [Dependencies: Task 1.5.11]
- [x] Task 1.5.13: Return Redis connection status in health check response [Complexity: low] [Dependencies: Task 1.5.12]

#### External Service Health Checks

- [x] Task 1.5.14: Create S3 service health check function with timeout [Complexity: medium] [Dependencies: none]
- [x] Task 1.5.15: Create email service health check function with timeout [Complexity: low] [Dependencies: none]
- [x] Task 1.5.16: Return external service status in detailed health check [Complexity: low] [Dependencies: Task 1.5.14, Task 1.5.15]

#### Detailed Health Check Endpoint

- [x] Task 1.5.17: Create detailed health check route handler for GET /health/detailed [Complexity: low] [Dependencies: none]
- [x] Task 1.5.18: Aggregate all health check results in detailed endpoint [Complexity: medium] [Dependencies: Task 1.5.10, Task 1.5.13, Task 1.5.16]
- [ ] Task 1.5.19: Verify detailed health endpoint responds within 500ms [Complexity: low] [Dependencies: Task 1.5.18]

#### Health Check Caching

- [x] Task 1.5.20: Install node-cache or create simple in-memory cache utility [Complexity: low] [Dependencies: none]
- [x] Task 1.5.21: Implement 30-second cache for health check results [Complexity: low] [Dependencies: Task 1.5.20]
- [x] Task 1.5.22: Return cached results for health check requests within 30 seconds [Complexity: low] [Dependencies: Task 1.5.21]

#### Prometheus Metrics

- [x] Task 1.5.23: Install prom-client package for Prometheus metrics [Complexity: low] [Dependencies: none]
- [x] Task 1.5.24: Create Prometheus metrics registry [Complexity: low] [Dependencies: Task 1.5.23]
- [x] Task 1.5.25: Create GET /metrics endpoint that returns Prometheus format [Complexity: low] [Dependencies: Task 1.5.24]
- [x] Task 1.5.26: Add basic application metrics to Prometheus registry [Complexity: medium] [Dependencies: Task 1.5.24]

#### Monitoring Integration (Optional)

- [ ] Task 1.5.27: Create health check failure detection logic [Complexity: medium] [Dependencies: Task 1.5.18]
- [ ] Task 1.5.28: Add alerting hook interface for monitoring system integration [Complexity: low] [Dependencies: Task 1.5.27]

## Priority 2: Platform Integrations & OAuth

### Story 2.1: YouTube OAuth Integration

**Story ID**: 2.1  
**Epic**: Platform Integrations & OAuth  
**Status**: In Progress

#### YouTube OAuth Configuration

- [x] Task 2.1.1: Create YouTube OAuth config with YouTube-specific scopes [Complexity: low] [Dependencies: none]
- [x] Task 2.1.2: Add YouTube scopes to OAuth config (youtube.upload, youtube.force-ssl, youtube.readonly) [Complexity: low] [Dependencies: Task 2.1.1]

#### Token Encryption Service

- [x] Task 2.1.3: Install crypto package for AES-256-GCM encryption [Complexity: low] [Dependencies: none]
- [x] Task 2.1.4: Create encryption service with encrypt function using AES-256-GCM [Complexity: medium] [Dependencies: Task 2.1.3]
- [x] Task 2.1.5: Create decryption function in encryption service [Complexity: medium] [Dependencies: Task 2.1.4]
- [x] Task 2.1.6: Store encryption key in environment variable [Complexity: low] [Dependencies: Task 2.1.4]

#### Social Account Service

- [x] Task 2.1.7: Create social account service for storing encrypted tokens [Complexity: medium] [Dependencies: Task 2.1.5]
- [x] Task 2.1.8: Implement function to save YouTube account with encrypted tokens [Complexity: medium] [Dependencies: Task 2.1.7]
- [x] Task 2.1.9: Implement function to retrieve YouTube account by user ID [Complexity: low] [Dependencies: Task 2.1.7]
- [x] Task 2.1.10: Implement function to list all YouTube accounts for user [Complexity: low] [Dependencies: Task 2.1.7]
- [x] Task 2.1.11: Implement function to delete YouTube account connection [Complexity: low] [Dependencies: Task 2.1.7]

#### YouTube OAuth Flow

- [x] Task 2.1.12: Create YouTube OAuth initiation endpoint [Complexity: low] [Dependencies: Task 2.1.2]
- [x] Task 2.1.13: Create YouTube OAuth callback handler [Complexity: medium] [Dependencies: Task 2.1.12, Task 2.1.8]
- [x] Task 2.1.14: Exchange authorization code for YouTube tokens [Complexity: low] [Dependencies: Task 2.1.13]
- [x] Task 2.1.15: Fetch YouTube channel information using access token [Complexity: medium] [Dependencies: Task 2.1.14]
- [x] Task 2.1.16: Store YouTube account with channel info and encrypted tokens [Complexity: medium] [Dependencies: Task 2.1.15, Task 2.1.8]

#### Token Refresh Service

- [x] Task 2.1.17: Create token refresh service for YouTube tokens [Complexity: medium] [Dependencies: Task 2.1.5]
- [x] Task 2.1.18: Implement function to refresh YouTube access token [Complexity: medium] [Dependencies: Task 2.1.17]
- [x] Task 2.1.19: Implement token rotation on refresh (delete old, store new) [Complexity: medium] [Dependencies: Task 2.1.18]
- [x] Task 2.1.20: Create auto-refresh mechanism that refreshes 5 minutes before expiry [Complexity: high] [Dependencies: Task 2.1.19]
- [x] Task 2.1.21: Track token expiry timestamps in database [Complexity: low] [Dependencies: Task 2.1.8]

#### Account Management Endpoints

- [x] Task 2.1.22: Create GET endpoint to list connected YouTube accounts [Complexity: low] [Dependencies: Task 2.1.10]
- [x] Task 2.1.23: Create DELETE endpoint to disconnect YouTube account [Complexity: medium] [Dependencies: Task 2.1.11]
- [x] Task 2.1.24: Implement token revocation on account disconnection [Complexity: medium] [Dependencies: Task 2.1.23]
- [x] Task 2.1.25: Add account labeling support to social_accounts table [Complexity: low] [Dependencies: none]
- [x] Task 2.1.26: Create PUT endpoint to update account label [Complexity: low] [Dependencies: Task 2.1.25]

#### Tier Limit Enforcement

- [x] Task 2.1.27: Create function to get tenant tier from database [Complexity: low] [Dependencies: none]
- [x] Task 2.1.28: Create function to check account count against tier limits [Complexity: low] [Dependencies: Task 2.1.27]
- [x] Task 2.1.29: Enforce tier limits when connecting new YouTube account [Complexity: low] [Dependencies: Task 2.1.28]

#### Token Health Check

- [x] Task 2.1.30: Create function to validate YouTube token using YouTube API [Complexity: medium] [Dependencies: Task 2.1.5]
- [x] Task 2.1.31: Create endpoint to check token health for all YouTube accounts [Complexity: low] [Dependencies: Task 2.1.30]
- [x] Task 2.1.32: Implement alert mechanism for invalid/expired tokens [Complexity: medium] [Dependencies: Task 2.1.31]

### Story 2.2: Instagram OAuth Integration

**Story ID**: 2.2  
**Epic**: Platform Integrations & OAuth  
**Status**: Completed

#### Facebook OAuth Configuration

- [x] Task 2.2.1: Create Facebook OAuth config with Instagram scopes [Complexity: low] [Dependencies: none]
- [x] Task 2.2.2: Add Facebook OAuth scopes (instagram_basic, instagram_content_publish, pages_read_engagement) [Complexity: low] [Dependencies: Task 2.2.1]

#### Instagram Service

- [x] Task 2.2.3: Create Facebook OAuth service for token exchange [Complexity: medium] [Dependencies: Task 2.2.2]
- [x] Task 2.2.4: Implement function to get Facebook Pages for user [Complexity: medium] [Dependencies: Task 2.2.3]
- [x] Task 2.2.5: Implement function to get Instagram account connected to Facebook Page [Complexity: medium] [Dependencies: Task 2.2.4]
- [x] Task 2.2.6: Implement function to exchange short-lived token for long-lived token (60 days) [Complexity: medium] [Dependencies: Task 2.2.3]
- [x] Task 2.2.13: Create Instagram service for API operations [Complexity: medium] [Dependencies: Task 2.2.3]
- [x] Task 2.2.14: Implement function to refresh Instagram long-lived token [Complexity: medium] [Dependencies: Task 2.2.6]

#### Instagram OAuth Flow

- [x] Task 2.2.7: Create Instagram OAuth initiation endpoint with Facebook Login [Complexity: low] [Dependencies: Task 2.2.2]
- [x] Task 2.2.8: Create Instagram OAuth callback handler [Complexity: medium] [Dependencies: Task 2.2.7]
- [x] Task 2.2.9: Implement Facebook Page selection in callback flow [Complexity: medium] [Dependencies: Task 2.2.8]
- [x] Task 2.2.10: Fetch Instagram account information using Instagram Graph API [Complexity: medium] [Dependencies: Task 2.2.5]
- [x] Task 2.2.11: Validate Instagram account is Professional (Business or Creator) [Complexity: low] [Dependencies: Task 2.2.10]
- [x] Task 2.2.12: Store Instagram account with encrypted tokens and account info [Complexity: medium] [Dependencies: Task 2.2.11]

#### Token Refresh

- [x] Task 2.2.15: Update token refresh service to support Instagram tokens [Complexity: low] [Dependencies: Task 2.2.14]

#### Account Management

- [x] Task 2.2.16: Create GET endpoint to list connected Instagram accounts [Complexity: low] [Dependencies: none]
- [x] Task 2.2.17: Create DELETE endpoint to disconnect Instagram account [Complexity: medium] [Dependencies: Task 2.2.16]
- [x] Task 2.2.18: Implement token revocation on Instagram account disconnection [Complexity: medium] [Dependencies: Task 2.2.17]
- [x] Task 2.2.19: Create PUT endpoint to update Instagram account label [Complexity: low] [Dependencies: none]
- [x] Task 2.2.20: Enforce tier limits when connecting new Instagram account [Complexity: low] [Dependencies: none]

#### Token Health & Error Handling

- [x] Task 2.2.21: Create function to validate Instagram token using Instagram API [Complexity: medium] [Dependencies: none]
- [x] Task 2.2.22: Create endpoint to check token health for Instagram accounts [Complexity: low] [Dependencies: Task 2.2.21]
- [x] Task 2.2.23: Implement error handling for non-professional Instagram accounts [Complexity: low] [Dependencies: Task 2.2.11]
- [x] Task 2.2.24: Implement error handling for unconnected Facebook Pages [Complexity: low] [Dependencies: Task 2.2.9]
- [x] Task 2.2.25: Implement error handling for permission denials [Complexity: low] [Dependencies: Task 2.2.8]

### Story 2.3: TikTok OAuth Integration

**Story ID**: 2.3  
**Epic**: Platform Integrations & OAuth  
**Status**: Completed

#### TikTok OAuth Configuration

- [x] Task 2.3.1: Create TikTok OAuth config with TikTok scopes [Complexity: low] [Dependencies: none]
- [x] Task 2.3.2: Add TikTok OAuth scopes (video.upload, user.info.basic) [Complexity: low] [Dependencies: Task 2.3.1]

#### TikTok Service

- [x] Task 2.3.3: Create TikTok service for OAuth and API operations [Complexity: medium] [Dependencies: Task 2.3.2]
- [x] Task 2.3.4: Implement function to exchange authorization code for TikTok tokens [Complexity: medium] [Dependencies: Task 2.3.3]
- [x] Task 2.3.5: Implement function to refresh TikTok access token [Complexity: medium] [Dependencies: Task 2.3.3]
- [x] Task 2.3.6: Implement function to get TikTok user information [Complexity: medium] [Dependencies: Task 2.3.3]
- [x] Task 2.3.7: Validate TikTok account is Creator or Business and age 18+ [Complexity: low] [Dependencies: Task 2.3.6]

#### TikTok OAuth Flow

- [x] Task 2.3.8: Create TikTok OAuth initiation endpoint [Complexity: low] [Dependencies: Task 2.3.2]
- [x] Task 2.3.9: Create TikTok OAuth callback handler [Complexity: medium] [Dependencies: Task 2.3.8]
- [x] Task 2.3.10: Store TikTok account with encrypted tokens and account info [Complexity: medium] [Dependencies: Task 2.3.7]

#### Token Refresh

- [x] Task 2.3.11: Update token refresh service to support TikTok tokens [Complexity: low] [Dependencies: Task 2.3.5]

#### Account Management

- [x] Task 2.3.12: Create GET endpoint to list connected TikTok accounts [Complexity: low] [Dependencies: none]
- [x] Task 2.3.13: Create DELETE endpoint to disconnect TikTok account [Complexity: medium] [Dependencies: Task 2.3.12]
- [x] Task 2.3.14: Implement token revocation on TikTok account disconnection [Complexity: medium] [Dependencies: Task 2.3.13]
- [x] Task 2.3.15: Create PUT endpoint to update TikTok account label [Complexity: low] [Dependencies: none]
- [x] Task 2.3.16: Enforce tier limits when connecting new TikTok account [Complexity: low] [Dependencies: none]

#### Token Health & Upload Limits

- [x] Task 2.3.17: Create function to validate TikTok token using TikTok API [Complexity: medium] [Dependencies: none]
- [x] Task 2.3.18: Create endpoint to check token health for TikTok accounts [Complexity: low] [Dependencies: Task 2.3.17]
- [x] Task 2.3.19: Track daily upload limit (20 videos per account per day) [Complexity: low] [Dependencies: Task 2.3.10]
- [x] Task 2.3.20: Display daily upload limit in account information [Complexity: low] [Dependencies: Task 2.3.19]

### Story 2.4: Twitter/X OAuth Integration

**Story ID**: 2.4  
**Epic**: Platform Integrations & OAuth  
**Status**: Completed

#### Twitter OAuth Configuration

- [x] Task 2.4.1: Create Twitter OAuth config with Twitter API v2 scopes [Complexity: low] [Dependencies: none]
- [x] Task 2.4.2: Add Twitter OAuth scopes (tweet.write, users.read, offline.access) [Complexity: low] [Dependencies: Task 2.4.1]

#### Twitter Service

- [x] Task 2.4.3: Create Twitter service for OAuth and API operations [Complexity: medium] [Dependencies: Task 2.4.2]
- [x] Task 2.4.4: Implement function to exchange authorization code for Twitter tokens [Complexity: medium] [Dependencies: Task 2.4.3]
- [x] Task 2.4.5: Implement function to refresh Twitter access token with rotation [Complexity: medium] [Dependencies: Task 2.4.3]
- [x] Task 2.4.6: Implement function to get Twitter user information [Complexity: medium] [Dependencies: Task 2.4.3]
- [x] Task 2.4.7: Get Twitter rate limit information from API headers [Complexity: low] [Dependencies: Task 2.4.6]

#### Twitter OAuth Flow

- [x] Task 2.4.8: Create Twitter OAuth initiation endpoint [Complexity: low] [Dependencies: Task 2.4.2]
- [x] Task 2.4.9: Create Twitter OAuth callback handler [Complexity: medium] [Dependencies: Task 2.4.8]
- [x] Task 2.4.10: Store Twitter account with encrypted tokens and account info [Complexity: medium] [Dependencies: Task 2.4.7]

#### Token Refresh

- [x] Task 2.4.11: Update token refresh service to support Twitter tokens with rotation [Complexity: low] [Dependencies: Task 2.4.5]

#### Account Management

- [x] Task 2.4.12: Create GET endpoint to list connected Twitter accounts [Complexity: low] [Dependencies: none]
- [x] Task 2.4.13: Create DELETE endpoint to disconnect Twitter account [Complexity: medium] [Dependencies: Task 2.4.12]
- [x] Task 2.4.14: Implement token revocation on Twitter account disconnection [Complexity: medium] [Dependencies: Task 2.4.13]
- [x] Task 2.4.15: Create PUT endpoint to update Twitter account label [Complexity: low] [Dependencies: none]
- [x] Task 2.4.16: Enforce tier limits when connecting new Twitter account [Complexity: low] [Dependencies: none]

#### Token Health & Error Handling

- [x] Task 2.4.17: Create function to validate Twitter token using Twitter API [Complexity: medium] [Dependencies: none]
- [x] Task 2.4.18: Create endpoint to check token health for Twitter accounts [Complexity: low] [Dependencies: Task 2.4.17]
- [x] Task 2.4.19: Track rate limits in account metadata [Complexity: low] [Dependencies: Task 2.4.7]
- [x] Task 2.4.20: Display rate limit information in account information [Complexity: low] [Dependencies: Task 2.4.19]
- [x] Task 2.4.21: Implement error handling for suspended accounts [Complexity: low] [Dependencies: Task 2.4.6]
- [x] Task 2.4.22: Implement error handling for rate limits [Complexity: low] [Dependencies: Task 2.4.7]
- [x] Task 2.4.23: Implement error handling for permission issues [Complexity: low] [Dependencies: Task 2.4.6]

## Priority 1: Foundation & Infrastructure (Legacy Tasks)

### Test Story 0.1: Task Breakdown Integration

**Story ID**: 0.1  
**Epic**: Test Epic  
**Status**: Draft

#### Database Setup (AC: 1)

- [ ] Task 1.1: Install PostgreSQL [Complexity: low] [Dependencies: none]
- [ ] Task 1.2: Configure connection pooling with PgBouncer [Complexity: medium] [Dependencies: Task 1.1]
- [ ] Task 1.3: Create database schema [Complexity: medium] [Dependencies: Task 1.1]
- [ ] Task 1.4: Set up connection middleware [Complexity: medium] [Dependencies: Task 1.2, Task 1.3]
- [ ] Task 1.5: Test database connections [Complexity: low] [Dependencies: Task 1.4]
- [ ] Task 1.6: Verify pooling works [Complexity: low] [Dependencies: Task 1.5]

#### Authentication & User Management (AC: 2)

- [ ] Task 2.1: Set up OAuth flow [Complexity: high] [Dependencies: none]
- [ ] Task 2.2: Create user registration endpoint [Complexity: medium] [Dependencies: Task 2.1]
- [ ] Task 2.3: Implement JWT token generation [Complexity: medium] [Dependencies: Task 2.2]
- [ ] Task 2.4: Implement user profile management [Complexity: medium] [Dependencies: Task 2.3]
- [ ] Task 2.5: Add password reset functionality [Complexity: medium] [Dependencies: Task 2.2]
- [ ] Task 2.6: Add email verification [Complexity: medium] [Dependencies: Task 2.2]

#### API Endpoints & Testing (AC: 3)

- [ ] Task 3.1: Design REST API endpoints [Complexity: medium] [Dependencies: none]
- [ ] Task 3.2: Implement request validation [Complexity: medium] [Dependencies: Task 3.1]
- [ ] Task 3.3: Write unit tests for endpoints [Complexity: medium] [Dependencies: Task 3.2]
- [ ] Task 3.4: Write integration tests for API flows [Complexity: high] [Dependencies: Task 3.3]
- [ ] Task 3.5: Document API endpoints [Complexity: low] [Dependencies: Task 3.1]
- [ ] Task 3.6: Set up error handling [Complexity: medium] [Dependencies: Task 3.2]

## Priority 2: Core Features

_No tasks yet - will be populated during planning phase_

## Priority 3: Enhancements

_No tasks yet - will be populated during planning phase_

## Notes

_Add any important notes, decisions, or considerations here_
