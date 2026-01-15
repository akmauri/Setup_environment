/**
 * Email Service
 *
 * Handles email sending for verification, password reset, etc.
 * Uses nodemailer for email delivery
 */

import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Create email transporter
 */
function createTransporter() {
  // In production, use SMTP or email service (SendGrid, SES, etc.)
  // For development, use Ethereal or console logging
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  // Development: Use console logging or Ethereal
  return nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true,
  });
}

/**
 * Send email
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  const transporter = createTransporter();

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@mpcas2.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    });

    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('Email sent:', info.messageId);
      // eslint-disable-next-line no-console
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email');
  }
}

/**
 * Send email verification email
 */
export async function sendVerificationEmail(
  email: string,
  verificationToken: string,
  tenantId?: string,
  type: 'signup' | 'email_change' = 'signup'
): Promise<void> {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  let verificationUrl: string;
  let subject: string;
  let html: string;

  if (type === 'email_change') {
    verificationUrl = `${baseUrl}/verify-email-change?token=${verificationToken}${tenantId ? `&tenantId=${tenantId}` : ''}`;
    subject = 'Verify your new email address';
    html = `
      <h1>Verify your new email address</h1>
      <p>Click the link below to verify your new email address:</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't request this change, please ignore this email.</p>
    `;
  } else {
    verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}${tenantId ? `&tenantId=${tenantId}` : ''}`;
    subject = 'Verify your email address';
    html = `
      <h1>Verify your email address</h1>
      <p>Click the link below to verify your email address:</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>This link will expire in 24 hours.</p>
    `;
  }

  await sendEmail({
    to: email,
    subject,
    html,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

  await sendEmail({
    to: email,
    subject: 'Reset your password',
    html: `
      <h1>Reset your password</h1>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  });
}
