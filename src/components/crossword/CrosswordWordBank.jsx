import React from 'react';
import { MaterialIcon } from '../landing-page/icons';

export const CrosswordWordBank = ({
  words,
  selectedWord,
  onSelectWord,
  placedWords = new Set(),   // words already placed correctly
  disabled = false,
}) => {
  return (
    <div className="nb-card" style={{ background: 'var(--nb-white)' }}>
      <div className="nb-flex nb-flex-center nb-gap-sm nb-mb-md">
        <MaterialIcon name="Abc" size={20} color="var(--nb-black)" />
        <h3 className="nb-heading nb-heading-sm" style={{ margin: 0 }}>
          Word Bank
        </h3>
        <span
          className="nb-badge"
          style={{ background: 'var(--nb-cyan)', marginLeft: 'auto' }}
        >
          {words.length} words
        </span>
      </div>

      <div
        className="nb-flex nb-gap-sm nb-flex-wrap"
        style={{ alignItems: 'flex-start' }}
      >
        {words.map((word) => {
          const isSelected = selectedWord === word;
          const isPlaced = placedWords.has(word);

          let bg = 'var(--nb-white)';
          if (isSelected) bg = 'var(--nb-yellow)';
          else if (isPlaced) bg = 'var(--nb-lime)';

          return (
            <button
              key={word}
              onClick={() => !disabled && onSelectWord(isSelected ? null : word)}
              disabled={disabled}
              className="nb-button"
              style={{
                background: bg,
                padding: 'var(--nb-space-sm) var(--nb-space-md)',
                fontWeight: 700,
                opacity: isPlaced && !isSelected ? 0.6 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
                minWidth: 'auto',
                textDecoration: isPlaced ? 'line-through' : 'none',
              }}
            >
              {word}
            </button>
          );
        })}
      </div>

      {selectedWord && (
        <p className="nb-text-xs nb-text-muted nb-mt-md" style={{ margin: 0 }}>
          Click a cell in the grid to place <strong>{selectedWord}</strong>.
        </p>
      )}
    </div>
  );
};