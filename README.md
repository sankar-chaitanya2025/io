# IO — The Raw Anonymous Campus Chat

IO (Input/Output) is a deliberately chaotic, neon-soaked anonymous chat concept for RGUKTN college students. It embraces mystery, celebrates honesty, and roasts anyone who fakes their vibe.

## 🔥 Features

- **Landing page with personality overload** – playful hero copy, animated glows, and instant chaos CTA.
- **Onboarding flow**
  - Magic-link email verification screen with snarky feedback.
  - Gender selection with animated buttons and cosmic-level warnings.
  - Alias generator with spinning suspense and emoji flair.
- **Dashboard experience**
  - Live-ish online counter and hype to “Find Someone Random”.
  - Animated search state, confetti burst on match, and a playful chat sandbox.
  - Reveal flow that mirrors the ticket’s copy, including accepted/declined paths.
  - Rating screen for the post-chat vibe check.
- **UI extras** – neon gradients, hover glows, framer-motion animations, and pre-written funny empty states.

## 🚀 Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router, TypeScript)
- Tailwind CSS v4 preview
- [Framer Motion](https://www.framer.com/motion/) for the wiggles and pulses
- [lucide-react](https://lucide.dev/) icons

## 🛠️ Local Development

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Navigate to `http://localhost:3000` to explore the flow. All state is client-side only—no real auth, storage, or chat backend. It’s a design prototype.

## 🧠 Notes

- Magic link, gender storage, and chat are mocked to keep the focus on visuals and copy.
- Try smashing the buttons and hovering around—the UI leans into subtle motion and glow effects.
- Ready for future integrations with Supabase, WebRTC, and true anonymous chat logic.
