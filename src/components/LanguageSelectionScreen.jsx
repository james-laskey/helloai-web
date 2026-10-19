import React, { useMemo, useState } from 'react';
import { LANGUAGE_TOPICS } from '../constants/languageTopics';

/**
 * Second onboarding step: pick the language to start learning.
 *
 * Rendered by App after QuestionnaireScreen completes. The chosen
 * language is sent to the server via onComplete({ targetLanguage })
 * and becomes preferences.targetLanguage, so downstream screens never
 * see a null target language on first entry.
 *
 * Animations are pure CSS (see <style> below) with no dependencies.
 */
export const LanguageSelectionScreen = ({
  userData,
  nativeLanguage,
  learningGoals,
  onComplete,
}) => {
  const [selected, setSelected] = useState('');
  const [error, setError] = useState('');

  const languages = useMemo(() => Object.keys(LANGUAGE_TOPICS), []);

  const handleSelect = (lang) => {
    setError('');
    setSelected((prev) => (prev === lang ? '' : lang));
  };

  const handleContinue = () => {
    if (!selected) {
      setError('Please pick a language to start learning');
      return;
    }
    if (nativeLanguage && selected === nativeLanguage) {
      setError(
        'You picked the same language as your native language. Choose a different one.'
      );
      return;
    }

    onComplete({
      ...userData,
      nativeLanguage,
      learningGoals,
      learningStyle: null,
      targetLanguage: selected,
    });
  };

  return (
    <div
      className="nb-container lang-select-root"
      style={{
        background: 'var(--nb-purple)',
        padding: 'var(--nb-space-xl)',
        minHeight: '100vh',
      }}
    >
      {/* Scoped animations. No external stylesheet changes needed. */}
      <style>{`
        @keyframes langFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes langPop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.06); }
          100% { transform: scale(1); }
        }
        @keyframes langGlow {
          0%   { box-shadow: var(--nb-shadow-sm); }
          50%  { box-shadow: 0 0 0 4px rgba(0,0,0,0.08), var(--nb-shadow-hover); }
          100% { box-shadow: var(--nb-shadow-hover); }
        }
        @keyframes langButtonIn {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }

        .lang-select-root .lang-header {
          animation: langFadeUp 380ms ease-out both;
        }
        .lang-select-root .lang-card {
          animation: langFadeUp 420ms ease-out both;
        }
        .lang-select-root .lang-tile {
          transition: transform 160ms ease, box-shadow 160ms ease,
                      background 160ms ease;
          will-change: transform;
        }
        .lang-select-root .lang-tile:hover {
          transform: translateY(-4px);
        }
        .lang-select-root .lang-tile.lang-tile--selected {
          animation: langPop 260ms ease-out, langGlow 700ms ease-out both;
        }
        .lang-select-root .lang-continue {
          animation: langButtonIn 300ms ease-out both;
        }
        @media (prefers-reduced-motion: reduce) {
          .lang-select-root .lang-header,
          .lang-select-root .lang-card,
          .lang-select-root .lang-tile.lang-tile--selected,
          .lang-select-root .lang-continue {
            animation: none !important;
          }
          .lang-select-root .lang-tile:hover {
            transform: none;
          }
        }
      `}</style>

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div className="nb-text-center nb-mb-xl lang-header">
          <h1
            className="nb-heading nb-heading-xl"
            style={{ color: 'var(--nb-white)' }}
          >
            Pick your language
          </h1>
          <p className="nb-text" style={{ color: 'rgba(255,255,255,0.8)' }}>
            Choose the language you want to start learning. You can switch
            later from the topic screen.
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

        <div className="nb-card nb-mb-lg lang-card">
          <div
            className="nb-grid"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: 'var(--nb-space-md)',
            }}
          >
            {languages.map((lang, index) => {
              const isSelected = selected === lang;
              const isNative = nativeLanguage === lang;
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => handleSelect(lang)}
                  disabled={isNative}
                  title={
                    isNative
                      ? 'This is your native language'
                      : `Learn ${lang}`
                  }
                  className={`nb-card-hover lang-tile${
                    isSelected ? ' lang-tile--selected' : ''
                  }`}
                  style={{
                    padding: 'var(--nb-space-md)',
                    background: isSelected
                      ? 'var(--nb-lime)'
                      : 'var(--nb-white)',
                    border: 'var(--nb-border)',
                    boxShadow: isSelected
                      ? 'var(--nb-shadow-hover)'
                      : 'var(--nb-shadow-sm)',
                    cursor: isNative ? 'not-allowed' : 'pointer',
                    opacity: isNative ? 0.45 : 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 'var(--nb-space-sm)',
                    fontFamily: 'var(--nb-font)',
                    fontWeight: '600',
                    // Stagger the entrance of each tile.
                    animationDelay: `${80 + index * 45}ms`,
                  }}
                >
                  <span style={{ fontSize: '2rem' }}>
                    {LANGUAGE_TOPICS[lang].icon}
                  </span>
                  <span>{lang}</span>
                  {isNative && (
                    <span
                      className="nb-text-xs nb-text-muted"
                      style={{ fontWeight: 500 }}
                    >
                      Native
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={handleContinue}
          disabled={!selected}
          className="nb-button nb-button-primary nb-button-full lang-continue"
          style={{
            fontSize: '1.25rem',
            padding: 'var(--nb-space-lg)',
            opacity: selected ? 1 : 0.6,
          }}
        >
          {selected ? `Start learning ${selected} →` : 'Pick a language to continue'}
        </button>
      </div>
    </div>
  );
};