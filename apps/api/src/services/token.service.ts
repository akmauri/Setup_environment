/**
 * Token Service
 *
 * Handles generation and validation of verification and reset tokens
 */

import crypto from 'crypto';

/**
 * Generate a secure random token
 */
export function generateToken(length = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate email verification token
 */
export function generateVerificationToken(): string {
  return generateToken(32);
}

/**
 * Generate password reset token
 */
export function generateResetToken(): string {
  return generateToken(32);
}

/**
 * Hash a token for storage (optional - for additional security)
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Verify token matches hash
 */
export function verifyToken(token: string, hash: string): boolean {
  const tokenHash = hashToken(token);
  return crypto.timingSafeEqual(Buffer.from(tokenHash), Buffer.from(hash));
}
