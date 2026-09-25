import React, { useState } from 'react';
import { LANGUAGE_TOPICS } from '../constants/languageTopics';

export const QuestionnaireScreen = ({ userData, onComplete }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [nativeLanguage, setNativeLanguage] = useState('');
  const [proficiency, setProficiency] = useState(null);
  const [learningGoals, setLearningGoals] = useState([]);
  const [preferredLearningStyle, setPreferredLearningStyle] = useState('');
  const [error, setError] = useState('');

  const allLanguages = Object.keys(LANGUAGE_TOPICS);

  const proficiencyLevels = [
    { value: 1, label: 'Absolute Beginner', description: 'Know nothing at all' },
    { value: 2, label: 'Very Basic', description: 'Know a few words' },
    { value: 3, label: 'Basic', description: 'Can say simple greetings' },
    { value: 4, label: 'Elementary', description: 'Basic phrases and vocabulary' },
    { value: 5, label: 'Lower Intermediate', description: 'Simple conversations' },
    { value: 6, label: 'Intermediate', description: 'Can handle basic topics' },
    { value: 7, label: 'Upper Intermediate', description: 'Good conversational skills' },
    { value: 8, label: 'Advanced', description: 'Fluent in most situations' },
    { value: 9, label: 'Very Advanced', description: 'Near-native understanding' },
    { value: 10, label: 'Proficient', description: 'Native-like fluency' },
  ];

  const learningStyles = [
    { id: 'conversation', label: 'Conversation Practice', icon: '💬' },
    { id: 'grammar', label: 'Grammar Focus', icon: '📖' },
    { id: 'vocabulary', label: 'Vocabulary Building', icon: '📚' },
    { id: 'pronunciation', label: 'Pronunciation & Speaking', icon: '🎤' },
    { id: 'reading', label: 'Reading & Writing', icon: '✍️' },
  ];

  const toggleGoal = (goalId) => {
    if (learningGoals.includes(goalId)) {
      setLearningGoals(learningGoals.filter(g => g !== goalId));
    } else {
      setLearningGoals([...learningGoals, goalId]);
    }
  };

  const handleSubmit = () => {
    if (!selectedLanguage) {
      setError('Please select a language to learn');
      return;
    }
    if (!nativeLanguage) {
      setError('Please select your native language');
      return;
    }
    if (selectedLanguage === nativeLanguage) {
      setError('You selected the same language as your native language. Please choose a different language to learn.');
      return;
    }
    if (!proficiency) {
      setError('Please rate your proficiency level');
      return;
    }
    if (learningGoals.length === 0) {
      setError('Please select at least one learning goal');
      return;
    }

    const userPreferences = {
      ...userData,
      targetLanguage: selectedLanguage,
      nativeLanguage: nativeLanguage,
      proficiencyLevel: proficiency,
      learningGoals: learningGoals,
      learningStyle: preferredLearningStyle,
      signupDate: new Date().toISOString(),
    };

    onComplete(userPreferences);
  };

  return (
    <div className="nb-container" style={{ 
      background: 'var(--nb-purple)',
      padding: 'var(--nb-space-xl)'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div className="nb-text-center nb-mb-xl">
          <h1 className="nb-heading nb-heading-xl" style={{ color: 'var(--nb-white)' }}>
            Tell us about yourself
          </h1>
          <p className="nb-text" style={{ color: 'rgba(255,255,255,0.8)' }}>
            Help us personalize your learning experience
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: 'var(--nb-red)',
            color: 'var(--nb-white)',
            padding: 'var(--nb-space-md)',
            border: 'var(--nb-border)',
            boxShadow: 'var(--nb-shadow-sm)',
            marginBottom: 'var(--nb-space-lg)',
            fontWeight: '600'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Target Language Selection */}
        <div className="nb-card nb-mb-lg">
          <h2 className="nb-heading nb-heading-md nb-mb-md">
            🌍 Which language do you want to learn?
          </h2>
          <div className="nb-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}>
            {allLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className="nb-card-hover"
                style={{
                  padding: 'var(--nb-space-md)',
                  background: selectedLanguage === lang ? 'var(--nb-lime)' : 'var(--nb-white)',
                  border: 'var(--nb-border)',
                  boxShadow: selectedLanguage === lang ? 'var(--nb-shadow-hover)' : 'var(--nb-shadow-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--nb-space-sm)',
                  fontFamily: 'var(--nb-font)',
                  fontWeight: '600'
                }}
              >
                <span style={{ fontSize: '2rem' }}>{LANGUAGE_TOPICS[lang].icon}</span>
                <span>{lang}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Native Language Selection */}
        <div className="nb-card nb-mb-lg">
          <h2 className="nb-heading nb-heading-md nb-mb-sm">
            🏠 What is your native language?
          </h2>
          <p className="nb-text nb-text-sm nb-text-muted nb-mb-md">
            This helps us provide better explanations in your language
          </p>
          <div className="nb-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}>
            {allLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => setNativeLanguage(lang)}
                className="nb-card-hover"
                style={{
                  padding: 'var(--nb-space-md)',
                  background: nativeLanguage === lang ? 'var(--nb-cyan)' : 'var(--nb-white)',
                  border: 'var(--nb-border)',
                  boxShadow: nativeLanguage === lang ? 'var(--nb-shadow-hover)' : 'var(--nb-shadow-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--nb-space-sm)',
                  fontFamily: 'var(--nb-font)',
                  fontWeight: '600'
                }}
              >
                <span style={{ fontSize: '2rem' }}>{LANGUAGE_TOPICS[lang].icon}</span>
                <span>{lang}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Proficiency Level */}
        <div className="nb-card nb-mb-lg">
          <h2 className="nb-heading nb-heading-md nb-mb-md">
            📊 How would you rate your current level?
          </h2>
          <div className="nb-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
            {proficiencyLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => setProficiency(level.value)}
                className="nb-card-hover"
                style={{
                  padding: 'var(--nb-space-md)',
                  background: proficiency === level.value ? 'var(--nb-yellow)' : 'var(--nb-white)',
                  border: 'var(--nb-border)',
                  boxShadow: proficiency === level.value ? 'var(--nb-shadow-hover)' : 'var(--nb-shadow-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--nb-space-xs)',
                  fontFamily: 'var(--nb-font)'
                }}
              >
                <span style={{ fontSize: '1.5rem', fontWeight: '700' }}>{level.value}</span>
                <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>{level.label}</span>
                <span style={{ fontSize: '0.75rem', color: '#666' }}>{level.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Learning Goals */}
        <div className="nb-card nb-mb-lg">
          <h2 className="nb-heading nb-heading-md nb-mb-sm">
            🎯 What are your learning goals?
          </h2>
          <p className="nb-text nb-text-sm nb-text-muted nb-mb-md">Select all that apply</p>
          <div className="nb-flex nb-flex-col nb-gap-md">
            {learningStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => toggleGoal(style.id)}
                className="nb-card-hover"
                style={{
                  padding: 'var(--nb-space-md)',
                  background: learningGoals.includes(style.id) ? 'var(--nb-lime)' : 'var(--nb-white)',
                  border: 'var(--nb-border)',
                  boxShadow: learningGoals.includes(style.id) ? 'var(--nb-shadow-hover)' : 'var(--nb-shadow-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--nb-space-md)',
                  fontFamily: 'var(--nb-font)',
                  fontSize: '1rem',
                  fontWeight: '600',
                  textAlign: 'left'
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>{style.icon}</span>
                <span>{style.label}</span>
                {learningGoals.includes(style.id) && (
                  <span style={{ marginLeft: 'auto', fontSize: '1.25rem' }}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Learning Style Preference */}
        <div className="nb-card nb-mb-lg">
          <h2 className="nb-heading nb-heading-md nb-mb-md">
            🧠 Preferred learning style
          </h2>
          <div className="nb-flex nb-flex-wrap nb-gap-md">
            {['Visual', 'Auditory', 'Reading/Writing', 'Kinesthetic'].map((style) => (
              <button
                key={style}
                onClick={() => setPreferredLearningStyle(style)}
                className="nb-card-hover"
                style={{
                  padding: 'var(--nb-space-md) var(--nb-space-lg)',
                  background: preferredLearningStyle === style ? 'var(--nb-pink)' : 'var(--nb-white)',
                  border: 'var(--nb-border)',
                  boxShadow: preferredLearningStyle === style ? 'var(--nb-shadow-hover)' : 'var(--nb-shadow-sm)',
                  cursor: 'pointer',
                  fontFamily: 'var(--nb-font)',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="nb-button nb-button-primary nb-button-full"
          style={{ fontSize: '1.25rem', padding: 'var(--nb-space-lg)' }}
        >
          🚀 Start Learning
        </button>
      </div>
    </div>
  );
};