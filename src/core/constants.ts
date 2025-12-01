export const GAME_CONFIG = {
  // Energy system
  MAX_ENERGY: 5,
  ENERGY_REFILL_MINUTES: 15,

  // Run timings (seconds)
  LOBBY_DURATION: 10,
  HEIST_DURATION_MIN: 60,
  HEIST_DURATION_MAX: 90,
  ESCAPE_DURATION: 20,

  // Co-op
  MIN_PLAYERS: 1,
  MAX_PLAYERS: 5,

  // Scoring
  BASE_LOOT: 100,
  DIFFICULTY_MULTIPLIERS: [1, 1.5, 2, 3, 5], // indices 0-4 for difficulties 1-5
  TEAM_BONUS_PER_PLAYER: 0.1, // 10% per additional player
  BETRAYAL_STEAL_PERCENT: 0.5, // steals 50% of team bonus
  BETRAYAL_HEAT_PENALTY: 2,

  // Gear upgrades
  GEAR_COSTS: {
    1: 0,
    2: 500,
    3: 1500,
    4: 5000,
    5: 15000,
  },

  // Heat decay
  HEAT_DECAY_PER_RUN: 1,

  // Session
  SESSION_DURATION_HOURS: 24,

  // Anti-cheat thresholds
  MAX_SCORE_PER_SECOND: 200,
  MIN_RUN_DURATION_SECONDS: 30,
  MAX_INPUT_RATE: 20, // inputs per second
};

export const ROLES = ['Hacker', 'Muscle', 'Driver', 'Lookout'] as const;
export type Role = (typeof ROLES)[number];

export const GEAR_TYPES = ['HACKER_RIG', 'DRILL', 'GETAWAY', 'MASK'] as const;

export const DAILY_TASK_TYPES = {
  COMPLETE_3_RUNS: { target: 3, reward: 300 },
  EARN_1000_COINS: { target: 1000, reward: 500 },
  WIN_5_HEISTS: { target: 5, reward: 800 },
} as const;

export const MINI_EVENTS = [
  'HACK_SEQUENCE',
  'DRILL_VAULT',
  'LOCKPICK',
  'DRIVE_ESCAPE',
  'DISABLE_CAMERAS',
  'CRACK_SAFE',
] as const;

export type MiniEvent = (typeof MINI_EVENTS)[number];
