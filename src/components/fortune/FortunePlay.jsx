import React, { useState, useMemo } from 'react';
import { MaterialIcon } from '../landing-page/icons';
import { FortuneBoard } from './FortuneBoard';
import { FortuneWheel } from './FortuneWheel';
import {
  STARTING_SCORE,
  SOLVE_BONUS_PER_LETTER,
  tierValue,
  VOWELS,
} from './constants';

export const FortunePlay = ({
  phrases,
  language,
  onComplete,
  onExit,
  backgroundImage,
}) => {
  const [score, setScore] = useState(STARTING_SCORE);
  const [highScore, setHighScore] = useState(STARTING_SCORE);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState(new Set());
  const [revealed, setRevealed] = useState(() =>
    buildRevealed(phrases[0].text, new Set())
  );
  const [selectedTier, setSelectedTier] = useState(null);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [puzzlesSolved, setPuzzlesSolved] = useState(0);
  const [correctGuesses, setCorrectGuesses] = useState(0);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [guessCount, setGuessCount] = useState(0);
  const [phase, setPhase] = useState('playing');
  const [startedAt] = useState(() => Date.now());

  /* Reveal-batch: which positions in the current phrase were just
     flipped from 0 to 1 on the most recent guess. Passed to the board
     so it can stagger + color-shift the animation for those cells
     only. The `id` counter guarantees a new batch re-triggers even if
     the same indices appear twice. */
  const [revealBatch, setRevealBatch] = useState({ id: 0, indices: [] });

  const currentPhrase = phrases[puzzleIndex];

  const tierReady = selectedTier !== null;

  /* ---------- Guess handling ---------- */

  const submitGuess = () => {
    const raw = input.trim().toLowerCase();
    setInput('');
    setFeedback(null);

    if (!raw) return;

    if (raw.length !== 1 || !/[a-z]/.test(raw)) {
      setFeedback({ type: 'error', text: 'Enter a single letter.' });
      return;
    }

    if (guessedLetters.has(raw)) {
      setFeedback({ type: 'error', text: `You already guessed "${raw}".` });
      return;
    }

    if (!tierReady) {
      setFeedback({ type: 'error', text: 'Spin the wheel first.' });
      return;
    }

    const letter = raw;
    const baseTier = selectedTier;
    const value = tierValue(baseTier, letter);
    const occurrences = currentPhrase.text
      .split('')
      .filter((c) => c === letter).length;

    setGuessCount((c) => c + 1);
    setGuessedLetters((prev) => new Set(prev).add(letter));
    setSelectedTier(null);

    if (occurrences > 0) {
      const newRevealed = revealed.slice();
      const flipped = [];
      for (let i = 0; i < currentPhrase.text.length; i++) {
        if (currentPhrase.text[i] === letter) {
          if (newRevealed[i] !== 1) flipped.push(i);
          newRevealed[i] = 1;
        }
      }

      setRevealed(newRevealed);
      setCorrectGuesses((c) => c + 1);

      /* Hand the board the positions that should animate. */
      setRevealBatch((prev) => ({
        id: prev.id + 1,
        indices: flipped,
      }));

      const gained = value * occurrences;
      setScore((s) => {
        const next = s + gained;
        setHighScore((hs) => Math.max(hs, next));
        return next;
      });
      setFeedback({
        type: 'correct',
        text: `"${letter.toUpperCase()}" appears ${occurrences}×. +${gained} points.`,
      });

      const solved = newRevealed.every((v) => v === 1);
      if (solved) {
        handlePuzzleSolved(newRevealed);
      }
    } else {
      setWrongGuesses((c) => c + 1);
      setScore((s) => {
        const next = s - value;
        if (next < 0) {
          setTimeout(() => handleGameOver(next), 0);
        }
        return next;
      });
      setFeedback({
        type: 'wrong',
        text: `No "${letter.toUpperCase()}" in the phrase. −${value} points.`,
      });
    }
  };

  const handlePuzzleSolved = () => {
    setScore((s) => {
      const next = s + SOLVE_BONUS_PER_LETTER * 1;
      setHighScore((hs) => Math.max(hs, next));
      return next;
    });
    setPuzzlesSolved((c) => c + 1);
    setPhase('puzzle-solved');
  };

  const nextPuzzle = () => {
    if (puzzleIndex + 1 >= phrases.length) {
      handleComplete();
      return;
    }
    const nextIdx = puzzleIndex + 1;
    setPuzzleIndex(nextIdx);
    setRevealed(buildRevealed(phrases[nextIdx].text, new Set()));
    setGuessedLetters(new Set());
    setSelectedTier(null);
    setInput('');
    setFeedback(null);
    setRevealBatch({ id: 0, indices: [] });
    setPhase('playing');
  };

  const handleComplete = () => {
    const timeSpent = Math.floor((Date.now() - startedAt) / 1000);
    onComplete?.({
      score,
      highScore: Math.max(highScore, score),
      puzzlesSolved: puzzlesSolved + 1,
      guessCount,
      correctGuesses,
      wrongGuesses,
      completed: true,
      timeSpent,
    });
  };

  const handleGameOver = (finalScore) => {
    const timeSpent = Math.floor((Date.now() - startedAt) / 1000);
    setPhase('game-over');
    onComplete?.({
      score: finalScore,
      highScore: Math.max(highScore, finalScore),
      puzzlesSolved,
      guessCount,
      correctGuesses,
      wrongGuesses,
      completed: false,
      timeSpent,
    });
  };

  const handleGiveUp = () => {
    const timeSpent = Math.floor((Date.now() - startedAt) / 1000);
    onComplete?.({
      score,
      highScore,
      puzzlesSolved,
      guessCount,
      correctGuesses,
      wrongGuesses,
      completed: false,
      timeSpent,
    });
  };

  /* ---------- Render ---------- */

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100%',
        overflow: 'hidden',
      }}
    >
      {backgroundImage && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: 0,
          }}
        />
      )}

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.35)',
          zIndex: 1,
        }}
      />

      <div
        className="nb-flex nb-flex-col nb-gap-lg"
        style={{
          position: 'relative',
          zIndex: 2,
          padding: 'var(--nb-space-lg)',
          paddingBottom: 'calc(var(--nb-space-lg) + 200px)',
          maxWidth: '960px',
          margin: '0 auto',
        }}
      >
        <div className="nb-card" style={{ background: 'var(--nb-white)' }}>
          <div className="nb-flex nb-flex-between nb-flex-center nb-flex-wrap nb-gap-md">
            <div>
              <div className="nb-text-xs nb-text-muted">Score</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{score}</div>
            </div>
            <div>
              <div className="nb-text-xs nb-text-muted">High Score</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                {Math.max(highScore, score)}
              </div>
            </div>
            <div>
              <div className="nb-text-xs nb-text-muted">Puzzle</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                {puzzleIndex + 1} / {phrases.length}
              </div>
            </div>
            <div>
              <div className="nb-text-xs nb-text-muted">Category</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                {currentPhrase.category}
              </div>
            </div>
          </div>
        </div>

        {/* Board — pass the batch so newly flipped cells animate */}
        <FortuneBoard
          phrase={currentPhrase.text}
          revealed={revealed}
          revealBatch={revealBatch}
        />

        {feedback && (
          <div
            className="nb-card"
            style={{
              background:
                feedback.type === 'correct'
                  ? 'var(--nb-lime)'
                  : feedback.type === 'wrong'
                  ? 'var(--nb-red)'
                  : 'var(--nb-orange)',
              color:
                feedback.type === 'wrong'
                  ? 'var(--nb-white)'
                  : 'var(--nb-black)',
              padding: 'var(--nb-space-md)',
            }}
          >
            <p style={{ margin: 0, fontWeight: 700 }}>{feedback.text}</p>
          </div>
        )}

        {phase === 'playing' && tierReady && (
          <div className="nb-card" style={{ background: 'var(--nb-white)' }}>
            <label className="nb-label">Guess a letter</label>
            <div className="nb-flex nb-gap-sm">
              <input
                className="nb-input"
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, 1))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitGuess();
                }}
                placeholder="A-Z"
                autoFocus
                style={{
                  textTransform: 'uppercase',
                  textAlign: 'center',
                  fontSize: '1.25rem',
                  letterSpacing: '2px',
                }}
              />
              <button
                className="nb-button nb-button-primary"
                onClick={submitGuess}
                disabled={!input.trim()}
              >
                <MaterialIcon name="Send" size={18} color="var(--nb-white)" />
                Guess
              </button>
            </div>
            <p
              className="nb-text-xs nb-text-muted nb-mt-sm"
              style={{ margin: 0 }}
            >
              Guessing with tier <strong>{selectedTier}</strong>. Vowels
              cost half. You must guess before you can spin again.
            </p>
          </div>
        )}

        {phase === 'playing' && !tierReady && (
          <div
            className="nb-card"
            style={{
              background: 'var(--nb-yellow)',
              padding: 'var(--nb-space-md)',
              textAlign: 'center',
            }}
          >
            <p style={{ margin: 0, fontWeight: 700 }}>
              Spin the wheel to lock in a tier, then guess a letter.
            </p>
          </div>
        )}

        {phase === 'puzzle-solved' && (
          <div className="nb-card" style={{ background: 'var(--nb-lime)' }}>
            <p className="nb-mb-md" style={{ margin: 0, fontWeight: 700 }}>
              Puzzle solved! +{SOLVE_BONUS_PER_LETTER} bonus points.
            </p>
            <button
              className="nb-button nb-button-primary"
              onClick={nextPuzzle}
            >
              Next Puzzle
            </button>
          </div>
        )}

        {guessedLetters.size > 0 && (
          <div className="nb-card" style={{ background: 'var(--nb-gray)' }}>
            <div className="nb-text-xs nb-text-muted nb-mb-sm">
              Guessed letters
            </div>
            <div className="nb-flex nb-gap-sm nb-flex-wrap">
              {Array.from(guessedLetters)
                .sort()
                .map((l) => (
                  <span
                    key={l}
                    className="nb-badge"
                    style={{
                      background: currentPhrase.text.includes(l)
                        ? 'var(--nb-lime)'
                        : 'var(--nb-red)',
                      color: currentPhrase.text.includes(l)
                        ? 'var(--nb-black)'
                        : 'var(--nb-white)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {l}
                  </span>
                ))}
            </div>
          </div>
        )}

        <div className="nb-flex nb-gap-sm nb-flex-center">
          <button className="nb-button" onClick={onExit}>
            Quit
          </button>
          <button
            className="nb-button nb-button-danger"
            onClick={handleGiveUp}
          >
            Give Up
          </button>
        </div>
      </div>

      <FortuneWheel
        selectedTier={selectedTier}
        onSelectTier={setSelectedTier}
        disabled={phase !== 'playing'}
        currentScore={score}
      />
    </div>
  );
};

function buildRevealed(text, revealedSet) {
  const revealed = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === ' ' || ch === "'") {
      revealed.push(1);
    } else if (revealedSet.has(ch)) {
      revealed.push(1);
    } else {
      revealed.push(0);
    }
  }
  return revealed;
}