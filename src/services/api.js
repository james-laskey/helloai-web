// services/api.js

import { authenticatedFetch, API_URL } from './authFetch';

export const api = {
  /* ---------- Stats ---------- */

  fetchStats: async (userId) => {
    try {
      const response = await authenticatedFetch(
        `${API_URL}/api/stats/${encodeURIComponent(userId)}`,
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
};