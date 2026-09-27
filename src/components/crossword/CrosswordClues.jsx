import React from 'react';
import { MaterialIcon } from '../landing-page/icons';

export const CrosswordClues = ({
  clues,
  onSelectClue,
  selectedClueId,
  onRevealClue,
  revealedClueIds = new Set(),
  revealsDisabled = false,
}) => {
  const across = clues.filter((c) => c.direction === 'across');
  const down = clues.filter((c) => c.direction === 'down');

  const renderList = (list, label, icon) => (
    <div style={{ flex: 1, minWidth: '250px' }}>
      <div className="nb-flex nb-flex-center nb-gap-sm nb-mb-sm">
        <MaterialIcon name={icon} size={18} color="var(--nb-black)" />
        <h3 className="nb-heading nb-heading-sm" style={{ margin: 0 }}>
          {label}
        </h3>
      </div>
      <div className="nb-flex nb-flex-col nb-gap-sm">
        {list.map((clue) => {
          const isSelected = selectedClueId === clue.id;
          const isRevealed = revealedClueIds.has(clue.id);
          return (
            <div
              key={clue.id}
              className="nb-card nb-card-hover"
              style={{
                padding: 'var(--nb-space-sm)',
                background: isRevealed
                  ? 'var(--nb-orange)'
                  : isSelected
                  ? 'var(--nb-yellow)'
                  : 'var(--nb-white)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--nb-space-sm)',
              }}
            >
              <button
                onClick={() => onSelectClue(clue)}
                style={{
                  flex: 1,
                  textAlign: 'left',
                  cursor: 'pointer',
                  padding: 0,
                  border: 'none',
                  background: 'transparent',
                  fontFamily: 'var(--nb-font)',
                }}
              >
                <div
                  className="nb-flex nb-gap-sm"
                  style={{ alignItems: 'flex-start' }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      color: 'var(--nb-orange, #f97316)',
                      flexShrink: 0,
                    }}
                  >
                    {clue.number}.
                  </span>
                  <span className="nb-text-sm" style={{ lineHeight: 1.4 }}>
                    {clue.clue}
                  </span>
                  <span
                    className="nb-text-xs nb-text-muted"
                    style={{ marginLeft: 'auto', flexShrink: 0 }}
                  >
                    ({clue.length})
                  </span>
                </div>
              </button>

              {!isRevealed && onRevealClue && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRevealClue(clue);
                  }}
                  disabled={revealsDisabled}
                  className="nb-button"
                  title="Reveal answer"
                  style={{
                    padding: '4px 8px',
                    minWidth: 'auto',
                    fontSize: '0.75rem',
                    cursor: revealsDisabled ? 'not-allowed' : 'pointer',
                    opacity: revealsDisabled ? 0.5 : 1,
                  }}
                >
                  <MaterialIcon name="Visibility" size={14} color="var(--nb-black)" />
                </button>
              )}

              {isRevealed && (
                <MaterialIcon name="CheckCircle" size={18} color="var(--nb-black)" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="nb-card" style={{ background: 'var(--nb-white)' }}>
      <div className="nb-flex nb-gap-lg nb-flex-wrap">
        {renderList(across, 'Across', 'ArrowForward')}
        {renderList(down, 'Down', 'ArrowDownward')}
      </div>
    </div>
  );
};