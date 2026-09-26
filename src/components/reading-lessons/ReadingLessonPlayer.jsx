import React, { useState, useEffect, useRef } from 'react';
import { LessonHeader } from './LessonHeader';
import { PassageViewer } from './PassageViewer';
import { VocabularyList } from './VocabularyList';
import { ComprehensionQuiz } from './ComprehensionQuiz';

export const ReadingLessonPlayer = ({
  lesson,
  language,
  speakText,
  stopSpeaking,
  isMuted,
  onToggleMute,
  activeSentenceIndex,
  setActiveSentenceIndex,
  onComplete,
  onProgress,
}) => {
  const [playingAll, setPlayingAll] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const sentences = lesson?.passage || [];
  const vocabulary = lesson?.vocabulary || [];
  const questions = lesson?.questions || [];

  // Engagement metrics
  const metricsRef = useRef({
    sentencesPlayed: 0,
    wordsPlayed: 0,
    replaysBySentence: new Array(sentences.length).fill(0),
    vocabTapsByWord: new Array(vocabulary.length).fill(0),
    playedAllCount: 0,
    firstInteractionAt: null,
    lastInteractionAt: null,
    startedAt: Date.now(),
  });

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

  const noteInteraction = () => {
    const m = metricsRef.current;
    const now = new Date().toISOString();
    if (!m.firstInteractionAt) m.firstInteractionAt = now;
    m.lastInteractionAt = now;

    // Emit progress for optional autosave
    if (onProgress) {
      onProgress({
        ...m,
        timeSpentSeconds: Math.floor((Date.now() - m.startedAt) / 1000),
      });
    }
  };

  /* ---------- Playback ---------- */

  const playSentence = (index) => {
    if (isMuted) return;
    const sentence = sentences[index];
    if (!sentence) return;

    metricsRef.current.sentencesPlayed += 1;
    metricsRef.current.replaysBySentence[index] =
      (metricsRef.current.replaysBySentence[index] || 0) + 1;
    noteInteraction();

    setActiveSentenceIndex(index);
    setPlayingAll(false);

    speakText(sentence.text, {
      onEnd: () => setActiveSentenceIndex(null),
    });
  };

  const playAll = async () => {
    if (isMuted || sentences.length === 0) return;
    setPlayingAll(true);
    metricsRef.current.playedAllCount += 1;
    noteInteraction();

    for (let i = 0; i < sentences.length; i++) {
      setActiveSentenceIndex(i);
      metricsRef.current.sentencesPlayed += 1;
      metricsRef.current.replaysBySentence[i] =
        (metricsRef.current.replaysBySentence[i] || 0) + 1;

      await new Promise((resolve) => {
        speakText(sentences[i].text, {
          onEnd: resolve,
          onError: resolve,
        });
      });
    }

    setActiveSentenceIndex(null);
    setPlayingAll(false);
  };

  const stopAll = () => {
    stopSpeaking();
    setPlayingAll(false);
    setActiveSentenceIndex(null);
  };

  /* ---------- Vocabulary ---------- */

  const handleWordClick = (index, word) => {
    if (isMuted) return;
    metricsRef.current.wordsPlayed += 1;
    metricsRef.current.vocabTapsByWord[index] =
      (metricsRef.current.vocabTapsByWord[index] || 0) + 1;
    noteInteraction();

    speakText(word, {
      onStart: () => setActiveSentenceIndex('vocab-' + index),
      onEnd: () => setActiveSentenceIndex(null),
    });
  };

  /* ---------- Quiz ---------- */

  const handleSelectAnswer = (qIndex, option) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: option }));
    noteInteraction();
  };

  const buildResultPayload = () => {
    let correctCount = 0;
    const detailedAnswers = questions.map((q, i) => {
      const selected = answers[i];
      const isCorrect = selected === q.correctAnswer;
      if (isCorrect) correctCount += 1;
      return {
        questionIndex: i,
        question: q.question,
        selected,
        correctAnswer: q.correctAnswer,
        isCorrect,
      };
    });

    const m = metricsRef.current;
    const timeSpentSeconds = Math.floor((Date.now() - m.startedAt) / 1000);

    return {
      answers: detailedAnswers,
      correctCount,
      totalQuestions: questions.length,
      audioMetrics: {
        sentencesPlayed: m.sentencesPlayed,
        wordsPlayed: m.wordsPlayed,
        replaysBySentence: m.replaysBySentence,
        vocabTapsByWord: m.vocabTapsByWord,
        playedAllCount: m.playedAllCount,
        firstInteractionAt: m.firstInteractionAt,
        lastInteractionAt: m.lastInteractionAt,
        timeSpentSeconds,
      },
      timeSpent: timeSpentSeconds,
    };
  };

  const handleSubmitQuiz = () => {
    if (submitted) return;
    setSubmitted(true);
    onComplete?.(buildResultPayload());
  };

  const handleContinue = () => {
    // Continue is only visible after submit; App already navigated away,
    // but keep this as a no-op safety net.
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--nb-space-lg)',
      }}
    >
      <LessonHeader
        lesson={lesson}
        language={language}
        sentenceCount={sentences.length}
        vocabCount={vocabulary.length}
        questionCount={questions.length}
        playingAll={playingAll}
        onPlayAllToggle={playingAll ? stopAll : playAll}
        isMuted={isMuted}
        onToggleMute={onToggleMute}
      />

      <PassageViewer
        sentences={sentences}
        activeSentenceIndex={activeSentenceIndex}
        onSentenceClick={playSentence}
        isMuted={isMuted}
      />

      <VocabularyList
        vocabulary={vocabulary}
        onWordClick={handleWordClick}
        isMuted={isMuted}
      />

      <ComprehensionQuiz
        questions={questions}
        answers={answers}
        submitted={submitted}
        onSelectAnswer={handleSelectAnswer}
        onSubmit={handleSubmitQuiz}
        onContinue={handleContinue}
      />
    </div>
  );
};