import React, { useEffect, useRef, useState } from 'react';
import { LANGUAGE_TOPICS } from '../constants/languageTopics';
import { MaterialIcon } from '../components/landing-page/icons';
import { StreakBadge } from '../components/StreakBadge';
import { ReadingLessonScreen } from './ReadingLessonScreen';
import { QuizScreen } from './QuizScreen';
import { FlashcardsFeature } from './FlashcardsFeature';
import { CrosswordGame } from '../components/crossword/CrosswordGame';
import { NinjaGame } from '../components/ninja/NinjaGame';
import { FortuneGame } from '../components/fortune/FortuneGame';
import { SettingsModal } from '../components/SettingsModal';
import { StatsModal } from '../components/StatsModal';

const FIRST_LANGUAGE = Object.keys(LANGUAGE_TOPICS)[0] || 'Spanish';

const FEATURES = [
  { id: 'reading',    label: 'Reading Lesson',  icon: 'MenuBook',          color: 'var(--nb-yellow)' },
  { id: 'flashcards', label: 'Flashcards',      icon: 'Style',             color: 'var(--nb-cyan)'   },
  { id: 'quiz',       label: 'Quiz',            icon: 'Quiz',              color: 'var(--nb-orange)' },
  { id: 'crossword',  label: 'Crossword',       icon: 'GridView',          color: 'var(--nb-lime)'   },
  { id: 'ninja',      label: 'Hello Ninja',     icon: 'SportsMartialArts', color: 'var(--nb-red)'    },
  { id: 'fortune',    label: 'Land of Fortune', icon: 'Casino',            color: 'var(--nb-purple)' },
];

/* ------------------------------------------------------------------ */

const useOutsideClick = (ref, cb) => {
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) cb();
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [ref, cb]);
};

const Dropdown = ({ label, valueLabel, hasValue, children }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClick(ref, () => setOpen(false));

  return (
    <div className="dash-dd" ref={ref}>
      <button
        type="button"
        className={`dash-dd__btn ${open ? 'dash-dd__btn--open' : ''} ${
          hasValue ? 'dash-dd__btn--active' : ''
        }`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="dash-dd__btn__label">{label}</span>
        <span className="dash-dd__btn__value">{valueLabel || '—'}</span>
        <span className="dash-dd__chevron">
          <MaterialIcon name="ExpandMore" size={16} color="var(--nb-black)" />
        </span>
      </button>

      {open && (
        <div className="dash-dd__panel" role="menu" onClick={() => setOpen(false)}>
          {children}
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */

export const DashboardScreen = ({
  user,
  userPreferences,
  userId,
  streak,

  selectedLanguage,
  onSelectLanguage,
  selectedTopic,
  onSelectTopic,
  learningMode,
  onSelectFeature,

  lesson,
  isLessonLoading,
  lessonError,
  onStartLesson,
  onRetryLesson,
  onLessonComplete,
  onLessonProgress,
  onSelectPreviousLesson,

  speakText,
  stopSpeaking,
  isSpeaking,
  isMuted,
  onToggleMute,
  activeSentenceIndex,
  setActiveSentenceIndex,

  userStats,
  showStats,
  onToggleStats,
  onFetchStats,

  onActivityComplete,

  onUpdatePreferences,
  onLogout,
  onDeleteAccount,

  onFeatureBack,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const language = selectedLanguage || FIRST_LANGUAGE;
  const languageData = LANGUAGE_TOPICS[language];
  const topics = languageData?.topics || [];
  const feature = FEATURES.find((f) => f.id === learningMode) || null;

  useEffect(() => {
    if (!selectedLanguage) onSelectLanguage?.(FIRST_LANGUAGE);
  }, [selectedLanguage, onSelectLanguage]);

  useEffect(() => {
    if (selectedTopic && !topics.some((t) => t.id === selectedTopic.id)) {
      onSelectTopic?.(null);
    }
  }, [language, selectedTopic, topics, onSelectTopic]);

  useEffect(() => {
    if (!selectedTopic && topics.length > 0) {
      onSelectTopic?.(topics[0]);
    }
  }, [topics, selectedTopic, onSelectTopic]);

  /* -------- Fullscreen toggle -------- */
  const toggleFullscreen = () => setFullscreen((v) => !v);

  /* ---------------- View ---------------- */
  const renderView = () => {
    if (!feature) {
      return (
        <div className="dash-empty">
          <div className="dash-empty__icon">✦</div>
          <h2 className="dash-empty__title">Pick a feature</h2>
          <p className="dash-empty__text">
            Choose a feature from the header to load it here.
          </p>
        </div>
      );
    }

    if (!selectedTopic) {
      return (
        <div className="dash-empty">
          <div className="dash-empty__icon">◈</div>
          <h2 className="dash-empty__title">Pick a topic</h2>
          <p className="dash-empty__text">
            Choose a topic from the header to start {feature.label}.
          </p>
        </div>
      );
    }

    switch (feature.id) {
      case 'reading':
        return (
          <ReadingLessonScreen
            lesson={lesson}
            language={language}
            userId={userId}
            topicId={selectedTopic.id}
            userPreferences={userPreferences}
            speakText={speakText}
            stopSpeaking={stopSpeaking}
            isSpeaking={isSpeaking}
            isMuted={isMuted}
            onToggleMute={onToggleMute}
            activeSentenceIndex={activeSentenceIndex}
            setActiveSentenceIndex={setActiveSentenceIndex}
            isLessonLoading={isLessonLoading}
            lessonError={lessonError}
            onStartLesson={onStartLesson}
            onRetryLesson={onRetryLesson}
            onLessonComplete={onLessonComplete}
            onLessonProgress={onLessonProgress}
            onSelectPreviousLesson={onSelectPreviousLesson}
            onBack={onFeatureBack}
            streak={streak}
          />
        );

      case 'flashcards':
        return (
          <FlashcardsFeature
            userId={userId}
            userPreferences={userPreferences}
            language={language}
            selectedTopic={selectedTopic}
            topics={topics}
            onSelectTopic={onSelectTopic}
            onActivityComplete={onActivityComplete}
            onBack={onFeatureBack}
          />
        );

      case 'quiz':
        return (
          <QuizScreen
            language={language}
            nativeLanguage={userPreferences?.nativeLanguage || 'English'}
            userId={userId}
            topicId={selectedTopic.id}
            topicName={selectedTopic.name}
            userPreferences={userPreferences}
            onBack={onFeatureBack}
            onActivityComplete={onActivityComplete}
            streak={streak}
          />
        );

      case 'crossword':
        return (
          <CrosswordGame
            userId={userId}
            language={language}
            topicId={selectedTopic.id}
            topicName={selectedTopic.name}
            userPreferences={userPreferences}
            onBack={onFeatureBack}
            onActivityComplete={onActivityComplete}
          />
        );

      case 'ninja':
        return (
          <NinjaGame
            userId={userId}
            language={language}
            topicId={selectedTopic.id}
            topicName={selectedTopic.name}
            onBack={onFeatureBack}
            onActivityComplete={onActivityComplete}
          />
        );

      case 'fortune':
        return (
          <FortuneGame
            userId={userId}
            language={language}
            topicId={selectedTopic.id}
            topicName={selectedTopic.name}
            onBack={onFeatureBack}
            onActivityComplete={onActivityComplete}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`dash-root${fullscreen ? ' dash-root--fullscreen' : ''}`}
    >
      <div className="dash-grid-bg" aria-hidden="true" />

      <header className="dash-topbar">
        <div className="dash-brand">
          <span className="dash-brand__mark">
            <img
              src="/images/logo.svg"
              alt="Hello AI"
              className="dash-brand__logo"
              draggable={false}
            />
          </span>
          Hello<span className="dash-brand__accent">.AI</span>
        </div>

        <Dropdown label="Language" hasValue={!!language} valueLabel={language}>
          <div className="dash-dd__group">Target language</div>
          {Object.keys(LANGUAGE_TOPICS).map((lang) => {
            const isSel = lang === language;
            return (
              <button
                key={lang}
                className={`dash-dd__item ${
                  isSel ? 'dash-dd__item--selected' : ''
                }`}
                onClick={() => {
                  onSelectLanguage?.(lang);
                  onSelectTopic?.(null);
                  onSelectFeature?.(null);
                }}
              >
                <span aria-hidden>{LANGUAGE_TOPICS[lang].icon}</span>
                <span className="dash-dd__item__name">{lang}</span>
                {isSel && (
                  <span className="dash-dd__check">
                    <MaterialIcon name="Check" size={16} color="var(--nb-black)" />
                  </span>
                )}
              </button>
            );
          })}
        </Dropdown>

        <Dropdown
          label="Feature"
          hasValue={!!feature}
          valueLabel={feature?.label || 'Choose'}
        >
          <div className="dash-dd__group">Learning feature</div>
          {FEATURES.map((f) => {
            const isSel = f.id === feature?.id;
            return (
              <button
                key={f.id}
                className={`dash-dd__item ${
                  isSel ? 'dash-dd__item--selected' : ''
                }`}
                onClick={() => onSelectFeature?.(f.id)}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 22,
                    height: 22,
                    flexShrink: 0,
                    background: f.color,
                    border: '2px solid var(--nb-black)',
                    borderRadius: 4,
                  }}
                >
                  <MaterialIcon name={f.icon} size={14} color="var(--nb-black)" />
                </span>
                <span className="dash-dd__item__name">{f.label}</span>
                {isSel && (
                  <span className="dash-dd__check">
                    <MaterialIcon name="Check" size={16} color="var(--nb-black)" />
                  </span>
                )}
              </button>
            );
          })}
        </Dropdown>

        <Dropdown
          label="Topic"
          hasValue={!!selectedTopic}
          valueLabel={selectedTopic?.name || 'Choose'}
        >
          <div className="dash-dd__group">Topics · {language}</div>
          {topics.length === 0 ? (
            <div
              style={{
                padding: 'var(--nb-space-md)',
                fontSize: '0.82rem',
                color: 'var(--nb-text-muted)',
              }}
            >
              No topics for this language yet.
            </div>
          ) : (
            topics.map((topic) => {
              const isSel = selectedTopic?.id === topic.id;
              return (
                <button
                  key={topic.id}
                  className={`dash-dd__item ${
                    isSel ? 'dash-dd__item--selected' : ''
                  }`}
                  onClick={() => onSelectTopic?.(topic)}
                >
                  <span className="dash-dd__item__name">
                    {topic.name}
                    <span className="dash-dd__item__sub">
                      {topic.concept} · {topic.level}
                    </span>
                  </span>
                  {isSel && (
                    <span className="dash-dd__check">
                      <MaterialIcon
                        name="Check"
                        size={16}
                        color="var(--nb-black)"
                      />
                    </span>
                  )}
                </button>
              );
            })
          )}
        </Dropdown>

        <StreakBadge streak={streak} />

        <button
          type="button"
          className="dash-btn dash-btn--icon dash-btn--ghost"
          aria-label="Open stats"
          onClick={() => {
            onFetchStats?.();
            onToggleStats?.();
          }}
        >
          <MaterialIcon name="Insights" size={16} color="var(--nb-black)" />
        </button>

        <button
          type="button"
          className="dash-btn dash-btn--icon dash-btn--ghost"
          aria-label="Open settings"
          onClick={() => setShowSettings(true)}
        >
          <MaterialIcon name="Settings" size={16} color="var(--nb-black)" />
        </button>
      </header>

      <main className="dash-view">
        <div className="dash-welcome">
          <h1 className="dash-welcome__hello">
            Welcome back<span>,</span> {user?.name || 'learner'}
          </h1>
          <p className="dash-welcome__sub">
            {language} · {topics.length} topics
          </p>
          <div className="dash-welcome__badges">
            <span className="dash-badge dash-badge--lime">Free forever</span>
            <span className="dash-badge dash-badge--cyan">
              {feature ? feature.label : 'No feature selected'}
            </span>
          </div>
        </div>

        {renderView()}
      </main>

      {/* Fullscreen FAB — bottom-right, always visible so entering
          and exiting fullscreen is the same gesture. */}
      <button
        type="button"
        className="dash-fs-fab"
        onClick={toggleFullscreen}
        aria-label={fullscreen ? 'Exit full screen' : 'Enter full screen'}
        title={fullscreen ? 'Exit full screen' : 'Enter full screen'}
      >
        <MaterialIcon
          name={fullscreen ? 'FullscreenExit' : 'Fullscreen'}
          size={22}
          color={fullscreen ? 'var(--nb-white)' : 'var(--nb-black)'}
        />
      </button>

      <StatsModal
        visible={showStats}
        onClose={onToggleStats}
        userStats={userStats}
      />

      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        userPreferences={userPreferences}
        selectedLanguage={language}
        onUpdatePreferences={onUpdatePreferences}
        onLogout={onLogout}
        user={user}
        onDeleteAccount={onDeleteAccount}
      />
    </div>
  );
};

export default DashboardScreen;