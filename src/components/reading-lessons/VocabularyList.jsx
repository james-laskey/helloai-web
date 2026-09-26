import React from 'react';
import { MaterialIcon } from '../landing-page/icons';

export const VocabularyList = ({
  vocabulary,
  onWordClick,
  isMuted,
}) => {
  if (!vocabulary.length) return null;

  return (
    <div className="nb-card" style={{ background: 'var(--nb-white)' }}>
      <h3 className="nb-heading nb-heading-sm nb-mb-md">
        <MaterialIcon name="Style" size={20} color="var(--nb-black)" /> Key
        Vocabulary
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 'var(--nb-space-md)',
        }}
      >
        {vocabulary.map((vocab, index) => (
          <div
            key={index}
            className="nb-flex nb-flex-between nb-flex-center"
            style={{
              padding: 'var(--nb-space-md)',
              background: 'var(--nb-cyan)',
              border: 'var(--nb-border)',
              boxShadow: 'var(--nb-shadow-sm)',
              gap: 'var(--nb-space-sm)',
            }}
          >
            <div>
              <p style={{ margin: 0, fontWeight: 700 }}>{vocab.word}</p>
              <p className="nb-text-sm" style={{ margin: 0, opacity: 0.75 }}>
                {vocab.translation}
              </p>
            </div>
            <button
              className="nb-button"
              style={{ padding: '6px 10px' }}
              onClick={() => onWordClick(index, vocab.word)}
              disabled={isMuted}
              aria-label={`Play ${vocab.word}`}
            >
              <MaterialIcon
                name="VolumeUp"
                size={18}
                color="var(--nb-black)"
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};