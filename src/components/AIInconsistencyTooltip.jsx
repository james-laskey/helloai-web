import React, { useState, useEffect, useRef } from 'react';
import { MaterialIcon } from './landing-page/icons';

/**
 * AIInconsistencyTooltip
 *
 * A small inline info icon that reveals a tooltip explaining how AI
 * generation can produce inconsistent results for a specific feature.
 *
 * Usage:
 *   <AIInconsistencyTooltip variant="reading" />
 *   <AIInconsistencyTooltip variant="crossword" placement="top" />
 *
 * Variants are keys in MESSAGES below. Add new ones as features are added.
 */

const MESSAGES = {
  reading: {
    title: 'AI-generated lesson',
    body: 'The passage, translations, and questions are generated on the fly. Word choice and difficulty may vary between sessions. If a sentence looks wrong, tap Retry to regenerate.',
  },
  flashcards: {
    title: 'AI-generated flashcards',
    body: 'Cards are created by AI for your topic and level. Occasionally a translation or example may be off. If a card looks wrong, mark it as Needs Review — the next set will avoid that word.',
  },
  quiz: {
    title: 'AI-generated quiz',
    body: 'Questions are generated from your topic and may occasionally have ambiguous options. If an answer seems incorrect, skip it and generate a new quiz.',
  },
  crossword: {
    title: 'AI-generated crossword',
    body: 'Sentences, clues, and the grid are built on the server. On rare occasions a clue may be unclear or a sentence slightly awkward. The puzzle is still solvable — use the reveal button if needed.',
  },
  ninja: {
    title: 'AI-generated word sets',
    body: 'Words and decoys are generated per round. Sometimes the distractors may be similar to the correct answer or slightly off-theme. Restart the round for a fresh set.',
  },
  fortune: {
    title: 'AI-generated phrases',
    body: 'Phrases are generated once per game. Occasionally a phrase may include unusual phrasing. If a puzzle feels unfair, give up and start a new game for a fresh set.',
  },
  tutor: {
    title: 'AI-powered tutor',
    body: 'Replies are generated in real time and may occasionally be inaccurate or repeat themselves. You can ask the tutor to rephrase or take a different approach.',
  },
  lesson_progress: {
    title: 'Progress is tracked automatically',
    body: 'Your reading progress is saved every 15 seconds and on completion. If you close the app mid-lesson, your last few interactions may not be recorded.',
  },
  general: {
    title: 'About AI content',
    body: 'This feature uses AI to generate content on demand. Results may vary between sessions. If something looks wrong, regenerate it — each attempt produces new content.',
  },
};

const PLACEMENTS = {
  top: { bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' },
  bottom: { top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' },
  left: { right: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)' },
  right: { left: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)' },
};

export const AIInconsistencyTooltip = ({
  variant = 'general',
  placement = 'top',
  size = 18,
  label,
}) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;

    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const message = MESSAGES[variant] || MESSAGES.general;
  const posStyle = PLACEMENTS[placement] || PLACEMENTS.top;

  return (
    <span
      ref={wrapperRef}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        verticalAlign: 'middle',
      }}
    >
      <button
        type="button"
        aria-label={label || 'About AI-generated content'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
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
          background: open ? 'var(--nb-yellow)' : 'var(--nb-white)',
          cursor: 'pointer',
          padding: 0,
          fontFamily: 'var(--nb-font)',
          transition: 'background 0.15s ease',
        }}
      >
        <MaterialIcon name="Info" size={size} color="var(--nb-black)" />
      </button>

      {open && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            ...posStyle,
            zIndex: 50,
            background: 'var(--nb-white)',
            border: 'var(--nb-border)',
            boxShadow: 'var(--nb-shadow)',
            padding: 'var(--nb-space-md)',
            width: '300px',
            textAlign: 'left',
            pointerEvents: 'none',
          }}
        >
          <div
            className="nb-heading nb-heading-sm nb-mb-sm"
            style={{ fontWeight: 700 }}
          >
            {message.title}
          </div>
          <p
            className="nb-text-sm nb-text-muted"
            style={{ margin: 0, lineHeight: 1.5 }}
          >
            {message.body}
          </p>
        </div>
      )}
    </span>
  );
};