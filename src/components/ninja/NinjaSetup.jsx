import React, { useState } from 'react';
import { MaterialIcon } from '../landing-page/icons';
import {
  QUESTION_COUNT_OPTIONS,
  TIMER_OPTIONS,
  DEFAULT_TIMER_SECONDS,
  DIFFICULTY_OPTIONS,
} from './constants';

export const NinjaSetup = ({
  topicName,
  language,
  onStart,
  onResume,
  isGenerating,
  error,
  previousGames = [],
}) => {
  const [theme, setTheme] = useState(topicName || '');
  const [questionCount, setQuestionCount] = useState(10);
  const [timerSeconds, setTimerSeconds] = useState(DEFAULT_TIMER_SECONDS);
  const [difficulty, setDifficulty] = useState('medium');

  const hasPrevious = previousGames.length > 0;

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      {hasPrevious && (
        <div className="nb-card nb-mb-lg" style={{ background: 'var(--nb-white)' }}>
          <div className="nb-flex nb-flex-center nb-gap-sm nb-mb-md">
            <MaterialIcon name="History" size={22} color="var(--nb-black)" />
            <h3 className="nb-heading nb-heading-sm" style={{ margin: 0 }}>
              Previous Games
            </h3>
            <span
              className="nb-badge"
              style={{ background: 'var(--nb-cyan)', marginLeft: 'auto' }}
            >
              {previousGames.length}
            </span>
          </div>

          <div className="nb-flex nb-flex-col nb-gap-sm">
            {previousGames.map((g) => (
              <button
                key={g.id}
                onClick={() => onResume(g.id)}
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
                    {g.theme}
                  </span>
                  <span
                    className="nb-badge"
                    style={{
                      background: g.isCompleted
                        ? 'var(--nb-lime)'
                        : g.score > 0
                        ? 'var(--nb-yellow)'
                        : 'var(--nb-white)',
                    }}
                  >
                    {g.isCompleted
                      ? `${g.score} pts`
                      : g.score > 0
                      ? 'In progress'
                      : 'New'}
                  </span>
                </div>
                <div className="nb-flex nb-gap-md nb-flex-wrap">
                  <span className="nb-text-xs nb-text-muted">
                    {g.questionCount} questions
                  </span>
                  <span className="nb-text-xs nb-text-muted">
                    {g.timerSeconds ?? 20}s / question
                  </span>
                  <span className="nb-text-xs nb-text-muted">{g.difficulty}</span>
                  <span className="nb-text-xs nb-text-muted">
                    Created {new Date(g.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="nb-card" style={{ background: 'var(--nb-white)' }}>
        <div className="nb-flex nb-flex-center nb-gap-sm nb-mb-md">
          <MaterialIcon name="SportsMartialArts" size={28} color="var(--nb-black)" />
          <h2 className="nb-heading nb-heading-md" style={{ margin: 0 }}>
            Hello Ninja
          </h2>
        </div>

        <p className="nb-text nb-text-muted nb-mb-lg">
          A word falls from the sky. Click the correct one before it hits the
          ground. Every question has its own timer. Survive the whole round to
          win.
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
          <label className="nb-label">Number of questions</label>
          <div className="nb-flex nb-gap-sm nb-flex-wrap">
            {QUESTION_COUNT_OPTIONS.map((n) => {
              const selected = questionCount === n;
              return (
                <button
                  key={n}
                  onClick={() => setQuestionCount(n)}
                  className="nb-button"
                  style={{
                    minWidth: '64px',
                    padding: 'var(--nb-space-sm) var(--nb-space-md)',
                    background: selected ? 'var(--nb-lime)' : 'var(--nb-white)',
                    fontWeight: 700,
                  }}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>

        {/* NEW: Timer picker */}
        <div className="nb-mb-lg">
          <label className="nb-label">Time per question (seconds)</label>
          <div className="nb-flex nb-gap-sm nb-flex-wrap">
            {TIMER_OPTIONS.map((s) => {
              const selected = timerSeconds === s;
              return (
                <button
                  key={s}
                  onClick={() => setTimerSeconds(s)}
                  className="nb-button"
                  style={{
                    minWidth: '64px',
                    padding: 'var(--nb-space-sm) var(--nb-space-md)',
                    background: selected ? 'var(--nb-cyan)' : 'var(--nb-white)',
                    fontWeight: 700,
                  }}
                >
                  {s}s
                </button>
              );
            })}
          </div>
          <p className="nb-text-xs nb-text-muted nb-mt-sm">
            Each word takes this long to fall from top to bottom. Click the
            correct one before it hits the ground.
          </p>
        </div>

        <div className="nb-mb-lg">
          <label className="nb-label">Difficulty</label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: 'var(--nb-space-sm)',
            }}
          >
            {DIFFICULTY_OPTIONS.map((opt) => {
              const selected = difficulty === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setDifficulty(opt.value)}
                  className="nb-card-hover"
                  style={{
                    padding: 'var(--nb-space-md)',
                    background: selected ? opt.color : 'var(--nb-white)',
                    border: 'var(--nb-border)',
                    boxShadow: selected
                      ? 'var(--nb-shadow-hover)'
                      : 'var(--nb-shadow-sm)',
                    cursor: 'pointer',
                    fontFamily: 'var(--nb-font)',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{opt.label}</div>
                  <div className="nb-text-xs nb-text-muted">{opt.description}</div>
                </button>
              );
            })}
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
          onClick={() =>
            onStart({
              theme: theme.trim(),
              questionCount,
              difficulty,
              timerSeconds,
            })
          }
          disabled={isGenerating || !theme.trim()}
        >
          {isGenerating ? (
            <span className="nb-flex nb-flex-center nb-gap-sm">
              <span
                className="nb-spinner"
                style={{ width: 18, height: 18, borderWidth: 2 }}
              />
              Generating questions...
            </span>
          ) : (
            <>
              <MaterialIcon name="PlayArrow" size={20} color="var(--nb-white)" />
              Start Game
            </>
          )}
        </button>
      </div>
    </div>
  );
};