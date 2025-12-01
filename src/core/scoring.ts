import { GAME_CONFIG, MiniEvent, MINI_EVENTS } from './constants.js';
import { SeededRNG } from './rng.js';

export interface RunParams {
  seed: string;
  difficulty: number;
  playerCount: number;
  duration: number; // seconds
  betrayUsed: boolean;
  gearLevel: number;
}

export interface RunResult {
  score: number;
  cashEarned: number;
  success: boolean;
  eventsCompleted: number;
  perfectEvents: number;
}

export interface MiniEventDefinition {
  type: MiniEvent;
  duration: number; // seconds
  baseScore: number;
  difficulty: number; // 1-5
}

/**
 * Generate mini-events for a heist run based on seed and difficulty.
 */
export function generateEvents(
  seed: string,
  difficulty: number,
  duration: number
): MiniEventDefinition[] {
  const rng = new SeededRNG(seed);
  const events: MiniEventDefinition[] = [];

  let timeRemaining = duration;
  const eventCount = Math.floor(difficulty * 3 + rng.nextInt(2, 5));

  for (let i = 0; i < eventCount && timeRemaining > 5; i++) {
    const eventType = rng.pick([...MINI_EVENTS]);
    const eventDuration = rng.nextInt(3, Math.min(10, timeRemaining));
    const eventDifficulty = Math.min(5, difficulty + rng.nextInt(-1, 1));

    events.push({
      type: eventType as MiniEvent,
      duration: eventDuration,
      baseScore: 100 * eventDifficulty,
      difficulty: eventDifficulty,
    });

    timeRemaining -= eventDuration;
  }

  return events;
}

/**
 * Calculate expected score range for a run based on parameters.
 * Used for anti-cheat validation.
 */
export function calculateExpectedScore(params: RunParams): {
  min: number;
  max: number;
} {
  const events = generateEvents(params.seed, params.difficulty, params.duration);

  let baseScore = 0;
  for (const event of events) {
    baseScore += event.baseScore;
  }

  // Apply difficulty multiplier
  const diffMultiplier =
    GAME_CONFIG.DIFFICULTY_MULTIPLIERS[params.difficulty - 1] || 1;
  baseScore *= diffMultiplier;

  // Apply gear bonus (5% per level)
  const gearBonus = 1 + (params.gearLevel - 1) * 0.05;
  baseScore *= gearBonus;

  // Team bonus
  if (params.playerCount > 1) {
    const teamBonus =
      1 + (params.playerCount - 1) * GAME_CONFIG.TEAM_BONUS_PER_PLAYER;
    baseScore *= teamBonus;
  }

  // Betrayal modifier (steals team bonus for self)
  if (params.betrayUsed && params.playerCount > 1) {
    const stolenBonus =
      baseScore * GAME_CONFIG.BETRAYAL_STEAL_PERCENT * (params.playerCount - 1);
    baseScore += stolenBonus;
  }

  // Min score: 50% of base (lots of failures)
  // Max score: 150% of base (all perfects + combos)
  return {
    min: Math.floor(baseScore * 0.5),
    max: Math.floor(baseScore * 1.5),
  };
}

/**
 * Simulate a run server-side to validate client-submitted results.
 */
export function validateRun(
  params: RunParams,
  clientResult: {
    score: number;
    eventsCompleted: number;
    inputs: number;
  }
): { valid: boolean; reason?: string } {
  // Check duration bounds
  if (
    params.duration < GAME_CONFIG.MIN_RUN_DURATION_SECONDS ||
    params.duration > GAME_CONFIG.HEIST_DURATION_MAX + 30
  ) {
    return { valid: false, reason: 'Invalid run duration' };
  }

  // Check score bounds
  const expectedScore = calculateExpectedScore(params);
  if (
    clientResult.score < expectedScore.min * 0.8 ||
    clientResult.score > expectedScore.max * 1.2
  ) {
    return { valid: false, reason: 'Score out of expected range' };
  }

  // Check input rate (anti-bot)
  const inputRate = clientResult.inputs / params.duration;
  if (inputRate > GAME_CONFIG.MAX_INPUT_RATE) {
    return { valid: false, reason: 'Input rate too high' };
  }

  // Check events completed
  const expectedEvents = generateEvents(
    params.seed,
    params.difficulty,
    params.duration
  );
  if (clientResult.eventsCompleted > expectedEvents.length) {
    return { valid: false, reason: 'Too many events completed' };
  }

  return { valid: true };
}

/**
 * Calculate final rewards for a validated run.
 */
export function calculateRewards(
  params: RunParams,
  score: number
): RunResult {
  // Base cash from score (1 score = 0.1 cash)
  let cashEarned = Math.floor(score * 0.1);

  // Success bonus (double cash if score > 50% of max expected)
  const expectedMax = calculateExpectedScore(params).max;
  const success = score >= expectedMax * 0.5;
  if (success) {
    cashEarned *= 2;
  }

  // Heat penalty (reduces cash)
  // Applied externally based on user's heat level

  return {
    score,
    cashEarned,
    success,
    eventsCompleted: 0, // filled by client
    perfectEvents: 0, // filled by client
  };
}

/**
 * Calculate energy cost for a run.
 */
export function calculateEnergyCost(difficulty: number): number {
  return 1; // All runs cost 1 energy for now
}
