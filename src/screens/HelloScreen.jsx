import React from 'react';
import WavingPerson from '../components/WavingPerson';

/**
 * Post-login splash rendered as a fixed full-viewport overlay.
 *
 * It is mounted by App alongside the topic screen, so the topic
 * screen is already behind it. Dismissed only by the Continue
 * button.
 */
export const HelloScreen = ({ userName = '', onDone }) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        background: 'var(--nb-surface)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Animation fills the overlay */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <WavingPerson />

        {/* Greeting overlay */}
        {userName ? (
          <div
            style={{
              position: 'absolute',
              top: 'var(--nb-space-lg)',
              left: 0,
              right: 0,
              textAlign: 'center',
              color: '#fff',
              fontFamily: 'var(--nb-font)',
              pointerEvents: 'none',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '0.85rem',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                opacity: 0.75,
              }}
            >
              Welcome back
            </p>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: '1.5rem',
                fontWeight: 700,
              }}
            >
              {userName}
            </p>
          </div>
        ) : null}

        {/* Continue — pinned bottom-right of the overlay */}
        <button
          type="button"
          onClick={() => onDone?.()}
          className="nb-button nb-button-primary"
          style={{
            position: 'absolute',
            right: 'var(--nb-space-lg)',
            bottom: 'var(--nb-space-lg)',
            zIndex: 5,
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default HelloScreen;