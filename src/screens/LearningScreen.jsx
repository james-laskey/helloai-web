import React, { useEffect, useState } from 'react';
import { ReadingLessonScreen } from './ReadingLessonScreen';
import { QuizScreen } from './QuizScreen';
import { FlashcardComponent } from '../components/FlashcardComponent';
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

  // Stats
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
  /* ---------- Flashcards ---------- */
  const [flashcards, setFlashcards] = useState(null);
  const [flashcardSetId, setFlashcardSetId] = useState(null);
  const [submittedFlashcards, setSubmittedFlashcards] = useState(false);
  const [flashcardsLoading, setFlashcardsLoading] = useState(false);
  const [flashcardsError, setFlashcardsError] = useState(null);

  const generateFlashcards = async () => {
    setFlashcardsLoading(true);
    setFlashcardsError(null);
    setFlashcards(null);
    setSubmittedFlashcards(false);
    try {
      const result = await learningApi.generateFlashcards({
        userId,
        topicId: selectedTopic.id,
        topicName: selectedTopic.name,
        language: selectedLanguage,
        userPreferences,
      });
      if (!result?.flashcards) throw new Error('No flashcards returned');
      setFlashcards(result.flashcards);
      setFlashcardSetId(result.setId);
    } catch (err) {
      console.error('Error generating flashcards:', err);
      setFlashcardsError('Could not generate flashcards. Please try again.');
    } finally {
      setFlashcardsLoading(false);
    }
  };

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
    } catch (err) {
      console.error('Error updating flashcard mastery:', err);
    }
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
      onActivityComplete?.();
    } catch (err) {
      console.error('Error completing flashcard set:', err);
    }
  };

  const handleFlashcardComplete = async (knownCount, totalCount) => {
    await submitFlashcardCompletion(knownCount, totalCount);
    onBack?.();
  };

  /* ---------- Content router ---------- */

  const renderContent = () => {
    if (mode === 'reading') {
      return (
        <ReadingLessonScreen
          lesson={lesson}
          language={selectedLanguage}
          userId={userId}
          topicId={selectedTopic?.id}
          userPreferences={userPreferences}
          speakText={speakText}
          stopSpeaking={stopSpeaking}
          isSpeaking={isSpeaking}
          isMuted={isMuted}
          onToggleMute={onToggleMute}
          activeSentenceIndex={activeSentenceIndex}
          setActiveSentenceIndex={setActiveSentenceIndex}
          isLessonLoading={isLessonLoading}
          lessonError={lessonError}
          onStartLesson={onStartLesson}
          onRetryLesson={onRetryLesson}
          onLessonComplete={onLessonComplete}
          onLessonProgress={onLessonProgress}
          onSelectPreviousLesson={onSelectPreviousLesson}
          onBack={onBack}
          streak={streak}
        />
      );
    }

    if (mode === 'flashcards') {
      if (!flashcards && !flashcardsLoading) {
        return (
          <div
            className="nb-card nb-text-center"
            style={{ maxWidth: 520, margin: '0 auto' }}
          >
            <MaterialIcon name="Style" size={40} color="var(--nb-black)" />
            <h3 className="nb-heading nb-heading-md nb-mt-md">
              Flashcard set
            </h3>
            <p className="nb-text nb-text-muted nb-mb-lg">
              Generate a fresh set of {selectedTopic?.name} cards for{' '}
              {selectedLanguage}.
            </p>
            <button
              className="nb-button nb-button-primary nb-button-full"
              onClick={generateFlashcards}
            >
              Generate Flashcards
            </button>
            {flashcardsError && (
              <p
                className="nb-text-sm nb-mt-md"
                style={{ color: 'var(--nb-red)' }}
              >
                {flashcardsError}
              </p>
            )}
          </div>
        );
      }

      if (flashcardsLoading) {
        return (
          <div
            className="nb-flex nb-flex-center"
            style={{ minHeight: 400, flexDirection: 'column' }}
          >
            <div className="nb-spinner" />
            <p className="nb-mt-md">Generating flashcards...</p>
          </div>
        );
      }

      if (flashcards?.length > 0) {
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
      return (
        <QuizScreen
          language={selectedLanguage}
          nativeLanguage={userPreferences?.nativeLanguage || 'English'}
          userId={userId}
          topicId={selectedTopic?.id}
          topicName={selectedTopic?.name}
          userPreferences={userPreferences}
          onBack={onBack}
          onActivityComplete={onActivityComplete}
          streak={streak}
        />
      );
    }

    if (mode === 'crossword') {
      return (
        <CrosswordGame
          userId={userId}
          language={selectedLanguage}
          topicId={selectedTopic?.id}
          topicName={selectedTopic?.name}
          userPreferences={userPreferences}
          onBack={onBack}
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
    <div
      className="nb-container"
      style={{ background: 'var(--nb-surface)' }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--nb-space-md) var(--nb-space-lg)',
          background: 'var(--nb-purple)',
          borderBottom: 'var(--nb-border)',
        }}
      >
        <button
          onClick={() => {
            stopSpeaking?.();
            onBack?.();
          }}
          className="nb-button"
          style={{
            padding: 'var(--nb-space-sm) var(--nb-space-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <MaterialIcon name="ArrowBack" size={18} color="var(--nb-black)" />
          Back
        </button>
        <h1 className="nb-heading nb-heading-md" style={{ margin: 0 }}>
          {headerTitle}
        </h1>
        <div
          style={{ width: 100, display: 'flex', justifyContent: 'flex-end' }}
        >
          <StreakBadge streak={streak} />
        </div>
      </div>

      <div
        style={{
          flex: 1,
          background: 'var(--nb-surface)',
        }}
      >
        {renderContent()}
      </div>
    </div>
  );
};