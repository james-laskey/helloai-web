import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AuthScreen } from './screens/AuthScreen';
import { QuestionnaireScreen } from './screens/QuestionnaireScreen';
import { TopicSelectionScreen } from './screens/TopicSelectionScreen';
import { FeatureSelectionScreen } from './components/FeatureSelectionScreen';
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
  const [isFeatureSelected, setIsFeatureSelected] = useState(false); // NEW: feature picker open
  const [isTopicSet, setIsTopicSet] = useState(false);               // mode is running
  const [learningMode, setLearningMode] = useState(null);

  /* -------- Reading lesson state (unchanged) -------- */
  const [lesson, setLesson] = useState(null);
  const [isLessonLoading, setIsLessonLoading] = useState(false);
  const [lessonError, setLessonError] = useState(null);
  const [pendingLessonConfig, setPendingLessonConfig] = useState(null);

  /* -------- Audio (unchanged) -------- */
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(null);

  /* -------- Stats (unchanged) -------- */
  const [showStats, setShowStats] = useState(false);
  const [userStats, setUserStats] = useState(null);

  const speechSynthRef = useRef(null);
  const lastProgressSaveRef = useRef(0);

  /* -------- Speech synthesis (unchanged) -------- */
  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechSynthRef.current = window.speechSynthesis;
    }
  }, []);

  /* -------- Bootstrap (unchanged) -------- */
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
        setIsHydrating(false);
        return;
      }

      const parsedUser = JSON.parse(savedUser);
      setUserData(parsedUser);
      setUserId(savedUserId || parsedUser.id);
      setIsAuthenticated(true);

      if (savedPreferences) {
        const parsedPrefs = JSON.parse(savedPreferences);
        setUserPreferences(parsedPrefs);
        setSelectedLanguage(parsedPrefs.targetLanguage || 'Spanish');
      }

      const result = await hydrateUser();

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

  const hydrateUser = async () => {
    try {
      const result = await api.fetchCurrentUser();
      if (!result?.user) return null;

      setUserData(result.user);
      setUserId(result.user.id);
      localStorage.setItem('userData', JSON.stringify(result.user));
      localStorage.setItem('userId', result.user.id);

      if (result.preferences) {
        setUserPreferences(result.preferences);
        setSelectedLanguage(result.preferences.targetLanguage || 'Spanish');
        localStorage.setItem('userPreferences', JSON.stringify(result.preferences));
      }

      return result;
    } catch (err) {
      console.error('hydrateUser failed:', err);
      return null;
    }
  };

  const handleAuthComplete = async (user) => {
    setUserData(user);
    setUserId(user.id);
    setIsAuthenticated(true);
    localStorage.setItem('userData', JSON.stringify(user));
    localStorage.setItem('userId', user.id);

    const result = await hydrateUser();
    if (result?.preferences) {
      setShowQuestionnaire(false);
      localStorage.setItem('userPreferences', JSON.stringify(result.preferences));
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
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
  };

  const handleUpdatePreferences = async (newPreferences) => {
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
    setIsFeatureSelected(false);
    setIsTopicSet(false);
    setLearningMode(null);
    setLesson(null);
    setLessonError(null);
    setPendingLessonConfig(null);
    lastProgressSaveRef.current = 0;
  };

  /* -------- Speech (unchanged) -------- */
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

  /* -------- Navigation: topic picker → feature picker → mode -------- */

  // Called when a topic card is clicked. Opens the feature selection screen.
  const handleSelectTopic = (topic) => {
    setSelectedTopic(topic);
    setIsFeatureSelected(true);
  };

  // Called when a feature tile is clicked. Starts the mode.
  const handleSelectFeature = (featureId) => {
    setLearningMode(featureId);
    setIsFeatureSelected(false);
    setIsTopicSet(true);
  };

  // Back from feature picker → topic picker
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

  // Back from a running mode → feature picker
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

  /* -------- Reading lesson flow (unchanged) -------- */

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

  /* -------- Stats (unchanged) -------- */

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

  // 1. Mode is running → LearningScreen
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

  // 2. Feature picker is open → FeatureSelectionScreen
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

  // 3. Default → TopicSelectionScreen
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
    />
  );
};

export default App;