import React from 'react';
import { MaterialIcon } from '../landing-page/icons';
import { QuestionCard } from './QuestionCard';

export const ComprehensionQuiz = ({
  questions,
  answers,
  submitted,
  onSelectAnswer,
  onSubmit,
  onContinue,
}) => {
  if (!questions.length) return null;

  const allAnswered = questions.every((_, i) => answers[i]);

  return (
    <div className="nb-card" style={{ background: 'var(--nb-white)' }}>
      <h3 className="nb-heading nb-heading-sm nb-mb-md">
        <MaterialIcon name="Quiz" size={20} color="var(--nb-black)" /> Check
        Your Understanding
      </h3>

      <div className="nb-flex nb-flex-col nb-gap-lg">
        {questions.map((q, i) => (
          <QuestionCard
            key={i}
            question={q}
            questionIndex={i}
            selectedAnswer={answers[i]}
            submitted={submitted}
            onSelectAnswer={onSelectAnswer}
          />
        ))}
      </div>

      <div className="nb-flex nb-gap-sm nb-mt-lg">
        {!submitted ? (
          <button
            className="nb-button nb-button-primary nb-button-full"
            onClick={onSubmit}
            disabled={!allAnswered}
          >
            Submit Answers
          </button>
        ) : (
          <button
            className="nb-button nb-button-success nb-button-full"
            onClick={onContinue}
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
};