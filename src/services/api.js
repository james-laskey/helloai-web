// services/api.js — clean version

const API_URL =
  process.env.REACT_APP_API_URL || 'https://helloapi-five.vercel.app';

/* ---------- Token helpers (unchanged) ---------- */

const getToken = () => {
  try {
    return localStorage.getItem('accessToken');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('accessToken', data.accessToken);
      return data.accessToken;
    }
    return null;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
};

const authenticatedFetch = async (url, options = {}) => {
  const token = getToken();

  const makeRequest = async (requestToken) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(requestToken && { Authorization: `Bearer ${requestToken}` }),
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401 && requestToken) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        return fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
            Authorization: `Bearer ${newToken}`,
          },
        });
      }
    }

    return response;
  };

  return makeRequest(token);
};

/* ---------- API ---------- */

export const api = {
  /* Stats */
  fetchStats: async (userId) => {
    try {
      const response = await authenticatedFetch(
        `${API_URL}/api/stats/${userId}`,
        { method: 'GET' }
      );
      if (!response.ok) {
        console.error('fetchStats failed:', response.status);
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error('Fetch stats error:', error);
      return null;
    }
  },

  /* Reading lessons */
  generateLesson: async (payload) => {
    const response = await authenticatedFetch(
      `${API_URL}/api/learning/generate-lesson`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error - generateLesson:', response.status, errorText);
      throw new Error(`API returned ${response.status}`);
    }

    return await response.json();
  },

  submitLessonResults: async (payload) => {
    const response = await authenticatedFetch(
      `${API_URL}/api/learning/submit-lesson`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        'API Error - submitLessonResults:',
        response.status,
        errorText
      );
      throw new Error(`API returned ${response.status}`);
    }

    return await response.json();
  },

  /* Flashcards */
  generateFlashcards: async (data) => {
    const response = await authenticatedFetch(
      `${API_URL}/api/learning/generate-flashcards`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    return await response.json();
  },

  updateFlashcardMastery: async (data) => {
    const response = await authenticatedFetch(
      `${API_URL}/api/learning/update-flashcard-mastery`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    return await response.json();
  },

  /* Quiz */
  generateQuiz: async (data) => {
    const response = await authenticatedFetch(
      `${API_URL}/api/learning/generate-quiz`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    return await response.json();
  },

  submitQuiz: async (data) => {
    const response = await authenticatedFetch(
      `${API_URL}/api/learning/submit-quiz`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    return await response.json();
  },
  // services/api.js — add to api object

saveLessonProgress: async (payload) => {
  const response = await authenticatedFetch(
    `${API_URL}/api/learning/lesson-progress`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
  if (!response.ok) {
    throw new Error(`API returned ${response.status}`);
  }
  return await response.json();
},
saveLessonProgress: async (payload) => {
  const response = await authenticatedFetch(
    `${API_URL}/api/learning/lesson-progress`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      'API Error - saveLessonProgress:',
      response.status,
      errorText
    );
    throw new Error(`API returned ${response.status}`);
  }

  return await response.json();
},
// services/api.js

fetchCurrentUser: async () => {
  const response = await authenticatedFetch(`${API_URL}/api/auth/me`, {
    method: 'GET',
  });
  if (!response.ok) {
    throw new Error(`API returned ${response.status}`);
  }
  return await response.json();
},

savePreferences: async (preferences) => {
  const response = await authenticatedFetch(
    `${API_URL}/api/auth/preferences`,
    {
      method: 'POST',
      body: JSON.stringify(preferences),
    }
  );
  if (!response.ok) {
    const errorText = await response.text();
    console.error('savePreferences error:', response.status, errorText);
    throw new Error(`API returned ${response.status}`);
  }
  return await response.json();
},
};