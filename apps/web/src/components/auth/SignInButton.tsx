'use client';

import { useState } from 'react';

interface SignInButtonProps {
  provider?: 'google';
  className?: string;
}

/**
 * Sign In Button Component
 *
 * Initiates OAuth flow with Google (or other providers)
 */
export default function SignInButton({ provider = 'google', className = '' }: SignInButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/v1/auth/${provider}`);
      const data = await response.json();

      if (data.authUrl) {
        // Redirect to OAuth provider
        window.location.href = data.authUrl;
      } else {
        throw new Error('Failed to get OAuth URL');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      alert('Failed to initiate sign in. Please try again.');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignIn}
      disabled={loading}
      className={`
        px-6 py-3 rounded-lg font-medium
        bg-blue-600 text-white
        hover:bg-blue-700
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors
        ${className}
      `}
    >
      {loading ? 'Signing in...' : `Sign in with ${provider === 'google' ? 'Google' : provider}`}
    </button>
  );
}
