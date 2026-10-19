import React, { useMemo, useState } from 'react';
import { MaterialIcon } from '../landing-page/icons';

const CONFETTI_COLORS = [
  'var(--nb-lime)',
  'var(--nb-yellow)',
  'var(--nb-cyan)',
  'var(--nb-orange)',
  'var(--nb-pink)',
  'var(--nb-red)',
];

function buildConfetti(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.2,
    duration: 2.4 + Math.random() * 2.2,
    size: 6 + Math.random() * 10,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    rotate: Math.random() * 360,
    round: Math.random() > 0.6,
  }));
}

function grade(score) {
  if (score >= 90) return { label: 'Outstanding!', emoji: '🏆', tone: 'var(--nb-lime)' };
  if (score >= 75) return { label: 'Great work!', emoji: '🎉', tone: 'var(--nb-cyan)' };
  if (score >= 60) return { label: 'Nice job!', emoji: '👏', tone: 'var(--nb-yellow)' };
  if (score >= 40) return { label: 'Good effort', emoji: '💪', tone: 'var(--nb-orange)' };
  return { label: 'Keep practicing', emoji: '📚', tone: 'var(--nb-pink)' };
}

function formatAnswer(value, type) {
  if (value === null || value === undefined) return '—';
  if (type === 'matching') {
    if (typeof value !== 'object') return String(value);
    const entries = Object.entries(value);
    if (entries.length === 0) return '—';
    return entries.map(([k, v]) => `${k} → ${v}`).join('; ');
  }
  return String(value);
}

const AnswerRow = ({ answer, index }) => {
  const type = answer?.type;
  const isCorrect = !!answer?.isCorrect;

  const partial =
    type === 'matching' && typeof answer?.partialScore === 'number'
      ? answer.partialScore
      : null;

  const bg = isCorrect ? 'var(--nb-lime)' : 'var(--nb-red)';
  const fg = isCorrect ? 'var(--nb-black)' : 'var(--nb-white)';

  return (
    <div
      className="nb-card nb-mb-sm"
      style={{
        padding: 'var(--nb-space-md)',
        background: bg,
        color: fg,
        textAlign: 'left',
      }}
    >
      <div className="nb-flex nb-gap-sm" style={{ alignItems: 'flex-start' }}>
        <span style={{ fontSize: '1.1rem', lineHeight: 1.2 }}>
          {isCorrect ? '✓' : '✕'}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>
            {index + 1}. {answer?.question || '(question)'}
            {type === 'fill-blank' ? ' (fill in the blank)' : ''}
            {type === 'matching' ? ' (matching)' : ''}
          </div>

          <div className="nb-text-sm" style={{ marginBottom: 2 }}>
            <strong>Your answer:</strong>{' '}
            {formatAnswer(answer?.selected, type)}
          </div>

          {type === 'matching' && partial !== null && !isCorrect && (
            <div className="nb-text-xs" style={{ opacity: 0.85, marginBottom: 4 }}>
              Partial credit: {Math.round(partial * 100)}%
            </div>
          )}

          {!isCorrect && answer?.explanation && (
            <div
              className="nb-text-sm"
              style={{
                marginTop: 6,
                paddingTop: 6,
                borderTop: '1px solid rgba(0,0,0,0.2)',
              }}
            >
              <strong>Why:</strong> {answer.explanation}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const LessonCelebration = ({
  result,
  language,
  lesson,
  onContinue,
  onReview,
}) => {
  const confetti = useMemo(() => buildConfetti(48), []);
  const [showAll, setShowAll] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'incorrect'

  const score =
    typeof result?.score === 'number'
      ? result.score
      : typeof result?.correctCount === 'number' &&
        typeof result?.totalQuestions === 'number' &&
        result.totalQuestions > 0
      ? Math.round((result.correctCount / result.totalQuestions) * 100)
      : 0;

  const { label, emoji, tone } = grade(score);

  const sections = lesson?.sections ?? [];
  const perSection = result?.sectionResults ?? [];
  const answers = result?.answers ?? [];

  const incorrectCount = answers.filter((a) => !a.isCorrect).length;

  const visibleAnswers = useMemo(() => {
    const list =
      filter === 'incorrect'
        ? answers.filter((a) => !a.isCorrect)
        : answers;
    return showAll ? list : list.slice(0, 5);
  }, [answers, filter, showAll]);

  const hiddenCount = useMemo(() => {
    const total = filter === 'incorrect' ? incorrectCount : answers.length;
    return Math.max(0, total - (showAll ? total : Math.min(5, total)));
  }, [answers, filter, showAll, incorrectCount]);

  return (
    <div
      className="celebration-root"
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 'var(--nb-space-xl) var(--nb-space-lg)',
        position: 'relative',
        overflowY: 'auto',
        overflowX: 'hidden',
        maxHeight: '100vh',
      }}
    >
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translate3d(0, -20vh, 0) rotate(0deg); opacity: 0; }
          8%   { opacity: 1; }
          100% { transform: translate3d(var(--drift, 0), 110vh, 0) rotate(720deg); opacity: 0.9; }
        }
        @keyframes popIn {
          0%   { opacity: 0; transform: scale(0.6); }
          60%  { opacity: 1; transform: scale(1.06); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scoreCount {
          from { transform: scale(0.8); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes trophyBounce {
          0%   { transform: translateY(0)    scale(1); }
          40%  { transform: translateY(-14px) scale(1.08); }
          70%  { transform: translateY(0)    scale(0.98); }
          100% { transform: translateY(0)    scale(1); }
        }

        .celebration-root .confetti-piece {
          position: absolute;
          top: 0;
          will-change: transform;
          animation-name: confettiFall;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
          pointer-events: none;
        }
        .celebration-root .cel-card {
          position: relative;
          z-index: 2;
          animation: popIn 420ms ease-out both;
          text-align: center;
          max-width: 560px;
          width: 100%;
          background: var(--nb-white);
          border: var(--nb-border);
          box-shadow: var(--nb-shadow);
          padding: var(--nb-space-xl);
          margin-bottom: var(--nb-space-lg);
        }
        .celebration-root .cel-emoji {
          font-size: 4.5rem;
          line-height: 1;
          margin-bottom: var(--nb-space-sm);
          display: inline-block;
          animation: trophyBounce 700ms ease-out 200ms both;
        }
        .celebration-root .cel-score {
          font-size: 4rem;
          font-weight: 800;
          line-height: 1;
          animation: scoreCount 500ms ease-out 260ms both;
        }
        .celebration-root .cel-label { animation: slideUp 420ms ease-out 340ms both; }
        .celebration-root .cel-breakdown { animation: slideUp 420ms ease-out 460ms both; }
        .celebration-root .cel-actions { animation: slideUp 420ms ease-out 560ms both; }
        .celebration-root .cel-review {
          animation: slideUp 420ms ease-out 660ms both;
          max-width: 560px;
          width: 100%;
          position: relative;
          z-index: 2;
        }

        @media (prefers-reduced-motion: reduce) {
          .celebration-root .confetti-piece { display: none; }
          .celebration-root .cel-card,
          .celebration-root .cel-emoji,
          .celebration-root .cel-score,
          .celebration-root .cel-label,
          .celebration-root .cel-breakdown,
          .celebration-root .cel-actions,
          .celebration-root .cel-review {
            animation: none !important;
          }
        }
      `}</style>

      {confetti.map((c) => (
        <span
          key={c.id}
          className="confetti-piece"
          style={{
            left: `${c.left}%`,
            width: `${c.size}px`,
            height: `${c.size * (c.round ? 1 : 0.5)}px`,
            background: c.color,
            borderRadius: c.round ? '50%' : '2px',
            animationDelay: `${c.delay}s`,
            animationDuration: `${c.duration}s`,
            '--drift': `${(Math.random() - 0.5) * 120}px`,
            transform: `rotate(${c.rotate}deg)`,
          }}
        />
      ))}

      <div className="cel-card">
        <div className="cel-emoji">{emoji}</div>

        <h2 className="nb-heading nb-heading-xl nb-mb-sm">{label}</h2>

        <p className="nb-text nb-text-muted nb-mb-md">
          You completed{' '}
          <strong>{lesson?.title || 'your reading lesson'}</strong>
          {language ? ` in ${language}` : ''}.
        </p>

        <div
          className="cel-score"
          style={{ color: tone, marginBottom: 'var(--nb-space-md)' }}
        >
          {score}%
        </div>

        <div className="cel-label nb-mb-lg">
          <span className="nb-badge" style={{ background: tone }}>
            {result?.correctCount ?? 0} of {result?.totalQuestions ?? 0}{' '}
            questions correct
          </span>
        </div>

        {perSection.length > 0 && (
          <div className="cel-breakdown nb-mb-lg">
            <h3
              className="nb-heading nb-heading-sm nb-mb-sm"
              style={{ textAlign: 'left' }}
            >
              Section results
            </h3>
            <div className="nb-flex nb-flex-col nb-gap-sm">
              {perSection.map((s, i) => {
                const pct =
                  s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
                return (
                  <div
                    key={s.sectionId ?? i}
                    className="nb-card"
                    style={{
                      padding: 'var(--nb-space-sm) var(--nb-space-md)',
                      background:
                        pct >= 75
                          ? 'var(--nb-lime)'
                          : pct >= 50
                          ? 'var(--nb-yellow)'
                          : 'var(--nb-orange)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 'var(--nb-space-sm)',
                    }}
                  >
                    <span style={{ fontWeight: 600, textAlign: 'left' }}>
                      {sections[i]?.heading || `Section ${s.sectionId ?? i + 1}`}
                    </span>
                    <span
                      className="nb-badge"
                      style={{ background: 'var(--nb-white)' }}
                    >
                      {s.correct}/{s.total}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div
          className="cel-actions nb-flex nb-gap-sm nb-flex-wrap"
          style={{ justifyContent: 'center' }}
        >
          {onReview && (
            <button className="nb-button" onClick={onReview}>
              <MaterialIcon name="MenuBook" size={18} color="var(--nb-black)" />
              Review in lesson
            </button>
          )}
          <button className="nb-button nb-button-primary" onClick={onContinue}>
            Continue Learning →
          </button>
        </div>
      </div>

      {answers.length > 0 && (
        <div className="cel-review">
          <div
            className="nb-card"
            style={{
              background: 'var(--nb-white)',
              padding: 'var(--nb-space-lg)',
              textAlign: 'left',
            }}
          >
            <div className="nb-flex nb-flex-between nb-flex-center nb-flex-wrap nb-gap-sm nb-mb-md">
              <h3 className="nb-heading nb-heading-md" style={{ margin: 0 }}>
                Review your answers
              </h3>
              <span
                className="nb-badge"
                style={{ background: 'var(--nb-cyan)' }}
              >
                {answers.length - incorrectCount} correct · {incorrectCount}{' '}
                incorrect
              </span>
            </div>

            

            {visibleAnswers.length === 0 ? (
              <p className="nb-text nb-text-muted" style={{ margin: 0 }}>
                {filter === 'incorrect'
                  ? 'No incorrect answers — perfect!'
                  : 'No answers recorded.'}
              </p>
            ) : (
              <div>
                {visibleAnswers.map((a, i) => (
                  <AnswerRow key={i} answer={a} index={i} />
                ))}
              </div>
            )}

            {hiddenCount > 0 && (
              <button
                className="nb-button nb-button-full nb-mt-sm"
                onClick={() => setShowAll(true)}
              >
                Show all {filter === 'incorrect' ? incorrectCount : answers.length}{' '}
                answers ({hiddenCount} more)
              </button>
            )}
            {showAll &&
              (filter === 'incorrect' ? incorrectCount : answers.length) > 5 && (
                <button
                  className="nb-button nb-button-full nb-mt-sm"
                  onClick={() => setShowAll(false)}
                >
                  Show fewer
                </button>
              )}
          </div>
        </div>
      )}
    </div>
  );
};