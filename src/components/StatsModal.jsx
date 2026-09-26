import React, { useState } from 'react';
import { MaterialIcon } from '../components/landing-page/icons';

export const StatsModal = ({ visible, onClose, userStats }) => {
  const [expandedLanguage, setExpandedLanguage] = useState(null);

  if (!visible) return null;

  const languages = userStats?.languages || [];

  return (
    <div className="nb-modal-overlay" onClick={onClose}>
      <div
        className="nb-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '750px' }}
      >
        {/* Header */}
        <div className="nb-modal-header" style={{ background: 'var(--nb-lime)' }}>
          <div className="nb-flex nb-flex-center nb-gap-sm">
            <MaterialIcon name="Insights" size={26} color="var(--nb-black)" />
            <h2 className="nb-heading nb-heading-lg" style={{ margin: 0 }}>
              Your Learning Stats
            </h2>
          </div>
          <button
            onClick={onClose}
            className="nb-button"
            style={{ padding: 'var(--nb-space-sm)' }}
            aria-label="Close"
          >
            <MaterialIcon name="Close" size={20} color="var(--nb-black)" />
          </button>
        </div>

        <div className="nb-modal-body">
          {/* Overall Stats */}
          <div className="nb-mb-xl">
            <h3 className="nb-heading nb-heading-md nb-mb-md">
              Overall Progress
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 'var(--nb-space-md)',
              }}
            >
              <StatCard
                icon="Time"
                value={userStats?.total_duration_formatted || '0m'}
                label="Reading Time"
                color="var(--nb-yellow)"
              />
              <StatCard
                icon="MenuBook"
                value={userStats?.total_lessons_completed || 0}
                label="Lessons Done"
                color="var(--nb-cyan)"
              />
              <StatCard
                icon="Quiz"
                value={userStats?.total_quizzes_completed || 0}
                label="Quizzes"
                color="var(--nb-orange)"
              />
              <StatCard
                icon="Style"
                value={userStats?.total_flashcards_mastered || 0}
                label="Cards Mastered"
                color="var(--nb-pink)"
              />
              <StatCard
                icon="Spellcheck"
                value={userStats?.total_sentences_read || 0}
                label="Sentences Read"
                color="var(--nb-lime)"
              />
              <StatCard
                icon="EmojiEvents"
                value={`${userStats?.overall_average_lesson_score || 0}%`}
                label="Avg Lesson"
                color="var(--nb-purple)"
                valueColor="var(--nb-white)"
                labelColor="var(--nb-white)"
              />
            </div>
          </div>

          {/* Languages */}
          <div>
            <h3 className="nb-heading nb-heading-md nb-mb-md">
              Languages Practiced
            </h3>

            {languages.length > 0 ? (
              <div className="nb-flex nb-flex-col nb-gap-md">
                {languages.map((lang) => {
                  const isExpanded = expandedLanguage === lang.language;
                  return (
                    <div
                      key={lang.language}
                      className="nb-card"
                      style={{ padding: 'var(--nb-space-md)' }}
                    >
                      {/* Header */}
                      <div
                        className="nb-flex nb-flex-between nb-flex-center"
                        style={{
                          cursor: 'pointer',
                          marginBottom: 'var(--nb-space-md)',
                        }}
                        onClick={() =>
                          setExpandedLanguage(
                            isExpanded ? null : lang.language
                          )
                        }
                      >
                        <div className="nb-flex nb-flex-center nb-gap-sm">
                          <MaterialIcon
                            name="Language"
                            size={22}
                            color="var(--nb-black)"
                          />
                          <span className="nb-heading nb-heading-sm">
                            {lang.language}
                          </span>
                        </div>
                        <MaterialIcon
                          name={isExpanded ? 'ExpandLess' : 'ExpandMore'}
                          size={22}
                          color="var(--nb-black)"
                        />
                      </div>

                      {/* Compact Stats */}
                      <div className="nb-flex nb-gap-sm nb-flex-wrap">
                        <StatBadge
                          icon="MenuBook"
                          label={`${lang.lessonsCompleted} lessons`}
                          color="var(--nb-cyan)"
                        />
                        <StatBadge
                          icon="EmojiEvents"
                          label={`${lang.averageLessonScore}% avg`}
                          color="var(--nb-lime)"
                        />
                        <StatBadge
                          icon="Quiz"
                          label={`${lang.quizzesCompleted} quizzes`}
                          color="var(--nb-orange)"
                        />
                        <StatBadge
                          icon="Style"
                          label={`${lang.flashcardsMastered}/${lang.totalFlashcards} cards`}
                          color="var(--nb-pink)"
                        />
                        <StatBadge
                          icon="Spellcheck"
                          label={`${lang.totalSentencesRead} sentences`}
                          color="var(--nb-yellow)"
                        />
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div
                          style={{
                            marginTop: 'var(--nb-space-md)',
                            paddingTop: 'var(--nb-space-md)',
                            borderTop: '2px solid var(--nb-black)',
                          }}
                        >
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns:
                                'repeat(auto-fit, minmax(120px, 1fr))',
                              gap: 'var(--nb-space-md)',
                            }}
                          >
                            <DetailItem
                              label="Started"
                              value={lang.lessonsStarted}
                            />
                            <DetailItem
                              label="Completed"
                              value={lang.lessonsCompleted}
                            />
                            <DetailItem
                              label="Avg Lesson"
                              value={`${lang.averageLessonScore}%`}
                            />
                            <DetailItem
                              label="Avg Quiz"
                              value={`${lang.averageQuizScore}%`}
                            />
                            <DetailItem
                              label="Cards Studied"
                              value={lang.flashcardsStudied}
                            />
                            <DetailItem
                              label="Last Activity"
                              value={
                                lang.lastActivity
                                  ? new Date(
                                      lang.lastActivity
                                    ).toLocaleDateString()
                                  : '—'
                              }
                            />
                          </div>

                          {/* Flashcard mastery bar */}
                          {lang.totalFlashcards > 0 && (
                            <div style={{ marginTop: 'var(--nb-space-md)' }}>
                              <div
                                className="nb-text-xs nb-text-muted nb-mb-xs"
                                style={{ fontWeight: 600 }}
                              >
                                Flashcard Mastery
                              </div>
                              <div
                                style={{
                                  height: '12px',
                                  background: 'var(--nb-gray)',
                                  border: '2px solid var(--nb-black)',
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  style={{
                                    height: '100%',
                                    width: `${
                                      (lang.flashcardsMastered /
                                        lang.totalFlashcards) *
                                      100
                                    }%`,
                                    background: 'var(--nb-lime)',
                                    transition: 'width 0.3s ease',
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                className="nb-text-center"
                style={{ padding: 'var(--nb-space-xl)' }}
              >
                <div style={{ marginBottom: 'var(--nb-space-md)' }}>
                  <MaterialIcon name="MenuBook" size={56} color="#888" />
                </div>
                <p className="nb-text">No learning data yet</p>
                <p className="nb-text-sm nb-text-muted">
                  Complete a lesson to see your stats.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- Sub-components ---------- */

const StatCard = ({ icon, value, label, color, valueColor, labelColor }) => (
  <div
    className="nb-card nb-text-center"
    style={{
      background: color,
      padding: 'var(--nb-space-md)',
    }}
  >
    <div style={{ marginBottom: 'var(--nb-space-xs)' }}>
      <MaterialIcon name={icon} size={26} color="var(--nb-black)" />
    </div>
    <div
      style={{
        fontSize: '1.25rem',
        fontWeight: 700,
        color: valueColor || 'var(--nb-black)',
      }}
    >
      {value}
    </div>
    <div
      className="nb-text-xs"
      style={{ color: labelColor || 'var(--nb-black)', opacity: 0.75 }}
    >
      {label}
    </div>
  </div>
);

const StatBadge = ({ icon, label, color }) => (
  <span
    className="nb-badge"
    style={{
      background: color,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
    }}
  >
    <MaterialIcon name={icon} size={12} color="var(--nb-black)" />
    {label}
  </span>
);

const DetailItem = ({ label, value }) => (
  <div className="nb-text-center">
    <div className="nb-text-xs nb-text-muted">{label}</div>
    <div style={{ fontWeight: 700 }}>{value}</div>
  </div>
);