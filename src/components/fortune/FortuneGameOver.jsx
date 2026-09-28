import React from 'react';
import { MaterialIcon } from '../landing-page/icons';

export const FortuneGameOver = ({
  score,
  highScore,
  puzzlesSolved,
  guessCount,
  correctGuesses,
  wrongGuesses,
  completed,
  onRestart,
  onBack,
}) => {
  const accuracy =
    guessCount > 0 ? Math.round((correctGuesses / guessCount) * 100) : 0;

  return (
    <div
      className="nb-flex nb-flex-center"
      style={{
        minHeight: '500px',
        flexDirection: 'column',
        padding: 'var(--nb-space-lg)',
      }}
    >
      <div
        className="nb-card nb-text-center"
        style={{
          maxWidth: '520px',
          background: completed ? 'var(--nb-lime)' : 'var(--nb-red)',
          color: completed ? 'var(--nb-black)' : 'var(--nb-white)',
          padding: 'var(--nb-space-xl)',
        }}
      >
        <div style={{ fontSize: '4rem', marginBottom: 'var(--nb-space-md)' }}>
          {completed ? '🏆' : '💸'}
        </div>
        <h2 className="nb-heading nb-heading-lg nb-mb-md">
          {completed ? 'All Puzzles Solved' : 'Game Over'}
        </h2>
        <p className="nb-text nb-mb-lg">
          {completed
            ? 'You made it through every puzzle.'
            : 'You went below zero. Better luck next time.'}
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--nb-space-sm)',
            marginBottom: 'var(--nb-space-lg)',
          }}
        >
          <div className="nb-card">
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{score}</div>
            <div className="nb-text-xs">Final Score</div>
          </div>
          <div className="nb-card">
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{highScore}</div>
            <div className="nb-text-xs">High Score</div>
          </div>
          <div className="nb-card">
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{accuracy}%</div>
            <div className="nb-text-xs">Accuracy</div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--nb-space-sm)',
            marginBottom: 'var(--nb-space-lg)',
          }}
        >
          <div className="nb-card">
            <div style={{ fontWeight: 700 }}>{puzzlesSolved}</div>
            <div className="nb-text-xs">Puzzles Solved</div>
          </div>
          <div className="nb-card">
            <div style={{ fontWeight: 700 }}>{correctGuesses}</div>
            <div className="nb-text-xs">Correct Guesses</div>
          </div>
          <div className="nb-card">
            <div style={{ fontWeight: 700 }}>{wrongGuesses}</div>
            <div className="nb-text-xs">Wrong Guesses</div>
          </div>
        </div>

        <div className="nb-flex nb-gap-sm nb-flex-center">
          <button className="nb-button" onClick={onBack}>
            Back
          </button>
          <button className="nb-button nb-button-primary" onClick={onRestart}>
            <MaterialIcon name="Replay" size={18} color="var(--nb-white)" />
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
};