import React from 'react';
import { MaterialIcon } from '../landing-page/icons';

export const PassageViewer = ({
  sentences,
  activeSentenceIndex,
  onSentenceClick,
  isMuted,
}) => {
  return (
    <div className="nb-card" style={{ background: 'var(--nb-white)' }}>
      <h3 className="nb-heading nb-heading-sm nb-mb-md">
        <MaterialIcon name="MenuBook" size={20} color="var(--nb-black)" />{' '}
        Read Along
      </h3>

      <div className="nb-flex nb-flex-col nb-gap-sm">
        {sentences.map((sentence, index) => {
          const isActive = activeSentenceIndex === index;
          return (
            <button
              key={index}
              onClick={() => onSentenceClick(index)}
              disabled={isMuted}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--nb-space-md)',
                padding: 'var(--nb-space-md)',
                background: isActive ? 'var(--nb-yellow)' : 'var(--nb-gray)',
                border: 'var(--nb-border)',
                boxShadow: isActive ? 'var(--nb-shadow-sm)' : 'none',
                cursor: isMuted ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                fontFamily: 'var(--nb-font)',
                transition: 'background 0.15s ease',
              }}
            >
              <MaterialIcon
                name={isActive ? 'VolumeUp' : 'PlayCircle'}
                size={22}
                color="var(--nb-black)"
              />
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: '1.05rem',
                    fontWeight: 600,
                    lineHeight: 1.4,
                  }}
                >
                  {sentence.text}
                </p>
                {sentence.translation && (
                  <p
                    className="nb-text-sm nb-text-muted"
                    style={{ margin: '4px 0 0' }}
                  >
                    {sentence.translation}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};