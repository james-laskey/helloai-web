import React from 'react';

const norm = (s) =>
  String(s || '')
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:'"]/g, '');

export const FillBlankQuestion = ({
  question,
  value,
  submitted,
  onChange,
}) => {
  const isCorrect = submitted && norm(value) === norm(question.answer);
  const showWrong = submitted && !isCorrect;

  return (
    <div>
      <p style={{ fontWeight: 600, marginBottom: 'var(--nb-space-sm)' }}>
        Fill in the blank:
      </p>

      <p
        style={{
          fontFamily: 'var(--nb-font)',
          fontSize: '1.05rem',
          lineHeight: 1.6,
          marginBottom: 'var(--nb-space-md)',
        }}
      >
        {question.sentence.split('___').map((part, i, arr) => (
          <React.Fragment key={i}>
            {part}
            {i < arr.length - 1 && (
              <input
                type="text"
                value={value || ''}
                onChange={(e) => !submitted && onChange(e.target.value)}
                disabled={submitted}
                aria-label="Fill in the blank"
                style={{
                  display: 'inline-block',
                  minWidth: '90px',
                  width: 'auto',
                  padding: '2px 8px',
                  margin: '0 4px',
                  border: '2px solid var(--nb-black)',
                  background: submitted
                    ? isCorrect
                      ? 'var(--nb-lime)'
                      : 'var(--nb-red)'
                    : 'var(--nb-white)',
                  color: submitted && !isCorrect ? 'var(--nb-white)' : 'inherit',
                  fontFamily: 'var(--nb-font)',
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              />
            )}
          </React.Fragment>
        ))}
      </p>

      {question.hint && !submitted && (
        <p className="nb-text-xs nb-text-muted" style={{ marginTop: 0 }}>
          Hint: {question.hint}
        </p>
      )}

      {submitted && (
        <div
          style={{
            padding: 'var(--nb-space-sm)',
            borderLeft: '4px solid var(--nb-black)',
            background: 'var(--nb-gray)',
          }}
        >
          <p className="nb-text-sm" style={{ margin: 0 }}>
            <strong>Answer:</strong> {question.answer}
          </p>
          <p className="nb-text-sm" style={{ margin: 0 }}>
            <strong>Why:</strong> {question.explanation}
          </p>
        </div>
      )}

      {showWrong && (
        <p className="nb-text-xs nb-text-muted" style={{ margin: '4px 0 0' }}>
          Your answer: {value || '(empty)'}
        </p>
      )}
    </div>
  );
};

export function isFillBlankCorrect(question, value) {
  return norm(value) === norm(question.answer);
}