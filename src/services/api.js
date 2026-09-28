// services/api.js

import { csrfHeaders } from '../utils/csrf';

const API_URL =
  process.env.REACT_APP_API_URL || 'https://helloapi-five.vercel.app';

/* ---------- Authenticated fetch ---------- */

/**
 * Sends an authenticated request using the httpOnly cookies that the
 * browser attaches automatically. On 401, it attempts to refresh the
 * access cookie once, then retries the original request.
 *
 * Includes a small single-flight guard so parallel 401s do not trigger
 * a burst of refresh calls.
 */

let refreshPromise = null;

const refreshAccessCookie = async () => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const refreshResponse = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: csrfHeaders('POST'),
      });
      return refreshResponse.ok;
    } catch (err) {
      console.error('[api] refresh request failed', err);
      return false;
    } finally {
      // Release the guard after the current tick so that any parallel
      // callers attach to the same promise.
      setTimeout(() => {
        refreshPromise = null;
      }, 0);
    }
  })();

  return refreshPromise;
};

const authenticatedFetch = async (url, options = {}) => {
  const method = options.method || 'GET';

  const makeRequest = () =>
    fetch(url, {
      ...options,
      method,
      credentials: 'include',
      headers: {
        ...csrfHeaders(method),
        ...(options.headers || {}),
      },
    });

  let response = await makeRequest();

  if (response.status === 401) {
    const refreshed = await refreshAccessCookie();
    if (refreshed) {
      response = await makeRequest();
    }
  }

  return response;
};

/* ---------- API ---------- */

export const api = {
  /* ---------- Stats ---------- */

  fetchStats: async (userId) => {
    try {
      const response = await authenticatedFetch(
        `${API_URL}/api/stats/${userId}`,
        { method: 'GET' }
      );
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Fetch stats error:', error);
      return null;
    }
  },

  /* ---------- Reading lessons ---------- */

  generateLesson: async (payload) => {
    const response = await authenticatedFetch(
      `${API_URL}/api/learning/generate-lesson`,
      { method: 'POST', body: JSON.stringify(payload) }
    );
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    return await response.json();
  },

  submitLessonResults: async (payload) => {
    const response = await authenticatedFetch(
      `${API_URL}/api/learning/submit-lesson`,
      { method: 'POST', body: JSON.stringify(payload) }
    );
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    return await response.json();
  },

  saveLessonProgress: async (payload) => {
    const response = await authenticatedFetch(
      `${API_URL}/api/learning/lesson-progress`,
      { method: 'POST', body: JSON.stringify(payload) }
    );
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    return await response.json();
  },

  getLessonAttempts: async ({ userId, topicId, language }) => {
    const response = await authenticatedFetch(
      `${API_URL}/api/learning/lesson-attempts`,
      {
        method: 'POST',
        body: JSON.stringify({ userId, topicId, language }),
      }
    );
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    return await response.json();
  },

  /* ---------- Flashcards ---------- */

  generateFlashcards: async (data) => {
    const response = await authenticatedFetch(
      `${API_URL}/api/learning/generate-flashcards`,
      { method: 'POST', body: JSON.stringify(data) }
    );
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    return await response.json();
  },

  updateFlashcardMastery: async (data) => {
    const response = await authenticatedFetch(
      `${API_URL}/api/learning/update-flashcard-mastery`,
      { method: 'POST', body: JSON.stringify(data) }
    );
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    return await response.json();
  },

  /* ---------- Quiz ---------- */

  generateQuiz: async (data) => {
    const response = await authenticatedFetch(
      `${API_URL}/api/learning/generate-quiz`,
      { method: 'POST', body: JSON.stringify(data) }
    );
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    return await response.json();
  },

  submitQuiz: async (data) => {
    const response = await authenticatedFetch(
      `${API_URL}/api/learning/submit-quiz`,
      { method: 'POST', body: JSON.stringify(data) }
    );
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    return await response.json();
  },

  /* ---------- Auth ---------- */

  fetchCurrentUser: async () => {
    const response = await authenticatedFetch(`${API_URL}/api/auth/me`, {
      method: 'GET',
    });
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    return await response.json();
  },

  savePreferences: async (preferences) => {
    const response = await authenticatedFetch(
      `${API_URL}/api/auth/preferences`,
      { method: 'POST', body: JSON.stringify(preferences) }
    );
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    return await response.json();
  },

  /* ---------- Crossword ---------- */

  generateCrossword: async (payload) => {
    const response = await authenticatedFetch(
      `${API_URL}/api/crossword/generate`,
      { method: 'POST', body: JSON.stringify(payload) }
    );
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API returned ${response.status}: ${text}`);
    }
    return await response.json();
  },

  fetchCrossword: async (puzzleId, userId) => {
    const response = await authenticatedFetch(
      `${API_URL}/api/crossword/${puzzleId}?userId=${encodeURIComponent(userId)}`,
      { method: 'GET' }
    );
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    return await response.json();
  },

  saveCrosswordProgress: async (payload) => {
    const response = await authenticatedFetch(
      `${API_URL}/api/crossword/save-progress`,
      { method: 'POST', body: JSON.stringify(payload) }
    );
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    return await response.json();
  },

  listCrosswords: async (payload) => {
    const response = await authenticatedFetch(
      `${API_URL}/api/crossword/list`,
      { method: 'POST', body: JSON.stringify(payload) }
    );
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    return await response.json();
  },

  /* ---------- Ninja ---------- */

  generateNinjaGame: async (payload) => {
    const response = await authenticatedFetch(
      `${API_URL}/api/ninja/generate`,
      { method: 'POST', body: JSON.stringify(payload) }
    );
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API returned ${response.status}: ${text}`);
    }
    return await response.json();
  },

  fetchNinjaGame: async (gameId, userId) => {
    const response = await authenticatedFetch(
      `${API_URL}/api/ninja/${gameId}?userId=${encodeURIComponent(userId)}`,
      { method: 'GET' }
    );
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    return await response.json();
  },

  submitNinjaResults: async (payload) => {
    const response = await authenticatedFetch(
      `${API_URL}/api/ninja/submit`,
      { method: 'POST', body: JSON.stringify(payload) }
    );
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    return await response.json();
  },

  listNinjaGames: async (payload) => {
    const response = await authenticatedFetch(
      `${API_URL}/api/ninja/list`,
      { method: 'POST', body: JSON.stringify(payload) }
    );
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    return await response.json();
  },
};