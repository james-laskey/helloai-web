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
    } catch (err) {
      console.error('Failed to resume puzzle:', err);
      setError(err.message || 'Could not load puzzle.');
    } finally {
      setIsResuming(false);
    }
  };

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

      // Prefer initialGrid (which includes prefilled hints) when provided.
      // Fall back to an empty grid otherwise.
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

      // Do not allow editing a prefilled hint cell
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

  // Called by CrosswordGrid's <input> when the user types
  const handleCellInput = useCallback(
    (row, col, rawValue) => {
      // For CJK, IME composition produces multi-character strings.
      // Take only the final character so the grid stays one character
      // per cell.
      const chars = Array.from(rawValue || '');
      const char = chars.length > 0 ? chars[chars.length - 1] : null;
      handleCellChange(row, col, char, { advance: Boolean(char) });
    },
    [handleCellChange]
  );

  /* ---------- Character keyboard (for CJK) ---------- */

  const handleCharSelect = (ch) => {
    if (!selectedCell) return;
    handleCellChange(selectedCell.row, selectedCell.col, ch, {
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

  /* ---------- Available characters ---------- */

  const availableChars = useMemo(() => {
    if (!puzzle) return [];
    const set = new Set();
    for (const sentence of puzzle.sentences) {
      for (const w of sentence.words) {
        // w is a word (phonetic) or a single character (CJK) depending on
        // how the backend tokenizes. Array.from handles both.
        for (const ch of Array.from(w)) set.add(ch);
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
        onResume={handleResume}
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