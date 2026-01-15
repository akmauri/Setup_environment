# Twitter/X OAuth Integration

## Description

Implement OAuth 2.0 connection for Twitter/X accounts using Twitter API v2, enabling users to connect their Twitter/X accounts and manage platform-specific settings.

## Requirements

- Twitter API v2 OAuth 2.0 flow
- Token encryption and secure storage
- Refresh token rotation (new refresh token on each refresh)
- Account information display
- Multiple account support with tier limits
- Account labeling
- Token health monitoring with automatic refresh
- Rate limit tracking
- Error handling for suspended accounts, rate limits, and permission issues

## Acceptance Criteria

- [ ] "Connect Twitter/X" button initiates OAuth 2.0 flow (Twitter API v2)
- [ ] OAuth scopes requested: `tweet.write`, `users.read`, `offline.access`
- [ ] Authorization code exchanged for access token and refresh token
- [ ] Access tokens stored encrypted with automatic refresh before expiry
- [ ] Refresh token rotation implemented (new refresh token issued on each refresh)
- [ ] Connected Twitter/X account displayed with username, handle, profile picture, follower count
- [ ] Account verification status displayed (blue checkmark if verified)
- [ ] Multiple Twitter/X accounts supported with account labeling
- [ ] Account disconnection revokes tokens and removes connection
- [ ] Token health monitoring with automatic refresh
- [ ] Rate limit tracking displayed (tweet limits per 15-minute window)
- [ ] Error handling for suspended accounts, rate limits, and permission issues

## Dependencies

- OAuth service infrastructure
- Social account service (already exists from YouTube/Instagram/TikTok)
- Encryption service (already exists from YouTube)
- Tier service (already exists from YouTube)
- Token refresh service (already exists from YouTube/Instagram/TikTok)
- Twitter API v2

## Technical Notes

- Twitter/X uses Twitter API v2 OAuth 2.0
- Requires Twitter Developer account and app creation
- Refresh token rotation: new refresh token issued on each refresh (old one invalidated)
- Rate limits: Tweet limits per 15-minute window (varies by tier)
- Account verification status via Twitter API v2
- Token refresh uses Twitter OAuth refresh endpoint
- Account info retrieved from Twitter API v2 User Lookup
- Error handling needed for: suspended accounts, rate limits, permission issues
- Rate limit headers included in API responses
