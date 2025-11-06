const ADJECTIVES = [
  "Cosmic",
  "Mystic",
  "Chaotic",
  "Neon",
  "Quantum",
  "Glitchy",
  "Cursed",
  "Electric",
  "Rogue",
  "Midnight",
  "Savage",
  "Turbo",
  "Stellar",
  "Velvet",
  "Reckless",
];

const NOUNS = [
  "Taco",
  "Potato",
  "Mango",
  "Penguin",
  "Wizard",
  "Ninja",
  "Donut",
  "Cactus",
  "Raccoon",
  "Goblin",
  "Slayer",
  "Comet",
  "Bandit",
  "Sprite",
  "Cyclone",
];

export const generateAlias = (): string => {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adjective}${noun}`;
};

export const generateOnlineCount = () => 30 + Math.floor(Math.random() * 75);

export const getRandomDelay = () => 1500 + Math.floor(Math.random() * 1500);
