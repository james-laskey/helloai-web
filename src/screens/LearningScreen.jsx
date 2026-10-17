import React, { useState, useEffect } from 'react';
import { ReadingLesson } from '../components/reading-lessons/ReadingLesson';
import { FlashcardComponent } from '../components/FlashcardComponent';
import { QuizComponent } from '../components/QuizComponent';
import { CrosswordGame } from '../components/crossword/CrosswordGame';
import { learningApi } from '../services/learningApi';
import { MaterialIcon } from '../components/landing-page/icons';
import { AIInconsistencyTooltip } from '../components/AIInconsistencyTooltip';
import { StreakBadge } from '../components/StreakBadge';

export const LearningScreen = ({
  mode,
  selectedLanguage,
  selectedTopic,
  userPreferences,
  onBack,

  // Reading lesson props
  lesson,
  isLessonLoading,
  lessonError,
  onStartLesson,
  onRetryLesson,
  onLessonComplete,

  // Audio props
  speakText,
  stopSpeaking,
  isSpeaking,
  isMuted,
  onToggleMute,
  activeSentenceIndex,
  setActiveSentenceIndex,

  // Stats props
  userStats,
  showStats,
  onToggleStats,
  onFetchStats,
  onLessonProgress,
  onSelectPreviousLesson,
  userId,

  // Streak
  streak,
  onActivityComplete,
}) => {
  const [flashcards, setFlashcards] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [flashcardSetId, setFlashcardSetId] = useState(null);
  const [quizAttemptId, setQuizAttemptId] = useState(null);
  const [submittedQuiz, setSubmittedQuiz] = useState(false);
  const [submittedFlashcards, setSubmittedFlashcards] = useState(false);

  const [previousFlashcardSets, setPreviousFlashcardSets] = useState([]);
  const [previousQuizAttempts, setPreviousQuizAttempts] = useState([]);
  const [showDatasetSelector, setShowDatasetSelector] = useState(false);
  const [loadingPrevious, setLoadingPrevious] = useState(false);

  useEffect(() => {
  if (mode === 'flashcards') {
    let cancelled = false;
    (async () => {
      setLoadingPrevious(true);
      try {
        const result = await learningApi.getPreviousFlashcardSets({
          userId,
          topicId: selectedTopic.id,
          language: selectedLanguage,
        });
        if (!cancelled && result?.sets) {
          setPreviousFlashcardSets(result.sets);
        }
      } catch (error) {
        console.error('Error fetching previous flashcard sets:', error);
      } finally {
        if (!cancelled) setLoadingPrevious(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }

  if (mode === 'quiz') {
    let cancelled = false;
    (async () => {
      setLoadingPrevious(true);
      try {
        const result = await learningApi.getPreviousQuizAttempts({
          userId,
          topicId: selectedTopic.id,
          language: selectedLanguage,
        });
        if (!cancelled && result?.quizzes) {
          setPreviousQuizAttempts(result.quizzes);
        }
      } catch (error) {
        console.error('Error fetching previous quiz attempts:', error);
      } finally {
        if (!cancelled) setLoadingPrevious(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }
}, [mode, userId, selectedTopic?.id, selectedLanguage]);

  // Show the dataset selector when there is no active content for the
  // current mode. This used to be a setState during render, which React
  // warns about and can loop.
  useEffect(() => {
    if (mode === 'flashcards' && !flashcards && !loading) {
      setShowDatasetSelector(true);
    }
    if (mode === 'quiz' && !quiz && !loading) {
      setShowDatasetSelector(true);
    }
  }, [mode, flashcards, quiz, loading]);

  /* ---------- Flashcard data loaders ---------- */

  const fetchPreviousFlashcardSets = async () => {
    setLoadingPrevious(true);
    try {
      const result = await learningApi.getPreviousFlashcardSets({
        userId,
        topicId: selectedTopic.id,
        language: selectedLanguage,
      });
      if (result && result.sets) {
        setPreviousFlashcardSets(result.sets);
      }
    } catch (error) {
      console.error('Error fetching previous flashcard sets:', error);
    } finally {
      setLoadingPrevious(false);
    }
  };

  const fetchPreviousQuizAttempts = async () => {
    setLoadingPrevious(true);
    try {
      const result = await learningApi.getPreviousQuizAttempts({
        userId,
        topicId: selectedTopic.id,
        language: selectedLanguage,
      });
      if (result && result.quizzes) {
        setPreviousQuizAttempts(result.quizzes);
      }
    } catch (error) {
      console.error('Error fetching previous quiz attempts:', error);
    } finally {
      setLoadingPrevious(false);
    }
  };

  /* ---------- Selection handlers ---------- */

  const handleUsePreviousFlashcardSet = (set) => {
    setFlashcards(set.cards);
    setFlashcardSetId(set.id);
    setSubmittedFlashcards(false);
    setShowDatasetSelector(false);
  };

  const handleUsePreviousQuiz = (quizData) => {
    setQuiz(quizData.questions);
    setQuizAttemptId(quizData.id);
    setSubmittedQuiz(false);
    setShowDatasetSelector(false);
  };

  const handleGenerateNew = () => {
    setShowDatasetSelector(false);
    if (mode === 'flashcards') {
      setFlashcards(null);
      setSubmittedFlashcards(false);
      generateFlashcards();
    } else if (mode === 'quiz') {
      setQuiz(null);
      setSubmittedQuiz(false);
      generateQuiz();
    }
  };

  /* ---------- Flashcard generation ---------- */

  const generateFlashcards = async () => {
    setLoading(true);
    try {
      const result = await learningApi.generateFlashcards({
        userId,
        topicId: selectedTopic.id,
        topicName: selectedTopic.name,
        language: selectedLanguage,
        userPreferences,
      });

      if (result && result.flashcards) {
        setFlashcards(result.flashcards);
        setFlashcardSetId(result.setId);
        setSubmittedFlashcards(false);
        fetchPreviousFlashcardSets();
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Quiz generation ---------- */

  const generateQuiz = async () => {
    setLoading(true);
    try {
      const result = await learningApi.generateQuiz({
        userId,
        topicId: selectedTopic.id,
        topicName: selectedTopic.name,
        language: selectedLanguage,
        userPreferences,
        questionCount: 10,
      });

      if (result && result.quiz) {
        setQuiz(result.quiz);
        setQuizAttemptId(result.attemptId);
        setSubmittedQuiz(false);
        fetchPreviousQuizAttempts();
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Quiz submission ---------- */

  // Called by QuizComponent when the last question is answered.
  // `answers` is the full array of answer objects; the API wants just
  // the selected strings, in order.
  const submitQuizResults = async (answers) => {
    if (!quizAttemptId || submittedQuiz) return;

    setSubmittedQuiz(true);
    try {
      await learningApi.submitQuiz({
        attemptId: quizAttemptId,
        userId,
        topicId: selectedTopic.id,
        answers: answers.map((a) => a.selected),
        timeSpent: 0,
      });
      fetchPreviousQuizAttempts();
      onActivityComplete?.();
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  /* ---------- Flashcard mastery + completion ---------- */

  const updateFlashcardMastery = async (cardIndex, known) => {
    if (!flashcardSetId || submittedFlashcards) return;

    try {
      await learningApi.updateFlashcardMastery({
        setId: flashcardSetId,
        userId,
        topicId: selectedTopic.id,
        cardIndex,
        known,
      });
    } catch (error) {
      console.error('Error updating flashcard mastery:', error);
    }
  };

  const handleFlashcardComplete = async (knownCount, totalCount) => {
    await submitFlashcardCompletion(knownCount, totalCount);
    onBack();
  };

  const submitFlashcardCompletion = async (knownCount, totalCount) => {
    if (!flashcardSetId || submittedFlashcards) return;

    setSubmittedFlashcards(true);
    try {
      await learningApi.completeFlashcardSet({
        setId: flashcardSetId,
        userId,
        knownCount,
        totalCount,
      });
      fetchPreviousFlashcardSets();
      onActivityComplete?.();
    } catch (error) {
      console.error('Error completing flashcard set:', error);
    }
  };

  /* ---------- Quiz completion ---------- */

  // Called by QuizComponent's Continue button. Submission already
  // happened on the last question, so this only navigates.
  const handleQuizComplete = async () => {
    onBack();
  };

  /* ---------- Back navigation ---------- */

  const handleBack = () => {
    stopSpeaking?.();
    onBack();
  };

  /* ---------- Dataset selectors ---------- */

  const renderFlashcardDatasetSelector = () => {
    if (previousFlashcardSets.length === 0 && !loadingPrevious) {
      return (
        <div className="nb-card nb-text-center">
          <h3 className="nb-heading nb-heading-md nb-mb-sm">
            No previous flashcards found
          </h3>
          <p className="nb-text nb-text-muted nb-mb-lg">
            Generate your first set to get started!
          </p>
          <button
            className="nb-button nb-button-primary"
            onClick={generateFlashcards}
          >
            Generate New Flashcards
          </button>
        </div>
      );
    }

    return (
      <div>
        <h2 className="nb-heading nb-heading-lg nb-mb-sm">
          Choose a Flashcard Set
          <AIInconsistencyTooltip variant="flashcards" placement="right" />
        </h2>
        <p className="nb-text nb-text-muted nb-mb-lg">
          Select from your previous sets or create a new one
        </p>

        <div className="nb-flex nb-flex-col nb-gap-md nb-mb-lg">
          {previousFlashcardSets.map((item) => (
            <button
              key={item.id}
              onClick={() => handleUsePreviousFlashcardSet(item)}
              className="nb-card nb-card-hover"
              style={{
                textAlign: 'left',
                cursor: 'pointer',
                fontFamily: 'var(--nb-font)',
              }}
            >
              <div className="nb-flex nb-flex-between nb-mb-sm">
                <span className="nb-heading nb-heading-sm">
                  {item.title || `${selectedTopic.name} Flashcards`}
                </span>
              </div>
              <div className="nb-flex nb-gap-md nb-mb-sm">
                <span className="nb-text-sm">
                  {item.cards?.length || 0} cards
                </span>
                <span className="nb-text-sm">
                  Mastery: {Math.round(item.masteryLevel || 0)}%
                </span>
                <span className="nb-text-sm">
                  Reviewed: {item.timesReviewed || 0} times
                </span>
              </div>
              <span className="nb-text-xs nb-text-muted">
                Created: {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </button>
          ))}
        </div>

        <button
          className="nb-button nb-button-primary nb-button-full"
          onClick={handleGenerateNew}
        >
          Generate New Set
        </button>
      </div>
    );
  };

  const renderQuizDatasetSelector = () => {
    if (previousQuizAttempts.length === 0 && !loadingPrevious) {
      return (
        <div className="nb-card nb-text-center">
          <h3 className="nb-heading nb-heading-md nb-mb-sm">
            No previous quizzes found
          </h3>
          <p className="nb-text nb-text-muted nb-mb-lg">
            Generate your first quiz to get started!
          </p>
          <button className="nb-button nb-button-primary" onClick={generateQuiz}>
            Generate New Quiz
          </button>
        </div>
      );
    }

    return (
      <div>
        <h2 className="nb-heading nb-heading-lg nb-mb-sm">
          Choose a Quiz
          <AIInconsistencyTooltip variant="quiz" placement="right" />
        </h2>

        <div className="nb-flex nb-flex-col nb-gap-md nb-mb-lg">
          {previousQuizAttempts.map((item) => (
            <button
              key={item.id}
              onClick={() => handleUsePreviousQuiz(item)}
              className="nb-card nb-card-hover"
              style={{
                textAlign: 'left',
                cursor: 'pointer',
                fontFamily: 'var(--nb-font)',
              }}
            >
              <div className="nb-flex nb-flex-between nb-mb-sm">
                <span className="nb-heading nb-heading-sm">
                  {item.title || `${selectedTopic.name} Quiz`}
                </span>
              </div>
              <div className="nb-flex nb-gap-md nb-mb-sm">
                <span className="nb-text-sm">
                  {item.totalQuestions || 0} questions
                </span>
                {item.score !== null && (
                  <span className="nb-text-sm">Score: {item.score}%</span>
                )}
                <span className="nb-text-sm">
                  Correct: {item.correctCount || 0}
                </span>
              </div>
              <span className="nb-text-xs nb-text-muted">
                {item.completedAt
                  ? `Completed: ${new Date(
                      item.completedAt
                    ).toLocaleDateString()}`
                  : `Created: ${new Date(item.createdAt).toLocaleDateString()}`}
              </span>
            </button>
          ))}
        </div>

        <button
          className="nb-button nb-button-primary nb-button-full"
          onClick={handleGenerateNew}
        >
          Generate New Quiz
        </button>
      </div>
    );
  };

  /* ---------- Content router ---------- */

  const renderContent = () => {
    if (mode === 'reading') {
      return (
        <ReadingLesson
          lesson={lesson}
          language={selectedLanguage}
          speakText={speakText}
          stopSpeaking={stopSpeaking}
          isSpeaking={isSpeaking}
          isMuted={isMuted}
          onToggleMute={onToggleMute}
          activeSentenceIndex={activeSentenceIndex}
          setActiveSentenceIndex={setActiveSentenceIndex}
          onComplete={onLessonComplete}
          onStart={onStartLesson}
          isGenerating={isLessonLoading}
          generationError={lessonError}
          onRetry={onRetryLesson}
          onProgress={onLessonProgress}
          topicId={selectedTopic?.id}
          userId={userId ?? userPreferences?.id}
          onSelectPreviousLesson={onSelectPreviousLesson}
        />
      );
    }

    if (mode === 'flashcards') {
      if (showDatasetSelector && !flashcards) {
        return loadingPrevious ? (
          <div
            className="nb-flex nb-flex-center"
            style={{ minHeight: '400px', flexDirection: 'column' }}
          >
            <div className="nb-spinner" />
            <p className="nb-mt-md">Loading your flashcards...</p>
          </div>
        ) : (
          renderFlashcardDatasetSelector()
        );
      }

      if (loading) {
        return (
          <div
            className="nb-flex nb-flex-center"
            style={{ minHeight: '400px', flexDirection: 'column' }}
          >
            <div className="nb-spinner" />
            <p className="nb-mt-md">Generating flashcards...</p>
          </div>
        );
      }

      if (flashcards && flashcards.length > 0) {
        return (
          <FlashcardComponent
            flashcards={flashcards}
            onComplete={handleFlashcardComplete}
            onUpdateMastery={updateFlashcardMastery}
            nativeLanguage={userPreferences?.nativeLanguage || 'English'}
          />
        );
      }

      return null;
    }

    if (mode === 'quiz') {
      if (showDatasetSelector && !quiz) {
        return loadingPrevious ? (
          <div
            className="nb-flex nb-flex-center"
            style={{ minHeight: '400px', flexDirection: 'column' }}
          >
            <div className="nb-spinner" />
            <p className="nb-mt-md">Loading your quizzes...</p>
          </div>
        ) : (
          renderQuizDatasetSelector()
        );
      }

      if (loading) {
        return (
          <div
            className="nb-flex nb-flex-center"
            style={{ minHeight: '400px', flexDirection: 'column' }}
          >
            <div className="nb-spinner" />
            <p className="nb-mt-md">Generating quiz...</p>
          </div>
        );
      }

      if (quiz && quiz.length > 0) {
        return (
          <QuizComponent
            quiz={quiz}
            onSubmit={submitQuizResults}
            onComplete={handleQuizComplete}
          />
        );
      }

      return null;
    }

    if (mode === 'crossword') {
      return (
        <CrosswordGame
          userId={userId}
          language={selectedLanguage}
          topicId={selectedTopic?.id}
          topicName={selectedTopic?.name}
          userPreferences={userPreferences}
          onBack={handleBack}
          onActivityComplete={onActivityComplete}
        />
      );
    }

    return null;
  };

  const headerTitle =
    mode === 'reading'
      ? 'Reading Lesson'
      : mode === 'flashcards'
      ? 'Flashcards'
      : mode === 'quiz'
      ? 'Quiz'
      : mode === 'crossword'
      ? 'Crossword'
      : 'Learning';

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
        <button
          onClick={handleBack}
          className="nb-button"
          style={{
            padding: 'var(--nb-space-sm) var(--nb-space-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <MaterialIcon name="ArrowBack" size={18} color="var(--nb-black)" />
          Back
        </button>
        <h1 className="nb-heading nb-heading-md" style={{ margin: 0 }}>
          {headerTitle}
        </h1>
        <div
          style={{
            width: '100px',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <StreakBadge streak={streak} />
        </div>
      </div>

      <div style={{ padding: 'var(--nb-space-lg)', flex: 1 }}>
        {renderContent()}
      </div>
    </div>
  );
};