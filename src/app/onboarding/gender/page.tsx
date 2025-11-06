'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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

  const handleSelect = (value: string) => {
    router.push(`/onboarding/username?gender=${value}`);
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

        <div className="mt-14 grid w-full max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2">
          {choices.map((choice) => (
            <motion.button
              key={choice.id}
              onClick={() => handleSelect(choice.id)}
              whileHover={{ scale: 1.05, rotate: [-1.5, 1.5, 0] }}
              whileTap={{ scale: 0.97 }}
              className={`group relative flex h-36 flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white/5 text-lg font-semibold uppercase tracking-widest text-white/90 shadow-[0_0_60px_rgba(0,0,0,0.35)] transition`}
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
                {choice.label.toUpperCase()}
              </span>
            </motion.button>
          ))}
        </div>

        <p className="mt-10 rounded-3xl border border-white/10 bg-white/10 px-6 py-4 text-xs uppercase tracking-[0.35em] text-white/60">
          (So be honest or prepare for cosmic karma.)
        </p>
      </div>
    </div>
  );
}
