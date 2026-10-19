import React, { useState } from 'react';
import { LANGUAGE_TOPICS } from '../constants/languageTopics';

export const QuestionnaireScreen = ({ userData, onComplete }) => {
  const [nativeLanguage, setNativeLanguage] = useState('');
  const [learningGoals, setLearningGoals] = useState([]);
  const [error, setError] = useState('');

  const allLanguages = Object.keys(LANGUAGE_TOPICS);

  const goalOptions = [
    { id: 'for work', label: 'For work', icon: '💼' },
    { id: 'for travel', label: 'For travel', icon: '✈️' },
    { id: 'for fun', label: 'For fun', icon: '🎉' },
  ];

  const toggleGoal = (goalId) => {
    if (learningGoals.includes(goalId)) {
      setLearningGoals(learningGoals.filter((g) => g !== goalId));
    } else {
      setLearningGoals([...learningGoals, goalId]);
    }
  };

  const handleSubmit = () => {
    if (!nativeLanguage) {
      setError('Please select your native language');
      return;
    }
    if (learningGoals.length === 0) {
      setError('Please select at least one learning goal');
      return;
    }

    // No targetLanguage here — the next screen picks it.
    onComplete({
      ...userData,
      nativeLanguage,
      learningGoals,
      learningStyle: null,
    });
  };

  return (
    <div
      className="nb-container q-root"
      style={{
        background: 'var(--nb-purple)',
        padding: 'var(--nb-space-xl)',
      }}
    >
      <style>{`
        @keyframes qFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .q-root .q-header { animation: qFadeUp 360ms ease-out both; }
        .q-root .q-card   { animation: qFadeUp 420ms ease-out both; }
        .q-root .q-tile {
          transition: transform 150ms ease, box-shadow 150ms ease,
                      background 150ms ease;
        }
        .q-root .q-tile:hover { transform: translateY(-3px); }
        @media (prefers-reduced-motion: reduce) {
          .q-root .q-header,
          .q-root .q-card { animation: none !important; }
          .q-root .q-tile:hover { transform: none; }
        }
      `}</style>

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div className="nb-text-center nb-mb-xl q-header">
          <h1
            className="nb-heading nb-heading-xl"
            style={{ color: 'var(--nb-white)' }}
          >
            Tell us about yourself
          </h1>
          <p className="nb-text" style={{ color: 'rgba(255,255,255,0.8)' }}>
            Help us personalize your learning experience
          </p>
        </div>

        {error && (
          <div
            style={{
              background: 'var(--nb-red)',
              color: 'var(--nb-white)',
              padding: 'var(--nb-space-md)',
              border: 'var(--nb-border)',
              boxShadow: 'var(--nb-shadow-sm)',
              marginBottom: 'var(--nb-space-lg)',
              fontWeight: '600',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <div className="nb-card nb-mb-lg q-card" style={{ animationDelay: '60ms' }}>
          <h2 className="nb-heading nb-heading-md nb-mb-sm">
            🏠 What is your native language?
          </h2>
          <p className="nb-text nb-text-sm nb-text-muted nb-mb-md">
            This helps us provide better explanations in your language
          </p>
          <div
            className="nb-grid"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
            }}
          >
            {allLanguages.map((lang, index) => (
              <button
                key={lang}
                type="button"
                onClick={() => setNativeLanguage(lang)}
                className="nb-card-hover q-tile"
                style={{
                  padding: 'var(--nb-space-md)',
                  background:
                    nativeLanguage === lang
                      ? 'var(--nb-cyan)'
                      : 'var(--nb-white)',
                  border: 'var(--nb-border)',
                  boxShadow:
                    nativeLanguage === lang
                      ? 'var(--nb-shadow-hover)'
                      : 'var(--nb-shadow-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--nb-space-sm)',
                  fontFamily: 'var(--nb-font)',
                  fontWeight: '600',
                  animation: 'qFadeUp 420ms ease-out both',
                  animationDelay: `${120 + index * 30}ms`,
                }}
              >
                <span style={{ fontSize: '2rem' }}>
                  {LANGUAGE_TOPICS[lang].icon}
                </span>
                <span>{lang}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="nb-card nb-mb-lg q-card" style={{ animationDelay: '140ms' }}>
          <h2 className="nb-heading nb-heading-md nb-mb-sm">
            🎯 What are your learning goals?
          </h2>
          <p className="nb-text nb-text-sm nb-text-muted nb-mb-md">
            Select all that apply
          </p>
          <div className="nb-flex nb-flex-col nb-gap-md">
            {goalOptions.map((goal, index) => (
              <button
                key={goal.id}
                type="button"
                onClick={() => toggleGoal(goal.id)}
                className="nb-card-hover q-tile"
                style={{
                  padding: 'var(--nb-space-md)',
                  background: learningGoals.includes(goal.id)
                    ? 'var(--nb-lime)'
                    : 'var(--nb-white)',
                  border: 'var(--nb-border)',
                  boxShadow: learningGoals.includes(goal.id)
                    ? 'var(--nb-shadow-hover)'
                    : 'var(--nb-shadow-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--nb-space-md)',
                  fontFamily: 'var(--nb-font)',
                  fontSize: '1rem',
                  fontWeight: '600',
                  textAlign: 'left',
                  animation: 'qFadeUp 420ms ease-out both',
                  animationDelay: `${200 + index * 50}ms`,
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>{goal.icon}</span>
                <span>{goal.label}</span>
                {learningGoals.includes(goal.id) && (
                  <span style={{ marginLeft: 'auto', fontSize: '1.25rem' }}>
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="nb-button nb-button-primary nb-button-full"
          style={{ fontSize: '1.25rem', padding: 'var(--nb-space-lg)' }}
        >
          Next: choose a language →
        </button>
      </div>
    </div>
  );
};