import React, { useState } from 'react';
import { LANGUAGE_TOPICS } from '../constants/languageTopics';

export const SettingsModal = ({
  visible,
  onClose,
  userPreferences,
  selectedLanguage,
  onUpdatePreferences,
  onLogout
}) => {
  const [tempPreferences, setTempPreferences] = useState(userPreferences);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!visible) return null;

  const proficiencyLevels = [
    { value: 1, label: 'Absolute Beginner' },
    { value: 2, label: 'Very Basic' },
    { value: 3, label: 'Basic' },
    { value: 4, label: 'Elementary' },
    { value: 5, label: 'Lower Intermediate' },
    { value: 6, label: 'Intermediate' },
    { value: 7, label: 'Upper Intermediate' },
    { value: 8, label: 'Advanced' },
    { value: 9, label: 'Very Advanced' },
    { value: 10, label: 'Proficient' },
  ];

  const learningStyles = [
    { id: 'Visual', label: 'Visual', icon: '👁️' },
    { id: 'Auditory', label: 'Auditory', icon: '👂' },
    { id: 'Reading/Writing', label: 'Reading/Writing', icon: '📖' },
    { id: 'Kinesthetic', label: 'Kinesthetic', icon: '🏃' },
  ];

  const handleSave = () => {
    onUpdatePreferences(tempPreferences);
    onClose();
  };

  const handleLogout = () => {
    onClose();
    onLogout();
  };

  const currentLanguageData = LANGUAGE_TOPICS[selectedLanguage];

  return (
    <div className="nb-modal-overlay" onClick={onClose}>
      <div className="nb-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        {/* Header */}
        <div className="nb-modal-header" style={{ background: 'var(--nb-cyan)' }}>
          <h2 className="nb-heading nb-heading-lg" style={{ margin: 0 }}>⚙️ Settings</h2>
          <button onClick={onClose} className="nb-button" style={{ padding: 'var(--nb-space-sm)' }}>✕</button>
        </div>

        <div className="nb-modal-body">
          {/* Profile */}
          <div className="nb-text-center nb-mb-xl">
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto var(--nb-space-md)',
              background: 'var(--nb-lime)',
              border: 'var(--nb-border)',
              boxShadow: 'var(--nb-shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem'
            }}>
              👤
            </div>
            <h3 className="nb-heading nb-heading-md">{userPreferences?.name || 'Language Learner'}</h3>
            <p className="nb-text-sm nb-text-muted">{userPreferences?.email || 'learner@example.com'}</p>
          </div>

          {/* Proficiency Level */}
          <div className="nb-mb-xl">
            <h4 className="nb-heading nb-heading-sm nb-mb-sm">Proficiency Level</h4>
            <div className="nb-flex nb-flex-wrap nb-gap-sm">
              {proficiencyLevels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setTempPreferences({ ...tempPreferences, proficiencyLevel: level.value })}
                  className="nb-card-hover"
                  style={{
                    padding: 'var(--nb-space-sm) var(--nb-space-md)',
                    background: tempPreferences?.proficiencyLevel === level.value ? 'var(--nb-lime)' : 'var(--nb-white)',
                    border: 'var(--nb-border)',
                    boxShadow: 'var(--nb-shadow-sm)',
                    cursor: 'pointer',
                    fontFamily: 'var(--nb-font)',
                    fontWeight: '600',
                    fontSize: '0.875rem'
                  }}
                >
                  {level.value} - {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* Learning Style */}
          <div className="nb-mb-xl">
            <h4 className="nb-heading nb-heading-sm nb-mb-sm">Learning Style</h4>
            <div className="nb-grid nb-grid-2">
              {learningStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setTempPreferences({ ...tempPreferences, preferredLearningStyle: style.id })}
                  className="nb-card-hover"
                  style={{
                    padding: 'var(--nb-space-md)',
                    background: tempPreferences?.preferredLearningStyle === style.id ? 'var(--nb-cyan)' : 'var(--nb-white)',
                    border: 'var(--nb-border)',
                    boxShadow: 'var(--nb-shadow-sm)',
                    cursor: 'pointer',
                    fontFamily: 'var(--nb-font)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--nb-space-sm)',
                    fontWeight: '600'
                  }}
                >
                  <span>{style.icon}</span>
                  <span>{style.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Language Info */}
          <div className="nb-card nb-mb-xl" style={{ background: 'var(--nb-gray)' }}>
            <h4 className="nb-heading nb-heading-sm nb-mb-md">Language Information</h4>
            <div className="nb-flex nb-flex-col nb-gap-sm">
              <div className="nb-flex nb-flex-between">
                <span className="nb-text-sm nb-text-muted">Target Language:</span>
                <span className="nb-flex nb-flex-center nb-gap-sm">
                  <span>{currentLanguageData?.icon}</span>
                  <span style={{ fontWeight: '600' }}>{selectedLanguage}</span>
                </span>
              </div>
              <div className="nb-flex nb-flex-between">
                <span className="nb-text-sm nb-text-muted">Native Language:</span>
                <span className="nb-flex nb-flex-center nb-gap-sm">
                  <span>{LANGUAGE_TOPICS[tempPreferences?.nativeLanguage]?.icon || '🌐'}</span>
                  <span style={{ fontWeight: '600' }}>{tempPreferences?.nativeLanguage || 'Not set'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="nb-flex nb-flex-col nb-gap-md">
            <button className="nb-button nb-button-primary nb-button-full" onClick={handleSave}>
              💾 Save Changes
            </button>

            {!showLogoutConfirm ? (
              <button
                className="nb-button nb-button-danger nb-button-full"
                onClick={() => setShowLogoutConfirm(true)}
              >
                🚪 Logout
              </button>
            ) : (
              <div className="nb-card" style={{ background: 'var(--nb-red)', color: 'var(--nb-white)' }}>
                <p className="nb-mb-md">Are you sure you want to logout?</p>
                <div className="nb-flex nb-gap-md">
                  <button
                    className="nb-button nb-button-full"
                    onClick={() => setShowLogoutConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="nb-button nb-button-danger nb-button-full"
                    onClick={handleLogout}
                    style={{ background: 'var(--nb-dark-gray)' }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          <p className="nb-text-xs nb-text-muted nb-text-center nb-mt-lg">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
};