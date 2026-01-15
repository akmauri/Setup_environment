# Pinterest OAuth Integration

## Description

Implement OAuth 2.0 connection for Pinterest accounts, enabling users to connect their Pinterest Business or personal accounts and manage boards.

## Requirements

- Pinterest OAuth 2.0 flow
- Support for Business and personal accounts
- Token encryption and secure storage
- Token refresh support
- Board list retrieval and display
- Multiple account support with tier limits
- Account labeling
- Token health monitoring
- Error handling for business account requirements and permission issues

## Acceptance Criteria

- [ ] "Connect Pinterest" button initiates Pinterest OAuth 2.0 flow
- [ ] User must have Pinterest Business account (recommended) or personal account
- [ ] OAuth scopes requested: `pins:read`, `pins:write`, `boards:read`, `boards:write`
- [ ] Access tokens stored encrypted with refresh token support
- [ ] Token refresh implemented using Pinterest OAuth refresh endpoint
- [ ] Connected Pinterest account displayed with username, profile picture, follower count
- [ ] Board list retrieved and displayed for board selection during publishing
- [ ] Multiple Pinterest accounts supported with account labeling
- [ ] Account disconnection removes connection and revokes tokens
- [ ] Token validation and automatic refresh implemented
- [ ] Error handling for business account requirements and permission issues
- [ ] Board management interface displays user's boards with board names and pin counts

## Dependencies

- OAuth service infrastructure
- Social account service (already exists)
- Encryption service (already exists)
- Tier service (already exists)
- Token refresh service (already exists)
- Pinterest API

## Technical Notes

- Pinterest OAuth uses standard OAuth 2.0 flow
- Requires Pinterest Developer account and app creation
- Business accounts recommended for API access
- Tokens have expiry and need refresh
- Board list retrieved from Pinterest API
- Token refresh uses Pinterest OAuth refresh endpoint
- Account info retrieved from Pinterest User API
- Token validation via Pinterest API
