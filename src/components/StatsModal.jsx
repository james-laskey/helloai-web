import React, { useState, useEffect } from 'react';

export const StatsModal = ({ visible, onClose, userStats }) => {
  const [expandedLanguage, setExpandedLanguage] = useState(null);

  if (!visible) return null;

  const languages = userStats?.languages || [];

  const getLanguageIcon = (language) => {
    const icons = {
      'Spanish': '🇪🇸', 'French': '🇫🇷', 'Japanese': '🇯🇵', 'Korean': '🇰🇷',
      'German': '🇩🇪', 'Italian': '🇮🇹', 'English': '🇬🇧', 'Chinese': '🇨🇳'
    };
    return icons[language] || '🌐';
  };

  return (
    <div className="nb-modal-overlay" onClick={onClose}>
      <div className="nb-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
        {/* Header */}
        <div className="nb-modal-header" style={{ background: 'var(--nb-lime)' }}>
          <h2 className="nb-heading nb-heading-lg" style={{ margin: 0 }}>📊 Your Learning Stats</h2>
          <button onClick={onClose} className="nb-button" style={{ padding: 'var(--nb-space-sm)' }}>✕</button>
        </div>

        <div className="nb-modal-body">
          {/* Overall Stats */}
          <div className="nb-mb-xl">
            <h3 className="nb-heading nb-heading-md nb-mb-md">Overall Progress</h3>
            <div className="nb-grid nb-grid-4">
              <div className="nb-card nb-text-center" style={{ background: 'var(--nb-yellow)' }}>
                <div style={{ fontSize: '1.5rem' }}>⏱️</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                  {userStats?.total_duration_formatted || '0m'}
                </div>
                <div className="nb-text-xs">Total Time</div>
              </div>
              <div className="nb-card nb-text-center" style={{ background: 'var(--nb-cyan)' }}>
                <div style={{ fontSize: '1.5rem' }}>💬</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                  {userStats?.total_sessions || 0}
                </div>
                <div className="nb-text-xs">Sessions</div>
              </div>
              <div className="nb-card nb-text-center" style={{ background: 'var(--nb-orange)' }}>
                <div style={{ fontSize: '1.5rem' }}>🎯</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                  {userStats?.total_quizzes_completed || 0}
                </div>
                <div className="nb-text-xs">Quizzes</div>
              </div>
              <div className="nb-card nb-text-center" style={{ background: 'var(--nb-pink)' }}>
                <div style={{ fontSize: '1.5rem' }}>📇</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                  {userStats?.total_flashcards_mastered || 0}
                </div>
                <div className="nb-text-xs">Cards Mastered</div>
              </div>
            </div>
          </div>

          {/* Languages */}
          <div>
            <h3 className="nb-heading nb-heading-md nb-mb-md">Languages Practiced</h3>
            {languages.length > 0 ? (
              <div className="nb-flex nb-flex-col nb-gap-md">
                {languages.map((lang) => (
                  <div key={lang.language} className="nb-card" style={{ padding: 'var(--nb-space-md)' }}>
                    {/* Header */}
                    <div
                      className="nb-flex nb-flex-between"
                      style={{ cursor: 'pointer', marginBottom: 'var(--nb-space-md)' }}
                      onClick={() => setExpandedLanguage(expandedLanguage === lang.language ? null : lang.language)}
                    >
                      <div className="nb-flex nb-flex-center nb-gap-sm">
                        <span style={{ fontSize: '1.5rem' }}>{getLanguageIcon(lang.language)}</span>
                        <span className="nb-heading nb-heading-sm">{lang.language}</span>
                      </div>
                      <span>{expandedLanguage === lang.language ? '▲' : '▼'}</span>
                    </div>

                    {/* Compact Stats */}
                    <div className="nb-flex nb-gap-md nb-flex-wrap">
                      <span className="nb-badge" style={{ background: 'var(--nb-lime)' }}>
                        ⏱️ {lang.totalDurationFormatted || '0m'}
                      </span>
                      <span className="nb-badge" style={{ background: 'var(--nb-cyan)' }}>
                        💬 {lang.totalSessions || 0}
                      </span>
                      <span className="nb-badge" style={{ background: 'var(--nb-orange)' }}>
                        🎯 {lang.quizzesCompleted || 0}
                      </span>
                      <span className="nb-badge" style={{ background: 'var(--nb-pink)' }}>
                        📇 {lang.flashcardsMastered || 0}/{lang.totalFlashcards || 0}
                      </span>
                    </div>

                    {/* Expanded Details */}
                    {expandedLanguage === lang.language && (
                      <div style={{ marginTop: 'var(--nb-space-md)', paddingTop: 'var(--nb-space-md)', borderTop: '2px solid var(--nb-black)' }}>
                        <div className="nb-grid nb-grid-3">
                          <div className="nb-text-center">
                            <div className="nb-text-xs nb-text-muted">Messages</div>
                            <div style={{ fontWeight: '700' }}>{lang.totalMessages || 0}</div>
                          </div>
                          <div className="nb-text-center">
                            <div className="nb-text-xs nb-text-muted">Avg Score</div>
                            <div style={{ fontWeight: '700' }}>{Math.round(lang.averageQuizScore || 0)}%</div>
                          </div>
                          <div className="nb-text-center">
                            <div className="nb-text-xs nb-text-muted">Mastery</div>
                            <div style={{ fontWeight: '700' }}>
                              {lang.totalFlashcards > 0
                                ? Math.round((lang.flashcardsMastered / lang.totalFlashcards) * 100)
                                : 0}%
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="nb-text-center" style={{ padding: 'var(--nb-space-xl)' }}>
                <div style={{ fontSize: '3rem', marginBottom: 'var(--nb-space-md)' }}>📚</div>
                <p className="nb-text">No language data yet</p>
                <p className="nb-text-sm nb-text-muted">Complete a session to see your stats!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};