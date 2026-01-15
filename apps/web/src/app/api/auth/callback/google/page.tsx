'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { storeTokens } from '@/utils/tokenStorage';

/**
 * OAuth Callback Page
 *
 * Handles OAuth callback from Google
 * Extracts authorization code and exchanges for tokens
 */
export default function GoogleCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const state = searchParams.get('state');

        if (error) {
          setError(`OAuth error: ${error}`);
          setStatus('error');
          return;
        }

        if (!code) {
          setError('Missing authorization code');
          setStatus('error');
          return;
        }

        // Exchange code for tokens via backend
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(
          `${apiUrl}/api/v1/auth/callback/google?code=${encodeURIComponent(code)}&state=${state || ''}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Failed to complete authentication');
        }

        const data = await response.json();

        if (data.tokens) {
          // Store tokens
          storeTokens(data.tokens);
          setStatus('success');

          // Redirect to home page after short delay
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else {
          throw new Error('No tokens received');
        }
      } catch (err) {
        console.error('Callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setStatus('error');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  if (status === 'loading') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg">Completing authentication...</p>
        </div>
      </main>
    );
  }

  if (status === 'error') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-6xl mb-4">✕</div>
          <h1 className="text-2xl font-bold mb-2">Authentication Failed</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center max-w-md">
        <div className="text-green-600 text-6xl mb-4">✓</div>
        <h1 className="text-2xl font-bold mb-2">Authentication Successful!</h1>
        <p className="text-gray-600">Redirecting you to the app...</p>
      </div>
    </main>
  );
}
