# Facebook OAuth Integration

## Description

Implement OAuth 2.0 connection for Facebook Pages, enabling users to connect their Facebook Pages where they have Admin or Editor role.

## Requirements

- Facebook Login OAuth flow
- Facebook Page selection (user selects which pages to connect)
- Long-lived Page Access Tokens (never expire unless revoked)
- Token exchange (short-lived user token → long-lived page token)
- Multiple Facebook Pages support with account labeling
- Token health monitoring
- Crossposting to Instagram option (if Instagram connected to same Page)
- Error handling for permissions, page access, token expiration

## Acceptance Criteria

- [ ] "Connect Facebook" button initiates Facebook Login OAuth flow
- [ ] OAuth scopes requested: `pages_manage_posts`, `pages_read_engagement`, `pages_show_list`
- [ ] User selects which Facebook Pages to connect (must have Admin or Editor role)
- [ ] Access tokens stored encrypted with long-lived Page Access Tokens (never expire unless revoked)
- [ ] Token exchange implemented to convert short-lived user token to long-lived page token
- [ ] Connected Facebook Pages displayed with page name, profile picture, follower count, page category
- [ ] Multiple Facebook Pages supported with account labeling
- [ ] Account disconnection removes connection and revokes page tokens
- [ ] Token health monitoring validates tokens and handles expired tokens
- [ ] Crossposting to Instagram option displayed if Instagram account connected to same Facebook Page
- [ ] Error handling for permission issues, page access problems, and token expiration
- [ ] Page insights access verified (for analytics features in later epic)

## Dependencies

- OAuth service infrastructure (Facebook OAuth already exists for Instagram)
- Social account service (already exists)
- Encryption service (already exists)
- Tier service (already exists)
- Token refresh service (already exists)
- Facebook Graph API

## Technical Notes

- Facebook OAuth uses Facebook Login (already implemented for Instagram)
- Long-lived Page Access Tokens never expire (unlike user tokens)
- Token exchange: Exchange short-lived user token for long-lived page token
- Page selection: User must have Admin or Editor role on the page
- Page info retrieved from Facebook Graph API
- Crossposting: Check if Instagram account exists for same Facebook Page ID
- Token health: Long-lived tokens don't expire, but can be revoked
