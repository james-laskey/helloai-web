export const SECTION_COUNT_OPTIONS = [1, 2, 3, 4, 5, 6];
export const QUESTIONS_PER_SECTION_OPTIONS = [1, 2, 3, 4, 5, 6, 8];

export const DIFFICULTY_OPTIONS = [
  {
    value: 'easy',
    label: 'Easy',
    description: 'Simple sentences, common words',
    color: 'var(--nb-lime)',
  },
  {
    value: 'medium',
    label: 'Medium',
    description: 'Everyday textbook level',
    color: 'var(--nb-yellow)',
  },
  {
    value: 'hard',
    label: 'Hard',
    description: 'Richer vocabulary, longer prose',
    color: 'var(--nb-orange)',
  },
  {
    value: 'adaptive',
    label: 'Adaptive',
    description: 'Matches your saved proficiency level',
    color: 'var(--nb-cyan)',
  },
];