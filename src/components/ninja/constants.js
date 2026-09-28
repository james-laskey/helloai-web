// src/components/ninja/constants.js

export const QUESTION_COUNT_OPTIONS = [10, 15, 20, 25];

export const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy', description: 'Short common words', color: 'var(--nb-lime)' },
  { value: 'medium', label: 'Medium', description: 'Everyday vocabulary', color: 'var(--nb-yellow)' },
  { value: 'hard', label: 'Hard', description: 'Longer, less common words', color: 'var(--nb-orange)' },
];

// Seconds per question, indexed by how many questions are in the round.
// Shorter rounds give more time per question.
export const TIME_PER_QUESTION_BY_COUNT = {
  10: 20,
  15: 18,
  20: 15,
  25: 12,
  50: 10,
};

export function timeForQuestion(questionCount) {
  return TIME_PER_QUESTION_BY_COUNT[questionCount] ?? 15;
}

export const STARTING_LIVES = 3;
export const SCORE_CORRECT = 100;
export const COMBO_BONUS = 25;

// src/components/ninja/constants.js

export const TIMER_OPTIONS = [10, 15, 20, 25, 30, 40, 60];

export const DEFAULT_TIMER_SECONDS = 20;



// Stagger between word spawns within a single question. Must be small
// enough that the last word still has time to fall before the question
// timer expires.
export const SPAWN_STAGGER_MS = 350;