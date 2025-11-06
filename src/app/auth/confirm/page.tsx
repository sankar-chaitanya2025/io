'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader } from 'lucide-react';

export default function AuthConfirmPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if we have hash params (old magic link format)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          // Set the session using the tokens from the hash
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            throw sessionError;
          }

          // Successfully authenticated, redirect to gender selection
          router.push('/onboarding/gender');
          return;
        }

        // If no hash params, check for error
        const errorDescription = hashParams.get('error_description');
        if (errorDescription) {
          setError(errorDescription);
          return;
        }

        // No tokens found, redirect to email page
        router.push('/onboarding/email');
      } catch (err) {
        console.error('Auth confirmation error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setTimeout(() => {
          router.push('/onboarding/email');
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6">
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center gap-6 rounded-3xl border border-white/10 bg-black/40 px-8 py-12 text-center shadow-[0_0_120px_rgba(0,240,255,0.12)] backdrop-blur">
        {error ? (
          <>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 text-3xl">
              ❌
            </div>
            <div className="space-y-2">
              <h1 className="font-display text-2xl font-semibold text-white">
                Authentication Failed
              </h1>
              <p className="text-sm text-white/70">{error}</p>
              <p className="text-xs text-white/50">Redirecting to login...</p>
            </div>
          </>
        ) : (
          <>
            <Loader className="h-12 w-12 animate-spin text-[var(--accent-electric)]" />
            <div className="space-y-2">
              <h1 className="font-display text-2xl font-semibold text-white">
                Confirming your identity...
              </h1>
              <p className="text-sm text-white/70">
                Hold tight, we&apos;re setting things up.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
