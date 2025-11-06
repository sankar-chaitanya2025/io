'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Loader } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const choices = [
  {
    id: 'dude',
    label: "I'm a dude",
    icon: '👨',
    color: 'from-[rgba(0,240,255,0.55)] to-[rgba(57,255,20,0.35)]',
  },
  {
    id: 'girl',
    label: "I'm a girl",
    icon: '👩',
    color: 'from-[rgba(255,0,110,0.6)] to-[rgba(0,240,255,0.35)]',
  },
];

export default function GenderSelectionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/onboarding/email');
          return;
        }
        setUserId(session.user.id);
      } catch (err) {
        console.error('Auth check error:', err);
        router.push('/onboarding/email');
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleSelect = async (value: string) => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user.email) {
        throw new Error('No email found');
      }

      const { error: upsertError } = await supabase
        .from('users')
        .upsert(
          {
            id: userId,
            email: session.user.email,
            gender: value as 'dude' | 'girl',
            alias: '',
            is_online: true,
          },
          { onConflict: 'id' }
        );

      if (upsertError) {
        throw upsertError;
      }

      router.push(`/onboarding/username?gender=${value}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save gender';
      setError(errorMessage);
      console.error('Gender selection error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col px-6 pb-20 pt-12 sm:px-12">
      <Link
        href="/onboarding/email"
        className="mb-10 inline-flex w-max items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/20"
      >
        <ArrowLeft size={16} /> Back
      </Link>

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/45 px-10 py-16 text-center shadow-[0_0_160px_rgba(255,0,110,0.12)] backdrop-blur-lg">
        <motion.span
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-5 py-2 text-xs uppercase tracking-[0.4em] text-white/70"
        >
          ⚠️ Critical Mission ⚠️
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl font-display text-3xl font-semibold text-white sm:text-4xl"
        >
          Whoever fakes their gender is gay LMAOOO
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-5 max-w-2xl text-base text-white/70"
        >
          Choose wisely. The universe is watching. This stays secret until you BOTH wanna reveal. Be honest or prepare for cosmic karma.
        </motion.p>

        {authLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-14 flex flex-col items-center gap-4"
          >
            <Loader className="h-8 w-8 animate-spin text-[var(--accent-electric)]" />
            <p className="text-white/70">Loading...</p>
          </motion.div>
        ) : (
          <>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 rounded-2xl bg-red-500/20 border border-red-500/50 px-4 py-3 text-sm text-red-200"
              >
                {error}
              </motion.div>
            )}
            <div className="mt-14 grid w-full max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2">
              {choices.map((choice) => (
                <motion.button
                  key={choice.id}
                  onClick={() => handleSelect(choice.id)}
                  disabled={loading}
                  whileHover={!loading ? { scale: 1.05, rotate: [-1.5, 1.5, 0] } : {}}
                  whileTap={!loading ? { scale: 0.97 } : {}}
                  className={`group relative flex h-36 flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white/5 text-lg font-semibold uppercase tracking-widest text-white/90 shadow-[0_0_60px_rgba(0,0,0,0.35)] transition disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  <span
                    className={`absolute inset-0 bg-gradient-to-br ${choice.color} opacity-0 transition duration-300 group-hover:opacity-100`}
                  />
                  <motion.div
                    className="relative flex h-12 w-12 items-center justify-center rounded-full bg-black/30 text-3xl"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {choice.icon}
                  </motion.div>
                  <span className="relative mt-4 text-sm font-bold tracking-[0.4em] text-white/80">
                    {loading ? 'Loading...' : choice.label.toUpperCase()}
                  </span>
                </motion.button>
              ))}
            </div>
          </>
        )}

        <p className="mt-10 rounded-3xl border border-white/10 bg-white/10 px-6 py-4 text-xs uppercase tracking-[0.35em] text-white/60">
          (So be honest or prepare for cosmic karma.)
        </p>
      </div>
    </div>
  );
}
