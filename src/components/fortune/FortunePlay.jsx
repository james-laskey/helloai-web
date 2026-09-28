import React, { useState, useMemo } from 'react';
import { MaterialIcon } from '../landing-page/icons';
import { FortuneBoard } from './FortuneBoard';
import { FortuneTierPicker } from './FortuneTierPicker';
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
}) => {
  const [score, setScore] = useState(STARTING_SCORE);
  const [highScore, setHighScore] = useState(STARTING_SCORE);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState(new Set());
  const [revealed, setRevealed] = useState(() => buildRevealed(phrases[0].text, new Set()));
  const [selectedTier, setSelectedTier] = useState(null);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [puzzlesSolved, setPuzzlesSolved] = useState(0);
  const [correctGuesses, setCorrectGuesses] = useState(0);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [guessCount, setGuessCount] = useState(0);
  const [phase, setPhase] = useState('playing'); // playing | puzzle-solved | game-over | complete
  const [startedAt] = useState(() => Date.now());

  const currentPhrase = phrases[puzzleIndex];

  /* ---------- Derived state ---------- */

  const totalLetters = useMemo(
    () => currentPhrase.text.replace(/[^a-z]/g, '').length,
    [currentPhrase]
  );

  const revealedLetters = useMemo(
    () => revealed.reduce((sum, v) => sum + v, 0),
    [revealed]
  );

  const remainingLetters = totalLetters - currentPhrase.text.split('')
    .filter((c, i) => /[a-z]/.test(c) && revealed[i] === 1).length;

  const allRevealed = revealed.every((v) => v === 1);

  const tierReady = selectedTier !== null;

  /* ---------- Guess handling ---------- */

  const submitGuess = () => {
    const raw = input.trim().toLowerCase();
    setInput('');
    setFeedback(null);

    if (!raw) return;

    // Only single letters are accepted.
    if (raw.length !== 1 || !/[a-z]/.test(raw)) {
      setFeedback({ type: 'error', text: 'Enter a single letter.' });
      return;
    }

    if (guessedLetters.has(raw)) {
      setFeedback({ type: 'error', text: `You already guessed "${raw}".` });
      return;
    }

    if (!tierReady) {
      setFeedback({ type: 'error', text: 'Pick a score tier first.' });
      return;
    }

    const letter = raw;
    const isVowel = VOWELS.has(letter);
    const baseTier = selectedTier;
    const value = tierValue(baseTier, letter);
    const occurrences = currentPhrase.text
      .split('')
      .filter((c) => c === letter).length;

    setGuessCount((c) => c + 1);
    setGuessedLetters((prev) => new Set(prev).add(letter));
    setSelectedTier(null);

    if (occurrences > 0) {
      // Correct guess: reveal letters, add points.
      const newRevealed = revealed.slice();
      for (let i = 0; i < currentPhrase.text.length; i++) {
        if (currentPhrase.text[i] === letter) newRevealed[i] = 1;
      }
      setRevealed(newRevealed);
      setCorrectGuesses((c) => c + 1);

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

      // Check if the puzzle is now solved.
      const solved = newRevealed.every((v) => v === 1);
      if (solved) {
        handlePuzzleSolved(newRevealed);
      }
    } else {
      // Wrong guess: lose points. Vowels still get the halved penalty
      // so the risk matches the reward.
      setWrongGuesses((c) => c + 1);
      setScore((s) => {
        const next = s - value;
        if (next < 0) {
          // Game over.
          setTimeout(() => handleGameOver(next), 0);
        }
        return next;
      });
      setFeedback({
        type: 'wrong',
        text: `No "${letter.toUpperCase()}" in the phrase. -${value} points.`,
      });
    }
  };

  const handlePuzzleSolved = (finalRevealed) => {
    // Award a solve bonus.
    const bonus = remainingLetters > 0
      ? Math.max(0, finalRevealed.filter((v) => v === 1).length) * 50
      : 500;
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
    <div className="nb-flex nb-flex-col nb-gap-lg">
      {/* Status bar */}
      <div className="nb-card" style={{ background: 'var(--nb-white)' }}>
        <div className="nb-flex nb-flex-between nb-flex-center nb-flex-wrap nb-gap-md">
          <div>
            <div className="nb-text-xs nb-text-muted">Score</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>
              {score}
            </div>
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

      {/* Board */}
      <FortuneBoard phrase={currentPhrase.text} revealed={revealed} />

      {/* Feedback */}
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
            color: feedback.type === 'wrong' ? 'var(--nb-white)' : 'var(--nb-black)',
            padding: 'var(--nb-space-md)',
          }}
        >
          <p style={{ margin: 0, fontWeight: 700 }}>{feedback.text}</p>
        </div>
      )}

      {/* Tier picker */}
      {phase === 'playing' && (
        <FortuneTierPicker
          selectedTier={selectedTier}
          onSelectTier={setSelectedTier}
          disabled={false}
          currentScore={score}
        />
      )}

      {/* Input */}
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
          {selectedTier && (
            <p className="nb-text-xs nb-text-muted nb-mt-sm" style={{ margin: 0 }}>
              Guessing with tier <strong>{selectedTier}</strong>. Vowels cost
              half.
            </p>
          )}
        </div>
      )}

      {/* Puzzle solved */}
      {phase === 'puzzle-solved' && (
        <div className="nb-card" style={{ background: 'var(--nb-lime)' }}>
          <p className="nb-mb-md" style={{ margin: 0, fontWeight: 700 }}>
            Puzzle solved! +{SOLVE_BONUS_PER_LETTER} bonus points.
          </p>
          <button className="nb-button nb-button-primary" onClick={nextPuzzle}>
            Next Puzzle
          </button>
        </div>
      )}

      {/* Guessed letters */}
      {guessedLetters.size > 0 && (
        <div className="nb-card" style={{ background: 'var(--nb-gray)' }}>
          <div className="nb-text-xs nb-text-muted nb-mb-sm">Guessed letters</div>
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

      {/* Controls */}
      <div className="nb-flex nb-gap-sm nb-flex-center">
        <button className="nb-button" onClick={onExit}>
          Quit
        </button>
        <button className="nb-button nb-button-danger" onClick={handleGiveUp}>
          Give Up
        </button>
      </div>
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