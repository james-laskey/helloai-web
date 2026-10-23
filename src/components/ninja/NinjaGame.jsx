import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { NinjaSetup } from './NinjaSetup';
import { NinjaPlay } from './NinjaPlay';
import { NinjaGameOver } from './NinjaGameOver';
import { DEFAULT_TIMER_SECONDS } from './constants';

/* Single source of truth for the ninja background. Lives in
   /public/images/ninja/bg.png. Used by both the setup and play
   screens so the whole feature shares one backdrop. */
const NINJA_BG = '/images/ninja/bg.png';

export const NinjaGame = ({
  userId,
  language,
  topicId,
  topicName,
  onBack,
}) => {
  const [phase, setPhase] = useState('setup'); // setup | playing | results
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const [gameId, setGameId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [timerSeconds, setTimerSeconds] = useState(DEFAULT_TIMER_SECONDS);
  const [previousGames, setPreviousGames] = useState([]);
  const [result, setResult] = useState(null);

  /* ---------- Load previous games ---------- */

  const fetchPreviousGames = useCallback(async () => {
    if (!userId || !topicId) return;
    try {
      const data = await api.listNinjaGames({ userId, language, topicId });
      setPreviousGames(data?.games ?? []);
    } catch (err) {
      console.warn('Failed to load previous ninja games:', err);
    }
  }, [userId, language, topicId]);

  useEffect(() => {
    fetchPreviousGames();
  }, [fetchPreviousGames]);

  /* ---------- Reset ---------- */
  const resetToSetup = () => {
    setResult(null);
    setGameId(null);
    setQuestions([]);
    setTimerSeconds(DEFAULT_TIMER_SECONDS);
    setError(null);
    setPhase('setup');
  };

  /* ---------- Back navigation ---------- */
  const handleBack = () => {
    if (phase === 'playing' || phase === 'results') {
      resetToSetup();
      fetchPreviousGames();
      return;
    }
    onBack?.();
  };

  /* ---------- Generate a new game ---------- */

  const handleStart = async ({
    theme,
    questionCount,
    difficulty,
    timerSeconds: chosenTimer,
  }) => {
    setIsGenerating(true);
    setError(null);

    const safeTimer =
      typeof chosenTimer === 'number' && chosenTimer > 0
        ? chosenTimer
        : DEFAULT_TIMER_SECONDS;

    try {
      const data = await api.generateNinjaGame({
        userId,
        language,
        topicId,
        topicName,
        theme,
        questionCount,
        difficulty,
        timerSeconds: safeTimer,
      });

      setGameId(data.gameId);
      setQuestions(data.questions);
      setTimerSeconds(data.timerSeconds ?? safeTimer);
      setPhase('playing');
    } catch (err) {
      console.error('Ninja generation failed:', err);
      setError(err.message || 'Could not generate questions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  /* ---------- Resume an existing game ---------- */

  const handleResume = async (existingGameId) => {
    setIsGenerating(true);
    setError(null);
    try {
      const data = await api.fetchNinjaGame(existingGameId, userId);
      setGameId(data.game.id);
      setQuestions(data.game.questions);
      setTimerSeconds(data.game.timerSeconds ?? DEFAULT_TIMER_SECONDS);
      setPhase('playing');
    } catch (err) {
      console.error('Failed to resume ninja game:', err);
      setError(err.message || 'Could not load game.');
    } finally {
      setIsGenerating(false);
    }
  };

  /* ---------- Completion ---------- */

  const handlePlayComplete = async (summary) => {
    setResult(summary);

    try {
      if (gameId) {
        await api.submitNinjaResults({
          gameId,
          userId,
          language,
          topicId,
          score: summary.score,
          correctCount: summary.correctCount,
          wrongCount: summary.wrongCount,
          missCount: summary.missCount,
          livesLeft: summary.livesLeft,
          completed: summary.completed,
          timeSpent: summary.timeSpent,
        });
      }
    } catch (err) {
      console.warn('Failed to submit ninja results:', err);
    }

    setPhase('results');
    fetchPreviousGames();
  };

  /* ---------- Restart ---------- */

  const handleRestart = () => {
    resetToSetup();
  };

  /* ---------- Render ---------- */

  if (phase === 'setup') {
    return (
      <NinjaSetup
        topicName={topicName}
        language={language}
        onStart={handleStart}
        onResume={handleResume}
        isGenerating={isGenerating}
        error={error}
        previousGames={previousGames}
        backgroundImage={NINJA_BG}
      />
    );
  }

  if (phase === 'playing') {
    /* Fill the feature view. No border or shadow — the dashboard's
       .dash-view owns the framing now. The wrapper just ensures the
       canvas has a real height to draw into and doesn't collapse. */
    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          minHeight: '600px',
        }}
      >
        <NinjaPlay
          questions={questions}
          language={language}
          timerSeconds={timerSeconds}
          onComplete={handlePlayComplete}
          onExit={handleBack}
          backgroundImage={NINJA_BG}
        />
      </div>
    );
  }

  if (phase === 'results' && result) {
    return (
      <NinjaGameOver
        score={result.score}
        correctCount={result.correctCount}
        wrongCount={result.wrongCount}
        missCount={result.missCount}
        livesLeft={result.livesLeft}
        completed={result.completed}
        onRestart={handleRestart}
        onBack={handleBack}
      />
    );
  }

  return null;
};