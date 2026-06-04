// All fetch calls to the Express server live here.
// Components never call fetch() directly — they use these functions.

const BASE = 'http://localhost:3001';

const handle = async (res) => {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
};

const opts = {
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
};

export const login  = (username, password) =>
  fetch(`${BASE}/api/session`, { method: 'POST', ...opts, body: JSON.stringify({ username, password }) }).then(handle);

export const logout = () =>
  fetch(`${BASE}/api/session`, { method: 'DELETE', ...opts }).then(handle);

export const getCurrentUser = () =>
  fetch(`${BASE}/api/session/current`, opts).then(handle);

export const startGame = () =>
  fetch(`${BASE}/api/game/start`, { method: 'POST', ...opts }).then(handle);

export const executeGame = (route, startId, endId) =>
  fetch(`${BASE}/api/game/execute`, { method: 'POST', ...opts, body: JSON.stringify({ route, startId, endId }) }).then(handle);

export const getLeaderboard = () =>
  fetch(`${BASE}/api/game/leaderboard`, opts).then(handle);
