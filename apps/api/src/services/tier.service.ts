/**
 * Tier Service
 *
 * Handles tenant tier management and limit enforcement
 */

import { prisma } from '@mpcas2/db';

export type TenantTier =
  | 'free'
  | 'creator'
  | 'professional'
  | 'agency'
  | 'white_label'
  | 'enterprise';

export interface TierLimits {
  youtubeAccounts: number;
  instagramAccounts: number;
  twitterAccounts: number;
  linkedinAccounts: number;
  facebookAccounts: number;
  tiktokAccounts: number;
  pinterestAccounts: number;
  threadsAccounts: number;
}

/**
 * Get tier limits for a tenant tier
 */
export function getTierLimits(tier: TenantTier): TierLimits {
  const limits: Record<TenantTier, TierLimits> = {
    free: {
      youtubeAccounts: 0,
      instagramAccounts: 0,
      twitterAccounts: 0,
      linkedinAccounts: 0,
      facebookAccounts: 0,
      tiktokAccounts: 0,
      pinterestAccounts: 0,
      threadsAccounts: 0,
    },
    creator: {
      youtubeAccounts: 3,
      instagramAccounts: 3,
      twitterAccounts: 3,
      linkedinAccounts: 3,
      facebookAccounts: 3,
      tiktokAccounts: 3,
      pinterestAccounts: 3,
      threadsAccounts: 3,
    },
    professional: {
      youtubeAccounts: 10,
      instagramAccounts: 10,
      twitterAccounts: 10,
      linkedinAccounts: 10,
      facebookAccounts: 10,
      tiktokAccounts: 10,
      pinterestAccounts: 10,
      threadsAccounts: 10,
    },
    agency: {
      youtubeAccounts: 50,
      instagramAccounts: 50,
      twitterAccounts: 50,
      linkedinAccounts: 50,
      facebookAccounts: 50,
      tiktokAccounts: 50,
      pinterestAccounts: 50,
      threadsAccounts: 50,
    },
    white_label: {
      youtubeAccounts: 100,
      instagramAccounts: 100,
      twitterAccounts: 100,
      linkedinAccounts: 100,
      facebookAccounts: 100,
      tiktokAccounts: 100,
      pinterestAccounts: 100,
      threadsAccounts: 100,
    },
    enterprise: {
      youtubeAccounts: 1000,
      instagramAccounts: 1000,
      twitterAccounts: 1000,
      linkedinAccounts: 1000,
      facebookAccounts: 1000,
      tiktokAccounts: 1000,
      pinterestAccounts: 1000,
      threadsAccounts: 1000,
    },
  };

  return limits[tier] || limits.free;
}

/**
 * Get tenant tier
 */
export async function getTenantTier(tenantId: string): Promise<TenantTier> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { tier: true },
  });

  return (tenant?.tier as TenantTier) || 'free';
}

/**
 * Check if account count exceeds tier limit
 */
export async function checkTierLimit(
  tenantId: string,
  platform: string,
  currentCount: number
): Promise<{ allowed: boolean; limit: number; current: number }> {
  const tier = await getTenantTier(tenantId);
  const limits = getTierLimits(tier);

  const platformKey = `${platform}Accounts` as keyof TierLimits;
  const limit = limits[platformKey] || 0;

  return {
    allowed: currentCount < limit,
    limit,
    current: currentCount,
  };
}
