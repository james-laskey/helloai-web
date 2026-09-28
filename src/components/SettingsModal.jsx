import React, { useState, useEffect } from 'react';
import { LANGUAGE_TOPICS } from '../constants/languageTopics';

export const SettingsModal = ({
  visible,
  onClose,
  user,
  userPreferences,
  selectedLanguage,
  onUpdatePreferences,
  onDeleteAccount,      // async () => requestDeletionResponse
  onLogout,
}) => {
  const [tempPreferences, setTempPreferences] = useState(userPreferences);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletionRequested, setDeletionRequested] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Resync temp state whenever the modal opens or the source changes.
  useEffect(() => {
    if (visible) {
      setTempPreferences(userPreferences);
      setShowLogoutConfirm(false);
      setShowDeleteConfirm(false);
      setDeletionRequested(false);
      setError('');
    }
  }, [visible, userPreferences]);

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

  const allLanguages = Object.keys(LANGUAGE_TOPICS);

  const handleSave = async () => {
    setError('');
    setIsSaving(true);
    try {
      await onUpdatePreferences(tempPreferences);
      onClose();
    } catch (err) {
      console.error('Save preferences failed:', err);
      setError('Could not save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    onClose();
    onLogout();
  };

  // Step 1 of deletion: request the verification email.
  // Does NOT delete anything. The user must click the link in the email.
  const handleRequestDeletion = async () => {
  if (!onDeleteAccount) return;
  setError('');
  setIsDeleting(true);
  try {
    const result = await onDeleteAccount();

    // Defensive: if the caller returned nothing, treat it as a failure.
    if (!result || typeof result !== 'object') {
      setError('Unexpected response from server. Please try again.');
      return;
    }

    if (result.emailSent === false) {
      setError(
        result.message ||
          'The request went through, but we could not send the email. Try again in a moment.'
      );
      setDeletionRequested(false);
    } else {
      setDeletionRequested(true);
    }
  } catch (err) {
    console.error('Request account deletion failed:', err);
    setError(
      err?.message ||
        'Could not request deletion. Please try again or contact support.'
    );
  } finally {
    setIsDeleting(false);
  }
};

  const currentLanguageData = LANGUAGE_TOPICS[selectedLanguage];

  const displayName = user?.name || userPreferences?.name || 'Language Learner';
  const displayEmail =
    user?.email || userPreferences?.email || 'learner@example.com';
  const hasRealEmail = Boolean(user?.email || userPreferences?.email);

  return (
    <div className="nb-modal-overlay" onClick={onClose}>
      <div
        className="nb-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px' }}
      >
        {/* Header */}
        <div className="nb-modal-header" style={{ background: 'var(--nb-cyan)' }}>
          <h2 className="nb-heading nb-heading-lg" style={{ margin: 0 }}>
            Settings
          </h2>
          <button
            onClick={onClose}
            className="nb-button"
            style={{ padding: 'var(--nb-space-sm)' }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="nb-modal-body">
          {/* Profile */}
          <div className="nb-text-center nb-mb-xl">
            <div
              style={{
                width: '80px',
                height: '80px',
                margin: '0 auto var(--nb-space-md)',
                background: 'var(--nb-lime)',
                border: 'var(--nb-border)',
                boxShadow: 'var(--nb-shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
              }}
            >
              👤
            </div>
            <h3 className="nb-heading nb-heading-md">{displayName}</h3>
            {hasRealEmail ? (
              <p className="nb-text-sm nb-text-muted">{displayEmail}</p>
            ) : (
              <p
                className="nb-text-sm nb-text-muted"
                style={{ fontStyle: 'italic' }}
              >
                Email not available — sign in again to refresh your profile.
              </p>
            )}
          </div>

          {error && (
            <div
              className="nb-card nb-mb-lg"
              style={{
                background: 'var(--nb-red)',
                color: 'var(--nb-white)',
                padding: 'var(--nb-space-md)',
              }}
            >
              <p style={{ margin: 0, fontWeight: 600 }}>⚠ {error}</p>
            </div>
          )}

          {/* Proficiency Level */}
          <div className="nb-mb-xl">
            <h4 className="nb-heading nb-heading-sm nb-mb-sm">
              Proficiency Level
            </h4>
            <div className="nb-flex nb-flex-wrap nb-gap-sm">
              {proficiencyLevels.map((level) => (
                <button
                  key={level.value}
                  onClick={() =>
                    setTempPreferences({
                      ...tempPreferences,
                      proficiencyLevel: level.value,
                    })
                  }
                  className="nb-card-hover"
                  style={{
                    padding: 'var(--nb-space-sm) var(--nb-space-md)',
                    background:
                      tempPreferences?.proficiencyLevel === level.value
                        ? 'var(--nb-lime)'
                        : 'var(--nb-white)',
                    border: 'var(--nb-border)',
                    boxShadow: 'var(--nb-shadow-sm)',
                    cursor: 'pointer',
                    fontFamily: 'var(--nb-font)',
                    fontWeight: '600',
                    fontSize: '0.875rem',
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
                  onClick={() =>
                    setTempPreferences({
                      ...tempPreferences,
                      preferredLearningStyle: style.id,
                    })
                  }
                  className="nb-card-hover"
                  style={{
                    padding: 'var(--nb-space-md)',
                    background:
                      tempPreferences?.preferredLearningStyle === style.id
                        ? 'var(--nb-cyan)'
                        : 'var(--nb-white)',
                    border: 'var(--nb-border)',
                    boxShadow: 'var(--nb-shadow-sm)',
                    cursor: 'pointer',
                    fontFamily: 'var(--nb-font)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--nb-space-sm)',
                    fontWeight: '600',
                  }}
                >
                  <span>{style.icon}</span>
                  <span>{style.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Language Information */}
          <div
            className="nb-card nb-mb-xl"
            style={{ background: 'var(--nb-gray)' }}
          >
            <h4 className="nb-heading nb-heading-sm nb-mb-md">
              Language Information
            </h4>
            <div className="nb-flex nb-flex-col nb-gap-md">
              <div>
                <label className="nb-label">Target Language</label>
                <select
                  value={tempPreferences?.targetLanguage || selectedLanguage}
                  onChange={(e) =>
                    setTempPreferences({
                      ...tempPreferences,
                      targetLanguage: e.target.value,
                    })
                  }
                  className="nb-input nb-select"
                  style={{ width: '100%' }}
                >
                  {allLanguages.map((lang) => (
                    <option key={lang} value={lang}>
                      {LANGUAGE_TOPICS[lang]?.icon} {lang}
                    </option>
                  ))}
                </select>
                {tempPreferences?.targetLanguage &&
                  tempPreferences.targetLanguage !== selectedLanguage && (
                    <p
                      className="nb-text-xs nb-mt-sm"
                      style={{
                        color: 'var(--nb-orange, #f97316)',
                        fontWeight: 600,
                      }}
                    >
                      Changing this will switch your active learning language
                      after you save.
                    </p>
                  )}
              </div>

              <div>
                <label className="nb-label">Native Language</label>
                <select
                  value={tempPreferences?.nativeLanguage || ''}
                  onChange={(e) =>
                    setTempPreferences({
                      ...tempPreferences,
                      nativeLanguage: e.target.value,
                    })
                  }
                  className="nb-input nb-select"
                  style={{ width: '100%' }}
                >
                  <option value="">Select your native language</option>
                  {allLanguages.map((lang) => (
                    <option key={lang} value={lang}>
                      {LANGUAGE_TOPICS[lang]?.icon} {lang}
                    </option>
                  ))}
                </select>
              </div>

              {tempPreferences?.targetLanguage &&
                tempPreferences?.nativeLanguage &&
                tempPreferences.targetLanguage ===
                  tempPreferences.nativeLanguage && (
                  <p
                    className="nb-text-xs"
                    style={{ color: 'var(--nb-red)', fontWeight: 600 }}
                  >
                    Target and native languages cannot be the same.
                  </p>
                )}
            </div>
          </div>

          {/* Actions */}
          <div className="nb-flex nb-flex-col nb-gap-md">
            <button
              className="nb-button nb-button-primary nb-button-full"
              onClick={handleSave}
              disabled={isSaving || isDeleting || deletionRequested}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>

            {/* Logout */}
            {!showLogoutConfirm ? (
              <button
                className="nb-button nb-button-full"
                onClick={() => setShowLogoutConfirm(true)}
                disabled={isDeleting || deletionRequested}
              >
                Logout
              </button>
            ) : (
              <div
                className="nb-card"
                style={{ background: 'var(--nb-yellow)' }}
              >
                <p className="nb-mb-md" style={{ fontWeight: 600 }}>
                  Are you sure you want to logout?
                </p>
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
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}

            {/* Delete Account — three states */}
            {deletionRequested ? (
              /* State 3: request succeeded — show the "check email" card */
              <div
                className="nb-card"
                style={{
                  background: 'var(--nb-lime)',
                  marginTop: 'var(--nb-space-md)',
                }}
              >
                <p className="nb-mb-sm" style={{ fontWeight: 700 }}>
                  Confirmation email sent
                </p>
                <p className="nb-text-sm nb-mb-md">
                  We sent a deletion link to <strong>{displayEmail}</strong>.
                  Open that email and click the confirmation button to
                  permanently delete your account. The link expires in 1 hour.
                </p>
                <p className="nb-text-sm nb-mb-md" style={{ fontWeight: 600 }}>
                  After confirming, refresh the Hello Ai app to complete the
                  logout.
                </p>
                <button
                  className="nb-button nb-button-full"
                  onClick={() => {
                    setDeletionRequested(false);
                    setShowDeleteConfirm(false);
                  }}
                >
                  Close
                </button>
              </div>
            ) : !showDeleteConfirm ? (
              /* State 1: initial button */
              <button
                className="nb-button nb-button-full"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                style={{
                  background: 'var(--nb-red)',
                  color: 'var(--nb-white)',
                  marginTop: 'var(--nb-space-md)',
                }}
              >
                Delete Account
              </button>
            ) : (
              /* State 2: confirmation card before sending the email */
              <div
                className="nb-card"
                style={{
                  background: 'var(--nb-red)',
                  color: 'var(--nb-white)',
                  marginTop: 'var(--nb-space-md)',
                }}
              >
                <p className="nb-mb-sm" style={{ fontWeight: 700 }}>
                  Delete your account?
                </p>
                <p className="nb-text-sm nb-mb-md">
                  We will email you a confirmation link. Click that link to
                  permanently delete your account and all associated data
                  (preferences, learning history, flashcards, quizzes,
                  crosswords). This cannot be undone.
                </p>
                <div className="nb-flex nb-gap-md">
                  <button
                    className="nb-button nb-button-full"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    className="nb-button nb-button-full"
                    onClick={handleRequestDeletion}
                    disabled={isDeleting}
                    style={{
                      background: 'var(--nb-dark-gray)',
                      color: 'var(--nb-white)',
                    }}
                  >
                    {isDeleting ? 'Sending...' : 'Send Verification Email'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <p className="nb-text-xs nb-text-muted nb-text-center nb-mt-lg">
            Version 1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};