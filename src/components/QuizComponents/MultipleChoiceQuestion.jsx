import React from 'react';

export const MultipleChoiceQuestion = ({
  question,
  selected,
  submitted,
  onSelect,
}) => {
  return (
    <div>
      <p style={{ fontWeight: 700, marginBottom: 'var(--nb-space-sm)' }}>
        {question.question}
      </p>

      <div className="nb-flex nb-flex-col nb-gap-sm">
        {question.options.map((option) => {
          const isSelected = selected === option;
          const isCorrect = option === question.correctAnswer;

          let bg = 'var(--nb-white)';
          if (submitted) {
            if (isCorrect) bg = 'var(--nb-lime)';
            else if (isSelected) bg = 'var(--nb-red)';
          } else if (isSelected) {
            bg = 'var(--nb-yellow)';
          }

          return (
            <button
              key={option}
              type="button"
              onClick={() => !submitted && onSelect(option)}
              disabled={submitted}
              style={{
                padding: 'var(--nb-space-md)',
                background: bg,
                border: 'var(--nb-border)',
                boxShadow: isSelected ? 'var(--nb-shadow-sm)' : 'none',
                cursor: submitted ? 'default' : 'pointer',
                textAlign: 'left',
                fontFamily: 'var(--nb-font)',
                fontSize: '1rem',
                color:
                  submitted && isSelected && !isCorrect
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

/**
 * Whether the answer is correct. `selected` is the chosen option
 * string (or undefined). Used by the section quiz for scoring.
 */
export function isMultipleChoiceCorrect(question, selected) {
  return selected === question.correctAnswer;
}