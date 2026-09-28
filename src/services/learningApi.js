// services/learningApi.js

import { csrfHeaders } from '../utils/csrf';

const API_BASE =
  process.env.REACT_APP_API_URL || 'https://helloapi-five.vercel.app';
const LEARNING_API_URL = `${API_BASE}/api/learning`;
const AUTH_API_URL = `${API_BASE}/api/auth`;

/* ---------- Shared refresh guard ----------
 * Ensures only one refresh call is in flight at a time. Parallel
 * 401s from multiple requests all await the same refresh promise.
 */
let refreshPromise = null;

const refreshAccessCookie = async () => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${AUTH_API_URL}/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: csrfHeaders('POST'),
      });
      return response.ok;
    } catch (err) {
      console.error('[learningApi] refresh request failed', err);
      return false;
    } finally {
      setTimeout(() => {
        refreshPromise = null;
      }, 0);
    }
  })();

  return refreshPromise;
};

/* ---------- Authenticated fetch ---------- */

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

export const learningApi = {
  generateFlashcards: async (data) => {
    const response = await authenticatedFetch(
      `${LEARNING_API_URL}/generate-flashcards`,
      { method: 'POST', body: JSON.stringify(data) }
    );
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    return await response.json();
  },

  generateQuiz: async (data) => {
    const response = await authenticatedFetch(
      `${LEARNING_API_URL}/generate-quiz`,
      { method: 'POST', body: JSON.stringify(data) }
    );
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    return await response.json();
  },

  submitQuiz: async (data) => {
    const response = await authenticatedFetch(
      `${LEARNING_API_URL}/submit-quiz`,
      { method: 'POST', body: JSON.stringify(data) }
    );
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    return await response.json();
  },

  updateFlashcardMastery: async (data) => {
    const response = await authenticatedFetch(
      `${LEARNING_API_URL}/update-flashcard-mastery`,
      { method: 'POST', body: JSON.stringify(data) }
    );
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    return await response.json();
  },

  getPreviousFlashcardSets: async (data) => {
    const response = await authenticatedFetch(
      `${LEARNING_API_URL}/flashcard-sets`,
      { method: 'POST', body: JSON.stringify(data) }
    );
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    return await response.json();
  },

  getPreviousQuizAttempts: async (data) => {
    const response = await authenticatedFetch(
      `${LEARNING_API_URL}/quiz-attempts`,
      { method: 'POST', body: JSON.stringify(data) }
    );
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    return await response.json();
  },

  completeFlashcardSet: async (data) => {
    const response = await authenticatedFetch(
      `${LEARNING_API_URL}/complete-flashcard-set`,
      { method: 'POST', body: JSON.stringify(data) }
    );
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    return await response.json();
  },

  getFlashcardSetById: async (id) => {
    const response = await authenticatedFetch(
      `${LEARNING_API_URL}/flashcard-sets/${id}`,
      { method: 'GET' }
    );
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    return await response.json();
  },

  getQuizAttemptById: async (id) => {
    const response = await authenticatedFetch(
      `${LEARNING_API_URL}/quiz-attempts/${id}`,
      { method: 'GET' }
    );
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    return await response.json();
  },
};