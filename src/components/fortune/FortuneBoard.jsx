import React from 'react';

const TILE_SIZE = 44;
const TILE_HEIGHT = 56;
const STAGGER_MS = 220;      // gap between successive cells
const COLOR_SHIFT_MS = 500;  // duration of the color-shift keyframe

/**
 * Wheel-of-Fortune-style letter board.
 *
 * Props:
 *   phrase     - string
 *   revealed   - array of 0/1, same length as phrase (1 = visible)
 *   revealBatch- optional { id, indices } describing the positions
 *                that were just flipped. Those cells animate in
 *                one-by-one with a color shift. Omit for no animation.
 */
export const FortuneBoard = ({ phrase, revealed, revealBatch }) => {
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

  const batchId = revealBatch?.id ?? 0;
  const batchSet = new Set(revealBatch?.indices ?? []);
  /* Map each index in the batch to its position in the batch, so we
     can stagger the animation in the order the cells appear on the
     board (left to right, top to bottom). */
  const batchOrder = new Map();
  (revealBatch?.indices ?? []).forEach((idx, pos) => {
    batchOrder.set(idx, pos);
  });

  return (
    <div
      className="nb-card"
      data-reveal-anim
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
      {/* Scoped keyframes. Placed inside the component so nothing
          outside the board is affected. */}
      <style>{`
        @keyframes fortuneRevealShift {
          0%   { background: var(--nb-yellow); transform: scale(1);   }
          45%  { background: var(--nb-lime);   transform: scale(1.15);}
          100% { background: var(--nb-white);  transform: scale(1);   }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-reveal-anim] .fortune-cell--animating {
            animation: none !important;
            background: var(--nb-white);
            transform: none;
          }
        }
      `}</style>

      {words.map((word, wi) => (
        <div
          key={wi}
          className="nb-flex nb-gap-sm"
          style={{ alignItems: 'flex-end' }}
        >
          {word.chars.map(({ ch, index }) => {
            const isSpace = ch === ' ' || ch === "'";
            const isRevealed = revealed[index] === 1;
            const isInBatch = isRevealed && batchSet.has(index);
            const orderInBatch = batchOrder.get(index) ?? 0;

            if (isSpace) {
              return (
                <div
                  key={index}
                  style={{ width: TILE_SIZE, height: TILE_HEIGHT }}
                />
              );
            }

            /* Animated cell: starts hidden and animates to revealed.
               The animationDelay uses orderInBatch so multiple cells
               appear one after another.
               The `key` includes batchId so React remounts the element
               for each new batch — this is what makes the CSS animation
               retrigger every time, even if the same index gets
               revealed in a different context. */
            if (isInBatch) {
              const delay = orderInBatch * STAGGER_MS;
              return (
                <div
                  key={`${index}-${batchId}`}
                  className="fortune-cell--animating"
                  style={{
                    width: TILE_SIZE,
                    height: TILE_HEIGHT,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--nb-yellow)',
                    border: '3px solid var(--nb-black)',
                    boxShadow: '3px 3px 0 var(--nb-black)',
                    fontSize: 26,
                    fontWeight: 800,
                    color: 'var(--nb-black)',
                    fontFamily: 'var(--nb-font)',
                    textTransform: 'uppercase',
                    userSelect: 'none',
                    lineHeight: 1,
                    animation: `fortuneRevealShift ${COLOR_SHIFT_MS}ms ease-out ${delay}ms both`,
                  }}
                  aria-label={ch.toUpperCase()}
                >
                  {ch.toUpperCase()}
                </div>
              );
            }

            /* Static cell (already revealed from a previous guess, or
               still hidden). */
            return (
              <div
                key={index}
                style={{
                  width: TILE_SIZE,
                  height: TILE_HEIGHT,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isRevealed
                    ? 'var(--nb-white)'
                    : 'var(--nb-yellow)',
                  border: '3px solid var(--nb-black)',
                  boxShadow: isRevealed
                    ? '3px 3px 0 var(--nb-black)'
                    : '2px 2px 0 var(--nb-black)',
                  fontSize: 26,
                  fontWeight: 800,
                  color: 'var(--nb-black)',
                  fontFamily: 'var(--nb-font)',
                  textTransform: 'uppercase',
                  userSelect: 'none',
                  lineHeight: 1,
                  transition: 'background 150ms ease, box-shadow 150ms ease',
                }}
                aria-label={isRevealed ? ch.toUpperCase() : 'hidden letter'}
              >
                {isRevealed ? ch.toUpperCase() : <span aria-hidden="true">·</span>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};