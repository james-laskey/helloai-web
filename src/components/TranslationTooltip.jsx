import React, { useState } from 'react';
import { MaterialIcon } from './landing-page/icons';

/**
 * TranslationTooltip
 *
 * A small inline icon that reveals the native-language translation of a
 * target-language term. Designed to sit next to a flashcard front, a
 * passage sentence, or any other string that has a known translation.
 *
 * Props:
 *   translation - the translation text to show
 *   nativeLanguage - the language name for the label (e.g. "English")
 *   size - icon size in pixels
 *   placement - 'top' | 'bottom' | 'left' | 'right'
 */
export const TranslationTooltip = ({
  translation,
  nativeLanguage = 'English',
  size = 18,
  placement = 'right',
}) => {
  const [open, setOpen] = useState(false);

  if (!translation) return null;

  const positions = {
    top: { bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' },
    bottom: { top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' },
    left: { right: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)' },
    right: { left: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)' },
  };

  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        verticalAlign: 'middle',
      }}
    >
      <button
        type="button"
        aria-label={`Show ${nativeLanguage} translation`}
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: `${size + 8}px`,
          height: `${size + 8}px`,
          border: '2px solid var(--nb-black)',
          borderRadius: '50%',
          background: open ? 'var(--nb-cyan)' : 'var(--nb-white)',
          cursor: 'pointer',
          padding: 0,
          transition: 'background 0.15s ease',
        }}
      >
        <MaterialIcon name="Translate" size={size} color="var(--nb-black)" />
      </button>

      {open && (
        <div
          role="tooltip"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            ...positions[placement],
            zIndex: 60,
            background: 'var(--nb-white)',
            border: 'var(--nb-border)',
            boxShadow: 'var(--nb-shadow)',
            padding: 'var(--nb-space-sm) var(--nb-space-md)',
            minWidth: '140px',
            maxWidth: '260px',
            textAlign: 'left',
            pointerEvents: 'none',
          }}
        >
          <div
            className="nb-text-xs nb-text-muted"
            style={{ fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}
          >
            {nativeLanguage}
          </div>
          <div className="nb-text-sm" style={{ fontWeight: 600, lineHeight: 1.4 }}>
            {translation}
          </div>
        </div>
      )}
    </span>
  );
};