'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Loader } from 'lucide-react';
import { generateAlias } from '@/lib/names';
import { supabase } from '@/lib/supabase';

const emojiPool = ['🌮', '🥷', '🦄', '🥑', '🛸', '🐲', '🌀', '🧪', '💥', '🧨'];

export function UsernameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gender = useMemo(() => searchParams.get('gender') ?? 'mystery', [searchParams]);

  const [alias, setAlias] = useState<string>('');
  const [emoji, setEmoji] = useState<string>(emojiPool[0]);
  const [spinning, setSpinning] = useState(true);
  const [saving, setSaving] = useState(false);
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
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    setSpinning(true);
    const timer = setTimeout(() => {
      setAlias(generateAlias());
      setEmoji(emojiPool[Math.floor(Math.random() * emojiPool.length)]);
      setSpinning(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, [gender]);

  const handleContinue = async () => {
    if (!userId || spinning) return;

    const username = alias || generateAlias();
    setSaving(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({ alias: username })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      router.push(`/dashboard?alias=${encodeURIComponent(username)}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save alias';
      setError(errorMessage);
      console.error('Alias save error:', err);
      setSaving(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col px-6 pb-20 pt-12 sm:px-12">
      <Link
        href="/onboarding/gender"
        className="mb-10 inline-flex w-max items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/20"
      >
        <ArrowLeft size={16} /> Back
      </Link>

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/40 px-10 py-16 text-center shadow-[0_0_140px_rgba(0,240,255,0.12)] backdrop-blur">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-center gap-6"
        >
          <motion.span
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 120 }}
            className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white/60"
          >
            Gender locked in.
          </motion.span>

          <h1 className="font-display text-3xl font-semibold text-white sm:text-4xl">
            Now generating your mysterious alter ego...
          </h1>

          <AnimatePresence mode="wait">
            {spinning ? (
              <motion.div
                key="spinner"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1, rotate: 360 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                className="mt-6 flex h-32 w-32 items-center justify-center rounded-full border-2 border-dashed border-white/20"
              >
                <Loader className="h-10 w-10 animate-spin text-[var(--accent-electric)]" />
              </motion.div>
            ) : (
              <motion.div
                key="alias"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4 }}
                className="mt-6 flex h-40 w-40 flex-col items-center justify-center rounded-full border border-white/10 bg-[radial-gradient(circle,_rgba(0,240,255,0.2),_rgba(255,0,110,0.12))] text-center"
              >
                <span className="text-xl text-white/70">You are now:</span>
                <span className="mt-2 font-display text-2xl text-white">{alias || '???'}</span>
                <span className="mt-3 text-2xl">{emoji}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-red-500/20 border border-red-500/50 px-4 py-3 text-sm text-red-200"
            >
              {error}
            </motion.div>
          )}
          <motion.button
            onClick={handleContinue}
            disabled={spinning || saving}
            whileTap={!spinning && !saving ? { scale: 0.97 } : {}}
            className="group relative mt-10 inline-flex items-center justify-center gap-3 overflow-hidden rounded-full border border-white/10 bg-white/10 px-9 py-4 text-sm font-bold uppercase tracking-[0.4em] text-white transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(0,240,255,0.4),_rgba(255,0,110,0.4),_rgba(57,255,20,0.4))] opacity-0 blur-xl transition group-hover:opacity-100" />
            <span className="relative">
              {saving ? 'Saving...' : "Let's Gooo"}
            </span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
