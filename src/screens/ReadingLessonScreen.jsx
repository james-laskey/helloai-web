import React, { useState, useCallback } from 'react';
import { MaterialIcon } from '../components/landing-page/icons';
import { ReadingLesson } from '../components/reading-lessons/ReadingLesson';
import { LessonCelebration } from '../components/reading-lessons/LessonCelebration';
import { StreakBadge } from '../components/StreakBadge';

/**
 * Full screen for the reading lesson flow:
 *   setup -> player -> celebration -> back
 *
 * Renders its own header with a Back button. Back behavior:
 *   - In the celebration  -> dismiss the celebration, return to the player.
 *   - In the player/setup -> call onBack() (parent resets reading state).
 */
export const ReadingLessonScreen = ({
  lesson,
  language,
  userId,
  topicId,
  userPreferences,
  speakText,
  stopSpeaking,
  isSpeaking,
  isMuted,
  onToggleMute,
  activeSentenceIndex,
  setActiveSentenceIndex,
  isLessonLoading,
  lessonError,
  onStartLesson,
  onRetryLesson,
  onLessonComplete,
  onLessonProgress,
  onSelectPreviousLesson,
  onBack,
  streak,
}) => {
  const [completion, setCompletion] = useState(null);
  const [celebrating, setCelebrating] = useState(false);

  const handleComplete = useCallback(
    async (result) => {
      setCompletion(result);
      setCelebrating(true);

      try {
        await onLessonComplete?.(result);
      } catch (err) {
        console.error('Error submitting lesson results:', err);
      }
    },
    [onLessonComplete]
  );

  const handleContinue = useCallback(() => {
    setCelebrating(false);
    setCompletion(null);
    onBack?.();
  }, [onBack]);

  const handleReview = useCallback(() => {
    setCelebrating(false);
  }, []);

  /* ---------- Back handler ---------- */
  const handleBack = () => {
    if (celebrating) {
      // Inside the celebration: dismiss it, stay in the reading lesson.
      setCelebrating(false);
      return;
    }
    // Setup or player: hand control to the parent.
    onBack?.();
  };

  /* ---------- Header ---------- */
  const Header = (
    <div className="dash-feature">
      <div className="dash-feature__bar">
        <button
          type="button"
          className="dash-feature__back"
          onClick={handleBack}
          aria-label="Back"
        >
          <MaterialIcon name="ArrowBack" size={16} color="var(--nb-black)" />
          Back
        </button>
        <div className="dash-feature__title-wrap">
          <span className="dash-feature__title">Reading Lesson</span>
          <span className="dash-feature__subtitle">{language}</span>
        </div>
      </div>
    </div>
  );

  /* ---------- Celebration ---------- */
  if (celebrating && completion) {
    return (
      <div>
        {Header}
        <LessonCelebration
          result={completion}
          language={language}
          lesson={lesson}
          onContinue={handleContinue}
          onReview={handleReview}
        />
      </div>
    );
  }

  /* ---------- Player / setup ---------- */
  return (
    <div>
      {Header}
      <ReadingLesson
        lesson={lesson}
        language={language}
        userId={userId}
        topicId={topicId}
        speakText={speakText}
        stopSpeaking={stopSpeaking}
        isSpeaking={isSpeaking}
        isMuted={isMuted}
        onToggleMute={onToggleMute}
        activeSentenceIndex={activeSentenceIndex}
        setActiveSentenceIndex={setActiveSentenceIndex}
        onComplete={handleComplete}
        onProgress={onLessonProgress}
        onStart={onStartLesson}
        onSelectPreviousLesson={onSelectPreviousLesson}
        isGenerating={isLessonLoading}
        generationError={lessonError}
        onRetry={onRetryLesson}
      />
    </div>
  );
};