import React, { useState } from 'react';
import { TranslationTooltip } from './TranslationTooltip';

export const FlashcardComponent = ({
  flashcards,
  onComplete,
  onUpdateMastery,
  nativeLanguage = 'English',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState([]);
  const [unknownCards, setUnknownCards] = useState([]);
  const [completed, setCompleted] = useState(false);

  const currentCard = flashcards[currentIndex];
  const totalCards = flashcards.length;
  const progress = ((currentIndex + 1) / totalCards) * 100;

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const handleKnown = () => {
    setKnownCards([...knownCards, currentCard]);
    onUpdateMastery(currentIndex, true);
    nextCard();
  };

  const handleUnknown = () => {
    setUnknownCards([...unknownCards, currentCard]);
    onUpdateMastery(currentIndex, false);
    nextCard();
  };

  const nextCard = () => {
    if (currentIndex + 1 < totalCards) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      setCompleted(true);
      onComplete(knownCards.length + 1, totalCards);
    }
  };

  if (completed) {
    const score = Math.round((knownCards.length / totalCards) * 100);
    return (
      <div className="nb-card nb-text-center">
        <div style={{ fontSize: '4rem', marginBottom: 'var(--nb-space-md)' }}>🎉</div>
        <h2 className="nb-heading nb-heading-lg nb-mb-lg">Session Complete!</h2>

        <div className="nb-grid nb-grid-3 nb-mb-lg">
          <div className="nb-card" style={{ background: 'var(--nb-lime)' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700' }}>{knownCards.length}</div>
            <div className="nb-text-sm">Known</div>
          </div>
          <div className="nb-card" style={{ background: 'var(--nb-orange)' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700' }}>{unknownCards.length}</div>
            <div className="nb-text-sm">Review Later</div>
          </div>
          <div className="nb-card" style={{ background: 'var(--nb-cyan)' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700' }}>{score}%</div>
            <div className="nb-text-sm">Mastery</div>
          </div>
        </div>

        <button className="nb-button nb-button-primary" onClick={onComplete}>
          Continue Learning
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* Progress */}
      <div className="nb-mb-lg">
        <div
          style={{
            height: '12px',
            background: 'var(--nb-white)',
            border: '2px solid var(--nb-black)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: 'var(--nb-lime)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
        <p className="nb-text-sm nb-text-center nb-mt-sm">
          Card {currentIndex + 1} of {totalCards}
        </p>
      </div>

      {/* Card */}
      <div
        onClick={flipCard}
        className="nb-card nb-card-hover"
        style={{
          minHeight: '300px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          background: isFlipped ? 'var(--nb-cyan)' : 'var(--nb-white)',
          transition: 'all 0.3s ease',
          position: 'relative',
        }}
      >
        {!isFlipped ? (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--nb-space-sm)',
                justifyContent: 'center',
                flexWrap: 'wrap',
                marginBottom: 'var(--nb-space-md)',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <h2
                  className="nb-heading nb-heading-lg nb-text-center"
                  style={{ margin: 0 }}
                >
                  {currentCard.front}
                </h2>
                {currentCard.romanization && (
                  <p
                    className="nb-text-sm"
                    style={{
                      margin: '4px 0 0',
                      color: '#888',
                      fontWeight: 500,
                      letterSpacing: '0.02em',
                    }}
                  >
                    {currentCard.romanization}
                  </p>
                )}
              </div>
              <TranslationTooltip
                translation={currentCard.translation || currentCard.back}
                nativeLanguage={nativeLanguage}
                placement="right"
              />
            </div>
            <p className="nb-text-sm nb-text-muted nb-mt-lg">Tap to flip</p>
          </>
        ) : (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--nb-space-sm)',
                justifyContent: 'center',
                marginBottom: 'var(--nb-space-md)',
              }}
            >
              <p
                className="nb-text nb-text-center"
                style={{ margin: 0 }}
              >
                {currentCard.back}
              </p>
              {currentCard.translation && currentCard.translation !== currentCard.back && (
                <TranslationTooltip
                  translation={currentCard.translation}
                  nativeLanguage={nativeLanguage}
                  placement="right"
                  size={16}
                />
              )}
            </div>
            {currentCard.example && (
              <div
                style={{
                  background: 'var(--nb-dark-gray)',
                  color: 'var(--nb-white)',
                  padding: 'var(--nb-space-md)',
                  border: '2px solid var(--nb-black)',
                  marginTop: 'var(--nb-space-md)',
                }}
              >
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: 'var(--nb-lime)',
                    marginBottom: 'var(--nb-space-xs)',
                  }}
                >
                  Example:
                </div>
                <p style={{ fontStyle: 'italic', margin: 0 }}>"{currentCard.example}"</p>
                  {currentCard.exampleRomanization && (
                    <p
                      style={{
                        fontStyle: 'italic',
                        margin: '4px 0 0',
                        color: '#999',
                        fontSize: '0.85rem',
                        fontWeight: 400,
                      }}
                    >
                      {currentCard.exampleRomanization}
                    </p>
                  )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Buttons */}
      {isFlipped && (
        <div className="nb-flex nb-gap-md nb-mt-lg">
          <button
            onClick={handleUnknown}
            className="nb-button nb-button-danger"
            style={{ flex: 1 }}
          >
            ✕ Needs Review
          </button>
          <button
            onClick={handleKnown}
            className="nb-button nb-button-success"
            style={{ flex: 1 }}
          >
            ✓ I Know This
          </button>
        </div>
      )}
    </div>
  );
};