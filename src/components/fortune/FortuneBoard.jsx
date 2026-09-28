import React from 'react';

export const FortuneBoard = ({ phrase, revealed }) => {
  // Group characters into words so we can wrap properly and only break
  // between words, not inside them.
  const words = [];
  let current = [];

  for (let i = 0; i < phrase.length; i++) {
    const ch = phrase[i];
    if (ch === ' ') {
      if (current.length > 0) {
        words.push({ start: i - current.length, chars: current });
        current = [];
      }
    } else {
      current.push({ ch, index: i });
    }
  }
  if (current.length > 0) {
    words.push({ start: phrase.length - current.length, chars: current });
  }

  return (
    <div
      className="nb-card"
      style={{
        background: 'var(--nb-dark-gray)',
        padding: 'var(--nb-space-lg)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 'var(--nb-space-lg)',
        minHeight: '200px',
        alignItems: 'center',
      }}
    >
      {words.map((word, wi) => (
        <div
          key={wi}
          className="nb-flex nb-gap-sm"
          style={{ alignItems: 'flex-end' }}
        >
          {word.chars.map(({ ch, index }) => {
            const isRevealed = revealed[index] === 1;
            return (
              <div
                key={index}
                style={{
                  width: '36px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderBottom: '3px solid var(--nb-white)',
                  fontSize: '28px',
                  fontWeight: 700,
                  color: 'var(--nb-white)',
                  fontFamily: 'var(--nb-font)',
                  textTransform: 'uppercase',
                  userSelect: 'none',
                }}
              >
                {isRevealed ? ch.toUpperCase() : ''}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};