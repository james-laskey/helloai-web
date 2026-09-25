// services/api.js

const API_URL = 'https://helloapi-five.vercel.app';

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

    const response = await fetch(`${API_URL}/api/auth/refresh`, {
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

export const api = {
  // Start session with user preferences
  startSession: async (language, userId, topicId, topicName, topicConcept, topicExample, userPreferences) => {
    try {
      const response = await authenticatedFetch(`${API_URL}/api/session/start`, {
        method: 'POST',
        body: JSON.stringify({
          language,
          userId,
          topicId,
          topicName,
          topicConcept,
          topicExample,
          userPreferences
        })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Start session error:', error);
      return {
        message: `👋 Hello! I'm your ${language} tutor. Let's learn ${language} together! What would you like to practice?`
      };
    }
  },

  // Send message
  sendMessage: async (sessionId, userId, message, language, topic, conversationHistory) => {
    try {
      const response = await authenticatedFetch(`${API_URL}/api/chat`, {
        method: 'POST',
        body: JSON.stringify({
          sessionId,
          userId,
          message,
          language,
          topic: { id: topic.id, name: topic.name, concept: topic.concept },
          conversationHistory
        })
      });

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Send message error:', error);
      return "I'm having connection issues. Could you please repeat that?";
    }
  },

  endSession: async (sessionId, userId) => {
    try {
      await authenticatedFetch(`${API_URL}/api/session/end`, {
        method: 'POST',
        body: JSON.stringify({ sessionId, userId })
      });
    } catch (error) {
      console.error('End session error:', error);
    }
  },

  fetchStats: async (userId) => {
    try {
      const response = await authenticatedFetch(`${API_URL}/api/stats/${userId}`, {
        method: 'GET'
      });
      return await response.json();
    } catch (error) {
      console.error('Fetch stats error:', error);
      return null;
    }
  },

  // Learning API methods
  generateFlashcards: async (data) => {
    try {
      const response = await authenticatedFetch(`${API_URL}/api/learning/generate-flashcards`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Generate flashcards error:', error);
      throw error;
    }
  },

  generateQuiz: async (data) => {
    try {
      const response = await authenticatedFetch(`${API_URL}/api/learning/generate-quiz`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Generate quiz error:', error);
      throw error;
    }
  },

  submitQuiz: async (data) => {
    try {
      const response = await authenticatedFetch(`${API_URL}/api/learning/submit-quiz`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Submit quiz error:', error);
      throw error;
    }
  },

  updateFlashcardMastery: async (data) => {
    try {
      const response = await authenticatedFetch(`${API_URL}/api/learning/update-flashcard-mastery`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Update mastery error:', error);
      throw error;
    }
  },

  updateSessionActivity: async (sessionId, data) => {
    try {
      const response = await authenticatedFetch(`${API_URL}/api/session/activity`, {
        method: 'POST',
        body: JSON.stringify({
          sessionId,
          messageCount: data.messageCount,
          duration: data.duration
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Update session activity error:', error);
      return null;
    }
  }
};