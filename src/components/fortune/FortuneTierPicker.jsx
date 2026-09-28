import React from 'react';
import { SCORE_TIERS, tierValue } from './constants';

export const FortuneTierPicker = ({
  selectedTier,
  onSelectTier,
  disabled,
  currentScore,
}) => {
  return (
    <div className="nb-card" style={{ background: 'var(--nb-white)' }}>
      <div className="nb-flex nb-flex-center nb-gap-sm nb-mb-md">
        <h3 className="nb-heading nb-heading-sm" style={{ margin: 0 }}>
          Pick your score tier
        </h3>
      </div>

      <div className="nb-flex nb-gap-sm nb-flex-wrap">
        {SCORE_TIERS.map((tier) => {
          const selected = selectedTier === tier;
          const wouldExceed = tier > currentScore;
          return (
            <button
              key={tier}
              onClick={() => onSelectTier(tier)}
              disabled={disabled}
              className="nb-button"
              style={{
                minWidth: '80px',
                padding: 'var(--nb-space-sm) var(--nb-space-md)',
                background: selected ? 'var(--nb-yellow)' : 'var(--nb-white)',
                fontWeight: 700,
                opacity: disabled ? 0.5 : 1,
                borderColor: wouldExceed ? 'var(--nb-red)' : undefined,
              }}
            >
              {tier}
            </button>
          );
        })}
      </div>

      {selectedTier && (
        <p className="nb-text-sm nb-text-muted nb-mt-md" style={{ margin: 0 }}>
          Correct guess: <strong>+{selectedTier}</strong> per occurrence.
          Wrong guess: <strong>-{selectedTier}</strong>. Vowels count as{' '}
          <strong>{tierValue(selectedTier, 'a')}</strong>.
        </p>
      )}
    </div>
  );
};