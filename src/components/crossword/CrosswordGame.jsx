import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
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
  const [isResuming, setIsResuming] = useState(false);

  const saveTimerRef = useRef(null);

  const isCharacterLanguage = useMemo(
    () => ['Chinese', 'Japanese', 'Korean'].includes(language),
    [language]
  );

  /* ---------- Prefilled hint cells ---------- */

  const prefilledKeys = useMemo(() => {
    if (!puzzle?.prefilledCells) return new Set();
    return new Set(
      puzzle.prefilledCells.map((c) => `${c.row},${c.col}`)
    );
  }, [puzzle]);

  /* ---------- Resume existing puzzle ---------- */

  const handleResume = async (existingPuzzleId) => {
    setIsResuming(true);
    setError(null);

    try {
      const result = await api.fetchCrossword(existingPuzzleId);

      setPuzzleId(result.puzzle.id);
      setPuzzle(result.puzzle);

      const grid =
        result.puzzle.initialGrid ??
        result.puzzle.emptyMask.map((row) => row.map(() => null));

      setCurrentGrid(grid);
      setPhase('playing');
      setSelectedCell(null);
      setSelectedClueId(null);
    } catch (err) {
      console.error('Failed to resume puzzle:', err);
      setError(err.message || 'Could not load puzzle.');
    } finally {
      setIsResuming(false);
    }
  };

  /* ---------- Generate new puzzle ---------- */

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

      const grid =
        result.puzzle.initialGrid ??
        result.puzzle.emptyMask.map((row) => row.map(() => null));

      setCurrentGrid(grid);
      setPhase('playing');
      setSelectedCell(null);
      setSelectedClueId(null);
    } catch (err) {
      console.error('Crossword generation failed:', err);
      setError(
        err.message || 'Could not generate puzzle. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  /* ---------- Cell edit + auto-advance ---------- */

  const advanceToNextCell = useCallback(
    (row, col) => {
      if (!selectedClueId || !puzzle) return;

      const clue = puzzle.clues.find((c) => c.id === selectedClueId);
      if (!clue) return;

      const idx =
        clue.direction === 'across'
          ? col - clue.startCol
          : row - clue.startRow;

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
    },
    [selectedClueId, puzzle]
  );

  const handleCellChange = useCallback(
    (row, col, value, { advance = false } = {}) => {
      const k = `${row},${col}`;

      // Prefilled hint cells cannot be edited.
      if (prefilledKeys.has(k)) return;

      setCurrentGrid((prev) => {
        const next = prev.map((r) => [...r]);
        next[row][col] = value;
        return next;
      });

      if (advance && value) {
        advanceToNextCell(row, col);
      }
    },
    [prefilledKeys, advanceToNextCell]
  );

  // Word-per-cell: keep the whole value. Lowercase to match solution.
  const handleCellInput = useCallback(
    (row, col, rawValue) => {
      const value = rawValue ? rawValue.trim().toLowerCase() : null;
      handleCellChange(row, col, value || null, {
        advance: Boolean(value),
      });
    },
    [handleCellChange]
  );

  /* ---------- Character keyboard (for CJK) ---------- */

  const handleWordSelect = (word) => {
    if (!selectedCell) return;
    handleCellChange(selectedCell.row, selectedCell.col, word, {
      advance: true,
    });
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

  /* ---------- Available words (word-per-cell) ---------- */

  const availableWords = useMemo(() => {
    if (!puzzle) return [];
    const set = new Set();
    for (const sentence of puzzle.sentences) {
      for (const w of sentence.words) {
        set.add(w);
      }
    }
    return Array.from(set).sort();
  }, [puzzle]);

  /* ---------- Render ---------- */

  if (phase === 'setup') {
    return (
      <CrosswordSetup
        userId={userId}
        topicId={topicId}
        topicName={topicName}
        language={language}
        onStart={handleStart}
        onResume={handleResume}
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
        onCellInput={handleCellInput}
        selectedCell={selectedCell}
        onSelectCell={setSelectedCell}
        prefilledKeys={prefilledKeys}
        isCharacterLanguage={isCharacterLanguage}
      />

      {isCharacterLanguage && (
        <CrosswordKeyboard
          availableWords={availableWords}
          onWordSelect={handleWordSelect}
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