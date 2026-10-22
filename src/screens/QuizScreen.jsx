import React, { useCallback, useEffect, useState } from 'react';
import { MaterialIcon } from '../components/landing-page/icons';
import { QuizSetup } from './QuizSetup';
import { QuizPlayer } from '../components/quiz/QuizPlayer';
import { LessonCelebration } from '../components/reading-lessons/LessonCelebration';
import { StreakBadge } from '../components/StreakBadge';
import { learningApi } from '../services/learningApi';

/**
 * Full quiz flow: setup -> loading -> player -> celebration.
 *
 * Renders its own header with a Back button. Back behavior:
 *   - In the celebration  -> dismiss it, stay on the quiz.
 *   - In the player       -> return to the setup screen.
 *   - In setup / loading  -> call onBack() (parent decides; on the
 *                            dashboard it resets reading state and
 *                            keeps the quiz feature mounted).
 */
export const QuizScreen = ({
  language,
  nativeLanguage,
  userId,
  topicId,
  topicName,
  userPreferences,
  onBack,
  onActivityComplete,
  streak,
}) => {
  const [config, setConfig] = useState({
    questionCount: 10,
    difficulty: 'adaptive',
    questionLanguage: 'target',
  });
  const [quizData, setQuizData] = useState(null); // { questions, attemptId }
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const [previousQuizzes, setPreviousQuizzes] = useState([]);
  const [loadingPrevious, setLoadingPrevious] = useState(false);

  const [celebration, setCelebration] = useState(null);

  /* ---------- Previous quizzes ---------- */

  const fetchPrevious = useCallback(async () => {
    if (!userId || !topicId) return;
    let cancelled = false;
    setLoadingPrevious(true);
    try {
      const result = await learningApi.getPreviousQuizAttempts({
        userId,
        topicId,
        language,
      });
      if (!cancelled && result?.quizzes) {
        setPreviousQuizzes(result.quizzes);
      }
    } catch (err) {
      console.error('Error fetching previous quizzes:', err);
    } finally {
      if (!cancelled) setLoadingPrevious(false);
    }
    return () => {
      cancelled = true;
    };
  }, [userId, topicId, language]);

  useEffect(() => {
    fetchPrevious();
  }, [fetchPrevious]);

  /* ---------- Generate ---------- */

  const generate = async (cfg) => {
    const nextCfg = cfg || config;
    setGenerating(true);
    setError(null);
    setQuizData(null);
    setCelebration(null);
    try {
      const result = await learningApi.generateQuiz({
        userId,
        topicId,
        topicName,
        language,
        userPreferences,
        questionCount: nextCfg.questionCount,
        difficulty: nextCfg.difficulty,
        questionLanguage: nextCfg.questionLanguage,
      });
      if (!result?.quiz) throw new Error('No quiz returned');
      setQuizData({
        questions: result.quiz,
        attemptId: result.attemptId,
        questionLanguage: result.questionLanguage ?? nextCfg.questionLanguage,
        difficulty: result.difficulty ?? nextCfg.difficulty,
      });
    } catch (err) {
      console.error('Error generating quiz:', err);
      setError(
        'Could not generate the quiz. Please check your connection and try again.'
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleConfirm = () => generate(config);

  /* ---------- Select a previous quiz ---------- */

  const handleSelectPrevious = (attempt) => {
    if (!attempt?.id || !Array.isArray(attempt.questions)) return;
    setCelebration(null);
    setError(null);
    setQuizData({
      questions: attempt.questions,
      attemptId: attempt.id,
      questionLanguage: config.questionLanguage,
      difficulty: config.difficulty,
      isReplay: true,
      score: attempt.score ?? null,
      correctCount: attempt.correctCount ?? null,
      totalQuestions: attempt.totalQuestions ?? attempt.questions.length,
    });
  };

  /* ---------- Dismiss the replay notice only ---------- */

  const dismissReplayNotice = () => {
    setQuizData((prev) => (prev ? { ...prev, isReplay: false } : prev));
  };

  /* ---------- Submit ---------- */

  const handleSubmit = useCallback(
    async (payload) => {
      if (!quizData?.attemptId) return;

      try {
        await learningApi.submitQuiz({
          attemptId: quizData.attemptId,
          userId,
          topicId,
          answers: payload.answers.map((a) => a.selected),
          timeSpent: payload.timeSpent,
        });
        onActivityComplete?.();
        fetchPrevious();
      } catch (err) {
        console.error('Error submitting quiz:', err);
      }
    },
    [quizData, userId, topicId, onActivityComplete, fetchPrevious]
  );

  const handlePlayerComplete = useCallback(
    (payload) => {
      handleSubmit(payload);
      setCelebration(payload);
    },
    [handleSubmit]
  );

  const handleCelebrationContinue = () => {
    setCelebration(null);
    setQuizData(null);
    onBack?.();
  };

  /* ---------- Back handler ---------- */

  const handleBack = () => {
    if (celebration) {
      setCelebration(null);
      return;
    }
    if (quizData) {
      setQuizData(null);
      return;
    }
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
          <span className="dash-feature__title">Quiz</span>
          <span className="dash-feature__subtitle">
            {language}
            {topicName ? ` · ${topicName}` : ''}
          </span>
        </div>
      </div>
    </div>
  );

  /* ---------- Celebration ---------- */

  if (celebration) {
    return (
      <div>
        {Header}
        <LessonCelebration
          result={celebration}
          language={language}
          lesson={{
            title: `${topicName} Quiz`,
            sections: [{ id: 1, heading: 'Quiz results' }],
          }}
          onContinue={handleCelebrationContinue}
          onReview={() => setCelebration(null)}
        />
      </div>
    );
  }

  /* ---------- Header + body ---------- */

  return (
    <div>
      {Header}

      <div style={{ paddingTop: 'var(--nb-space-md)' }}>
        {!quizData && !generating && (
          <QuizSetup
            language={language}
            nativeLanguage={nativeLanguage}
            config={config}
            setConfig={setConfig}
            onConfirm={handleConfirm}
            isGenerating={generating}
            generationError={error}
            onRetry={handleConfirm}
            previousQuizzes={previousQuizzes}
            loadingPrevious={loadingPrevious}
            onSelectPrevious={handleSelectPrevious}
          />
        )}

        {generating && (
          <div
            className="nb-flex nb-flex-center"
            style={{ minHeight: 400, flexDirection: 'column' }}
          >
            <div className="nb-spinner" />
            <p className="nb-mt-md">Generating quiz...</p>
            <p className="nb-text-sm nb-text-muted">
              {config.questionCount} questions · {config.difficulty} ·{' '}
              {config.questionLanguage === 'native'
                ? 'questions in your native language'
                : 'questions in the target language'}
            </p>
          </div>
        )}

        {quizData && !generating && (
          <>
            {quizData.isReplay && (
              <div
                className="nb-card nb-mb-md"
                style={{
                  background: 'var(--nb-yellow)',
                  padding: 'var(--nb-space-md)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 'var(--nb-space-md)',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 600 }}>
                    Replaying a previous quiz.{' '}
                    {quizData.score !== null
                      ? `Last score: ${quizData.score}%.`
                      : 'It was not completed.'}
                  </p>
                  <button
                    className="nb-button nb-mt-sm"
                    onClick={() => setQuizData(null)}
                  >
                    Choose a different quiz
                  </button>
                </div>

                <button
                  type="button"
                  onClick={dismissReplayNotice}
                  aria-label="Dismiss replay notice"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28,
                    height: 28,
                    padding: 0,
                    background: 'var(--nb-white)',
                    border: '2px solid var(--nb-black)',
                    borderRadius: 'var(--nb-radius-sm)',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <MaterialIcon name="Close" size={16} color="var(--nb-black)" />
                </button>
              </div>
            )}
            <QuizPlayer
              quiz={{ questions: quizData.questions }}
              language={language}
              onSubmit={() => {}}
              onComplete={handlePlayerComplete}
            />
          </>
        )}
      </div>
    </div>
  );
};