import React, { useState } from 'react';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const MatchingBoard = ({ question, value, submitted, onChange }) => {
  // Right column is shuffled once per mount. The parent remounts this
  // component when the question changes by using a key, so no memo or
  // eslint-disable is needed.
  const [rightItems] = useState(() => shuffle(question.pairs.map((p) => p.right)));
  const [activeLeft, setActiveLeft] = useState(null);

  const selections = value || {};
  const usedRights = new Set(Object.values(selections));

  const handleLeftClick = (left) => {
    if (submitted) return;
    setActiveLeft((prev) => (prev === left ? null : left));
  };

  const handleRightClick = (right) => {
    if (submitted) return;
    if (!activeLeft) return;

    const next = { ...selections };
    for (const k of Object.keys(next)) {
      if (next[k] === right) delete next[k];
    }
    next[activeLeft] = right;
    onChange(next);
    setActiveLeft(null);
  };

  const pairStatus = (left) => {
    if (!submitted) return 'unsubmitted';
    const chosen = selections[left];
    const correctRight = question.pairs.find((p) => p.left === left)?.right;
    return chosen === correctRight ? 'correct' : 'wrong';
  };

  return (
    <>
      <p style={{ fontWeight: 600, marginBottom: 'var(--nb-space-md)' }}>
        {question.prompt}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--nb-space-md)',
        }}
      >
        <div className="nb-flex nb-flex-col nb-gap-sm">
          {question.pairs.map((p) => {
            const chosen = selections[p.left];
            const active = activeLeft === p.left;
            const status = pairStatus(p.left);
            let bg = 'var(--nb-white)';
            if (status === 'correct') bg = 'var(--nb-lime)';
            else if (status === 'wrong') bg = 'var(--nb-red)';
            else if (active) bg = 'var(--nb-yellow)';
            else if (chosen) bg = 'var(--nb-cyan)';

            return (
              <button
                key={p.left}
                type="button"
                onClick={() => handleLeftClick(p.left)}
                disabled={submitted}
                style={{
                  padding: 'var(--nb-space-md)',
                  background: bg,
                  border: 'var(--nb-border)',
                  boxShadow: active ? 'var(--nb-shadow-hover)' : 'none',
                  cursor: submitted ? 'default' : 'pointer',
                  textAlign: 'left',
                  fontFamily: 'var(--nb-font)',
                  fontWeight: 600,
                }}
              >
                {p.left}
                {chosen && (
                  <div className="nb-text-xs" style={{ opacity: 0.8, marginTop: 4 }}>
                    → {chosen}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="nb-flex nb-flex-col nb-gap-sm">
          {rightItems.map((right) => {
            const used = usedRights.has(right);
            return (
              <button
                key={right}
                type="button"
                onClick={() => handleRightClick(right)}
                disabled={submitted || !activeLeft || used}
                style={{
                  padding: 'var(--nb-space-md)',
                  background: used ? 'var(--nb-gray)' : 'var(--nb-white)',
                  border: 'var(--nb-border)',
                  cursor: submitted || !activeLeft || used ? 'default' : 'pointer',
                  textAlign: 'left',
                  fontFamily: 'var(--nb-font)',
                  opacity: used ? 0.6 : 1,
                }}
              >
                {right}
              </button>
            );
          })}
        </div>
      </div>

      {!submitted && (
        <p className="nb-text-xs nb-text-muted nb-mt-sm" style={{ margin: 0 }}>
          {activeLeft
            ? 'Now pick the matching item on the right.'
            : 'Tap an item on the left, then its match on the right.'}
        </p>
      )}

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
    </>
  );
};

export const MatchingQuestion = ({ question, value, submitted, onChange }) => (
  <MatchingBoard
    key={question.prompt}
    question={question}
    value={value}
    submitted={submitted}
    onChange={onChange}
  />
);

export function isMatchingCorrect(question, selections) {
  if (!selections) return false;
  return question.pairs.every((p) => selections[p.left] === p.right);
}

export function matchingPartialScore(question, selections) {
  if (!selections) return 0;
  return question.pairs.reduce(
    (n, p) => n + (selections[p.left] === p.right ? 1 : 0),
    0
  );
}