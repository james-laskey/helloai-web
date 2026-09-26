// services/learningApi.js

const LEARNING_API_URL = `${
  process.env.REACT_APP_API_URL || 'https://helloapi-five.vercel.app'
}/api/learning`;
const AUTH_API_URL = `${
  process.env.REACT_APP_API_URL || 'https://helloapi-five.vercel.app'
}/api/auth`;

// Helper function to get token
const getToken = () => {
  try {
    return localStorage.getItem('accessToken');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Helper function to refresh token
const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    const response = await fetch(`${AUTH_API_URL}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
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

// Helper function to make authenticated requests
const authenticatedFetch = async (url, options = {}) => {
  const token = getToken();

  const makeRequest = async (requestToken) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(requestToken && { 'Authorization': `Bearer ${requestToken}` })
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    // If unauthorized, try to refresh token once
    if (response.status === 401 && requestToken) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        // Retry with new token
        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
            'Authorization': `Bearer ${newToken}`
          }
        });
        return retryResponse;
      }
    }

    return response;
  };

  return makeRequest(token);
};

export const learningApi = {
  generateFlashcards: async (data) => {
    try {
      const response = await authenticatedFetch(`${LEARNING_API_URL}/generate-flashcards`, {
        method: 'POST',
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`API returned ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Generate flashcards error:', error);
      throw error;
    }
  },

  generateQuiz: async (data) => {
    try {
      const response = await authenticatedFetch(`${LEARNING_API_URL}/generate-quiz`, {
        method: 'POST',
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`API returned ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Generate quiz error:', error);
      throw error;
    }
  },

  submitQuiz: async (data) => {
    try {
      const response = await authenticatedFetch(`${LEARNING_API_URL}/submit-quiz`, {
        method: 'POST',
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`API returned ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Submit quiz error:', error);
      throw error;
    }
  },

  updateFlashcardMastery: async (data) => {
    try {
      const response = await authenticatedFetch(`${LEARNING_API_URL}/update-flashcard-mastery`, {
        method: 'POST',
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`API returned ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Update mastery error:', error);
      throw error;
    }
  },

  getPreviousFlashcardSets: async (data) => {
    try {
      const response = await authenticatedFetch(`${LEARNING_API_URL}/flashcard-sets`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Get previous flashcard sets error:', error);
      throw error;
    }
  },

  getPreviousQuizAttempts: async (data) => {
    try {
      const response = await authenticatedFetch(`${LEARNING_API_URL}/quiz-attempts`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Get previous quiz attempts error:', error);
      throw error;
    }
  },

completeFlashcardSet: async (data) => {
  const response = await authenticatedFetch(
    `${LEARNING_API_URL}/complete-flashcard-set`,
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

  getFlashcardSetById: async (id) => {
    try {
      const response = await authenticatedFetch(`${LEARNING_API_URL}/flashcard-sets/${id}`, {
        method: 'GET'
      });
      return await response.json();
    } catch (error) {
      console.error('Get flashcard set error:', error);
      throw error;
    }
  },

  getQuizAttemptById: async (id) => {
    try {
      const response = await authenticatedFetch(`${LEARNING_API_URL}/quiz-attempts/${id}`, {
        method: 'GET'
      });
      return await response.json();
    } catch (error) {
      console.error('Get quiz attempt error:', error);
      throw error;
    }
  },
};