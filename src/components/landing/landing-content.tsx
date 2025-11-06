'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const taglines = [
  'Your identity is safe. Your dignity? That\'s on you.',
  'No screenshots. No receipts. Just vibes.',
  'What happens in IO, stays in IO... probably.',
];

const floatingShapes = [
  {
    className:
      'absolute -top-12 -left-12 h-48 w-48 rounded-full bg-[radial-gradient(circle,_rgba(0,240,255,0.4),_transparent_70%)] blur-xl',
    animate: { y: [0, -20, 0], rotate: [0, 10, -10, 0] },
  },
  {
    className:
      'absolute bottom-8 -right-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,_rgba(255,0,110,0.4),_transparent_70%)] blur-2xl',
    animate: { y: [0, 30, -10, 0], rotate: [0, -12, 12, 0] },
  },
  {
    className:
      'absolute top-36 right-1/4 h-40 w-40 rounded-full bg-[radial-gradient(circle,_rgba(57,255,20,0.45),_transparent_60%)] blur-2xl',
    animate: { y: [0, -15, 15, 0], rotate: [0, 15, -15, 0] },
  },
];

export function LandingContent() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden px-6 pb-16 pt-24 sm:px-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,240,255,0.08),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(255,0,110,0.08),_transparent_55%)]" />
      {floatingShapes.map((shape, index) => (
        <motion.div
          key={index}
          className={shape.className}
          animate={shape.animate}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center text-center">
        <motion.span
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-2 text-sm font-medium uppercase tracking-[0.4em] text-white/70 backdrop-blur"
        >
          <span className="text-2xl">🎭</span>
          IO
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl md:text-6xl"
        >
          Where college strangers become... well, still strangers. But fun ones.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 max-w-2xl text-balance text-lg text-white/70 sm:text-xl"
        >
          Dive into the most chaotic anonymous chat on campus. Zero resumes, zero filters, pure feral energy.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10"
        >
          <Link
            href="/onboarding/email"
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-white/10 bg-white/10 px-10 py-4 text-lg font-semibold uppercase tracking-wide text-white transition"
          >
            <span className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(0,240,255,0.45),_rgba(255,0,110,0.45),_rgba(57,255,20,0.45))] opacity-0 blur-lg transition duration-300 group-hover:opacity-100" />
            <span className="relative flex items-center gap-3">
              Enter The Chaos
              <motion.span
                animate={{ x: [0, 6, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                className="text-xl"
                aria-hidden
              >
                ➜
              </motion.span>
            </span>
          </Link>
        </motion.div>

        <div className="mt-14 flex flex-col items-center gap-3 text-sm uppercase tracking-[0.3em] text-white/40">
          {taglines.map((line, index) => (
            <motion.p
              key={line}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.08 }}
              className="rounded-full border border-white/5 bg-black/20 px-6 py-2 text-xs sm:text-sm"
            >
              {line}
            </motion.p>
          ))}
        </div>
      </div>
    </div>
  );
}
