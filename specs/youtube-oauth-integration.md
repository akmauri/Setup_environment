# YouTube OAuth Integration

## Description

Implement OAuth 2.0 connection for YouTube accounts enabling users to connect their YouTube channels and manage platform-specific settings.

## Requirements

- OAuth 2.0 flow with Google (YouTube uses Google OAuth)
- Token encryption and secure storage
- Token refresh with rotation
- Account management (connect, disconnect, list)
- Dashboard display of connected accounts
- Multiple account support with tier limits
- Account labeling
- Token health monitoring

## Acceptance Criteria

- [ ] "Connect YouTube" button initiates OAuth 2.0 flow with Google OAuth
- [ ] OAuth scopes requested: `youtube.upload`, `youtube.force-ssl`, `youtube.readonly`
- [ ] OAuth callback handler processes authorization code and exchanges for access/refresh tokens
- [ ] Access tokens stored encrypted (AES-256-GCM) in database with tenant isolation
- [ ] Refresh tokens stored encrypted with single-use rotation on refresh
- [ ] Token expiry tracked (access: 1 hour, refresh: indefinite until revoked)
- [ ] Auto-refresh mechanism refreshes access tokens 5 minutes before expiry
- [ ] Connected YouTube account displayed in dashboard with channel name, thumbnail, subscriber count
- [ ] User can disconnect YouTube account which revokes tokens and removes connection
- [ ] Multiple YouTube accounts supported (within tier limits: Creator: 3, Professional: 10, Agency: 50)
- [ ] Account labeling supported (e.g., "Personal", "Business", "Client A")
- [ ] Token health check validates token validity and alerts if token is invalid/expired

## Dependencies

- OAuth service infrastructure (already exists for Google OAuth)
- Database schema for social_accounts table (already exists)
- Encryption service for token storage
- Token refresh service
- YouTube Data API v3

## Technical Notes

- YouTube uses Google OAuth, so can leverage existing Google OAuth infrastructure
- Need to extend OAuth config to support YouTube-specific scopes
- Tokens must be encrypted before storage (AES-256-GCM)
- Token refresh requires Google OAuth token refresh endpoint
- YouTube Data API v3 for channel information retrieval
- Account limits enforced per tenant tier
- Token health checks should run periodically or on-demand
