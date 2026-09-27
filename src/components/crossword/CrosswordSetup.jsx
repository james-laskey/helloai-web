import React, { useState, useEffect } from 'react';
import { MaterialIcon } from '../landing-page/icons';
import { api } from '../../services/api';

const SENTENCE_COUNT_OPTIONS = [3, 4, 5, 6, 8];
const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy', color: 'var(--nb-lime)' },
  { value: 'medium', label: 'Medium', color: 'var(--nb-yellow)' },
  { value: 'hard', label: 'Hard', color: 'var(--nb-orange)' },
  { value: 'adaptive', label: 'Adaptive', color: 'var(--nb-cyan)' },
];

export const CrosswordSetup = ({
  userId,
  topicId,
  topicName,
  language,
  onStart,
  onResume,
  isGenerating,
  error,
}) => {
  const [theme, setTheme] = useState(topicName || '');
  const [sentenceCount, setSentenceCount] = useState(5);
  const [difficulty, setDifficulty] = useState('adaptive');

  const [previousPuzzles, setPreviousPuzzles] = useState([]);
  const [loadingPrevious, setLoadingPrevious] = useState(false);

  useEffect(() => {
    if (!userId || !topicId || !language) return;

    let cancelled = false;

    const load = async () => {
      setLoadingPrevious(true);
      try {
        const result = await api.listCrosswords({
          userId,
          language,
          topicId,
        });
        console.log('Previous crosswords:', result);
        if (!cancelled) setPreviousPuzzles(result?.puzzles ?? []);
      } catch (err) {
        console.error('Failed to list crosswords:', err);
      } finally {
        if (!cancelled) setLoadingPrevious(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [userId, topicId, language]);

  const hasPrevious = previousPuzzles.length > 0;

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      {(loadingPrevious || hasPrevious) && (
        <div className="nb-card nb-mb-lg" style={{ background: 'var(--nb-white)' }}>
          <div className="nb-flex nb-flex-center nb-gap-sm nb-mb-md">
            <MaterialIcon name="History" size={22} color="var(--nb-black)" />
            <h3 className="nb-heading nb-heading-sm" style={{ margin: 0 }}>
              Previous Crosswords
            </h3>
            {hasPrevious && (
              <span
                className="nb-badge"
                style={{ background: 'var(--nb-cyan)', marginLeft: 'auto' }}
              >
                {previousPuzzles.length}
              </span>
            )}
          </div>

          {loadingPrevious ? (
            <p className="nb-text-sm nb-text-muted">Loading...</p>
          ) : (
            <div className="nb-flex nb-flex-col nb-gap-sm">
              {previousPuzzles.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onResume(p.id)}
                  className="nb-card nb-card-hover"
                  style={{
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontFamily: 'var(--nb-font)',
                    padding: 'var(--nb-space-md)',
                  }}
                >
                  <div className="nb-flex nb-flex-between nb-flex-center nb-mb-sm">
                    <span className="nb-heading nb-heading-sm" style={{ margin: 0 }}>
                      {p.theme}
                    </span>
                    <span
                      className="nb-badge"
                      style={{
                        background: p.isCompleted
                          ? 'var(--nb-lime)'
                          : p.cellsFilled > 0
                          ? 'var(--nb-yellow)'
                          : 'var(--nb-white)',
                      }}
                    >
                      {p.isCompleted
                        ? 'Completed'
                        : p.cellsFilled > 0
                        ? 'In progress'
                        : 'New'}
                    </span>
                  </div>
                  <div className="nb-flex nb-gap-md nb-flex-wrap">
                    <span className="nb-text-xs nb-text-muted">
                      {p.clueCount} clues
                    </span>
                    <span className="nb-text-xs nb-text-muted">
                      {p.difficulty}
                    </span>
                    <span className="nb-text-xs nb-text-muted">
                      Created {new Date(p.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="nb-card" style={{ background: 'var(--nb-white)' }}>
        <div className="nb-flex nb-flex-center nb-gap-sm nb-mb-md">
          <MaterialIcon name="GridView" size={28} color="var(--nb-black)" />
          <h2 className="nb-heading nb-heading-md" style={{ margin: 0 }}>
            {hasPrevious ? 'New Crossword' : 'Crossword Puzzle'}
          </h2>
        </div>

        <p className="nb-text nb-text-muted nb-mb-lg">
          Generate a new {language} crossword for {topicName}.
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
                  background: sentenceCount === n ? 'var(--nb-lime)' : 'var(--nb-white)',
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
                  background: difficulty === opt.value ? opt.color : 'var(--nb-white)',
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
              Generate New Puzzle
            </>
          )}
        </button>
      </div>
    </div>
  );
};