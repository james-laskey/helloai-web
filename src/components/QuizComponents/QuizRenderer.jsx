import React from 'react';
import {
  MultipleChoiceQuestion,
  isMultipleChoiceCorrect,
} from './MultipleChoiceQuestion';
import { FillBlankQuestion, isFillBlankCorrect } from './FillBlankQuestion';
import {
  MatchingQuestion,
  isMatchingCorrect,
  matchingPartialScore,
} from './MatchingQuestion';

export const QuizRenderer = ({ question, value, submitted, onChange }) => {
  if (!question) return null;

  switch (question.type) {
    case 'multiple-choice':
      return (
        <MultipleChoiceQuestion
          question={question}
          selected={value}
          submitted={submitted}
          onSelect={onChange}
        />
      );
    case 'fill-blank':
      return (
        <FillBlankQuestion
          question={question}
          value={value}
          submitted={submitted}
          onChange={onChange}
        />
      );
    case 'matching':
      return (
        <MatchingQuestion
          question={question}
          value={value}
          submitted={submitted}
          onChange={onChange}
        />
      );
    default:
      return (
        <p className="nb-text-sm nb-text-muted">
          Unsupported question type: {String(question.type)}
        </p>
      );
  }
};

export function isAnswerCorrect(question, value) {
  if (!question) return false;
  switch (question.type) {
    case 'multiple-choice':
      return isMultipleChoiceCorrect(question, value);
    case 'fill-blank':
      return isFillBlankCorrect(question, value);
    case 'matching':
      return isMatchingCorrect(question, value);
    default:
      return false;
  }
}

/**
 * Grades a whole section.
 *
 *   keys - optional array of answer keys, one per question, in the
 *          same order as section.questions. When omitted, each
 *          question is keyed with questionKey(question) (legacy).
 *          The quiz player passes index-based keys so duplicate
 *          question text can't collide.
 */
export function gradeSection(section, answers, keys) {
  const questions = section.questions || [];
  let earned = 0;
  let correct = 0;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const key = keys ? keys[i] : questionKey(q);
    const value = answers?.[key];

    if (q.type === 'matching') {
      const partial = matchingPartialScore(q, value);
      const denom = q.pairs.length || 1;
      earned += partial / denom;
      if (partial === denom) correct += 1;
    } else {
      if (isAnswerCorrect(q, value)) {
        earned += 1;
        correct += 1;
      }
    }
  }

  const total = questions.length;
  return {
    score: total > 0 ? earned / total : 0,
    correct,
    total,
  };
}

export function questionKey(question) {
  return question.type === 'matching' ? question.prompt : question.question;
}