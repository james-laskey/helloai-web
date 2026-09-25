import React, { useState, useEffect } from 'react';
import { CallScreen } from './CallScreen';
import { FlashcardComponent } from '../components/FlashcardComponent';
import { QuizComponent } from '../components/QuizComponent';
import { learningApi } from '../services/learningApi';

export const LearningScreen = ({
  mode,
  selectedLanguage,
  selectedTopic,
  userPreferences,
  onBack,
  // CallScreen props
  messages,
  isLoading,
  isSpeaking,
  isMuted,
  callDuration,
  inputText,
  onInputChange,
  onSendMessage,
  onEndCall,
  onToggleMute,
  onStopSpeaking,
  userStats,
  showStats,
  onToggleStats,
  onFetchStats,
  sessionId,
  speakText,
  stopSpeaking
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
      fetchPreviousFlashcardSets();
    } else if (mode === 'quiz') {
      fetchPreviousQuizAttempts();
    }
  }, [mode]);

  const fetchPreviousFlashcardSets = async () => {
    setLoadingPrevious(true);
    try {
      const result = await learningApi.getPreviousFlashcardSets({
        userId: userPreferences?.id || 'anonymous',
        topicId: selectedTopic.id,
        language: selectedLanguage
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
        userId: userPreferences?.id || 'anonymous',
        topicId: selectedTopic.id,
        language: selectedLanguage
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

  const handleUsePreviousFlashcardSet = (set) => {
    setFlashcards(set.cards);
    setFlashcardSetId(set.id);
    setShowDatasetSelector(false);
  };

  const handleUsePreviousQuiz = (quizData) => {
    setQuiz(quizData.questions);
    setQuizAttemptId(quizData.id);
    setShowDatasetSelector(false);
  };

  const handleGenerateNew = () => {
    setShowDatasetSelector(false);
    if (mode === 'flashcards') {
      setFlashcards(null);
      generateFlashcards();
    } else if (mode === 'quiz') {
      setQuiz(null);
      generateQuiz();
    }
  };

  const generateFlashcards = async () => {
    setLoading(true);
    try {
      const result = await learningApi.generateFlashcards({
        userId: userPreferences?.id || 'anonymous',
        topicId: selectedTopic.id,
        topicName: selectedTopic.name,
        language: selectedLanguage,
        userPreferences
      });

      if (result && result.flashcards) {
        setFlashcards(result.flashcards);
        setFlashcardSetId(result.setId);
        fetchPreviousFlashcardSets();
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQuiz = async () => {
    setLoading(true);
    try {
      const result = await learningApi.generateQuiz({
        userId: userPreferences?.id || 'anonymous',
        topicId: selectedTopic.id,
        topicName: selectedTopic.name,
        language: selectedLanguage,
        userPreferences,
        questionCount: 10
      });

      if (result && result.quiz) {
        setQuiz(result.quiz);
        setQuizAttemptId(result.attemptId);
        fetchPreviousQuizAttempts();
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitQuizResults = async (answers, score, total) => {
    if (!quizAttemptId || submittedQuiz) return;

    setSubmittedQuiz(true);
    try {
      await learningApi.submitQuiz({
        attemptId: quizAttemptId,
        userId: userPreferences?.id || 'anonymous',
        topicId: selectedTopic.id,
        answers: answers.map(a => a.selected),
        timeSpent: 0
      });
      setQuiz(null);
      fetchPreviousQuizAttempts();
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  const updateFlashcardMastery = async (cardIndex, known) => {
    if (!flashcardSetId || submittedFlashcards) return;

    try {
      await learningApi.updateFlashcardMastery({
        setId: flashcardSetId,
        userId: userPreferences?.id || 'anonymous',
        topicId: selectedTopic.id,
        cardIndex,
        known
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
      setFlashcards(null);
      fetchPreviousFlashcardSets();
    } catch (error) {
      console.error('Error submitting flashcard completion:', error);
    }
  };

  const handleQuizComplete = async (score, total, answers) => {
    await submitQuizResults(answers, score, total);
    onBack();
  };

  const handleBack = () => {
    if (mode === 'tutor') {
      onEndCall();
    }
    onBack();
  };

  // Render dataset selector for flashcards
  const renderFlashcardDatasetSelector = () => {
    if (previousFlashcardSets.length === 0 && !loadingPrevious) {
      return (
        <div className="nb-card nb-text-center">
          <h3 className="nb-heading nb-heading-md nb-mb-sm">No previous flashcards found</h3>
          <p className="nb-text nb-text-muted nb-mb-lg">Generate your first set to get started!</p>
          <button className="nb-button nb-button-primary" onClick={generateFlashcards}>
            ➕ Generate New Flashcards
          </button>
        </div>
      );
    }

    return (
      <div>
        <h2 className="nb-heading nb-heading-lg nb-mb-sm">Choose a Flashcard Set</h2>
        <p className="nb-text nb-text-muted nb-mb-lg">Select from your previous sets or create a new one</p>

        <div className="nb-flex nb-flex-col nb-gap-md nb-mb-lg">
          {previousFlashcardSets.map((item) => (
            <button
              key={item.id}
              onClick={() => handleUsePreviousFlashcardSet(item)}
              className="nb-card nb-card-hover"
              style={{ textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--nb-font)' }}
            >
              <div className="nb-flex nb-flex-between nb-mb-sm">
                <span className="nb-heading nb-heading-sm">📇 {item.title || `${selectedTopic.name} Flashcards`}</span>
              </div>
              <div className="nb-flex nb-gap-md nb-mb-sm">
                <span className="nb-text-sm">📇 {item.cards?.length || 0} cards</span>
                <span className="nb-text-sm">📊 Mastery: {Math.round(item.masteryLevel || 0)}%</span>
                <span className="nb-text-sm">🔄 Reviewed: {item.timesReviewed || 0} times</span>
              </div>
              <span className="nb-text-xs nb-text-muted">
                Created: {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </button>
          ))}
        </div>

        <button className="nb-button nb-button-primary nb-button-full" onClick={handleGenerateNew}>
          ➕ Generate New Set
        </button>
      </div>
    );
  };

  // Render dataset selector for quizzes
  const renderQuizDatasetSelector = () => {
    if (previousQuizAttempts.length === 0 && !loadingPrevious) {
      return (
        <div className="nb-card nb-text-center">
          <h3 className="nb-heading nb-heading-md nb-mb-sm">No previous quizzes found</h3>
          <p className="nb-text nb-text-muted nb-mb-lg">Generate your first quiz to get started!</p>
          <button className="nb-button nb-button-primary" onClick={generateQuiz}>
            ➕ Generate New Quiz
          </button>
        </div>
      );
    }

    return (
      <div>
        <h2 className="nb-heading nb-heading-lg nb-mb-sm">Choose a Quiz</h2>
        <p className="nb-text nb-text-muted nb-mb-lg">Select from your previous quizzes or create a new one</p>

        <div className="nb-flex nb-flex-col nb-gap-md nb-mb-lg">
          {previousQuizAttempts.map((item) => (
            <button
              key={item.id}
              onClick={() => handleUsePreviousQuiz(item)}
              className="nb-card nb-card-hover"
              style={{ textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--nb-font)' }}
            >
              <div className="nb-flex nb-flex-between nb-mb-sm">
                <span className="nb-heading nb-heading-sm">🎯 {item.title || `${selectedTopic.name} Quiz`}</span>
              </div>
              <div className="nb-flex nb-gap-md nb-mb-sm">
                <span className="nb-text-sm">📝 {item.totalQuestions || 0} questions</span>
                {item.score !== null && (
                  <span className="nb-text-sm">⭐ Score: {item.score}%</span>
                )}
                <span className="nb-text-sm">🎯 Correct: {item.correctCount || 0}</span>
              </div>
              <span className="nb-text-xs nb-text-muted">
                {item.completedAt
                  ? `Completed: ${new Date(item.completedAt).toLocaleDateString()}`
                  : `Created: ${new Date(item.createdAt).toLocaleDateString()}`}
              </span>
            </button>
          ))}
        </div>

        <button className="nb-button nb-button-primary nb-button-full" onClick={handleGenerateNew}>
          ➕ Generate New Quiz
        </button>
      </div>
    );
  };

  const renderContent = () => {
    if (mode === 'tutor') {
      return (
        <CallScreen
          selectedLanguage={selectedLanguage}
          selectedTopic={selectedTopic}
          messages={messages}
          isLoading={isLoading}
          isSpeaking={isSpeaking}
          isMuted={isMuted}
          callDuration={callDuration}
          inputText={inputText}
          onInputChange={onInputChange}
          onSendMessage={onSendMessage}
          onEndCall={handleBack}
          onToggleMute={onToggleMute}
          onStopSpeaking={onStopSpeaking}
          userStats={userStats}
          showStats={showStats}
          onToggleStats={onToggleStats}
          onFetchStats={onFetchStats}
          speakText={speakText}
        />
      );
    }

    if (mode === 'flashcards') {
      if (!flashcards && !loading && !showDatasetSelector) {
        setShowDatasetSelector(true);
      }

      if (showDatasetSelector && !flashcards) {
        return loadingPrevious ? (
          <div className="nb-flex nb-flex-center" style={{ minHeight: '400px' }}>
            <div className="nb-spinner" />
            <p className="nb-mt-md">Loading your flashcards...</p>
          </div>
        ) : renderFlashcardDatasetSelector();
      }

      if (loading) {
        return (
          <div className="nb-flex nb-flex-center" style={{ minHeight: '400px', flexDirection: 'column' }}>
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
          />
        );
      }

      return null;
    }

    if (mode === 'quiz') {
      if (!quiz && !loading && !showDatasetSelector) {
        setShowDatasetSelector(true);
      }

      if (showDatasetSelector && !quiz) {
        return loadingPrevious ? (
          <div className="nb-flex nb-flex-center" style={{ minHeight: '400px', flexDirection: 'column' }}>
            <div className="nb-spinner" />
            <p className="nb-mt-md">Loading your quizzes...</p>
          </div>
        ) : renderQuizDatasetSelector();
      }

      if (loading) {
        return (
          <div className="nb-flex nb-flex-center" style={{ minHeight: '400px', flexDirection: 'column' }}>
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
            attemptId={quizAttemptId}
            userId={userPreferences?.id}
            topicId={selectedTopic.id}
          />
        );
      }

      return null;
    }

    return null;
  };

  return (
    <div className="nb-container" style={{ background: 'var(--nb-purple)' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'var(--nb-space-md) var(--nb-space-lg)',
        background: 'var(--nb-white)',
        borderBottom: 'var(--nb-border)'
      }}>
        <button
          onClick={handleBack}
          className="nb-button"
          style={{ padding: 'var(--nb-space-sm) var(--nb-space-md)' }}
        >
          ← Back
        </button>
        <h1 className="nb-heading nb-heading-md" style={{ margin: 0 }}>
          {mode === 'tutor' ? '🎓 AI Tutor' : mode === 'flashcards' ? '📇 Flashcards' : '🎯 Quiz'}
        </h1>
        <div style={{ width: '100px' }} />
      </div>

      {/* Content */}
      <div style={{ padding: 'var(--nb-space-lg)', flex: 1 }}>
        {renderContent()}
      </div>
    </div>
  );
};