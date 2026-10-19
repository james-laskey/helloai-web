import React, { useMemo, useRef, useState } from 'react';
import { MaterialIcon } from '../landing-page/icons';
import {
  QuizRenderer,
  gradeSection,
} from '../QuizComponents/QuizRenderer';

/**
 * Index-based answer key. Unique by construction, so two fill-blank
 * questions with the same sentence never share a value.
 */
function indexKey(question, index) {
  return `${question.type}:${index}`;
}

export const QuizPlayer = ({ quiz, onSubmit, onComplete, language }) => {
  const questions = quiz?.questions ?? quiz ?? [];

  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const startedAtRef = useRef(Date.now());

  const keys = useMemo(
    () => questions.map((q, i) => indexKey(q, i)),
    [questions]
  );

  const section = useMemo(
    () => ({ id: 0, heading: '', questions }),
    [questions]
  );

  const currentQuestion = questions[currentIndex];
  const currentKey = keys[currentIndex];
  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const setAnswer = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const isAnswered = (q, value) => {
    if (!q) return false;
    if (q.type === 'matching') {
      return value && Object.keys(value).length === q.pairs.length;
    }
    return typeof value === 'string' && value.trim().length > 0;
  };

  const allAnswered = questions.every((q, i) =>
    isAnswered(q, answers[keys[i]])
  );

  const canAdvance = isAnswered(currentQuestion, answers[currentKey]);

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleSubmit = () => {
    const graded = gradeSection(section, answers, keys);
    setResult(graded);
    setSubmitted(true);

    const detailed = questions.map((q, i) => {
      const value = answers[keys[i]];
      if (q.type === 'multiple-choice') {
        return {
          type: 'multiple-choice',
          sectionId: 0,
          questionIndex: i,
          question: q.question,
          selected: value ?? null,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          isCorrect: value === q.correctAnswer,
        };
      }
      if (q.type === 'fill-blank') {
        const norm = (x) =>
          String(x || '')
            .trim()
            .toLowerCase()
            .replace(/[.,!?;:'"]/g, '');
        return {
          type: 'fill-blank',
          sectionId: 0,
          questionIndex: i,
          question: q.sentence,
          selected: value ?? null,
          correctAnswer: q.answer,
          explanation: q.explanation,
          isCorrect: norm(value) === norm(q.answer),
        };
      }
      const chosen = value || {};
      const totalPairs = q.pairs.length || 1;
      const matched = q.pairs.reduce(
        (n, p) => n + (chosen[p.left] === p.right ? 1 : 0),
        0
      );
      return {
        type: 'matching',
        sectionId: 0,
        questionIndex: i,
        question: q.prompt,
        selected: chosen,
        correctAnswer: q.pairs,
        explanation: q.explanation,
        isCorrect: matched === totalPairs,
        partialScore: matched / totalPairs,
      };
    });

    const timeSpent = Math.floor((Date.now() - startedAtRef.current) / 1000);

    const payload = {
      answers: detailed,
      correctCount: graded.correct,
      totalQuestions: graded.total,
      score: Math.round(graded.score * 100),
      sectionResults: [
        {
          sectionId: 0,
          correct: graded.correct,
          total: graded.total,
          score: graded.score,
        },
      ],
      audioMetrics: {
        sentencesPlayed: 0,
        wordsPlayed: 0,
        replaysBySentence: [],
        vocabTapsByWord: [],
        playedAllCount: 0,
        timeSpentSeconds: timeSpent,
      },
      timeSpent,
    };

    onSubmit?.(payload);
    onComplete?.(payload);
  };

  if (questions.length === 0) {
    return (
      <div className="nb-card nb-text-center">
        <p className="nb-text nb-text-muted">No questions in this quiz.</p>
      </div>
    );
  }

  const isLast = currentIndex + 1 === questions.length;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Header */}
      <div
        className="nb-card nb-mb-md"
        style={{ background: 'var(--nb-white)' }}
      >
        <div className="nb-flex nb-flex-between nb-flex-center nb-flex-wrap nb-gap-sm">
          <div>
            <h2 className="nb-heading nb-heading-md" style={{ margin: 0 }}>
              Quiz
            </h2>
            <p
              className="nb-text-sm nb-text-muted nb-mt-xs"
              style={{ margin: 0 }}
            >
              {language} · {questions.length} questions
            </p>
          </div>
          {result && (
            <span
              className="nb-badge"
              style={{ background: 'var(--nb-lime)' }}
            >
              {result.correct}/{result.total} correct
            </span>
          )}
        </div>

        {/* Progress */}
        <div className="nb-mt-md">
          <div
            style={{
              height: 12,
              background: 'var(--nb-white)',
              border: '2px solid var(--nb-black)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'var(--nb-lime)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <p className="nb-text-xs nb-text-muted nb-text-center nb-mt-xs">
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>
      </div>

      {/* Current question */}
      <div
        className="nb-card"
        style={{ background: 'var(--nb-white)' }}
      >
        <QuizRenderer
          question={currentQuestion}
          value={answers[currentKey]}
          submitted={submitted}
          onChange={(val) => setAnswer(currentKey, val)}
        />
      </div>

      {/* Navigation / submit */}
      <div className="nb-flex nb-gap-sm nb-mt-lg nb-flex-wrap">
        <button
          className="nb-button"
          onClick={handlePrevious}
          disabled={currentIndex === 0 || submitted}
        >
          <MaterialIcon name="ArrowBack" size={18} color="var(--nb-black)" />
          Previous
        </button>

        {!isLast && (
          <button
            className="nb-button nb-button-primary"
            onClick={handleNext}
            disabled={!canAdvance || submitted}
            style={{ flex: 1 }}
          >
            Next
            <MaterialIcon
              name="ArrowForward"
              size={18}
              color="var(--nb-white)"
            />
          </button>
        )}

        {isLast && !submitted && (
          <button
            className="nb-button nb-button-primary"
            onClick={handleSubmit}
            disabled={!allAnswered}
            style={{ flex: 1 }}
          >
            <MaterialIcon name="Check" size={18} color="var(--nb-white)" />
            Submit Quiz
          </button>
        )}

        {submitted && (
          <div
            className="nb-card nb-text-center"
            style={{
              background: 'var(--nb-lime)',
              padding: 'var(--nb-space-sm) var(--nb-space-md)',
              flex: 1,
            }}
          >
            <p style={{ margin: 0, fontWeight: 700 }}>
              {result.correct}/{result.total} correct ·{' '}
              {Math.round(result.score * 100)}%
            </p>
          </div>
        )}
      </div>

      {isLast && !submitted && !allAnswered && (
        <p className="nb-text-xs nb-text-muted nb-text-center nb-mt-sm">
          Answer every question before submitting. Use Previous to revisit
          earlier ones.
        </p>
      )}
    </div>
  );
};