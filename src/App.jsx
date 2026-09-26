import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AuthScreen } from './screens/AuthScreen';
import { QuestionnaireScreen } from './screens/QuestionnaireScreen';
import { TopicSelectionScreen } from './screens/TopicSelectionScreen';
import { LearningScreen } from './screens/LearningScreen';
import { api } from './services/api';

const LANGUAGE_SPEECH_CODES = {
  English: 'en-US',
  Spanish: 'es-ES',
  French: 'fr-FR',
  German: 'de-DE',
  Italian: 'it-IT',
  Portuguese: 'pt-BR',
  Japanese: 'ja-JP',
  Korean: 'ko-KR',
  Chinese: 'zh-CN',
  Russian: 'ru-RU',
  Arabic: 'ar-SA',
  Hindi: 'hi-IN',
};

const PROGRESS_SAVE_INTERVAL_MS = 15_000;

const App = () => {
  // Auth + user
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userPreferences, setUserPreferences] = useState(null);
  const [userId, setUserId] = useState(null);

  // Language + topic
  const [selectedLanguage, setSelectedLanguage] = useState('Spanish');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isTopicSet, setIsTopicSet] = useState(false);
  const [learningMode, setLearningMode] = useState(null);

  // Reading lesson state
  const [lesson, setLesson] = useState(null);
  const [isLessonLoading, setIsLessonLoading] = useState(false);
  const [lessonError, setLessonError] = useState(null);
  const [pendingLessonConfig, setPendingLessonConfig] = useState(null);

  // Audio state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(null);

  // Stats
  const [showStats, setShowStats] = useState(false);
  const [userStats, setUserStats] = useState(null);

  const speechSynthRef = useRef(null);
  const lastProgressSaveRef = useRef(0);

  // Initialize speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechSynthRef.current = window.speechSynthesis;
    }
  }, []);

  // Load saved user data on startup, then hydrate from backend
  useEffect(() => {
    bootstrap();
  }, []);

  const bootstrap = async () => {
    setIsHydrating(true);
    try {
      const savedUser = localStorage.getItem('userData');
      const savedPreferences = localStorage.getItem('userPreferences');
      const savedUserId = localStorage.getItem('userId');

      if (!savedUser) {
        // Not logged in
        setIsHydrating(false);
        return;
      }

      const parsedUser = JSON.parse(savedUser);
      setUserData(parsedUser);
      setUserId(savedUserId || parsedUser.id);
      setIsAuthenticated(true);

      // Optimistic state from cache so the UI is responsive
      if (savedPreferences) {
        const parsedPrefs = JSON.parse(savedPreferences);
        setUserPreferences(parsedPrefs);
        setSelectedLanguage(parsedPrefs.targetLanguage || 'Spanish');
      }

      // Now sync with backend. This is the source of truth.
      const result = await hydrateUser();

      // If the backend says the user has no preferences, show questionnaire
      if (!result?.preferences && !savedPreferences) {
        setShowQuestionnaire(true);
      } else {
        setShowQuestionnaire(false);
      }
    } catch (error) {
      console.error('Bootstrap error:', error);
    } finally {
      setIsHydrating(false);
    }
  };

  /**
   * Fetch the user + preferences from the backend, update state and cache.
   * Returns { user, preferences } or null on failure.
   */
  const hydrateUser = async () => {
    try {
      const result = await api.fetchCurrentUser();

      if (!result?.user) return null;

      // Update user
      setUserData(result.user);
      setUserId(result.user.id);
      localStorage.setItem('userData', JSON.stringify(result.user));
      localStorage.setItem('userId', result.user.id);

      // Update preferences
      if (result.preferences) {
        setUserPreferences(result.preferences);
        setSelectedLanguage(result.preferences.targetLanguage || 'Spanish');
        localStorage.setItem(
          'userPreferences',
          JSON.stringify(result.preferences)
        );
      }

      return result;
    } catch (err) {
      console.error('hydrateUser failed:', err);
      return null;
    }
  };

  const handleAuthComplete = async (user) => {
    // 1. Store tokens and user from the auth response
    setUserData(user);
    setUserId(user.id);
    setIsAuthenticated(true);
    localStorage.setItem('userData', JSON.stringify(user));
    localStorage.setItem('userId', user.id);

    // 2. Fetch preferences from the backend. If the user has completed
    //    the questionnaire before (even on another device), we get them
    //    here and skip the questionnaire entirely.
    const result = await hydrateUser();

    if (result?.preferences) {
      // Already onboarded — skip questionnaire
      setShowQuestionnaire(false);
      localStorage.setItem(
        'userPreferences',
        JSON.stringify(result.preferences)
      );
    } else {
      // No preferences on the backend yet — show questionnaire
      setShowQuestionnaire(true);
    }
  };

  const handleQuestionnaireComplete = async (preferences) => {
    // Persist to backend first
    try {
      await api.savePreferences(preferences);
    } catch (err) {
      console.error('Failed to save preferences to backend:', err);
      // Continue anyway — cache locally so the app remains usable offline
    }

    // Update local state and cache
    setUserPreferences(preferences);
    setSelectedLanguage(preferences.targetLanguage);
    setShowQuestionnaire(false);
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
  };

  const handleUpdatePreferences = async (newPreferences) => {
    // Persist to backend
    try {
      await api.savePreferences(newPreferences);
    } catch (err) {
      console.error('Failed to update preferences on backend:', err);
    }

    setUserPreferences(newPreferences);
    localStorage.setItem('userPreferences', JSON.stringify(newPreferences));
    if (newPreferences.targetLanguage !== selectedLanguage) {
      setSelectedLanguage(newPreferences.targetLanguage);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('userPreferences');
    localStorage.removeItem('userId');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    setIsAuthenticated(false);
    setShowQuestionnaire(false);
    setUserData(null);
    setUserPreferences(null);
    setUserId(null);
    setSelectedLanguage('Spanish');
    setSelectedTopic(null);
    setIsTopicSet(false);
    setLearningMode(null);
    setLesson(null);
    setLessonError(null);
    setPendingLessonConfig(null);
    lastProgressSaveRef.current = 0;
  };

  /* ---------- Speech synthesis ---------- */

  const speakText = useCallback(
    (text, { onStart, onEnd, lang } = {}) => {
      if (isMuted || !speechSynthRef.current || !text) return;

      speechSynthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      let rate = 0.9;
      let pitch = 1.0;

      if (userPreferences) {
        if (userPreferences.proficiencyLevel <= 3) rate = 0.6;
        else if (userPreferences.proficiencyLevel <= 6) rate = 0.8;
        else rate = 0.9;

        if (
          userPreferences.targetLanguage === 'Japanese' ||
          userPreferences.targetLanguage === 'Korean'
        ) {
          pitch = 1.05;
        }
      }

      utterance.lang =
        lang || LANGUAGE_SPEECH_CODES[selectedLanguage] || 'en-US';
      utterance.rate = rate;
      utterance.pitch = pitch;

      utterance.onstart = () => {
        setIsSpeaking(true);
        onStart?.();
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        onEnd?.();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        onEnd?.();
      };

      speechSynthRef.current.speak(utterance);
    },
    [isMuted, selectedLanguage, userPreferences]
  );

  const stopSpeaking = useCallback(() => {
    if (speechSynthRef.current) {
      speechSynthRef.current.cancel();
    }
    setIsSpeaking(false);
    setActiveSentenceIndex(null);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      if (!prev) stopSpeaking();
      return !prev;
    });
  }, [stopSpeaking]);

  /* ---------- Reading lesson flow ---------- */

  const handleStartReadingLesson = (topic) => {
    setSelectedTopic(topic);
    setLearningMode('reading');
    setIsTopicSet(true);
    setLesson(null);
    setLessonError(null);
    setPendingLessonConfig(null);
    lastProgressSaveRef.current = 0;
  };

  const handleGenerateLesson = async ({ questionCount, difficulty }) => {
    setPendingLessonConfig({ questionCount, difficulty });
    setIsLessonLoading(true);
    setLessonError(null);
    setLesson(null);
    lastProgressSaveRef.current = 0;

    try {
      const data = await api.generateLesson({
        userId,
        language: selectedLanguage,
        topicId: selectedTopic.id,
        topicName: selectedTopic.name,
        topicConcept: selectedTopic.concept,
        topicExample: selectedTopic.example,
        userPreferences,
        questionCount,
        difficulty,
      });

      if (!data || !data.lesson) {
        throw new Error('No lesson returned');
      }

      setLesson({
        ...data.lesson,
        lessonId: data.lessonId,
      });
    } catch (err) {
      console.error('Error generating lesson:', err);
      setLessonError(
        'Could not load the lesson. Please check your connection and try again.'
      );
    } finally {
      setIsLessonLoading(false);
    }
  };

  const handleRetryLesson = () => {
      if (pendingLessonConfig) {
        handleGenerateLesson(pendingLessonConfig);
      }
    };

    const handleSelectPreviousLesson = (attempt) => {
    if (!attempt?.lesson) {
      console.warn('Selected attempt has no lesson payload');
      return;
    }

    setLesson({
      ...attempt.lesson,
      lessonId: attempt.lessonId,
      // Mark that this is a replay so onComplete can choose to skip re-save
      isReplay: true,
      previousAttemptId: attempt.attemptId,
    });
  };

  const handleLessonProgress = useCallback(
    (metrics) => {
      const now = Date.now();
      if (now - lastProgressSaveRef.current < PROGRESS_SAVE_INTERVAL_MS) {
        return;
      }
      lastProgressSaveRef.current = now;

      if (!lesson?.lessonId) return;

      api
        .saveLessonProgress({
          lessonId: lesson.lessonId,
          userId,
          language: selectedLanguage,
          topicId: selectedTopic?.id,
          audioMetrics: {
            sentencesPlayed: metrics.sentencesPlayed ?? 0,
            wordsPlayed: metrics.wordsPlayed ?? 0,
            replaysBySentence: metrics.replaysBySentence ?? [],
            vocabTapsByWord: metrics.vocabTapsByWord ?? [],
            playedAllCount: metrics.playedAllCount ?? 0,
            firstInteractionAt: metrics.firstInteractionAt ?? undefined,
            lastInteractionAt: metrics.lastInteractionAt ?? undefined,
            timeSpentSeconds: metrics.timeSpentSeconds ?? 0,
          },
        })
        .catch((err) =>
          console.warn('Partial lesson save failed (non-fatal):', err)
        );
    },
    [lesson?.lessonId, userId, selectedLanguage, selectedTopic?.id]
  );

  const handleLessonComplete = async (results) => {
    try {
      if (lesson?.lessonId) {
        await api.submitLessonResults({
          lessonId: lesson.lessonId,
          userId,
          language: selectedLanguage,
          topicId: selectedTopic?.id,
          answers: results.answers,
          correctCount: results.correctCount,
          totalQuestions: results.totalQuestions,
          audioMetrics: results.audioMetrics ?? {
            sentencesPlayed: results.sentencesPlayed ?? 0,
            wordsPlayed: results.wordsPlayed ?? 0,
          },
          timeSpent: results.timeSpent,
        });
      }
    } catch (err) {
      console.error('Error submitting lesson results:', err);
    }
    handleBackToTopics();
  };

  /* ---------- Other modes ---------- */

  const handleStartFlashcards = (topic) => {
    setSelectedTopic(topic);
    setLearningMode('flashcards');
    setIsTopicSet(true);
  };

  const handleStartQuiz = (topic) => {
    setSelectedTopic(topic);
    setLearningMode('quiz');
    setIsTopicSet(true);
  };

  /* ---------- Navigation ---------- */

  const handleBackToTopics = () => {
    setIsTopicSet(false);
    setSelectedTopic(null);
    setLearningMode(null);
    setLesson(null);
    setLessonError(null);
    setPendingLessonConfig(null);
    lastProgressSaveRef.current = 0;
    stopSpeaking();
    fetchStats();
  };

  const fetchStats = async () => {
    if (!userId) return;
    try {
      const stats = await api.fetchStats(userId);
      setUserStats(stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const toggleStats = () => setShowStats(!showStats);

  /* ---------- Routing ---------- */

  // Show a splash while we hydrate from the backend
  if (isHydrating && isAuthenticated) {
    return (
      <div
        className="nb-container nb-flex nb-flex-center"
        style={{ background: 'var(--nb-purple)', minHeight: '100vh' }}
      >
        <div className="nb-spinner" />
        <p className="nb-mt-md" style={{ color: 'var(--nb-white)' }}>
          Loading your account...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen onAuthComplete={handleAuthComplete} />;
  }

  if (showQuestionnaire) {
    return (
      <QuestionnaireScreen
        userData={userData}
        onComplete={handleQuestionnaireComplete}
      />
    );
  }

  if (!isTopicSet) {
    return (
      <TopicSelectionScreen
        selectedLanguage={selectedLanguage}
        onSelectLanguage={setSelectedLanguage}
        onStartReadingLesson={handleStartReadingLesson}
        onStartFlashcards={handleStartFlashcards}
        onStartQuiz={handleStartQuiz}
        userStats={userStats}
        showStats={showStats}
        onToggleStats={toggleStats}
        onFetchStats={fetchStats}
        userPreferences={userPreferences}
        onUpdatePreferences={handleUpdatePreferences}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <LearningScreen
      mode={learningMode}
      selectedLanguage={selectedLanguage}
      selectedTopic={selectedTopic}
      userPreferences={userPreferences}
      onBack={handleBackToTopics}
      lesson={lesson}
      isLessonLoading={isLessonLoading}
      lessonError={lessonError}
      onStartLesson={handleGenerateLesson}
      onRetryLesson={handleRetryLesson}
      onLessonComplete={handleLessonComplete}
      onLessonProgress={handleLessonProgress}
      speakText={speakText}
      stopSpeaking={stopSpeaking}
      isSpeaking={isSpeaking}
      isMuted={isMuted}
      onToggleMute={toggleMute}
      activeSentenceIndex={activeSentenceIndex}
      setActiveSentenceIndex={setActiveSentenceIndex}
      userStats={userStats}
      showStats={showStats}
      onToggleStats={toggleStats}
      onFetchStats={fetchStats}
      onSelectPreviousLesson={handleSelectPreviousLesson}
    />
  );
};

export default App;