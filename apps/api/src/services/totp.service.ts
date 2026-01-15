/**
 * TOTP Service
 *
 * Handles Time-based One-Time Password (2FA) generation and verification
 */

import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export interface TOTPSecret {
  secret: string;
  qrCodeUrl: string;
  manualEntryKey: string;
}

/**
 * Generate TOTP secret for a user
 */
export function generateTOTPSecret(userEmail: string, issuer = 'MPCAS2'): TOTPSecret {
  const secret = speakeasy.generateSecret({
    name: `${issuer} (${userEmail})`,
    issuer,
    length: 32,
  });

  return {
    secret: secret.base32 || '',
    qrCodeUrl: secret.otpauth_url || '',
    manualEntryKey: secret.base32 || '',
  };
}

/**
 * Generate QR code data URL for TOTP secret
 */
export async function generateQRCode(otpauthUrl: string): Promise<string> {
  try {
    return await QRCode.toDataURL(otpauthUrl);
  } catch (error) {
    console.error('QR code generation failed:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Verify TOTP token
 */
export function verifyTOTP(token: string, secret: string, window = 2): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window, // Allow tokens within ±2 time steps (60 seconds each)
  });
}

/**
 * Generate TOTP token (for testing)
 */
export function generateTOTPToken(secret: string): string {
  return speakeasy.totp({
    secret,
    encoding: 'base32',
  });
}
