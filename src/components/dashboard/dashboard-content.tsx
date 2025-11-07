'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Flame, Loader2 } from 'lucide-react';
import { generateAlias, generateOnlineCount, getRandomDelay } from '@/lib/names';
import { supabase } from '@/lib/supabase';
import { useChat } from '@/hooks/useChat';
import { RealtimeDebugger } from '../debug/realtime-debugger';
import { DevUserCreator } from '../debug/dev-user-creator';

const autoResponses = [
  `Okay but that's kinda iconic.`,
  'MysticPotato approves this chaos.',
  `I'm saving that line for my future TED talk.`,
  `Bold of you to assume I'm normal.`,
  'Pause. Rewind. Say that again for the void.',
];

type ChatAuthor = 'you' | 'them';

type ChatMessage = {
  id: string;
  author: ChatAuthor;
  text: string;
  timestamp: string;
  sender_id?: string;
};

type RevealState = 'idle' | 'pending' | 'accepted' | 'declined';

type Status = 'idle' | 'searching' | 'matched' | 'rating';

type IdentityCard = {
  alias: string;
  name: string;
  email: string;
  details: string;
};

const youIdentityTemplate: Omit<IdentityCard, 'alias'> = {
  name: 'Rahul Verma',
  email: 'rahul.verma@rguktn.ac.in',
  details: '🎓 CSE, 3rd Year',
};

const matchIdentityTemplate: Omit<IdentityCard, 'alias'> = {
  name: 'Priya Sharma',
  email: 'priya.sharma@rguktn.ac.in',
  details: '🎓 ECE, 2nd Year',
};

const ratingOptions = [
  { label: 'Boring', icon: '😴' },
  { label: 'Okay', icon: '🙂' },
  { label: 'Fire', icon: '🔥' },
  { label: 'Legendary', icon: '✨' },
];

const createTimestamp = () =>
  new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());

export function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const aliasFromParams = searchParams.get('alias');

  const initialAlias = useMemo(() => aliasFromParams ?? generateAlias(), [aliasFromParams]);

  const [alias] = useState(initialAlias);
  const [userId, setUserId] = useState<string | null>(null);
  const [userGender, setUserGender] = useState<'dude' | 'girl' | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [onlineCount, setOnlineCount] = useState(() => generateOnlineCount());
  const [matchAlias, setMatchAlias] = useState(() => generateAlias());
  const [matchId, setMatchId] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [revealState, setRevealState] = useState<RevealState>('idle');
  const [confettiBurst, setConfettiBurst] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [botResponsePending, setBotResponsePending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const youIdentity = useMemo<IdentityCard>(
    () => ({
      alias,
      ...youIdentityTemplate,
    }),
    [alias],
  );

  const matchIdentity = useMemo<IdentityCard>(
    () => ({
      alias: matchAlias,
      ...matchIdentityTemplate,
    }),
    [matchAlias],
  );

  // Auth check and initialization
  useEffect(() => {
    const initUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/onboarding/email');
          return;
        }

        setUserId(session.user.id);

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userError) {
          throw userError;
        }

        setUserGender(userData.gender);
        
        // Set user online
        await supabase
          .from('users')
          .update({ is_online: true, last_active: new Date().toISOString() })
          .eq('id', session.user.id);
      } catch (err) {
        console.error('Init error:', err);
        setError('Failed to initialize');
        router.push('/onboarding/email');
      } finally {
        setLoading(false);
      }
    };

    initUser();

    // Cleanup: set offline on unmount
    return () => {
      if (userId) {
        (async () => {
          try {
            await supabase
              .from('users')
              .update({ is_online: false })
              .eq('id', userId);
          } catch (err) {
            console.error('Error setting offline:', err);
          }
        })();
      }
    };
  }, [router, userId]);

  // Online count updates
  useEffect(() => {
    const updateOnlineCount = async () => {
      try {
        const { count } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('is_online', true);
        
        if (count !== null) {
          setOnlineCount(count);
        }
      } catch (err) {
        console.error('Error updating online count:', err);
        // Fallback to random generation
        setOnlineCount(generateOnlineCount());
      }
    };

    // Initial count
    updateOnlineCount();

    // Set up real-time subscription for user status changes
    const channel = supabase
      .channel('online-users')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: 'is_online=eq.true',
        },
        updateOnlineCount
      )
      .subscribe();

    // Also update periodically to keep it fresh
    const interval = setInterval(updateOnlineCount, 30000); // Every 30 seconds

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const { messages: realtimeMessages, sendMessage } = useChat(currentSessionId);

  // Sync realtime messages with local state
  useEffect(() => {
    if (realtimeMessages.length > 0 && currentSessionId) {
      const chatMessages: ChatMessage[] = realtimeMessages.map((msg) => ({
        id: msg.id,
        author: msg.sender_id === userId ? 'you' : 'them',
        text: msg.content,
        timestamp: createTimestamp(),
        sender_id: msg.sender_id,
      }));
      setMessages(chatMessages);
    }
  }, [realtimeMessages, currentSessionId, userId]);

  const handleFind = async () => {
    if (!userId || !userGender) return;

    setStatus('searching');
    setRevealState('idle');
    setMessages([]);
    setCurrentSessionId(null);
    setError(null);

    try {
      console.log('Starting matchmaking for user:', userId, 'gender:', userGender);

      // First, check total online users
      const { count: totalOnline } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_online', true)
        .neq('id', userId);

      console.log('Total online users (excluding self):', totalOnline);

      // Find online user with opposite gender
      const { data: potentialMatches, error: queryError } = await supabase
        .from('users')
        .select('*')
        .eq('is_online', true)
        .eq('gender', userGender === 'dude' ? 'girl' : 'dude')
        .neq('id', userId)
        .limit(10);

      if (queryError) {
        throw queryError;
      }

      console.log('Potential matches found:', potentialMatches?.length || 0);

      if (!potentialMatches || potentialMatches.length === 0) {
        setStatus('idle');
        setError(`No ${userGender === 'dude' ? 'girls' : 'dudes'} online right now. Try again later!`);
        setTimeout(() => setError(null), 3000);
        return;
      }

      // Filter out users we've already matched with recently
      const { data: recentSessions } = await supabase
        .from('chat_sessions')
        .select('user1_id, user2_id')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .gte('started_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
        .limit(50);

      const matchedUserIds = new Set<string>();
      if (recentSessions) {
        recentSessions.forEach(session => {
          if (session.user1_id !== userId) matchedUserIds.add(session.user1_id);
          if (session.user2_id !== userId) matchedUserIds.add(session.user2_id);
        });
      }

      console.log('Recently matched users to exclude:', matchedUserIds.size);

      const availableMatches = potentialMatches.filter(match => !matchedUserIds.has(match.id));

      console.log('Available matches after filtering:', availableMatches.length);

      if (availableMatches.length === 0) {
        setStatus('idle');
        setError('No new users available. Try again later for fresh matches!');
        setTimeout(() => setError(null), 3000);
        return;
      }

      // Pick random match with weighted selection (prefer users who've been online longer)
      const weightedMatches = availableMatches.map(match => {
        const hoursOnline = (Date.now() - new Date(match.last_active).getTime()) / (1000 * 60 * 60);
        const weight = Math.min(hoursOnline / 2, 5); // Cap weight at 5
        return { match, weight };
      });

      const totalWeight = weightedMatches.reduce((sum, item) => sum + item.weight, 0);
      let random = Math.random() * totalWeight;
      
      let selectedMatch = weightedMatches[0].match;
      for (const item of weightedMatches) {
        random -= item.weight;
        if (random <= 0) {
          selectedMatch = item.match;
          break;
        }
      }

      console.log('Selected match:', selectedMatch.alias, selectedMatch.id);

      setMatchId(selectedMatch.id);
      setMatchAlias(selectedMatch.alias || generateAlias());

      // Simulate delay for user experience
      const delay = getRandomDelay();
      setTimeout(() => {
        createChatSession(selectedMatch.id);
      }, delay);
    } catch (err) {
      console.error('Find error:', err);
      setError('Failed to find match. Please try again.');
      setStatus('idle');
    }
  };

  const createChatSession = async (matchUserId: string) => {
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          user1_id: userId,
          user2_id: matchUserId,
          status: 'active',
        })
        .select()
        .single();

      if (sessionError) {
        throw sessionError;
      }

      setCurrentSessionId(sessionData.id);
      setStatus('matched');
      setConfettiBurst(true);
      setTimeout(() => setConfettiBurst(false), 2200);

      // Send initial warmup messages
      const warmupMessages = [
        {
          content: `${matchAlias} here. ${matchAlias === 'MysticPotato' ? 'Already mysterious.' : `Call me ${matchAlias}.`} What's your chaos level tonight?`,
          sender_id: matchUserId,
        },
        {
          content: `${alias} reporting for duty. Ready to unleash maximum feral energy. 😈`,
          sender_id: userId,
        },
        {
          content: 'Say less. The void has been craving this energy.',
          sender_id: matchUserId,
        },
      ];

      for (const warmupMsg of warmupMessages) {
        await supabase.from('messages').insert({
          session_id: sessionData.id,
          sender_id: warmupMsg.sender_id,
          content: warmupMsg.content,
        });
        
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    } catch (err) {
      console.error('Session creation error:', err);
      setError('Failed to create chat session');
      setStatus('idle');
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !currentSessionId || !userId) return;

    const messageText = input.trim();
    setInput('');

    try {
      await sendMessage(messageText, userId);
      setBotResponsePending(true);

      // Simulate bot response
      setTimeout(() => {
        if (!matchId) return;
        
        const botMessage: ChatMessage = {
          id: Date.now().toString(),
          author: 'them',
          text: autoResponses[Math.floor(Math.random() * autoResponses.length)],
          timestamp: createTimestamp(),
          sender_id: matchId,
        };

        (async () => {
          try {
            await supabase
              .from('messages')
              .insert({
                session_id: currentSessionId,
                sender_id: matchId,
                content: botMessage.text,
              });
          } catch (err) {
            console.error('Error sending bot message:', err);
          }
        })();

        setBotResponsePending(false);
      }, 2000);
    } catch (err) {
      console.error('Send error:', err);
      setInput(messageText);
      setError('Failed to send message');
    }
  };

  const handleReveal = () => {
    setRevealState('pending');
  };

  const handleNext = () => {
    setStatus('rating');
    setRevealState('idle');
  };

  const handleRate = async () => {
    if (!currentSessionId || !userId) return;

    try {
      // Record rating
      await supabase.from('ratings').insert({
        session_id: currentSessionId,
        rater_id: userId,
        rating: Math.floor(Math.random() * 4) + 1,
      });

      // Update session status
      await supabase
        .from('chat_sessions')
        .update({ status: 'rated' })
        .eq('id', currentSessionId);

      setStatus('idle');
      setRevealState('idle');
      setMessages([]);
      setCurrentSessionId(null);
    } catch (err) {
      console.error('Rate error:', err);
      setError('Failed to save rating');
    }
  };

  const showChat = status === 'matched';

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pb-20 pt-12 sm:px-12">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-electric)]" />
          <p className="text-white/70">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-6 pb-20 pt-12 sm:px-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,240,255,0.1),_transparent_55%),radial-gradient(circle_at_bottom_left,_rgba(255,0,110,0.12),_transparent_60%)]" />

      <header className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/onboarding/username"
          className="inline-flex w-max items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white/60 transition hover:bg-white/20"
        >
          <ArrowLeft size={16} /> Back to onboarding
        </Link>
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-5 py-2 text-sm text-white/70">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-lg">👥</div>
          Currently online: <span className="font-semibold text-white">{onlineCount}</span> mysterious humans
        </div>
      </header>

      <main className="relative z-10 mx-auto mt-12 flex w-full max-w-5xl flex-col gap-10">
        <section className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/50 p-10 shadow-[0_0_140px_rgba(0,240,255,0.12)] backdrop-blur">
          <div className="flex flex-col gap-4 text-white/80">
            <span className="text-xs uppercase tracking-[0.4em] text-white/50">🎲 IO</span>
            <h1 className="font-display text-4xl font-semibold text-white sm:text-5xl">You are: {alias}</h1>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 rounded-2xl bg-red-500/20 border border-red-500/50 px-4 py-3 text-sm text-red-200"
            >
              {error}
            </motion.div>
          )}

          {status === 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 flex flex-col items-center gap-6 text-center text-white/70"
            >
              <p className="max-w-xl text-balance text-lg">
                The void is waiting. Will you find your vibe match or a complete weirdo? Only one way to find out.
              </p>
              <motion.button
                onClick={handleFind}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-white/10 bg-white/10 px-8 py-4 text-sm font-bold uppercase tracking-[0.4em] text-white"
              >
                <span className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(0,240,255,0.45),_rgba(255,0,110,0.45),_rgba(57,255,20,0.45))] opacity-0 blur-xl transition group-hover:opacity-100" />
                <span className="relative flex items-center gap-3">
                  <Flame className="h-4 w-4" /> Find someone random
                </span>
              </motion.button>
              <p className="text-sm uppercase tracking-[0.3em] text-white/40">
                Pro tip: Konami code unlocks the cursed emoji pack.
              </p>
            </motion.div>
          )}

          {status === 'searching' && (
            <motion.div
              key="searching"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 flex flex-col items-center gap-6 text-white/70"
            >
              <motion.div
                className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-dashed border-white/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 className="h-9 w-9 animate-spin text-[var(--accent-electric)]" />
              </motion.div>
              <h2 className="font-display text-2xl text-white">🌀 Summoning a random human...</h2>
              <p className="text-sm uppercase tracking-[0.35em] text-white/50">(Patience, grasshopper)</p>
            </motion.div>
          )}

          {status === 'rating' && (
            <motion.div
              key="rating"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 flex flex-col items-center gap-6 text-center"
            >
              <h2 className="font-display text-3xl text-white">Rate this vibe:</h2>
              <div className="flex flex-wrap justify-center gap-4">
                {ratingOptions.map((option) => (
                  <motion.button
                    key={option.label}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRate}
                    className="flex h-24 w-36 flex-col items-center justify-center gap-2 rounded-3xl border border-white/10 bg-white/10 text-base font-semibold text-white/80 transition hover:bg-white/20"
                  >
                    <span className="text-2xl">{option.icon}</span>
                    {option.label}
                  </motion.button>
                ))}
              </div>
              <motion.button
                onClick={handleFind}
                className="group relative mt-4 inline-flex items-center gap-3 overflow-hidden rounded-full border border-white/10 bg-white/10 px-7 py-3 text-xs font-bold uppercase tracking-[0.4em] text-white"
              >
                <span className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(0,240,255,0.35),_rgba(255,0,110,0.35))] opacity-0 blur-lg transition group-hover:opacity-100" />
                <span className="relative flex items-center gap-3">
                  Next Random Human <ArrowRight className="h-3 w-3" />
                </span>
              </motion.button>
            </motion.div>
          )}

          {showChat && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative mt-12 space-y-6"
            >
              <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">🎭</span>
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-white/60">Chatting with</p>
                      <h2 className="font-display text-2xl text-white">{matchAlias}</h2>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleNext}
                      className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:bg-white/10"
                    >
                      ⏭️ Next
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleReveal}
                      className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:bg-white/10"
                    >
                      🎁 Reveal
                    </motion.button>
                  </div>
                </div>
                <p className="text-sm text-white/60">💥 BOOM! You&apos;re connected! Now say something interesting.</p>
              </div>

              <div className="relative rounded-3xl border border-white/10 bg-black/40 p-6">
                <div className="flex h-80 flex-col gap-4 overflow-y-auto pr-2">
                  <AnimatePresence initial={false}>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`group max-w-[75%] rounded-3xl px-5 py-3 text-sm leading-relaxed text-white ${
                          message.author === 'you'
                            ? 'self-end bg-[linear-gradient(135deg,_rgba(0,240,255,0.5),_rgba(255,0,110,0.45))]' 
                            : 'self-start bg-white/10'
                        }`}
                      >
                        {message.text}
                        <span className="mt-2 block text-right text-xs uppercase tracking-[0.4em] text-white/50 opacity-0 transition group-hover:opacity-100">
                          {message.timestamp}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {botResponsePending && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="self-start rounded-3xl bg-white/10 px-5 py-3 text-sm text-white"
                    >
                      <motion.span
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        ●●●
                      </motion.span>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form
                  className="mt-6 flex items-center gap-4 rounded-full border border-white/10 bg-black/40 px-4 py-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleSend();
                  }}
                >
                  <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Type something..."
                    disabled={botResponsePending}
                    className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40 disabled:opacity-60"
                  />
                  <motion.button
                    type="submit"
                    disabled={botResponsePending || !input.trim()}
                    whileTap={{ scale: 0.9 }}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,_rgba(0,240,255,0.6),_rgba(255,0,110,0.6))] text-black disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    📤
                  </motion.button>
                </form>

                <AnimatePresence>
                  {revealState !== 'idle' && (
                    <motion.div
                      key={revealState}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center rounded-3xl bg-black/80 p-8 text-center backdrop-blur"
                    >
                      {revealState === 'pending' && (
                        <motion.div
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          className="flex max-w-md flex-col items-center gap-4 text-white"
                        >
                          <span className="text-4xl">🎁</span>
                          <h3 className="font-display text-2xl">You want to reveal your identity!</h3>
                          <p className="text-sm text-white/70">
                            Waiting for {matchAlias} to agree... (They&apos;ll see this request. Cross your fingers.)
                          </p>
                          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-electric)]" />
                        </motion.div>
                      )}

                      {revealState === 'accepted' && (
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 120 }}
                          className="flex w-full max-w-2xl flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 text-left text-white"
                        >
                          <div className="flex items-center gap-3 text-2xl text-white">
                            🎊 Identity Unlocked! 🎊
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            {[youIdentity, matchIdentity].map((identity) => (
                              <div
                                key={identity.email}
                                className="rounded-2xl border border-white/10 bg-black/40 p-5"
                              >
                                <p className="text-sm uppercase tracking-[0.4em] text-white/60">{identity.alias}</p>
                                <h4 className="mt-2 font-display text-xl">{identity.name}</h4>
                                <p className="text-sm text-white/70">{identity.email}</p>
                                <p className="mt-2 text-sm text-white/60">{identity.details}</p>
                              </div>
                            ))}
                          </div>
                          <p className="text-sm text-white/70">&quot;Now you know. Don&apos;t make it weird.&quot;</p>
                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={() => setRevealState('idle')}
                              className="rounded-full border border-white/10 bg-black/40 px-5 py-2 text-xs font-bold uppercase tracking-[0.4em] text-white"
                            >
                              Continue Chatting
                            </button>
                            <button
                              onClick={() => setRevealState('idle')}
                              className="rounded-full border border-white/10 bg-black/40 px-5 py-2 text-xs font-bold uppercase tracking-[0.4em] text-white"
                            >
                              Exchange Socials
                            </button>
                            <button
                              onClick={handleNext}
                              className="rounded-full border border-white/10 bg-black/40 px-5 py-2 text-xs font-bold uppercase tracking-[0.4em] text-white"
                            >
                              End Chat
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {revealState === 'declined' && (
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex max-w-lg flex-col items-center gap-4 text-white"
                        >
                          <span className="text-4xl">❌</span>
                          <h3 className="font-display text-2xl">{matchAlias} wants to stay mysterious</h3>
                          <p className="text-sm text-white/70">
                            Respect the vibe. Keep it anonymous.
                          </p>
                          <div className="flex gap-3">
                            <button
                              onClick={() => setRevealState('idle')}
                              className="rounded-full border border-white/10 bg-black/40 px-5 py-2 text-xs font-bold uppercase tracking-[0.4em] text-white"
                            >
                              Continue Chatting
                            </button>
                            <button
                              onClick={handleNext}
                              className="rounded-full border border-white/10 bg-black/40 px-5 py-2 text-xs font-bold uppercase tracking-[0.4em] text-white"
                            >
                              Next Match
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </section>

        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/40 p-6 text-sm text-white/60">
          <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,0,110,0.08),_transparent_60%)]" />
          <div className="relative z-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <p className="text-xs uppercase tracking-[0.35em] text-white/50">Funny Empty State</p>
              <h3 className="mt-3 font-display text-xl text-white">Ghost town?</h3>
              <p className="mt-2 text-white/70">It&apos;s a ghost town. Tell your friends to log in!</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <p className="text-xs uppercase tracking-[0.35em] text-white/50">Connection Drama</p>
              <h3 className="mt-3 font-display text-xl text-white">Internet gods mad?</h3>
              <p className="mt-2 text-white/70">The internet gods have forsaken us. Refresh?</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <p className="text-xs uppercase tracking-[0.35em] text-white/50">Match Rage Quit</p>
              <h3 className="mt-3 font-display text-xl text-white">They dipped?</h3>
              <p className="mt-2 text-white/70">They vanished into the void. Their loss.</p>
            </div>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {confettiBurst && (
          <motion.div
            key="confetti"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 flex items-start justify-center overflow-hidden"
          >
            <ConfettiLayer />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Development-only realtime debugger */}
      {process.env.NODE_ENV === 'development' && <RealtimeDebugger />}
      {/* Development-only user creator */}
      {process.env.NODE_ENV === 'development' && <DevUserCreator />}
    </div>
  );
}

function generateConfettiPieces() {
  return Array.from({ length: 28 }).map(() => ({
    top: Math.random() * 20,
    left: Math.random() * 100,
    duration: 2 + Math.random(),
  }));
}

function ConfettiLayer() {
  const pieces = useMemo(() => generateConfettiPieces(), []);

  return (
    <div className="relative h-full w-full">
      {pieces.map((piece, index) => (
        <motion.span
          key={index}
          className="absolute block h-2 w-6 rounded-full"
          style={{
            background:
              index % 3 === 0
                ? 'rgba(0,240,255,0.9)'
                : index % 3 === 1
                  ? 'rgba(255,0,110,0.85)'
                  : 'rgba(57,255,20,0.85)',
            top: `${piece.top}%`,
            left: `${piece.left}%`,
          }}
          animate={{
            y: ['0vh', '100vh'],
            rotate: [0, 120, -90, 180],
            opacity: [1, 0.9, 0.8, 0],
          }}
          transition={{ duration: piece.duration, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}
