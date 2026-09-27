import React from 'react';
import { MaterialIcon } from '../landing-page/icons';

export const CrosswordClues = ({ clues, onSelectClue, selectedClueId }) => {
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
          return (
            <button
              key={clue.id}
              onClick={() => onSelectClue(clue)}
              className="nb-card nb-card-hover"
              style={{
                textAlign: 'left',
                cursor: 'pointer',
                padding: 'var(--nb-space-sm)',
                fontFamily: 'var(--nb-font)',
                background: isSelected ? 'var(--nb-yellow)' : 'var(--nb-white)',
              }}
            >
              <div className="nb-flex nb-gap-sm" style={{ alignItems: 'flex-start' }}>
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