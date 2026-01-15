# LinkedIn OAuth Integration

## Description

Implement OAuth 2.0 connection for LinkedIn accounts, enabling users to connect their personal LinkedIn profiles and LinkedIn Company Pages where they have admin access.

## Requirements

- LinkedIn OAuth 2.0 flow
- Support for personal profiles and company pages
- Long-lived token management (60 days) with refresh capability
- Token encryption and secure storage
- Account type indication (Personal Profile vs Company Page)
- Multiple account support with tier limits
- Account labeling
- Token health monitoring with automatic refresh
- Error handling for permission issues and account access problems

## Acceptance Criteria

- [ ] "Connect LinkedIn" button initiates LinkedIn OAuth 2.0 flow
- [ ] OAuth scopes requested: `openid`, `profile`, `email`, `w_member_social`, `rw_organization_admin` (for company pages)
- [ ] Note: `r_liteprofile` is deprecated, use `profile` instead (OpenID Connect)
- [ ] User can connect personal LinkedIn profile
- [ ] User can connect LinkedIn Company Pages where they have admin access
- [ ] Access tokens stored encrypted with long-lived tokens (60 days) and refresh capability
- [ ] Token refresh implemented using LinkedIn refresh token endpoint
- [ ] Connected accounts displayed with profile/company name, profile picture, follower count
- [ ] Account type clearly indicated (Personal Profile vs Company Page)
- [ ] Multiple LinkedIn accounts supported (personal + multiple company pages)
- [ ] Account disconnection removes connection and revokes tokens
- [ ] Token validation and automatic refresh implemented
- [ ] Error handling for permission issues and account access problems

## Dependencies

- OAuth service infrastructure
- Social account service (already exists from other platforms)
- Encryption service (already exists from YouTube)
- Tier service (already exists from YouTube)
- Token refresh service (already exists from other platforms)
- LinkedIn API

## Technical Notes

- LinkedIn OAuth uses standard OAuth 2.0 flow
- Requires LinkedIn Developer account and app creation
- Long-lived tokens (60 days) vs short-lived (1 hour) - need token exchange
- Support for both personal profiles and company pages
- Company page connection requires admin access verification
- Token refresh uses LinkedIn refresh token endpoint
- Account info retrieved from LinkedIn Profile API and Organization API
- Error handling needed for: permission issues, account access problems
- Account type stored in metadata to distinguish personal vs company
