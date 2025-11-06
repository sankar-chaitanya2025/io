'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Rocket } from 'lucide-react';

const domainHint = '@rguktn.ac.in';

export default function EmailVerificationPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
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
              Verify You're Real
            </h1>
            <p className="text-base text-white/65">
              Drop your {domainHint} email. No spam, no nonsense — just the magic link to unlock the mayhem.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={`you${domainHint}`}
                required
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-base text-white outline-none transition focus:border-[var(--accent-electric)] focus:bg-white/10"
              />
            </div>
            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(120deg,_rgba(0,240,255,0.4),_rgba(255,0,110,0.4))] px-8 py-4 text-base font-semibold uppercase tracking-widest text-white transition"
            >
              <span className="absolute inset-0 opacity-0 blur-xl transition group-hover:opacity-100" style={{
                background:
                  'linear-gradient(140deg, rgba(0,240,255,0.4), rgba(255,0,110,0.4), rgba(57,255,20,0.4))',
              }} />
              <span className="relative flex items-center gap-3">
                Send Magic Link
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
                We sent you a link. Click it or cry about it. (Check spam if you're that person.)
              </span>
            ) : (
              <span className="text-white/40">We'll send a link. Click it. Don't overthink it.</span>
            )}
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
