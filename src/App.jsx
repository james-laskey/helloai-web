import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AuthScreen } from './screens/AuthScreen';
import { QuestionnaireScreen } from './screens/QuestionnaireScreen';
import { TopicSelectionScreen } from './screens/TopicSelectionScreen';
import { FeatureSelectionScreen } from './components/FeatureSelectionScreen';
import { LearningScreen } from './screens/LearningScreen';
import { NinjaGame } from './components/ninja/NinjaGame';
import { api } from './services/api';
import { authApi } from './services/authApi';

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
  /* -------- Auth + user -------- */
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userPreferences, setUserPreferences] = useState(null);
  const [userId, setUserId] = useState(null);

  /* -------- Language + navigation -------- */
  const [selectedLanguage, setSelectedLanguage] = useState('Spanish');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isFeatureSelected, setIsFeatureSelected] = useState(false);
  const [isTopicSet, setIsTopicSet] = useState(false);
  const [learningMode, setLearningMode] = useState(null);

  /* -------- Reading lesson state -------- */
  const [lesson, setLesson] = useState(null);
  const [isLessonLoading, setIsLessonLoading] = useState(false);
  const [lessonError, setLessonError] = useState(null);
  const [pendingLessonConfig, setPendingLessonConfig] = useState(null);

  /* -------- Audio -------- */
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(null);

  /* -------- Stats -------- */
  const [showStats, setShowStats] = useState(false);
  const [userStats, setUserStats] = useState(null);

  const speechSynthRef = useRef(null);
  const lastProgressSaveRef = useRef(0);

  /* -------- Speech synthesis -------- */
  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechSynthRef.current = window.speechSynthesis;
    }
  }, []);

  /* -------- Bootstrap -------- */
  useEffect(() => {
    bootstrap();
  }, []);

  const bootstrap = async () => {
    setIsHydrating(true);
    try {
      const result = await api.fetchCurrentUser();

      if (!result?.user) {
        setIsAuthenticated(false);
        setIsHydrating(false);
        return;
      }

      setUserData(result.user);
      setUserId(result.user.id);
      setIsAuthenticated(true);

      if (result.preferences) {
        setUserPreferences(result.preferences);
        setSelectedLanguage(result.preferences.targetLanguage || 'Spanish');
        setShowQuestionnaire(false);
      } else {
        setShowQuestionnaire(true);
      }
    } catch (error) {
      console.warn('[bootstrap] no session', error?.message || error);
      setIsAuthenticated(false);
    } finally {
      setIsHydrating(false);
    }
  };

  const hydrateUser = async () => {
    try {
      const result = await api.fetchCurrentUser();
      if (!result?.user) return null;

      setUserData(result.user);
      setUserId(result.user.id);

      if (result.preferences) {
        setUserPreferences(result.preferences);
        setSelectedLanguage(result.preferences.targetLanguage || 'Spanish');
      }

      return result;
    } catch (err) {
      console.error('hydrateUser failed:', err);
      return null;
    }
  };

  /**
   * Resets all client state to the unauthenticated baseline.
   * Called on logout and after account deletion is confirmed.
   */
  const resetClientState = useCallback(() => {
    setIsAuthenticated(false);
    setShowQuestionnaire(false);
    setUserData(null);
    setUserPreferences(null);
    setUserId(null);
    setSelectedLanguage('Spanish');
    setSelectedTopic(null);
    setIsFeatureSelected(false);
    setIsTopicSet(false);
    setLearningMode(null);
    setLesson(null);
    setLessonError(null);
    setPendingLessonConfig(null);
    lastProgressSaveRef.current = 0;
  }, []);

  /**
   * Request account deletion. This is step 1 of a two-step flow:
   *   1. This function asks the backend to email a confirmation link.
   *   2. The user clicks the link in their inbox, which actually deletes
   *      the account on the backend.
   *
   * Because the account is NOT deleted here, we do NOT reset client
   * state. The user is still logged in until they confirm via email.
   * Returns the response so the SettingsModal can inspect `emailSent`.
   */
  const handleDeleteAccount = async () => {
    try {
      const result = await authApi.requestAccountDeletion();
      return result;
    } catch (err) {
      console.error('Request account deletion failed:', err);
      throw err;
    }
  };

  const handleAuthComplete = async (user) => {
    setUserData(user);
    setUserId(user.id);
    setIsAuthenticated(true);

    const result = await hydrateUser();
    if (result?.preferences) {
      setShowQuestionnaire(false);
    } else {
      setShowQuestionnaire(true);
    }
  };

  const handleQuestionnaireComplete = async (preferences) => {
    try {
      await api.savePreferences(preferences);
    } catch (err) {
      console.error('Failed to save preferences to backend:', err);
    }
    setUserPreferences(preferences);
    setSelectedLanguage(preferences.targetLanguage);
    setShowQuestionnaire(false);
  };

  const handleUpdatePreferences = async (newPreferences) => {
    try {
      await api.savePreferences(newPreferences);
    } catch (err) {
      console.error('Failed to update preferences on backend:', err);
    }
    setUserPreferences(newPreferences);
    if (newPreferences.targetLanguage !== selectedLanguage) {
      setSelectedLanguage(newPreferences.targetLanguage);
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout API error:', err);
    }
    resetClientState();
  };

  /* -------- Speech -------- */
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

        if (
          userPreferences.targetLanguage === 'Japanese' ||
          userPreferences.targetLanguage === 'Korean'
        ) {
          pitch = 1.05;
        }
      }

      utterance.lang = lang || LANGUAGE_SPEECH_CODES[selectedLanguage] || 'en-US';
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
    if (speechSynthRef.current) speechSynthRef.current.cancel();
    setIsSpeaking(false);
    setActiveSentenceIndex(null);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      if (!prev) stopSpeaking();
      return !prev;
    });
  }, [stopSpeaking]);

  /* -------- Navigation -------- */

  const handleSelectTopic = (topic) => {
    setSelectedTopic(topic);
    setIsFeatureSelected(true);
  };

  const handleSelectFeature = (featureId) => {
    setLearningMode(featureId);
    setIsFeatureSelected(false);
    setIsTopicSet(true);
  };

  const handleBackToTopics = () => {
    setIsFeatureSelected(false);
    setSelectedTopic(null);
    setLearningMode(null);
    setIsTopicSet(false);
    setLesson(null);
    setLessonError(null);
    setPendingLessonConfig(null);
    lastProgressSaveRef.current = 0;
    stopSpeaking();
    fetchStats();
  };

  const handleBackToFeatures = () => {
    setIsTopicSet(false);
    setLearningMode(null);
    setLesson(null);
    setLessonError(null);
    setPendingLessonConfig(null);
    lastProgressSaveRef.current = 0;
    stopSpeaking();
    fetchStats();
    setIsFeatureSelected(true);
  };

  /* -------- Reading lesson flow -------- */

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

      if (!data || !data.lesson) throw new Error('No lesson returned');
      setLesson({ ...data.lesson, lessonId: data.lessonId });
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
    if (pendingLessonConfig) handleGenerateLesson(pendingLessonConfig);
  };

  const handleSelectPreviousLesson = (attempt) => {
    if (!attempt?.lesson) return;
    setLesson({
      ...attempt.lesson,
      lessonId: attempt.lessonId,
      isReplay: true,
      previousAttemptId: attempt.attemptId,
    });
  };

  const handleLessonProgress = useCallback(
    (metrics) => {
      const now = Date.now();
      if (now - lastProgressSaveRef.current < PROGRESS_SAVE_INTERVAL_MS) return;
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
    handleBackToFeatures();
  };

  /* -------- Stats -------- */

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

  /* -------- Routing -------- */

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

  /* -------- Ninja mode -------- */

  if (isTopicSet && learningMode === 'ninja') {
    return (
      <div className="nb-container" style={{ background: 'var(--nb-purple)' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--nb-space-md) var(--nb-space-lg)',
            background: 'var(--nb-white)',
            borderBottom: 'var(--nb-border)',
          }}
        >
          <button onClick={handleBackToFeatures} className="nb-button">
            Back
          </button>
          <h1 className="nb-heading nb-heading-md" style={{ margin: 0 }}>
            Hello Ninja
          </h1>
          <div style={{ width: '100px' }} />
        </div>
        <div style={{ padding: 'var(--nb-space-lg)' }}>
          <NinjaGame
            userId={userId}
            language={selectedLanguage}
            topicId={selectedTopic?.id}
            topicName={selectedTopic?.name}
            onBack={handleBackToFeatures}
          />
        </div>
      </div>
    );
  }

  /* -------- Other learning modes -------- */

  if (isTopicSet) {
    return (
      <LearningScreen
        mode={learningMode}
        selectedLanguage={selectedLanguage}
        selectedTopic={selectedTopic}
        userPreferences={userPreferences}
        onBack={handleBackToFeatures}
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
        userId={userId}
      />
    );
  }

  /* -------- Feature picker -------- */

  if (isFeatureSelected && selectedTopic) {
    return (
      <FeatureSelectionScreen
        topic={selectedTopic}
        language={selectedLanguage}
        onSelectFeature={handleSelectFeature}
        onBack={handleBackToTopics}
        userStats={userStats}
        showStats={showStats}
        onToggleStats={toggleStats}
        onFetchStats={fetchStats}
      />
    );
  }

  /* -------- Topic picker -------- */

  return (
    <TopicSelectionScreen
      selectedLanguage={selectedLanguage}
      onSelectLanguage={setSelectedLanguage}
      onSelectTopic={handleSelectTopic}
      userStats={userStats}
      showStats={showStats}
      onToggleStats={toggleStats}
      onFetchStats={fetchStats}
      userPreferences={userPreferences}
      onUpdatePreferences={handleUpdatePreferences}
      onLogout={handleLogout}
      user={userData}
      onDeleteAccount={handleDeleteAccount}
    />
  );
};

export default App;