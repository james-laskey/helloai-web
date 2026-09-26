import React from 'react';

export const QuestionCard = ({
  question,
  questionIndex,
  selectedAnswer,
  submitted,
  onSelectAnswer,
}) => {
  return (
    <div>
      <p
        style={{
          fontWeight: 700,
          marginBottom: 'var(--nb-space-sm)',
        }}
      >
        {questionIndex + 1}. {question.question}
      </p>

      <div className="nb-flex nb-flex-col nb-gap-sm">
        {question.options.map((option) => {
          const selected = selectedAnswer === option;
          const isCorrect = option === question.correctAnswer;

          let bg = 'var(--nb-white)';
          if (submitted) {
            if (isCorrect) bg = 'var(--nb-lime)';
            else if (selected) bg = 'var(--nb-red)';
          } else if (selected) {
            bg = 'var(--nb-yellow)';
          }

          return (
            <button
              key={option}
              onClick={() => onSelectAnswer(questionIndex, option)}
              disabled={submitted}
              style={{
                padding: 'var(--nb-space-md)',
                background: bg,
                border: 'var(--nb-border)',
                boxShadow: selected ? 'var(--nb-shadow-sm)' : 'none',
                cursor: submitted ? 'default' : 'pointer',
                textAlign: 'left',
                fontFamily: 'var(--nb-font)',
                fontSize: '1rem',
                color:
                  submitted && selected && !isCorrect
                    ? 'var(--nb-white)'
                    : 'inherit',
              }}
            >
              {option}
            </button>
          );
        })}
      </div>

      {submitted && (
        <div
          style={{
            marginTop: 'var(--nb-space-sm)',
            padding: 'var(--nb-space-sm)',
            borderLeft: '4px solid var(--nb-black)',
            background: 'var(--nb-gray)',
          }}
        >
          <p className="nb-text-sm" style={{ margin: 0 }}>
            <strong>Why:</strong> {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
};