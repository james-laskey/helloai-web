import React from 'react';

export const CrosswordKeyboard = ({ availableWords, onCharSelect, onBackspace }) => {
  return (
    <div className="nb-card" style={{ background: 'var(--nb-white)' }}>
      <div className="nb-flex nb-gap-sm nb-flex-wrap">
        {availableWords.map((ch) => (
          <button
            key={ch}
            onClick={() => onCharSelect(ch)}
            className="nb-button"
            style={{
              minWidth: '44px',
              height: '44px',
              fontSize: '1.25rem',
              padding: 0,
            }}
          >
            {ch}
          </button>
        ))}
        <button
          onClick={onBackspace}
          className="nb-button nb-button-danger"
          style={{ minWidth: '60px', height: '44px' }}
        >
          Del
        </button>
      </div>
    </div>
  );
};