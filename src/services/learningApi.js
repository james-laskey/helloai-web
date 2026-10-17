// services/learningApi.js

import { authenticatedFetch, LEARNING_API_URL } from './authFetch';

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