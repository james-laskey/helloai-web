import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../../services/api';
import { CrosswordSetup } from './CrosswordSetup';
import { CrosswordGrid } from './CrosswordGrid';
import { CrosswordClues } from './CrosswordClues';
import { CrosswordKeyboard } from './CrosswordKeyboard';

export const CrosswordGame = ({
  userId,
  language,
  topicId,
  topicName,
  onBack,
}) => {
  const [phase, setPhase] = useState('setup'); // 'setup' | 'playing'
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const [puzzle, setPuzzle] = useState(null);
  const [puzzleId, setPuzzleId] = useState(null);
  const [currentGrid, setCurrentGrid] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedClueId, setSelectedClueId] = useState(null);

  const saveTimerRef = useRef(null);

  const isCharacterLanguage = ['Chinese', 'Japanese', 'Korean'].includes(language);

  /* ---------- Generate ---------- */

  const handleStart = async ({ theme, sentenceCount, difficulty }) => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await api.generateCrossword({
        userId,
        language,
        topicId,
        topicName,
        theme,
        sentenceCount,
        difficulty,
      });

      setPuzzleId(result.puzzleId);
      setPuzzle(result.puzzle);
      setCurrentGrid(
        result.puzzle.emptyMask.map((row) =>
          row.map(() => null)
        )
      );
      setPhase('playing');
    } catch (err) {
      console.error('Crossword generation failed:', err);
      setError(err.message || 'Could not generate puzzle. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  /* ---------- Cell edit ---------- */

  const handleCellChange = useCallback(
    (row, col, value) => {
      setCurrentGrid((prev) => {
        const next = prev.map((r) => [...r]);
        next[row][col] = value;
        return next;
      });
    },
    []
  );

  const handleCharSelect = (ch) => {
    if (!selectedCell) return;
    handleCellChange(selectedCell.row, selectedCell.col, ch);

    // Auto-advance to next cell in the current word
    if (selectedClueId) {
      const clue = puzzle.clues.find((c) => c.id === selectedClueId);
      if (clue) {
        const idx =
          clue.direction === 'across'
            ? selectedCell.col - clue.startCol
            : selectedCell.row - clue.startRow;
        if (idx < clue.length - 1) {
          const nextRow =
            clue.direction === 'down'
              ? clue.startRow + idx + 1
              : clue.startRow;
          const nextCol =
            clue.direction === 'across'
              ? clue.startCol + idx + 1
              : clue.startCol;
          setSelectedCell({ row: nextRow, col: nextCol });
        }
      }
    }
  };

  const handleBackspace = () => {
    if (!selectedCell) return;
    handleCellChange(selectedCell.row, selectedCell.col, null);
  };

  /* ---------- Auto-save ---------- */

  useEffect(() => {
    if (!puzzleId || !currentGrid) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(() => {
      api
        .saveCrosswordProgress({
          puzzleId,
          userId,
          currentGrid,
        })
        .catch((err) =>
          console.warn('Crossword progress save failed:', err)
        );
    }, 2000);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [currentGrid, puzzleId, userId]);

  /* ---------- Available characters ---------- */

  const availableChars = React.useMemo(() => {
    if (!puzzle) return [];
    const set = new Set();
    for (const row of puzzle.sentences) {
      for (const w of row.words) {
        for (const ch of w) set.add(ch);
      }
    }
    return Array.from(set).sort();
  }, [puzzle]);

  /* ---------- Render ---------- */

  if (phase === 'setup') {
    return (
      <CrosswordSetup
        topicName={topicName}
        language={language}
        onStart={handleStart}
        isGenerating={isGenerating}
        error={error}
      />
    );
  }

  return (
    <div className="nb-flex nb-flex-col nb-gap-lg">
      <CrosswordGrid
        size={puzzle.size}
        emptyMask={puzzle.emptyMask}
        currentGrid={currentGrid}
        clues={puzzle.clues}
        onCellChange={handleCellChange}
        selectedCell={selectedCell}
        onSelectCell={setSelectedCell}
      />

      {isCharacterLanguage && (
        <CrosswordKeyboard
          availableChars={availableChars}
          onCharSelect={handleCharSelect}
          onBackspace={handleBackspace}
        />
      )}

      <CrosswordClues
        clues={puzzle.clues}
        onSelectClue={(clue) => {
          setSelectedClueId(clue.id);
          setSelectedCell({
            row: clue.startRow,
            col: clue.startCol,
          });
        }}
        selectedClueId={selectedClueId}
      />
    </div>
  );
};