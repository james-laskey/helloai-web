import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SCORE_TIERS, tierValue } from './constants';

/* Wheel segment colors, cycled per tier. */
const SEGMENT_COLORS = [
  'var(--nb-yellow)',
  'var(--nb-cyan)',
  'var(--nb-lime)',
  'var(--nb-orange)',
  'var(--nb-pink)',
  'var(--nb-purple)',
  'var(--nb-green)',
  'var(--nb-red)',
];

const SPIN_DURATION_MS = 2600;
const MIN_ROTATIONS = 4;
const MAX_ROTATIONS = 7;
const POPUP_HOLD_MS = 1200;
const POPUP_FADE_MS = 300;

/**
 * Wheel-of-Fortune-style tier picker, rendered as a fixed bottom-center
 * FAB. Spinning is done by clicking the wheel itself; a "Spin" label
 * sits on the center hub. After a spin lands, the wheel stays disabled
 * until the parent clears `selectedTier` (i.e. until the player makes a
 * guess). The tier that lands is shown in a center-screen popup that
 * fades on its own.
 *
 * Props (unchanged from the previous version):
 *   selectedTier   - tier chosen by the last spin (null when the
 *                    player has already used it on a guess)
 *   onSelectTier   - called with the landed tier once the wheel stops
 *   disabled       - disables the spin action entirely
 *   currentScore   - unused visually, kept for contract compatibility
 */
export const FortuneWheel = ({
  selectedTier,
  onSelectTier,
  disabled,
  currentScore,
}) => {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const spinEndTimer = useRef(null);

  const [popupTier, setPopupTier] = useState(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const popupHideTimer = useRef(null);
  const popupClearTimer = useRef(null);

  const segmentCount = SCORE_TIERS.length;
  const sliceAngle = 360 / segmentCount;

  /* Clear timers on unmount. */
  useEffect(() => {
    return () => {
      if (spinEndTimer.current) clearTimeout(spinEndTimer.current);
      if (popupHideTimer.current) clearTimeout(popupHideTimer.current);
      if (popupClearTimer.current) clearTimeout(popupClearTimer.current);
    };
  }, []);

  /* If the parent clears the tier (e.g. after a guess), the wheel is
     free to spin again. The popup, if any, disappears at the same
     time — the player has already seen it. */
  useEffect(() => {
    if (selectedTier === null) {
      setPopupVisible(false);
      if (popupClearTimer.current) {
        clearTimeout(popupClearTimer.current);
        popupClearTimer.current = null;
      }
    }
  }, [selectedTier]);

  /* Wheel geometry. */
  const size = 180; // FAB diameter
  const center = size / 2;
  const radius = size / 2 - 4;

  const segments = useMemo(() => {
    return SCORE_TIERS.map((tier, i) => {
      const startAngle = i * sliceAngle - 90 - sliceAngle / 2;
      const endAngle = startAngle + sliceAngle;

      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      const x1 = center + radius * Math.cos(startRad);
      const y1 = center + radius * Math.sin(startRad);
      const x2 = center + radius * Math.cos(endRad);
      const y2 = center + radius * Math.sin(endRad);

      const largeArc = sliceAngle > 180 ? 1 : 0;
      const d = [
        `M ${center} ${center}`,
        `L ${x1.toFixed(2)} ${y1.toFixed(2)}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`,
        'Z',
      ].join(' ');

      const labelAngle = startAngle + sliceAngle / 2;
      const labelRad = (labelAngle * Math.PI) / 180;
      const labelRadius = radius * 0.68;
      const lx = center + labelRadius * Math.cos(labelRad);
      const ly = center + labelRadius * Math.sin(labelRad);

      return {
        tier,
        d,
        color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
        lx,
        ly,
      };
    });
  }, [sliceAngle, center, radius]);

  const spin = () => {
    if (spinning || disabled || selectedTier !== null) return;

    const pickedIndex = Math.floor(Math.random() * segmentCount);
    const pickedTier = SCORE_TIERS[pickedIndex];

    const midAngle = pickedIndex * sliceAngle - 90 + sliceAngle / 2;
    const targetAngleUnderPointer = -90;
    const deltaToMid =
      ((targetAngleUnderPointer - midAngle) % 360 + 360) % 360;

    const fullTurns =
      MIN_ROTATIONS +
      Math.floor(Math.random() * (MAX_ROTATIONS - MIN_ROTATIONS + 1));

    const extra = fullTurns * 360 + deltaToMid;

    setSpinning(true);
    setRotation((r) => r + extra);

    spinEndTimer.current = setTimeout(() => {
      setSpinning(false);
      onSelectTier(pickedTier);

      /* Show the center-screen popup for this tier, then fade it. */
      setPopupTier(pickedTier);
      setPopupVisible(true);

      if (popupHideTimer.current) clearTimeout(popupHideTimer.current);
      if (popupClearTimer.current) clearTimeout(popupClearTimer.current);

      popupHideTimer.current = setTimeout(() => {
        setPopupVisible(false);
        popupClearTimer.current = setTimeout(() => {
          setPopupTier(null);
        }, POPUP_FADE_MS);
      }, POPUP_HOLD_MS);
    }, SPIN_DURATION_MS + 60);
  };

  const lockedUntilGuess = selectedTier !== null;
  const canSpin = !spinning && !disabled && !lockedUntilGuess;

  return (
    <>
      {/* Fixed bottom-center wheel FAB */}
      <div
        style={{
          position: 'fixed',
          left: '50%',
          bottom: 'var(--nb-space-lg)',
          transform: 'translateX(-50%)',
          zIndex: 900,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: size,
            height: size,
            filter: 'drop-shadow(4px 4px 0 var(--nb-black))',
            opacity: disabled ? 0.5 : 1,
            transition: 'opacity 150ms ease',
          }}
        >
          {/* Fixed pointer at the top */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderTop: '16px solid var(--nb-black)',
              zIndex: 2,
            }}
          />

          <svg
            viewBox={`0 0 ${size} ${size}`}
            width={size}
            height={size}
            style={{
              display: 'block',
              borderRadius: '50%',
              border: '3px solid var(--nb-black)',
              background: 'var(--nb-white)',
              transform: `rotate(${rotation}deg)`,
              transition: spinning
                ? `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.15, 0.85, 0.15, 1)`
                : 'none',
              willChange: 'transform',
            }}
          >
            {segments.map((seg) => (
              <g key={seg.tier}>
                <path
                  d={seg.d}
                  fill={seg.color}
                  stroke="var(--nb-black)"
                  strokeWidth="2"
                />
                <text
                  x={seg.lx}
                  y={seg.ly}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    fontFamily: 'var(--nb-font)',
                    fontWeight: 800,
                    fontSize: 12,
                    fill: 'var(--nb-black)',
                    userSelect: 'none',
                  }}
                >
                  {seg.tier}
                </text>
              </g>
            ))}
          </svg>

          {/* Center hub is the spin button. It does not rotate with
              the wheel because it's a sibling, not inside the SVG
              that has the rotate transform. */}
          <button
            type="button"
            onClick={spin}
            disabled={!canSpin}
            aria-label="Spin the wheel"
            style={{
              position: 'absolute',
              inset: 0,
              margin: 'auto',
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: canSpin ? 'var(--nb-lime)' : 'var(--nb-white)',
              border: '3px solid var(--nb-black)',
              boxShadow: '3px 3px 0 var(--nb-black)',
              cursor: canSpin ? 'pointer' : 'not-allowed',
              fontFamily: 'var(--nb-font)',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: 'var(--nb-black)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              zIndex: 3,
              transition: 'background 150ms ease',
            }}
          >
            {spinning ? '…' : lockedUntilGuess ? selectedTier : 'Spin'}
          </button>
        </div>
      </div>

      {/* Center-screen tier popup */}
      {popupTier !== null && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 950,
            opacity: popupVisible ? 1 : 0,
            transition: `opacity ${POPUP_FADE_MS}ms ease`,
          }}
        >
          <div
            className="nb-card"
            style={{
              background: 'var(--nb-black)',
              color: 'var(--nb-white)',
              padding: 'var(--nb-space-lg) var(--nb-space-xl)',
              boxShadow: '8px 8px 0 var(--nb-black)',
              textAlign: 'center',
            }}
          >
            <div
              className="nb-text-xs"
              style={{
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--nb-lime)',
                marginBottom: 6,
              }}
            >
              Tier
            </div>
            <div
              style={{
                fontSize: '4rem',
                fontWeight: 900,
                lineHeight: 1,
                margin: 0,
              }}
            >
              {popupTier}
            </div>
            <p
              className="nb-text-sm nb-text-muted nb-mt-sm"
              style={{ margin: 0, color: 'rgba(255,255,255,0.7)' }}
            >
              Correct: +{popupTier} · Wrong: −{popupTier} · Vowel:{' '}
              {tierValue(popupTier, 'a')}
            </p>
          </div>
        </div>
      )}
    </>
  );
};