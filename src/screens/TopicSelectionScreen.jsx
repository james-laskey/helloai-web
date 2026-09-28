import React, { useState } from 'react';
import { LANGUAGE_TOPICS } from '../constants/languageTopics';
import { StatsModal } from '../components/StatsModal';
import { SettingsModal } from '../components/SettingsModal';
import { TopicCard } from '../components/TopicCard';
import { MaterialIcon } from '../components/landing-page/icons';

export const TopicSelectionScreen = ({
  selectedLanguage,
  onSelectLanguage,
  onSelectTopic,
  userStats,
  showStats,
  onToggleStats,
  onFetchStats,
  userPreferences,
  onUpdatePreferences,
  onLogout,
  user,
  onDeleteAccount,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const currentLanguageData = LANGUAGE_TOPICS[selectedLanguage];
  const topics = currentLanguageData?.topics || [];

  const handleStatsPress = async () => {
    setIsLoadingStats(true);
    try {
      await onFetchStats();
      onToggleStats();
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  return (
    <div className="nb-container" style={{ background: 'var(--nb-purple)' }}>
      <StatsModal
        visible={showStats}
        onClose={onToggleStats}
        userStats={userStats}
      />

      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        userPreferences={userPreferences}
        selectedLanguage={selectedLanguage}
        onUpdatePreferences={onUpdatePreferences}
        onLogout={onLogout}
        user={user}
        onDeleteAccount={onDeleteAccount}
      />

      {/* Top Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--nb-space-md) var(--nb-space-lg)',
          borderBottom: 'var(--nb-border)',
          background: 'var(--nb-white)',
        }}
      >
        {/* Language Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="nb-button"
            style={{
              padding: 'var(--nb-space-sm) var(--nb-space-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <MaterialIcon name="Public" size={18} color="var(--nb-black)" />
            {selectedLanguage}
            <MaterialIcon name="ArrowDropDown" size={18} color="var(--nb-black)" />
          </button>

          {showLanguageMenu && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: 'var(--nb-space-sm)',
                background: 'var(--nb-white)',
                border: 'var(--nb-border)',
                boxShadow: 'var(--nb-shadow)',
                zIndex: 100,
                minWidth: '220px',
              }}
            >
              {Object.keys(LANGUAGE_TOPICS).map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    onSelectLanguage(lang);
                    setShowLanguageMenu(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--nb-space-sm)',
                    width: '100%',
                    padding: 'var(--nb-space-md)',
                    background:
                      selectedLanguage === lang
                        ? 'var(--nb-lime)'
                        : 'var(--nb-white)',
                    border: 'none',
                    borderBottom: '2px solid var(--nb-black)',
                    cursor: 'pointer',
                    fontFamily: 'var(--nb-font)',
                    fontSize: '1rem',
                    fontWeight: '600',
                    textAlign: 'left',
                  }}
                >
                  <MaterialIcon name="Language" size={18} color="var(--nb-black)" />
                  <span>{lang}</span>
                  {selectedLanguage === lang && (
                    <MaterialIcon
                      name="Check"
                      size={18}
                      color="var(--nb-black)"
                      style={{ marginLeft: 'auto' }}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="nb-flex nb-gap-sm">
          <button
            onClick={handleStatsPress}
            className="nb-button"
            disabled={isLoadingStats}
            style={{
              padding: 'var(--nb-space-sm) var(--nb-space-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <MaterialIcon
              name={isLoadingStats ? 'HourglassEmpty' : 'Insights'}
              size={18}
              color="var(--nb-black)"
            />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="nb-button"
            style={{
              padding: 'var(--nb-space-sm) var(--nb-space-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <MaterialIcon name="Settings" size={18} color="var(--nb-black)" />
          </button>
        </div>
      </div>

      {/* Header */}
      <div
        style={{
          padding: 'var(--nb-space-xl) var(--nb-space-lg)',
          textAlign: 'center',
          background: 'var(--nb-yellow)',
          borderBottom: 'var(--nb-border)',
        }}
      >
        <h1
          className="nb-heading nb-heading-xl"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            margin: 0,
          }}
        >
          <MaterialIcon name="Translate" size={40} color="var(--nb-black)" />
          {selectedLanguage}
        </h1>
        <p className="nb-text nb-text-muted nb-mt-sm">
          Choose a topic to practice
        </p>
      </div>

      {/* Topics Grid */}
      <div
        style={{
          padding: 'var(--nb-space-lg)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: 'var(--nb-space-lg)',
        }}
      >
        {topics.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            languageColor={currentLanguageData?.color}
            onSelect={onSelectTopic}
          />
        ))}
      </div>
    </div>
  );
};