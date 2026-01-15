# TikTok OAuth Integration

## Description

Implement OAuth 2.0 connection for TikTok accounts enabling users to connect their TikTok Creator or Business accounts and manage platform-specific settings.

## Requirements

- TikTok OAuth 2.0 flow
- Account type validation (Creator or Business, age 18+)
- Token encryption and secure storage
- Token refresh support
- Account information display
- Multiple account support with tier limits
- Account labeling
- Token health monitoring
- Daily upload limit tracking (20 videos per account per day)

## Acceptance Criteria

- [ ] "Connect TikTok" button initiates TikTok OAuth flow
- [ ] User must have TikTok Creator or Business account (age 18+ required for API access)
- [ ] OAuth scopes requested: `video.upload`, `user.info.basic`
- [ ] Authorization code exchanged for access token with proper error handling
- [ ] Access tokens stored encrypted with refresh token support
- [ ] Token refresh implemented using TikTok OAuth refresh endpoint
- [ ] Connected TikTok account displayed with username, profile picture, follower count
- [ ] Account type displayed (Creator, Business) with verification status
- [ ] Multiple TikTok accounts supported (within tier limits)
- [ ] Daily upload limit displayed (20 videos per account per day)
- [ ] Account disconnection removes connection and revokes tokens
- [ ] Token validation and refresh handled automatically

## Dependencies

- OAuth service infrastructure
- Social account service (already exists from YouTube/Instagram)
- Encryption service (already exists from YouTube)
- Tier service (already exists from YouTube)
- Token refresh service (already exists from YouTube/Instagram)
- TikTok OAuth API

## Technical Notes

- TikTok OAuth uses standard OAuth 2.0 flow
- Requires TikTok Developer account and app creation
- Account must be Creator or Business (not Personal)
- Age 18+ requirement for API access
- Tokens have expiry and need refresh
- Daily upload limit: 20 videos per account per day
- Token refresh uses TikTok OAuth refresh endpoint
- Account info retrieved from TikTok User Info API
- Token validation via TikTok API
