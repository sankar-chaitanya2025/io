'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Rocket } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const domainHint = '@rguktn.ac.in';

export default function EmailVerificationPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail.endsWith('@rguktn.ac.in')) {
      setError('Please use your college email (@rguktn.ac.in)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/gender`,
        },
      });

      if (signInError) {
        throw signInError;
      }

      setSubmitted(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send magic link';
      setError(errorMessage);
      console.error('Email verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col px-6 pb-20 pt-10 sm:px-12">
      <Link
        href="/"
        className="mb-8 inline-flex w-max items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/20"
      >
        <ArrowLeft size={16} /> Back to chaos
      </Link>

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center overflow-hidden rounded-3xl border border-white/10 bg-black/40 px-8 py-12 shadow-[0_0_120px_rgba(0,240,255,0.12)] backdrop-blur">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-6 text-center"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-2xl">
            📧
          </div>
          <div className="space-y-4">
            <h1 className="font-display text-3xl font-semibold text-white sm:text-4xl">
              Verify You&apos;re Real
            </h1>
            <p className="text-base text-white/65">
              Drop your {domainHint} email. No spam, no nonsense &mdash; just the magic link to unlock the mayhem.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError(null);
                }}
                placeholder={`you${domainHint}`}
                required
                disabled={loading || submitted}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-base text-white outline-none transition focus:border-[var(--accent-electric)] focus:bg-white/10 disabled:opacity-60"
              />
            </div>
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
              type="submit"
              disabled={loading || submitted}
              whileTap={{ scale: 0.97 }}
              className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(120deg,_rgba(0,240,255,0.4),_rgba(255,0,110,0.4))] px-8 py-4 text-base font-semibold uppercase tracking-widest text-white transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="absolute inset-0 opacity-0 blur-xl transition group-hover:opacity-100" style={{
                background:
                  'linear-gradient(140deg, rgba(0,240,255,0.4), rgba(255,0,110,0.4), rgba(57,255,20,0.4))',
              }} />
              <span className="relative flex items-center gap-3">
                {loading ? 'Sending...' : 'Send Magic Link'}
                <Rocket className="h-4 w-4" />
              </span>
            </motion.button>
          </form>

          <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: submitted ? 1 : 0 }}
          className="mt-8 rounded-2xl border border-white/10 bg-white/5 px-6 py-5 text-sm uppercase tracking-[0.35em] text-white/80"
          >
          {submitted ? (
            <span className="flex flex-col gap-2 text-base normal-case tracking-normal text-white/70">
              <span className="text-lg font-semibold text-white">✨ Check your email, genius</span>
              We sent you a link. Click it or cry about it. (Check spam if you&apos;re that person.)
            </span>
          ) : (
            <span className="text-white/40">We&apos;ll send a link. Click it. Don&apos;t overthink it.</span>
          )}
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
