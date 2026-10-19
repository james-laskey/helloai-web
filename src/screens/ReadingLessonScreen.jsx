import React, { useState, useCallback } from 'react';
import { MaterialIcon } from '../components/landing-page/icons';
import { ReadingLesson } from '../components/reading-lessons/ReadingLesson';
import { LessonCelebration } from '../components/reading-lessons/LessonCelebration';
import { StreakBadge } from '../components/StreakBadge';

/**
 * Full screen for the reading lesson flow:
 *   setup -> player -> celebration -> back
 *
 * The celebration is shown here (not in the player) so the player can
 * unmount cleanly and the result can be displayed with its own
 * animations before navigating away.
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
  // The result of the just-submitted lesson. When set, show the
  // celebration instead of the player/setup.
  const [completion, setCompletion] = useState(null);
  const [celebrating, setCelebrating] = useState(false);

  const handleComplete = useCallback(
    async (result) => {
      // Let the player finish its own state updates first.
      setCompletion(result);
      setCelebrating(true);

      // Persist to the backend. App's handler does the API call and
      // refreshes the streak; we keep its return value for the
      // celebration summary.
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
    // Collapse the celebration but keep the lesson mounted so the
    // player can show its per-question review state.
    setCelebrating(false);
  }, []);

  /* ---------- Celebration ---------- */

  if (celebrating && completion) {
    return (
      <div
        className="nb-container"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
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
    <div
      className="nb-container"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >

      <div style={{ padding: 'var(--nb-space-lg)', flex: 1 }}>
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
    </div>
  );
};