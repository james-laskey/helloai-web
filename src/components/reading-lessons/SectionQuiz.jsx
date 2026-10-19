import React from 'react';
import {
  QuizRenderer,
  gradeSection,
  questionKey,
} from '../QuizComponents/QuizRenderer';

/**
 * One section's quiz.
 *
 * Props:
 *   section       - the ReadingSection ({ id, heading, questions, ... })
 *   answers       - object keyed by questionKey(question) -> answer value
 *   onAnswerChange- (key, value) => void
 *   submitted     - whether this section has been graded
 *   onSubmit      - () => void  (called when the user clicks Submit)
 *   onGraded      - (result: { score, correct, total }) => void
 *                   called after submit so the parent can aggregate
 */
export const SectionQuiz = ({
  section,
  answers,
  onAnswerChange,
  submitted,
  onSubmit,
  onGraded,
}) => {
  const questions = section.questions || [];

  if (questions.length === 0) {
    return (
      <p className="nb-text-sm nb-text-muted">
        No questions for this section.
      </p>
    );
  }

  const allAnswered = questions.every((q) => {
    const v = answers?.[questionKey(q)];
    if (q.type === 'matching') {
      // All pairs must be paired.
      return v && Object.keys(v).length === q.pairs.length;
    }
    return typeof v === 'string' && v.trim().length > 0;
  });

  const handleSubmit = () => {
    const result = gradeSection(section, answers);
    onGraded?.(result);
    onSubmit?.();
  };

  return (
    <div>
      <div className="nb-flex nb-flex-col nb-gap-lg">
        {questions.map((q, i) => {
          const key = questionKey(q);
          return (
            <div key={key}>
              <p
                className="nb-text-xs nb-text-muted"
                style={{ margin: '0 0 6px', fontWeight: 700 }}
              >
                Question {i + 1}
              </p>
              <QuizRenderer
                question={q}
                value={answers?.[key]}
                submitted={submitted}
                onChange={(val) => onAnswerChange?.(key, val)}
              />
            </div>
          );
        })}
      </div>

      <div className="nb-flex nb-gap-sm nb-mt-lg">
        {!submitted ? (
          <button
            className="nb-button nb-button-primary nb-button-full"
            onClick={handleSubmit}
            disabled={!allAnswered}
          >
            Submit Section
          </button>
        ) : (
          <div
            className="nb-card nb-text-center nb-button-full"
            style={{ background: 'var(--nb-lime)', padding: 'var(--nb-space-md)' }}
          >
            <p style={{ margin: 0, fontWeight: 700 }}>
              Section graded
            </p>
          </div>
        )}
      </div>
    </div>
  );
};