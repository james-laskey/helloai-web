// src/components/fortune/constants.js

export const PUZZLE_COUNT_OPTIONS = [1, 3, 5, 10];

export const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy', description: 'Short familiar phrases', color: 'var(--nb-lime)' },
  { value: 'medium', label: 'Medium', description: 'Everyday sentences', color: 'var(--nb-yellow)' },
  { value: 'hard', label: 'Hard', description: 'Longer, richer phrases', color: 'var(--nb-orange)' },
];

// Score tiers in ascending risk. The player picks one before each guess.
// Bigger tiers mean bigger rewards and bigger losses.
export const SCORE_TIERS = [100, 250, 500, 1000, 1500, 2000];

// Vowels are halved on guess. This mirrors the real Wheel of Fortune
// rule and prevents players from trivially buying vowels for free.
export const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

export const STARTING_SCORE = 2000;
export const SOLVE_BONUS_PER_LETTER = 500;

export function tierValue(tier, letter) {
  const base = tier;
  if (!letter) return base;
  return VOWELS.has(letter.toLowerCase()) ? Math.floor(base / 2) : base;
}