/**
 * Authentication Service
 *
 * Handles user registration, login, password reset, email verification, and 2FA
 */

import { db } from '@mpcas2/db';
import { Prisma } from '@prisma/client';
import { getTenantSchemaName, createTenant } from './tenant.service.js';
import { hashPassword, verifyPassword, validatePasswordStrength } from './password.service.js';
import { generateVerificationToken, generateResetToken, hashToken } from './token.service.js';
import { sendVerificationEmail, sendPasswordResetEmail } from './email.service.js';
import { generateTOTPSecret, verifyTOTP } from './totp.service.js';
import { createSession } from './session.service.js';
import { generateTokenPair } from './jwt.service.js';

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
  createTenant?: boolean;
  tenantName?: string;
}

export interface LoginInput {
  email: string;
  password: string;
  totpCode?: string;
  deviceInfo?: {
    userAgent?: string;
    ipAddress?: string;
    deviceType?: string;
    browser?: string;
    os?: string;
  };
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    email_verified: boolean;
    two_factor_enabled: boolean;
  };
  tenantId: string;
  tokens?: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  requires2FA?: boolean;
}

/**
 * Register a new user with email/password
 */
export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  const { email, password, name, createTenant: shouldCreateTenant, tenantName } = input;

  // Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.valid) {
    throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create tenant if requested
  let tenantId: string;
  if (shouldCreateTenant && tenantName) {
    const tenant = await createTenant({ name: tenantName });
    tenantId = tenant.id;
  } else {
    // For MVP, create default tenant per user
    // In production, user would select/join existing tenant
    const emailDomain = email.split('@')[1];
    const defaultTenantName = `Default Tenant for ${emailDomain}`;
    const tenant = await createTenant({ name: defaultTenantName });
    tenantId = tenant.id;
  }

  const schemaName = getTenantSchemaName(tenantId);
  await db.execute(`SET search_path TO ${schemaName}, public`);

  // Check if user already exists
  const existingUsers = await db.query<{ id: string; email: string }>(
    Prisma.sql`
      SELECT id, email FROM users WHERE email = ${email}
    `
  );

  if (existingUsers.length > 0) {
    throw new Error('User with this email already exists');
  }

  // Generate email verification token
  const verificationToken = generateVerificationToken();
  const verificationExpires = new Date();
  verificationExpires.setHours(verificationExpires.getHours() + 24); // 24 hours

  // Create user
  const users = await db.query<{
    id: string;
    email: string;
    name: string | null;
    role: string;
    email_verified: boolean;
    two_factor_enabled: boolean;
  }>(
    Prisma.sql`
      INSERT INTO users (
        email, name, password_hash, provider, role,
        email_verification_token, email_verification_expires_at
      )
      VALUES (
        ${email},
        ${name || null},
        ${passwordHash},
        'email',
        'user',
        ${verificationToken},
        ${verificationExpires.toISOString()}::timestamp
      )
      RETURNING id, email, name, role, email_verified, two_factor_enabled
    `
  );

  const user = users[0];

  // Send verification email
  await sendVerificationEmail(email, verificationToken);

  // Generate tokens
  const tokens = generateTokenPair({
    userId: user.id,
    tenantId,
    email: user.email,
    role: user.role,
  });

  // Create session
  const refreshTokenHash = hashToken(tokens.refreshToken);
  await createSession(tenantId, user.id, refreshTokenHash, {
    userAgent: 'Registration',
    ipAddress: 'unknown',
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      email_verified: user.email_verified,
      two_factor_enabled: user.two_factor_enabled,
    },
    tenantId,
    tokens: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    },
  };
}

/**
 * Login with email/password
 */
export async function loginUser(input: LoginInput): Promise<AuthResult> {
  const { email, password, totpCode, deviceInfo } = input;

  // Find user by email (check all tenants - simplified for MVP)
  // In production, tenant would be determined from subdomain or user selection
  const { prisma } = await import('@mpcas2/db');
  const tenants = await prisma.tenant.findMany({ where: { status: 'active' } });

  let user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    email_verified: boolean;
    two_factor_enabled: boolean;
    two_factor_secret: string | null;
    password_hash: string | null;
    tenant_id?: string;
  } | null = null;

  let tenantId: string | null = null;

  // Search for user across tenants
  for (const tenant of tenants) {
    const schemaName = getTenantSchemaName(tenant.id);
    await db.execute(`SET search_path TO ${schemaName}, public`);

    const users = await db.query<{
      id: string;
      email: string;
      name: string | null;
      role: string;
      email_verified: boolean;
      two_factor_enabled: boolean;
      two_factor_secret: string | null;
      password_hash: string | null;
    }>(
      Prisma.sql`
        SELECT id, email, name, role, email_verified, two_factor_enabled, two_factor_secret, password_hash
        FROM users
        WHERE email = ${email} AND provider = 'email'
      `
    );

    if (users.length > 0) {
      user = { ...users[0], tenant_id: tenant.id };
      tenantId = tenant.id;
      break;
    }
  }

  if (!user || !tenantId) {
    throw new Error('Invalid email or password');
  }

  if (!user.password_hash) {
    throw new Error('Password not set for this account');
  }

  // Verify password
  const passwordValid = await verifyPassword(password, user.password_hash);
  if (!passwordValid) {
    throw new Error('Invalid email or password');
  }

  // Check 2FA if enabled
  if (user.two_factor_enabled) {
    if (!user.two_factor_secret) {
      throw new Error('2FA is enabled but secret is missing');
    }

    if (!totpCode) {
      // Return requires 2FA flag
      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          email_verified: user.email_verified,
          two_factor_enabled: user.two_factor_enabled,
        },
        tenantId,
        requires2FA: true,
      };
    }

    // Verify TOTP code
    const totpValid = verifyTOTP(totpCode, user.two_factor_secret);
    if (!totpValid) {
      throw new Error('Invalid 2FA code');
    }
  }

  // Update last login
  const schemaName = getTenantSchemaName(tenantId);
  await db.execute(`SET search_path TO ${schemaName}, public`);

  await db.execute(
    Prisma.sql`
      UPDATE users
      SET last_login_at = CURRENT_TIMESTAMP
      WHERE id = ${user.id}::uuid
    `
  );

  // Generate tokens
  const tokens = generateTokenPair({
    userId: user.id,
    tenantId,
    email: user.email,
    role: user.role,
  });

  // Create session
  const refreshTokenHash = hashToken(tokens.refreshToken);
  await createSession(tenantId, user.id, refreshTokenHash, deviceInfo || {});

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      email_verified: user.email_verified,
      two_factor_enabled: user.two_factor_enabled,
    },
    tenantId,
    tokens: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    },
  };
}

/**
 * Verify email with verification token
 */
export async function verifyEmail(tenantId: string, verificationToken: string): Promise<boolean> {
  const schemaName = getTenantSchemaName(tenantId);
  await db.execute(`SET search_path TO ${schemaName}, public`);

  const users = await db.query<{ id: string }>(
    Prisma.sql`
      UPDATE users
      SET email_verified = true,
          email_verification_token = NULL,
          email_verification_expires_at = NULL
      WHERE email_verification_token = ${verificationToken}
        AND email_verification_expires_at > CURRENT_TIMESTAMP
      RETURNING id
    `
  );

  return users.length > 0;
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<void> {
  // Find user across tenants (simplified for MVP)
  const { prisma } = await import('@mpcas2/db');
  const tenants = await prisma.tenant.findMany({ where: { status: 'active' } });

  for (const tenant of tenants) {
    const schemaName = getTenantSchemaName(tenant.id);
    await db.execute(`SET search_path TO ${schemaName}, public`);

    const users = await db.query<{ id: string; email: string }>(
      Prisma.sql`
        SELECT id, email FROM users
        WHERE email = ${email} AND provider = 'email'
      `
    );

    if (users.length > 0) {
      const resetToken = generateResetToken();
      const resetExpires = new Date();
      resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour

      await db.execute(
        Prisma.sql`
          UPDATE users
          SET password_reset_token = ${resetToken},
              password_reset_expires_at = ${resetExpires.toISOString()}::timestamp
          WHERE id = ${users[0].id}::uuid
        `
      );

      await sendPasswordResetEmail(email, resetToken);
      return;
    }
  }

  // Don't reveal if user exists (security best practice)
}

/**
 * Reset password with reset token
 */
export async function resetPassword(
  tenantId: string,
  resetToken: string,
  newPassword: string
): Promise<boolean> {
  // Validate password strength
  const passwordValidation = validatePasswordStrength(newPassword);
  if (!passwordValidation.valid) {
    throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
  }

  const schemaName = getTenantSchemaName(tenantId);
  await db.execute(`SET search_path TO ${schemaName}, public`);

  // Hash new password
  const passwordHash = await hashPassword(newPassword);

  const users = await db.query<{ id: string }>(
    Prisma.sql`
      UPDATE users
      SET password_hash = ${passwordHash},
          password_reset_token = NULL,
          password_reset_expires_at = NULL
      WHERE password_reset_token = ${resetToken}
        AND password_reset_expires_at > CURRENT_TIMESTAMP
      RETURNING id
    `
  );

  if (users.length > 0) {
    // Invalidate all sessions for this user (force re-login)
    await db.execute(
      Prisma.sql`
        DELETE FROM sessions
        WHERE user_id = ${users[0].id}::uuid
      `
    );
    return true;
  }

  return false;
}

/**
 * Enable 2FA for user
 */
export async function enable2FA(
  tenantId: string,
  userId: string
): Promise<{
  secret: string;
  qrCodeUrl: string;
  manualEntryKey: string;
}> {
  const schemaName = getTenantSchemaName(tenantId);
  await db.execute(`SET search_path TO ${schemaName}, public`);

  // Get user email
  const users = await db.query<{ email: string }>(
    Prisma.sql`
      SELECT email FROM users WHERE id = ${userId}::uuid
    `
  );

  if (users.length === 0) {
    throw new Error('User not found');
  }

  // Generate TOTP secret
  const totpSecret = generateTOTPSecret(users[0].email);

  // Store secret (not enabled yet - user needs to verify)
  await db.execute(
    Prisma.sql`
      UPDATE users
      SET two_factor_secret = ${totpSecret.secret}
      WHERE id = ${userId}::uuid
    `
  );

  return totpSecret;
}

/**
 * Verify and enable 2FA
 */
export async function verifyAndEnable2FA(
  tenantId: string,
  userId: string,
  totpCode: string
): Promise<boolean> {
  const schemaName = getTenantSchemaName(tenantId);
  await db.execute(`SET search_path TO ${schemaName}, public`);

  const users = await db.query<{ two_factor_secret: string | null }>(
    Prisma.sql`
      SELECT two_factor_secret FROM users WHERE id = ${userId}::uuid
    `
  );

  if (users.length === 0 || !users[0].two_factor_secret) {
    throw new Error('2FA secret not found');
  }

  // Verify TOTP code
  const valid = verifyTOTP(totpCode, users[0].two_factor_secret);
  if (!valid) {
    return false;
  }

  // Enable 2FA
  await db.execute(
    Prisma.sql`
      UPDATE users
      SET two_factor_enabled = true
      WHERE id = ${userId}::uuid
    `
  );

  return true;
}

/**
 * Disable 2FA for user
 */
export async function disable2FA(tenantId: string, userId: string): Promise<void> {
  const schemaName = getTenantSchemaName(tenantId);
  await db.execute(`SET search_path TO ${schemaName}, public`);

  await db.execute(
    Prisma.sql`
      UPDATE users
      SET two_factor_enabled = false,
          two_factor_secret = NULL
      WHERE id = ${userId}::uuid
    `
  );
}
