/**
 * Global game state store.
 */

export interface GameState {
  user: {
    id: string;
    username: string | null;
    firstName: string | null;
    energy: number;
    heat: number;
    gearLvl: number;
    coinsTotal: number;
  } | null;
  currentRun: {
    runId: string;
    seed: string;
    nonce: string;
    difficulty: number;
    mode: string;
    startTime: number;
    score: number;
    eventsCompleted: number;
    inputs: number;
  } | null;
}

const state: GameState = {
  user: null,
  currentRun: null,
};

export function getState(): GameState {
  return state;
}

export function setState(updates: Partial<GameState>): void {
  Object.assign(state, updates);
}

export function setUser(user: GameState['user']): void {
  state.user = user;
}

export function setCurrentRun(run: GameState['currentRun']): void {
  state.currentRun = run;
}

export function incrementScore(amount: number): void {
  if (state.currentRun) {
    state.currentRun.score += amount;
  }
}

export function incrementInputs(): void {
  if (state.currentRun) {
    state.currentRun.inputs++;
  }
}

export function incrementEventsCompleted(): void {
  if (state.currentRun) {
    state.currentRun.eventsCompleted++;
  }
}

export function clearCurrentRun(): void {
  state.currentRun = null;
}

/**
 * Calculate checksum for current run.
 */
export function calculateChecksum(): string {
  if (!state.currentRun) return '';

  const { seed, nonce, score } = state.currentRun;
  const duration = Math.floor((Date.now() - state.currentRun.startTime) / 1000);

  const str = `${seed}:${nonce}:${score}:${duration}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
