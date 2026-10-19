import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ReadingLessonSetup } from './ReadingLessonSetup';
import { ReadingLessonPlayer } from './ReadingLessonPlayer';

export const ReadingLesson = ({
  lesson,
  language,
  userId,
  topicId,
  speakText,
  stopSpeaking,
  isSpeaking,
  isMuted,
  onToggleMute,
  activeSentenceIndex,
  setActiveSentenceIndex,
  onComplete,
  onProgress,
  onStart,
  onSelectPreviousLesson,
  isGenerating,
  generationError,
  onRetry,
}) => {
  const [started, setStarted] = useState(false);
  // Matches ReadingLessonSetup's controls.
  const [config, setConfig] = useState({
    sectionCount: 3,
    questionsPerSection: 3,
    difficulty: 'adaptive',
  });

  const [previousAttempts, setPreviousAttempts] = useState([]);
  const [loadingPrevious, setLoadingPrevious] = useState(false);

  useEffect(() => {
    if (!userId || !topicId) return;

    let cancelled = false;

    const load = async () => {
      setLoadingPrevious(true);
      try {
        const result = await api.getLessonAttempts({
          userId,
          topicId,
          language,
        });
        if (!cancelled) {
          setPreviousAttempts(result?.attempts ?? []);
        }
      } catch (err) {
        console.error('Failed to load previous lessons:', err);
      } finally {
        if (!cancelled) setLoadingPrevious(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [userId, topicId, language]);

  useEffect(() => {
    if (lesson) setStarted(true);
  }, [lesson]);

  // Only reset when there is no lesson AND no generation in flight AND
  // no error. Previously this also reset during an error flash.
  useEffect(() => {
    if (!lesson && !isGenerating && !generationError) {
      setStarted(false);
    }
  }, [lesson, isGenerating, generationError]);

  const handleConfirm = () => {
    setStarted(true);
    onStart?.(config);
  };

  const handleSelectPrevious = (attempt) => {
    onSelectPreviousLesson?.(attempt);
  };

  if (!started) {
    return (
      <ReadingLessonSetup
        language={language}
        config={config}
        setConfig={setConfig}
        onConfirm={handleConfirm}
        isGenerating={isGenerating}
        generationError={generationError}
        onRetry={onRetry}
        previousAttempts={previousAttempts}
        loadingPrevious={loadingPrevious}
        onSelectPrevious={handleSelectPrevious}
      />
    );
  }

  if (isGenerating) {
    return (
      <div
        className="nb-flex nb-flex-center"
        style={{ minHeight: '400px', flexDirection: 'column' }}
      >
        <div className="nb-spinner" />
        <p className="nb-mt-md">Generating your reading lesson...</p>
        <p className="nb-text-sm nb-text-muted">
          {config.sectionCount} sections · {config.questionsPerSection}{' '}
          questions each · {config.difficulty}
        </p>
      </div>
    );
  }

  if (generationError) {
    return (
      <div
        className="nb-card nb-text-center"
        style={{ maxWidth: '500px', margin: '0 auto' }}
      >
        <h3 className="nb-heading nb-heading-md nb-mb-sm">
          Something went wrong
        </h3>
        <p className="nb-text nb-text-muted nb-mb-lg">{generationError}</p>
        <div className="nb-flex nb-gap-sm nb-flex-center">
          <button className="nb-button" onClick={() => setStarted(false)}>
            Change Settings
          </button>
          {onRetry && (
            <button className="nb-button nb-button-primary" onClick={onRetry}>
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!lesson) return null;

  return (
    <ReadingLessonPlayer
      lesson={lesson}
      language={language}
      speakText={speakText}
      stopSpeaking={stopSpeaking}
      isSpeaking={isSpeaking}
      isMuted={isMuted}
      onToggleMute={onToggleMute}
      activeSentenceIndex={activeSentenceIndex}
      setActiveSentenceIndex={setActiveSentenceIndex}
      onComplete={onComplete}
      onProgress={onProgress}
    />
  );
};