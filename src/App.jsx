import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AuthScreen } from './screens/AuthScreen';
import { HelloScreen } from './screens/HelloScreen';
import { QuestionnaireScreen } from './screens/QuestionnaireScreen';
import { LanguageSelectionScreen } from './components/LanguageSelectionScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { api } from './services/api';
import { authApi } from './services/authApi';
import { LANGUAGE_TOPICS } from './constants/languageTopics';

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

const DEFAULT_LANGUAGE = Object.keys(LANGUAGE_TOPICS)[0] || 'Spanish';
const PROGRESS_SAVE_INTERVAL_MS = 15_000;

const App = () => {
  /* -------- Auth + user -------- */
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const [userData, setUserData] = useState(null);
  const [userPreferences, setUserPreferences] = useState(null);
  const [userId, setUserId] = useState(null);

  /* -------- Post-login splash -------- */
  const [showHello, setShowHello] = useState(true);
  const helloShownThisLoginRef = useRef(false);

  /* -------- Onboarding -------- */
  const [onboardingStep, setOnboardingStep] = useState(null);
  const [onboardingData, setOnboardingData] = useState(null);

  /* -------- Language + navigation -------- */
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [learningMode, setLearningMode] = useState(null);

  /* -------- Streak -------- */
  const [streak, setStreak] = useState(null);

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

  /* -------- Bootstrap (app load only) -------- */
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

      const prefs = result.preferences;

      if (!prefs) {
        setOnboardingStep('questionnaire');
        setOnboardingData(null);
      } else if (!prefs.targetLanguage) {
        setOnboardingStep('language');
        setOnboardingData({
          nativeLanguage: prefs.nativeLanguage,
          learningGoals: prefs.learningGoals ?? [],
        });
        setUserPreferences(prefs);
      } else {
        setUserPreferences(prefs);
        setSelectedLanguage(prefs.targetLanguage);
        setOnboardingStep(null);
        setOnboardingData(null);
      }

      if (result.streak) {
        setStreak(result.streak);
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
        if (result.preferences.targetLanguage) {
          setSelectedLanguage(result.preferences.targetLanguage);
        }
      }

      if (result.streak) {
        setStreak(result.streak);
      }

      return result;
    } catch (err) {
      console.error('hydrateUser failed:', err);
      return null;
    }
  };

  const refreshStreak = useCallback(async () => {
    if (!userId) return;
    try {
      const result = await api.fetchCurrentUser();
      if (result?.streak) {
        setStreak(result.streak);
      }
    } catch (err) {
      console.warn('refreshStreak failed (non-fatal):', err);
    }
  }, [userId]);

  const resetClientState = useCallback(() => {
    setIsAuthenticated(false);
    setUserData(null);
    setUserPreferences(null);
    setUserId(null);
    setShowHello(false);
    helloShownThisLoginRef.current = false;
    setOnboardingStep(null);
    setOnboardingData(null);
    setSelectedLanguage(null);
    setSelectedTopic(null);
    setLearningMode(null);
    setLesson(null);
    setLessonError(null);
    setPendingLessonConfig(null);
    setStreak(null);
    lastProgressSaveRef.current = 0;
  }, []);

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

    if (!helloShownThisLoginRef.current) {
      setShowHello(true);
    }

    const hydrated = await hydrateUser();
    const prefs = hydrated?.preferences;

    if (!prefs) {
      setOnboardingStep('questionnaire');
      setOnboardingData(null);
    } else if (!prefs.targetLanguage) {
      setOnboardingStep('language');
      setOnboardingData({
        nativeLanguage: prefs.nativeLanguage,
        learningGoals: prefs.learningGoals ?? [],
      });
    } else {
      setOnboardingStep(null);
      setOnboardingData(null);
    }

    setIsHydrating(false);
  };

  const handleHelloDone = () => {
    setShowHello(false);
    helloShownThisLoginRef.current = true;
  };

  const handleQuestionnaireComplete = (data) => {
    setOnboardingData({
      nativeLanguage: data.nativeLanguage,
      learningGoals: data.learningGoals,
    });
    setOnboardingStep('language');
  };

  const handleLanguageSelected = async (data) => {
    const preferences = {
      nativeLanguage: data.nativeLanguage,
      learningGoals: data.learningGoals,
      learningStyle: data.learningStyle ?? null,
      targetLanguage: data.targetLanguage,
    };

    try {
      await api.savePreferences(preferences);
    } catch (err) {
      console.error('Failed to save preferences to backend:', err);
    }

    setUserPreferences(preferences);
    setSelectedLanguage(preferences.targetLanguage);
    setOnboardingStep(null);
    setOnboardingData(null);

    await hydrateUser();
  };

  const handleUpdatePreferences = async (newPreferences) => {
    try {
      await api.savePreferences(newPreferences);
    } catch (err) {
      console.error('Failed to update preferences on backend:', err);
    }
    setUserPreferences(newPreferences);
    if (
      newPreferences.targetLanguage &&
      newPreferences.targetLanguage !== selectedLanguage
    ) {
      setSelectedLanguage(newPreferences.targetLanguage);
      await refreshStreak();
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

      if (
        userPreferences &&
        typeof userPreferences.proficiencyLevel === 'number'
      ) {
        if (userPreferences.proficiencyLevel <= 3) rate = 0.6;
        else if (userPreferences.proficiencyLevel <= 6) rate = 0.8;
      }

      if (selectedLanguage === 'Japanese' || selectedLanguage === 'Korean') {
        pitch = 1.05;
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

  /* -------- Navigation (kept for compatibility) -------- */

  const handleSelectTopic = (topic) => {
    setSelectedTopic(topic);
  };

  const handleSelectFeature = (featureId) => {
    setLearningMode(featureId);
  };

  const handleBackToTopics = () => {
    setSelectedTopic(null);
    setLearningMode(null);
    setLesson(null);
    setLessonError(null);
    setPendingLessonConfig(null);
    lastProgressSaveRef.current = 0;
    stopSpeaking();
    fetchStats();
    refreshStreak();
  };

  const handleBackToFeatures = () => {
    setLearningMode(null);
    setLesson(null);
    setLessonError(null);
    setPendingLessonConfig(null);
    lastProgressSaveRef.current = 0;
    stopSpeaking();
    fetchStats();
    refreshStreak();
  };

  /**
   * Called by the feature shell's Back button inside DashboardScreen.
   * Resets per-feature state (reading lesson / errors / pending config)
   * and stops speech, but keeps `learningMode` set so the dashboard
   * stays on the same feature and its setup screen reappears.
   */
  const handleFeatureBack = () => {
    setLesson(null);
    setLessonError(null);
    setPendingLessonConfig(null);
    lastProgressSaveRef.current = 0;
    stopSpeaking();
  };

  /* -------- Reading lesson flow -------- */

  const handleGenerateLesson = async ({
    questionCount,
    questionsPerSection,
    sectionCount,
    difficulty,
    language,
  } = {}) => {
    const lessonLanguage = language || selectedLanguage || DEFAULT_LANGUAGE;

    const resolvedPerSection =
      typeof questionsPerSection === 'number'
        ? questionsPerSection
        : typeof questionCount === 'number'
        ? questionCount
        : 3;

    const resolvedSectionCount =
      typeof sectionCount === 'number' ? sectionCount : 3;

    const resolvedDifficulty = difficulty || 'adaptive';

    setPendingLessonConfig({
      sectionCount: resolvedSectionCount,
      questionsPerSection: resolvedPerSection,
      difficulty: resolvedDifficulty,
      language: lessonLanguage,
    });
    setIsLessonLoading(true);
    setLessonError(null);
    setLesson(null);
    lastProgressSaveRef.current = 0;

    if (lessonLanguage !== selectedLanguage) {
      setSelectedLanguage(lessonLanguage);
    }

    try {
      const data = await api.generateLesson({
        userId,
        language: lessonLanguage,
        topicId: selectedTopic.id,
        topicName: selectedTopic.name,
        topicConcept: selectedTopic.concept,
        topicExample: selectedTopic.example,
        userPreferences,
        sectionCount: resolvedSectionCount,
        questionsPerSection: resolvedPerSection,
        difficulty: resolvedDifficulty,
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
          score: results.score,
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
    await refreshStreak();
    return results;
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

  if (!isAuthenticated) {
    return <AuthScreen onAuthComplete={handleAuthComplete} />;
  }

  if (isHydrating) {
    return (
      <div
        className="dash-root"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div className="nb-spinner" />
        <p style={{ color: 'var(--nb-text)' }}>Loading your account...</p>
      </div>
    );
  }

  if (onboardingStep === 'questionnaire') {
    return (
      <QuestionnaireScreen
        userData={userData}
        onComplete={handleQuestionnaireComplete}
      />
    );
  }

  if (onboardingStep === 'language') {
    return (
      <LanguageSelectionScreen
        userData={userData}
        nativeLanguage={onboardingData?.nativeLanguage ?? ''}
        learningGoals={onboardingData?.learningGoals ?? []}
        onComplete={handleLanguageSelected}
      />
    );
  }

  return (
    <>
      <DashboardScreen
        user={userData}
        userPreferences={userPreferences}
        userId={userId}
        streak={streak}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={setSelectedLanguage}
        selectedTopic={selectedTopic}
        onSelectTopic={handleSelectTopic}
        learningMode={learningMode}
        onSelectFeature={handleSelectFeature}
        lesson={lesson}
        isLessonLoading={isLessonLoading}
        lessonError={lessonError}
        onStartLesson={handleGenerateLesson}
        onRetryLesson={handleRetryLesson}
        onLessonComplete={handleLessonComplete}
        onLessonProgress={handleLessonProgress}
        onSelectPreviousLesson={handleSelectPreviousLesson}
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
        onActivityComplete={refreshStreak}
        onUpdatePreferences={handleUpdatePreferences}
        onLogout={handleLogout}
        onDeleteAccount={handleDeleteAccount}
        onFeatureBack={handleFeatureBack}
      />

      {showHello && (
        <HelloScreen userName={userData?.name || ''} onDone={handleHelloDone} />
      )}
    </>
  );
};

export default App;