import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { FortuneSetup } from './FortuneSetup';
import { FortunePlay } from './FortunePlay';
import { FortuneGameOver } from './FortuneGameOver';

/* Shared background for the whole fortune feature. Lives in
   /public/images/ninja/bg.png. Change this one constant to swap the
   image used by both the setup and play screens. */
const FORTUNE_BG = '/images/ninja/bg.png';

export const FortuneGame = ({
  userId,
  language,
  topicId,
  topicName,
  onBack,
}) => {
  const [phase, setPhase] = useState('setup');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const [gameId, setGameId] = useState(null);
  const [phrases, setPhrases] = useState([]);
  const [previousGames, setPreviousGames] = useState([]);
  const [result, setResult] = useState(null);

  const fetchPreviousGames = useCallback(async () => {
    if (!userId || !topicId) return;
    try {
      const data = await api.listFortuneGames({ userId, language, topicId });
      setPreviousGames(data?.games ?? []);
    } catch (err) {
      console.warn('Failed to load previous fortune games:', err);
    }
  }, [userId, language, topicId]);

  useEffect(() => {
    fetchPreviousGames();
  }, [fetchPreviousGames]);

  const resetToSetup = () => {
    setGameId(null);
    setPhrases([]);
    setResult(null);
    setError(null);
    setPhase('setup');
  };

  const handleBack = () => {
    if (phase === 'playing' || phase === 'results') {
      resetToSetup();
      fetchPreviousGames();
      return;
    }
    onBack?.();
  };

  const handleStart = async ({ theme, puzzleCount, difficulty }) => {
    setIsGenerating(true);
    setError(null);
    try {
      const data = await api.generateFortuneGame({
        userId,
        language,
        topicId,
        topicName,
        theme,
        puzzleCount,
        difficulty,
      });
      setGameId(data.gameId);
      setPhrases(data.phrases);
      setPhase('playing');
    } catch (err) {
      console.error('Fortune generation failed:', err);
      setError(err.message || 'Could not generate phrases. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResume = async (existingGameId) => {
    setIsGenerating(true);
    setError(null);
    try {
      const data = await api.fetchFortuneGame(existingGameId, userId);
      setGameId(data.game.id);
      setPhrases(data.game.phrases);
      setPhase('playing');
    } catch (err) {
      console.error('Failed to resume fortune game:', err);
      setError(err.message || 'Could not load game.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayComplete = async (summary) => {
    setResult(summary);

    try {
      if (gameId) {
        await api.submitFortuneResults({
          gameId,
          userId,
          language,
          topicId,
          score: summary.score,
          highScore: summary.highScore,
          puzzlesSolved: summary.puzzlesSolved,
          guessCount: summary.guessCount,
          correctGuesses: summary.correctGuesses,
          wrongGuesses: summary.wrongGuesses,
          completed: summary.completed,
          timeSpent: summary.timeSpent,
        });
      }
    } catch (err) {
      console.warn('Failed to submit fortune results:', err);
    }

    setPhase('results');
    fetchPreviousGames();
  };

  const handleRestart = () => {
    resetToSetup();
  };

  if (phase === 'setup') {
    return (
      <FortuneSetup
        topicName={topicName}
        language={language}
        onStart={handleStart}
        onResume={handleResume}
        isGenerating={isGenerating}
        error={error}
        previousGames={previousGames}
        backgroundImage={FORTUNE_BG}
      />
    );
  }

  if (phase === 'playing') {
    return (
      <FortunePlay
        phrases={phrases}
        language={language}
        onComplete={handlePlayComplete}
        onExit={handleBack}
        backgroundImage={FORTUNE_BG}
      />
    );
  }

  if (phase === 'results' && result) {
    return (
      <FortuneGameOver
        score={result.score}
        highScore={result.highScore}
        puzzlesSolved={result.puzzlesSolved}
        guessCount={result.guessCount}
        correctGuesses={result.correctGuesses}
        wrongGuesses={result.wrongGuesses}
        completed={result.completed}
        onRestart={handleRestart}
        onBack={handleBack}
      />
    );
  }

  return null;
};