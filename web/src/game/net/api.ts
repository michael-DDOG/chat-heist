/**
 * API client for Chat Heist backend.
 */

const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:3000';

let authToken: string | null = null;

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: {
    id: string;
    tgUserId: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    energy: number;
    heat: number;
    gearLvl: number;
    coinsTotal: number;
  };
}

export interface StartRunResponse {
  runId: string;
  seed: string;
  nonce: string;
  difficulty: number;
  mode: string;
  startedAt: string;
}

export interface CompleteRunResponse {
  success: boolean;
  score: number;
  cashEarned: number;
  totalCoins: number;
  heat: number;
}

/**
 * Set auth token for subsequent requests.
 */
export function setAuthToken(token: string): void {
  authToken = token;
}

/**
 * Get Telegram initData.
 */
export function getTelegramInitData(): string {
  const tg = (window as any).Telegram?.WebApp;
  return tg?.initData || '';
}

/**
 * Authenticate with Telegram initData.
 */
export async function authenticate(): Promise<AuthResponse> {
  const initData = getTelegramInitData();

  const response = await fetch(`${API_BASE}/auth/verifyInitData`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ initData }),
  });

  if (!response.ok) {
    throw new Error('Authentication failed');
  }

  const data: AuthResponse = await response.json();
  setAuthToken(data.token);
  return data;
}

/**
 * Make authenticated request.
 */
async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  if (!authToken) {
    throw new Error('Not authenticated');
  }

  return fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
      ...options.headers,
    },
  });
}

/**
 * Start a new run.
 */
export async function startRun(params: {
  difficulty: number;
  mode: string;
  chatId?: string;
}): Promise<StartRunResponse> {
  const response = await authFetch('/game/start', {
    method: 'POST',
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to start run');
  }

  return response.json();
}

/**
 * Complete a run.
 */
export async function completeRun(params: {
  runId: string;
  score: number;
  eventsCompleted: number;
  inputs: number;
  checksum: string;
}): Promise<CompleteRunResponse> {
  const response = await authFetch('/game/complete', {
    method: 'POST',
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to complete run');
  }

  return response.json();
}

/**
 * Get user profile.
 */
export async function getProfile(): Promise<any> {
  const response = await authFetch('/me');

  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }

  return response.json();
}

/**
 * Get leaderboard.
 */
export async function getLeaderboard(scope: 'global' | 'chat', chatId?: string): Promise<any> {
  const url = scope === 'global' ? '/leaderboard/global' : `/leaderboard/chat/${chatId}`;
  const response = await authFetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard');
  }

  return response.json();
}

/**
 * Get shop gear.
 */
export async function getShopGear(): Promise<any> {
  const response = await authFetch('/shop/gear');

  if (!response.ok) {
    throw new Error('Failed to fetch shop gear');
  }

  return response.json();
}

/**
 * Buy gear.
 */
export async function buyGear(gearType: string): Promise<any> {
  const response = await authFetch('/shop/buy', {
    method: 'POST',
    body: JSON.stringify({ gearType }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to buy gear');
  }

  return response.json();
}

/**
 * Get daily tasks.
 */
export async function getDailyTasks(): Promise<any> {
  const response = await authFetch('/dailies');

  if (!response.ok) {
    throw new Error('Failed to fetch daily tasks');
  }

  return response.json();
}

/**
 * Claim daily task reward.
 */
export async function claimDailyTask(taskId: string): Promise<any> {
  const response = await authFetch('/dailies/claim', {
    method: 'POST',
    body: JSON.stringify({ taskId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to claim reward');
  }

  return response.json();
}
