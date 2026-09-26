// src/components/reading-lesson-components/ReadingLessonSetup.jsx

import React from 'react';
import { MaterialIcon } from '../landing-page/icons';
import { QUESTION_COUNT_OPTIONS, DIFFICULTY_OPTIONS } from './constants';

export const ReadingLessonSetup = ({
  language,
  config,
  setConfig,
  onConfirm,
  isGenerating,
  generationError,
  onRetry,
  previousAttempts = [],
  loadingPrevious = false,
  onSelectPrevious,
}) => {
  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      {/* Previous lessons */}
      {(loadingPrevious || previousAttempts.length > 0) && (
        <div
          className="nb-card nb-mb-lg"
          style={{ background: 'var(--nb-white)' }}
        >
          <div className="nb-flex nb-flex-center nb-gap-sm nb-mb-md">
            <MaterialIcon name="History" size={22} color="var(--nb-black)" />
            <h3 className="nb-heading nb-heading-sm" style={{ margin: 0 }}>
              Previous Lessons
            </h3>
          </div>

          {loadingPrevious ? (
            <p className="nb-text-sm nb-text-muted">Loading...</p>
          ) : (
            <div className="nb-flex nb-flex-col nb-gap-sm">
              {previousAttempts.map((attempt) => (
                <button
                  key={attempt.attemptId}
                  onClick={() => onSelectPrevious?.(attempt)}
                  className="nb-card nb-card-hover"
                  style={{
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontFamily: 'var(--nb-font)',
                    padding: 'var(--nb-space-md)',
                  }}
                >
                  <div className="nb-flex nb-flex-between nb-flex-center nb-mb-sm">
                    <span
                      className="nb-heading nb-heading-sm"
                      style={{ margin: 0 }}
                    >
                      {attempt.title}
                    </span>
                    <span
                      className="nb-badge"
                      style={{ background: 'var(--nb-lime)' }}
                    >
                      {attempt.score}%
                    </span>
                  </div>
                  <div className="nb-flex nb-gap-md nb-flex-wrap">
                    <span className="nb-text-xs nb-text-muted">
                      {attempt.correctCount}/{attempt.totalQuestions} correct
                    </span>
                    <span className="nb-text-xs nb-text-muted">
                      {attempt.sentencesCount} sentences
                    </span>
                    <span className="nb-text-xs nb-text-muted">
                      Completed{' '}
                      {attempt.completedAt
                        ? new Date(attempt.completedAt).toLocaleDateString()
                        : '—'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New lesson setup */}
      <div
        className="nb-card"
        style={{ background: 'var(--nb-white)' }}
      >
        <div className="nb-flex nb-flex-center nb-gap-sm nb-mb-md">
          <MaterialIcon name="MenuBook" size={28} color="var(--nb-black)" />
          <h2 className="nb-heading nb-heading-md" style={{ margin: 0 }}>
            New Reading Lesson
          </h2>
        </div>

        <p className="nb-text nb-text-muted nb-mb-lg">
          Choose how many questions you want and how difficult the lesson
          should be. The AI will build a custom passage for {language}.
        </p>

        <div className="nb-mb-lg">
          <label className="nb-label">Number of questions</label>
          <div className="nb-flex nb-gap-sm nb-flex-wrap">
            {QUESTION_COUNT_OPTIONS.map((n) => {
              const selected = config.questionCount === n;
              return (
                <button
                  key={n}
                  onClick={() =>
                    setConfig((c) => ({ ...c, questionCount: n }))
                  }
                  className="nb-button"
                  style={{
                    minWidth: '56px',
                    padding: 'var(--nb-space-sm) var(--nb-space-md)',
                    background: selected
                      ? 'var(--nb-lime)'
                      : 'var(--nb-white)',
                    boxShadow: selected
                      ? 'var(--nb-shadow-hover)'
                      : 'var(--nb-shadow-sm)',
                    fontWeight: 700,
                  }}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>

        <div className="nb-mb-lg">
          <label className="nb-label">Difficulty</label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 'var(--nb-space-sm)',
            }}
          >
            {DIFFICULTY_OPTIONS.map((option) => {
              const selected = config.difficulty === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() =>
                    setConfig((c) => ({ ...c, difficulty: option.value }))
                  }
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '4px',
                    padding: 'var(--nb-space-md)',
                    background: selected
                      ? option.color
                      : 'var(--nb-white)',
                    border: 'var(--nb-border)',
                    boxShadow: selected
                      ? 'var(--nb-shadow-hover)'
                      : 'var(--nb-shadow-sm)',
                    cursor: 'pointer',
                    fontFamily: 'var(--nb-font)',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontWeight: 700 }}>{option.label}</span>
                  <span className="nb-text-xs nb-text-muted">
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {generationError && (
          <div
            className="nb-card nb-mb-md"
            style={{
              background: 'var(--nb-red)',
              color: 'var(--nb-white)',
              padding: 'var(--nb-space-md)',
            }}
          >
            <p style={{ margin: 0, fontWeight: 600 }}>{generationError}</p>
          </div>
        )}

        <div className="nb-flex nb-gap-sm">
          <button
            className="nb-button nb-button-primary nb-button-full"
            onClick={onConfirm}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <span className="nb-flex nb-flex-center nb-gap-sm">
                <span
                  className="nb-spinner"
                  style={{ width: 18, height: 18, borderWidth: 2 }}
                />
                Generating...
              </span>
            ) : (
              <>
                <MaterialIcon
                  name="PlayArrow"
                  size={20}
                  color="var(--nb-white)"
                />
                Start Lesson
              </>
            )}
          </button>
          {generationError && onRetry && (
            <button className="nb-button" onClick={onRetry}>
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
};