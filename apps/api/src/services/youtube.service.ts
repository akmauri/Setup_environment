/**
 * YouTube Service
 *
 * Handles YouTube-specific OAuth and API operations
 */

import { youtubeOAuthConfig } from '../config/oauth.config.js';
import { exchangeCodeForToken, refreshAccessToken, OAuthTokenResponse } from './oauth.service.js';

export interface YouTubeChannelInfo {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  subscriberCount?: number;
  videoCount?: number;
  viewCount?: number;
}

/**
 * Get YouTube channel information using access token
 */
export async function getYouTubeChannelInfo(accessToken: string): Promise<YouTubeChannelInfo> {
  // YouTube Data API v3 - Get channel info
  const response = await fetch(
    'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(
      `Failed to fetch YouTube channel info: ${error.error?.message || response.statusText}`
    );
  }

  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    throw new Error('No YouTube channel found for this account');
  }

  const channel = data.items[0];
  const snippet = channel.snippet || {};
  const statistics = channel.statistics || {};

  return {
    id: channel.id,
    title: snippet.title || 'Untitled Channel',
    description: snippet.description,
    thumbnail: snippet.thumbnails?.default?.url || snippet.thumbnails?.medium?.url,
    subscriberCount: statistics.subscriberCount
      ? parseInt(statistics.subscriberCount, 10)
      : undefined,
    videoCount: statistics.videoCount ? parseInt(statistics.videoCount, 10) : undefined,
    viewCount: statistics.viewCount ? parseInt(statistics.viewCount, 10) : undefined,
  };
}

/**
 * Exchange authorization code for YouTube tokens
 */
export async function exchangeYouTubeCode(code: string): Promise<OAuthTokenResponse> {
  return exchangeCodeForToken(code, youtubeOAuthConfig);
}

/**
 * Refresh YouTube access token
 */
export async function refreshYouTubeToken(refreshToken: string): Promise<OAuthTokenResponse> {
  return refreshAccessToken(refreshToken, youtubeOAuthConfig);
}

/**
 * Revoke YouTube token
 */
export async function revokeYouTubeToken(token: string): Promise<void> {
  const response = await fetch('https://oauth2.googleapis.com/revoke', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      token,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to revoke YouTube token: ${response.statusText}`);
  }
}

/**
 * Validate YouTube token by making a test API call
 */
export async function validateYouTubeToken(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=id&mine=true',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.ok;
  } catch {
    return false;
  }
}
