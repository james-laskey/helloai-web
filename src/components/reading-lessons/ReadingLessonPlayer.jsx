import React, { useMemo, useRef, useState } from 'react';
import { MaterialIcon } from '../landing-page/icons';
import { SectionView } from './SectionView';
import { gradeSection, questionKey } from '../QuizComponents/QuizRenderer';

const PROGRESS_STEP_MS = 200;

export const ReadingLessonPlayer = ({
  lesson,
  language,
  speakText,
  stopSpeaking,
  isMuted,
  onToggleMute,
  onComplete,
  onProgress,
}) => {
  const sections = lesson?.sections || [];

  // Answers are stored per section so identical question text in two
  // sections can't collide: { [sectionId]: { [questionKey]: value } }
  const [answersBySection, setAnswersBySection] = useState({});
  const [submittedBySection, setSubmittedBySection] = useState({});
  const [resultsBySection, setResultsBySection] = useState({});
  const [playingAll, setPlayingAll] = useState(false);

  const metricsRef = useRef({
    sentencesPlayed: 0,
    wordsPlayed: 0,
    replaysBySentence: {}, // { [sectionId]: number[] }
    vocabTapsByWord: {},   // { [sectionId]: number[] }
    playedAllCount: 0,
    firstInteractionAt: null,
    lastInteractionAt: null,
    startedAt: Date.now(),
  });

  const noteInteraction = () => {
    const m = metricsRef.current;
    const now = new Date().toISOString();
    if (!m.firstInteractionAt) m.firstInteractionAt = now;
    m.lastInteractionAt = now;

    if (onProgress) {
      onProgress({
        sentencesPlayed: m.sentencesPlayed,
        wordsPlayed: m.wordsPlayed,
        replaysBySentence: flattenCounts(m.replaysBySentence),
        vocabTapsByWord: flattenCounts(m.vocabTapsByWord),
        playedAllCount: m.playedAllCount,
        firstInteractionAt: m.firstInteractionAt ?? undefined,
        lastInteractionAt: m.lastInteractionAt ?? undefined,
        timeSpentSeconds: Math.floor((Date.now() - m.startedAt) / 1000),
      });
    }
  };

  /* ---------- Answers ---------- */

  const setAnswer = (sectionId, key, value) => {
    setAnswersBySection((prev) => ({
      ...prev,
      [sectionId]: {
        ...(prev[sectionId] || {}),
        [key]: value,
      },
    }));
    noteInteraction();
  };

  /* ---------- Section submit ---------- */

  const handleSectionSubmit = (sectionId) => {
    const nextSubmitted = { ...submittedBySection, [sectionId]: true };
    setSubmittedBySection(nextSubmitted);

    const allSubmitted = sections.every((s) => nextSubmitted[s.id]);
    if (allSubmitted) finalize();
  };

  const handleSectionGraded = (sectionId, result) => {
    setResultsBySection((prev) => ({ ...prev, [sectionId]: result }));
  };

  /* ---------- Finalize ---------- */

  const finalize = () => {
    // Grade every section synchronously from the current answers.
    // Do NOT read resultsBySection here: onGraded is called just before
    // onSubmit in SectionQuiz, so the last section's result may not have
    // been committed yet when finalize runs.
    let correct = 0;
    let total = 0;
    const sectionResults = [];

    for (const s of sections) {
      const sectionAnswers = answersBySection[s.id] || {};
      const r = gradeSection(s, sectionAnswers);
      correct += r.correct;
      total += r.total;
      sectionResults.push({
        sectionId: s.id,
        correct: r.correct,
        total: r.total,
        score: r.score,
      });
    }

    // Build the per-question answer list for persistence. One entry per
    // question, tagged with type + section, matching LessonAnswer.
    const detailedAnswers = [];

    for (const s of sections) {
      const sectionAnswers = answersBySection[s.id] || {};
      for (let qi = 0; qi < s.questions.length; qi++) {
        const q = s.questions[qi];
        const value = sectionAnswers[questionKey(q)];

        if (q.type === 'multiple-choice') {
          const isCorrect = value === q.correctAnswer;
          detailedAnswers.push({
            type: 'multiple-choice',
            sectionId: s.id,
            questionIndex: qi,
            question: q.question,
            selected: value ?? null,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            isCorrect,
          });
        } else if (q.type === 'fill-blank') {
          const norm = (x) =>
            String(x || '')
              .trim()
              .toLowerCase()
              .replace(/[.,!?;:'"]/g, '');
          const isCorrect = norm(value) === norm(q.answer);
          detailedAnswers.push({
            type: 'fill-blank',
            sectionId: s.id,
            questionIndex: qi,
            question: q.sentence,
            selected: value ?? null,
            correctAnswer: q.answer,
            explanation: q.explanation,
            isCorrect,
          });
        } else if (q.type === 'matching') {
          const chosen = value || {};
          const totalPairs = q.pairs.length || 1;
          const matched = q.pairs.reduce(
            (n, p) => n + (chosen[p.left] === p.right ? 1 : 0),
            0
          );
          const isCorrect = matched === totalPairs;
          detailedAnswers.push({
            type: 'matching',
            sectionId: s.id,
            questionIndex: qi,
            question: q.prompt,
            selected: chosen,
            correctAnswer: q.pairs,
            explanation: q.explanation,
            isCorrect,
            partialScore: matched / totalPairs,
          });
        }
      }
    }

    const totalQuestions = detailedAnswers.length;
    const m = metricsRef.current;
    const timeSpentSeconds = Math.floor((Date.now() - m.startedAt) / 1000);

    // Partial credit for matching counts toward the score.
    let earned = 0;
    for (const a of detailedAnswers) {
      if (a.type === 'matching') earned += a.partialScore;
      else earned += a.isCorrect ? 1 : 0;
    }
    const score =
      totalQuestions > 0 ? Math.round((earned / totalQuestions) * 100) : 0;

    onComplete?.({
      answers: detailedAnswers,
      correctCount: correct,
      totalQuestions,
      score,
      sectionResults,
      audioMetrics: {
        sentencesPlayed: m.sentencesPlayed,
        wordsPlayed: m.wordsPlayed,
        replaysBySentence: flattenCounts(m.replaysBySentence),
        vocabTapsByWord: flattenCounts(m.vocabTapsByWord),
        playedAllCount: m.playedAllCount,
        firstInteractionAt: m.firstInteractionAt ?? undefined,
        lastInteractionAt: m.lastInteractionAt ?? undefined,
        timeSpentSeconds,
      },
      timeSpent: timeSpentSeconds,
    });
  };

  /* ---------- Audio ---------- */

  const playAllVocab = async () => {
    if (isMuted) return;
    setPlayingAll(true);
    metricsRef.current.playedAllCount += 1;
    noteInteraction();

    for (const s of sections) {
      for (let i = 0; i < (s.vocabulary?.length || 0); i++) {
        const word = s.vocabulary[i].word;
        metricsRef.current.wordsPlayed += 1;
        const arr =
          metricsRef.current.vocabTapsByWord[s.id] ||
          new Array(s.vocabulary.length).fill(0);
        arr[i] = (arr[i] || 0) + 1;
        metricsRef.current.vocabTapsByWord[s.id] = arr;
        await new Promise((resolve) => speakText(word, { onEnd: resolve, onError: resolve }));
      }
    }

    setPlayingAll(false);
  };

  const stopAll = () => {
    stopSpeaking?.();
    setPlayingAll(false);
  };

  /* ---------- Progress ---------- */

  const submittedCount = useMemo(
    () => sections.filter((s) => submittedBySection[s.id]).length,
    [sections, submittedBySection]
  );
  const progressPct =
    sections.length > 0 ? (submittedCount / sections.length) * 100 : 0;

  if (!lesson || sections.length === 0) {
    return (
      <div className="nb-card nb-text-center">
        <p className="nb-text nb-text-muted">No sections to display.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="nb-card nb-mb-lg" style={{ background: 'var(--nb-white)' }}>
        <div className="nb-flex nb-flex-between nb-flex-center nb-flex-wrap nb-gap-sm">
          <div>
            <div className="nb-badge nb-mb-sm" style={{ background: 'var(--nb-lime)' }}>
              {lesson.level || 'Lesson'}
            </div>
            <h2 className="nb-heading nb-heading-md" style={{ margin: 0 }}>
              {lesson.title}
            </h2>
            <p className="nb-text-sm nb-text-muted nb-mt-xs" style={{ margin: 0 }}>
              {language} · {sections.length} sections ·{' '}
              {sections.reduce((n, s) => n + s.questions.length, 0)} questions
            </p>
          </div>

          <div className="nb-flex nb-gap-sm">
            <button
              className={`nb-button ${
                playingAll ? 'nb-button-danger' : 'nb-button-primary'
              }`}
              onClick={playingAll ? stopAll : playAllVocab}
              disabled={isMuted}
            >
              <MaterialIcon
                name={playingAll ? 'Stop' : 'PlayArrow'}
                size={20}
                color="var(--nb-white)"
              />
              {playingAll ? 'Stop' : 'Play All Terms'}
            </button>
            <button
              className="nb-button"
              onClick={onToggleMute}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              <MaterialIcon
                name={isMuted ? 'VolumeOff' : 'VolumeUp'}
                size={20}
                color="var(--nb-black)"
              />
            </button>
          </div>
        </div>

        {lesson.introduction && (
          <p className="nb-text nb-mt-md" style={{ marginBottom: 0 }}>
            {lesson.introduction}
          </p>
        )}

        {/* Progress */}
        <div className="nb-mt-md">
          <div
            style={{
              height: '12px',
              background: 'var(--nb-white)',
              border: '2px solid var(--nb-black)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progressPct}%`,
                background: 'var(--nb-lime)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <p className="nb-text-xs nb-text-muted nb-text-center nb-mt-xs">
            {submittedCount} of {sections.length} sections submitted
          </p>
        </div>
      </div>

      {/* Sections */}
      {sections.map((section, index) => (
        <SectionView
          key={section.id}
          section={section}
          index={index}
          totalSections={sections.length}
          language={language}
          speakText={speakText}
          isMuted={isMuted}
          submitted={!!submittedBySection[section.id]}
          answers={answersBySection[section.id] || {}}
          onAnswerChange={(key, val) => setAnswer(section.id, key, val)}
          onSectionSubmit={handleSectionSubmit}
          onSectionGraded={handleSectionGraded}
          sectionResult={resultsBySection[section.id]}
        />
      ))}
    </div>
  );
};

/* ---------- Helpers ---------- */

/**
 * Convert { [sectionId]: number[] } into a flat number[] for storage.
 * Keeps ordering by section id so it's stable.
 */
function flattenCounts(bySection) {
  const ids = Object.keys(bySection)
    .map((k) => Number(k))
    .sort((a, b) => a - b);
  const out = [];
  for (const id of ids) out.push(...(bySection[id] || []));
  return out;
}