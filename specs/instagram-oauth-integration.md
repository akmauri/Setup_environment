# Instagram OAuth Integration

## Description

Implement OAuth 2.0 connection for Instagram accounts via Facebook Login. Instagram requires Facebook Business Manager and Instagram Professional accounts (Business or Creator) connected to Facebook Pages.

## Requirements

- OAuth flow via Facebook Login (Instagram uses Facebook OAuth)
- Facebook Page selection for Instagram account connection
- Long-lived token management (60 days) with automatic refresh
- Token encryption and secure storage
- Account information display (username, profile picture, follower count, account type)
- Verification status display
- Multiple account support with tier limits
- Account labeling
- Token health monitoring and refresh
- Error handling for common Instagram/Facebook issues

## Acceptance Criteria

- [ ] "Connect Instagram" button initiates OAuth flow via Facebook Login
- [ ] User must have Instagram Professional account (Business or Creator) connected to Facebook Page
- [ ] OAuth scopes requested: `instagram_basic`, `instagram_content_publish`, `pages_read_engagement`
- [ ] Facebook Page selection interface allows user to choose which Page's Instagram account to connect
- [ ] Access tokens stored encrypted with long-lived tokens (60 days) and automatic refresh
- [ ] Token refresh implemented using Facebook Graph API token exchange
- [ ] Connected Instagram account displayed with username, profile picture, follower count, account type
- [ ] Account verification status displayed (verified badge if applicable)
- [ ] Multiple Instagram accounts supported with account labeling
- [ ] Account disconnection revokes tokens and removes connection
- [ ] Token health monitoring validates token and refreshes if needed
- [ ] Error handling for common issues (account not professional, page not connected, permissions denied)

## Dependencies

- OAuth service infrastructure (Facebook OAuth)
- Social account service (already exists from YouTube)
- Encryption service (already exists from YouTube)
- Tier service (already exists from YouTube)
- Token refresh service (already exists from YouTube)
- Facebook Graph API

## Technical Notes

- Instagram uses Facebook Login, so need Facebook OAuth infrastructure
- Requires Facebook App with Instagram permissions
- Long-lived tokens (60 days) vs short-lived (1 hour) - need token exchange
- Facebook Page selection required before Instagram account connection
- Instagram account must be Professional (Business or Creator) and connected to Facebook Page
- Token refresh uses Facebook Graph API token exchange endpoint
- Account info retrieved from Instagram Graph API
- Error handling needed for: non-professional accounts, unconnected pages, permission denials
