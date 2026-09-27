import React, { useState } from 'react';
import { MaterialIcon } from '../landing-page/icons';

const SENTENCE_COUNT_OPTIONS = [3, 4, 5, 6, 8];
const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy', color: 'var(--nb-lime)' },
  { value: 'medium', label: 'Medium', color: 'var(--nb-yellow)' },
  { value: 'hard', label: 'Hard', color: 'var(--nb-orange)' },
  { value: 'adaptive', label: 'Adaptive', color: 'var(--nb-cyan)' },
];

export const CrosswordSetup = ({
  topicName,
  language,
  onStart,
  isGenerating,
  error,
}) => {
  const [theme, setTheme] = useState(topicName || '');
  const [sentenceCount, setSentenceCount] = useState(5);
  const [difficulty, setDifficulty] = useState('adaptive');

  return (
    <div className="nb-card" style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div className="nb-flex nb-flex-center nb-gap-sm nb-mb-md">
        <MaterialIcon name="GridView" size={28} color="var(--nb-black)" />
        <h2 className="nb-heading nb-heading-md" style={{ margin: 0 }}>
          Crossword Puzzle
        </h2>
      </div>

      <p className="nb-text nb-text-muted nb-mb-lg">
        The AI will build a themed {language} crossword for you. Choose a
        theme below or use the topic name.
      </p>

      <div className="nb-mb-lg">
        <label className="nb-label">Theme</label>
        <input
          className="nb-input"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          placeholder="e.g. greetings, food, travel"
        />
      </div>

      <div className="nb-mb-lg">
        <label className="nb-label">Number of sentences</label>
        <div className="nb-flex nb-gap-sm nb-flex-wrap">
          {SENTENCE_COUNT_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => setSentenceCount(n)}
              className="nb-button"
              style={{
                minWidth: '56px',
                background:
                  sentenceCount === n ? 'var(--nb-lime)' : 'var(--nb-white)',
                fontWeight: 700,
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="nb-mb-lg">
        <label className="nb-label">Difficulty</label>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 'var(--nb-space-sm)',
          }}
        >
          {DIFFICULTY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDifficulty(opt.value)}
              className="nb-button"
              style={{
                background:
                  difficulty === opt.value ? opt.color : 'var(--nb-white)',
                fontWeight: 700,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div
          className="nb-card nb-mb-md"
          style={{
            background: 'var(--nb-red)',
            color: 'var(--nb-white)',
            padding: 'var(--nb-space-md)',
          }}
        >
          <p style={{ margin: 0, fontWeight: 600 }}>{error}</p>
        </div>
      )}

      <button
        className="nb-button nb-button-primary nb-button-full"
        disabled={isGenerating || !theme.trim()}
        onClick={() => onStart({ theme: theme.trim(), sentenceCount, difficulty })}
      >
        {isGenerating ? (
          <span className="nb-flex nb-flex-center nb-gap-sm">
            <span
              className="nb-spinner"
              style={{ width: 18, height: 18, borderWidth: 2 }}
            />
            Generating puzzle...
          </span>
        ) : (
          <>
            <MaterialIcon name="PlayArrow" size={20} color="var(--nb-white)" />
            Generate Puzzle
          </>
        )}
      </button>
    </div>
  );
};