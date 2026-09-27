import React from 'react';
import { MaterialIcon } from '../landing-page/icons';

export const CrosswordWordBank = ({ bank, selectedWord, onSelectWord }) => {
  const entries = Object.entries(bank).sort(([a], [b]) => a.localeCompare(b));

  if (entries.length === 0) {
    return (
      <div className="nb-card nb-text-center" style={{ background: 'var(--nb-lime)' }}>
        <p className="nb-text" style={{ margin: 0, fontWeight: 700 }}>
          All words placed. Puzzle complete.
        </p>
      </div>
    );
  }

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
          {entries.reduce((sum, [, count]) => sum + count, 0)} words
        </span>
      </div>

      <div className="nb-flex nb-gap-sm nb-flex-wrap">
        {entries.map(([word, count]) => {
          const isSelected = selectedWord === word;
          return (
            <button
              key={word}
              onClick={() => onSelectWord(word)}
              className="nb-button"
              style={{
                background: isSelected ? 'var(--nb-yellow)' : 'var(--nb-white)',
                padding: 'var(--nb-space-sm) var(--nb-space-md)',
                fontWeight: 700,
                minWidth: 'auto',
                position: 'relative',
              }}
            >
              {word}
              {count > 1 && (
                <span
                  style={{
                    marginLeft: '6px',
                    fontSize: '0.75rem',
                    color: 'var(--nb-orange, #f97316)',
                  }}
                >
                  ×{count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selectedWord ? (
        <p className="nb-text-xs nb-text-muted nb-mt-md" style={{ margin: 0 }}>
          Click a cell to place <strong>{selectedWord}</strong>, or click the
          word again to deselect.
        </p>
      ) : (
        <p className="nb-text-xs nb-text-muted nb-mt-md" style={{ margin: 0 }}>
          Click a word, then click a cell to place it. Click a filled cell
          with no word selected to remove it.
        </p>
      )}
    </div>
  );
};