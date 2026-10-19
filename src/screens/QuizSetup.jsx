import React from 'react';
import { MaterialIcon } from '../components/landing-page/icons';
import { AIInconsistencyTooltip } from '../components/AIInconsistencyTooltip';

const QUESTION_COUNT_OPTIONS = [5, 8, 10, 12, 15, 20];

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy', description: 'Simple sentences, common words', color: 'var(--nb-lime)' },
  { value: 'medium', label: 'Medium', description: 'Everyday level', color: 'var(--nb-yellow)' },
  { value: 'hard', label: 'Hard', description: 'Richer vocabulary, longer sentences', color: 'var(--nb-orange)' },
  { value: 'adaptive', label: 'Adaptive', description: 'Matches your saved proficiency', color: 'var(--nb-cyan)' },
];

const QUESTION_LANGUAGE_OPTIONS = [
  {
    value: 'native',
    label: 'Native language',
    description: 'Questions in your native language; answers in the target language.',
    color: 'var(--nb-cyan)',
  },
  {
    value: 'target',
    label: 'Target language',
    description: 'Questions and answers in the language you are learning.',
    color: 'var(--nb-lime)',
  },
];

export const QuizSetup = ({
  language,
  nativeLanguage,
  config,
  setConfig,
  onConfirm,
  isGenerating,
  generationError,
  onRetry,

  // Previous quizzes
  previousQuizzes = [],
  loadingPrevious = false,
  onSelectPrevious,
}) => {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      {/* Previous quizzes */}
      {(loadingPrevious || previousQuizzes.length > 0) && (
        <div
          className="nb-card nb-mb-lg"
          style={{ background: 'var(--nb-white)' }}
        >
          <div className="nb-flex nb-flex-center nb-gap-sm nb-mb-md">
            <MaterialIcon name="History" size={22} color="var(--nb-black)" />
            <h3 className="nb-heading nb-heading-sm" style={{ margin: 0 }}>
              Previous Quizzes
            </h3>
          </div>

          {loadingPrevious ? (
            <p className="nb-text-sm nb-text-muted">Loading...</p>
          ) : (
            <div className="nb-flex nb-flex-col nb-gap-sm">
              {previousQuizzes.map((attempt) => (
                <button
                  key={attempt.id}
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
                      {attempt.title || 'Quiz'}
                    </span>
                    {attempt.score !== null && attempt.score !== undefined ? (
                      <span
                        className="nb-badge"
                        style={{ background: 'var(--nb-lime)' }}
                      >
                        {attempt.score}%
                      </span>
                    ) : (
                      <span
                        className="nb-badge"
                        style={{ background: 'var(--nb-cyan)' }}
                      >
                        Not completed
                      </span>
                    )}
                  </div>
                  <div className="nb-flex nb-gap-md nb-flex-wrap">
                    <span className="nb-text-xs nb-text-muted">
                      {attempt.questionCount ?? attempt.totalQuestions ?? 0} questions
                    </span>
                    {attempt.correctCount !== null &&
                      attempt.correctCount !== undefined && (
                        <span className="nb-text-xs nb-text-muted">
                          {attempt.correctCount}/{attempt.totalQuestions} correct
                        </span>
                      )}
                    <span className="nb-text-xs nb-text-muted">
                      {attempt.completedAt
                        ? `Completed ${new Date(
                            attempt.completedAt
                          ).toLocaleDateString()}`
                        : 'Not completed'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New quiz form */}
      <div
        className="nb-card"
        style={{ background: 'var(--nb-white)' }}
      >
        <div className="nb-flex nb-flex-center nb-gap-sm nb-mb-md">
          <MaterialIcon name="Quiz" size={28} color="var(--nb-black)" />
          <h2 className="nb-heading nb-heading-md" style={{ margin: 0 }}>
            New Quiz
          </h2>
          <AIInconsistencyTooltip variant="quiz" />
        </div>

        <p className="nb-text nb-text-muted nb-mb-lg">
          Choose the language for questions, how many questions to answer, and
          how difficult they should be. Quizzes mix multiple choice, fill in
          the blank, and matching questions.
        </p>

        {/* Question language */}
        <div className="nb-mb-lg">
          <label className="nb-label">Question language</label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 'var(--nb-space-sm)',
            }}
          >
            {QUESTION_LANGUAGE_OPTIONS.map((opt) => {
              const selected = config.questionLanguage === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() =>
                    setConfig((c) => ({ ...c, questionLanguage: opt.value }))
                  }
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 4,
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
                  <span style={{ fontWeight: 700 }}>{opt.label}</span>
                  <span className="nb-text-xs nb-text-muted">
                    {opt.description}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="nb-text-xs nb-text-muted nb-mt-sm">
            {config.questionLanguage === 'native'
              ? `Questions will be in ${
                  nativeLanguage || 'your native language'
                }; answers will be in ${language}.`
              : `Questions and answers will be in ${language}.`}
          </p>
        </div>

        {/* Count */}
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
                    minWidth: 56,
                    padding: 'var(--nb-space-sm) var(--nb-space-md)',
                    background: selected ? 'var(--nb-lime)' : 'var(--nb-white)',
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

        {/* Difficulty */}
        <div className="nb-mb-lg">
          <label className="nb-label">Difficulty</label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
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
                    gap: 4,
                    padding: 'var(--nb-space-md)',
                    background: selected ? option.color : 'var(--nb-white)',
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
                Start Quiz
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