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
import { CrosswordWordBank } from './CrosswordWordBank';
import { MaterialIcon } from '../landing-page/icons';

export const CrosswordGame = ({
  userId,
  language,
  topicId,
  topicName,
  onBack,
}) => {
  const [phase, setPhase] = useState('setup');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const [puzzle, setPuzzle] = useState(null);
  const [puzzleId, setPuzzleId] = useState(null);
  const [currentGrid, setCurrentGrid] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedClueId, setSelectedClueId] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [revealedCells, setRevealedCells] = useState(new Set());
  const [revealedClueIds, setRevealedClueIds] = useState(new Set());

  const saveTimerRef = useRef(null);

  const prefilledKeys = useMemo(() => {
    if (!puzzle?.prefilledCells) return new Set();
    return new Set(puzzle.prefilledCells.map((c) => `${c.row},${c.col}`));
  }, [puzzle]);

  /* ---------- Word bank ---------- */

  const availableWords = useMemo(() => {
    if (!puzzle) return [];
    const set = new Set();
    for (const sentence of puzzle.sentences) {
      for (const w of sentence.words) set.add(w);
    }
    return Array.from(set).sort();
  }, [puzzle]);

  // Words placed correctly in their solution position. Used to grey out
  // the bank entries that are already solved.
  const placedCorrectly = useMemo(() => {
    if (!puzzle?.solutionGrid || !currentGrid) return new Set();
    const set = new Set();
    for (let r = 0; r < puzzle.size; r++) {
      for (let c = 0; c < puzzle.size; c++) {
        const val = currentGrid[r]?.[c];
        if (val && puzzle.solutionGrid[r]?.[c] === val) {
          set.add(val);
        }
      }
    }
    return set;
  }, [puzzle, currentGrid]);

  /* ---------- Load / generate ---------- */

  const applyGridState = (puzzleData, savedGrid, savedRevealed) => {
    setPuzzle(puzzleData);
    const grid =
      savedGrid ??
      puzzleData.initialGrid ??
      puzzleData.emptyMask.map((row) => row.map(() => null));
    setCurrentGrid(grid);

    const revealedSet = new Set();
    if (Array.isArray(savedRevealed)) {
      for (const cell of savedRevealed) {
        revealedSet.add(`${cell.row},${cell.col}`);
      }
    }
    setRevealedCells(revealedSet);

    // Recompute revealed clue IDs from the revealed cells
    if (puzzleData.clues) {
      const clueIds = new Set();
      for (const clue of puzzleData.clues) {
        // A clue is fully revealed if all its cells are in revealedSet
        let allRevealed = true;
        for (let i = 0; i < clue.length; i++) {
          const r = clue.direction === 'down' ? clue.startRow + i : clue.startRow;
          const c = clue.direction === 'across' ? clue.startCol + i : clue.startCol;
          if (!revealedSet.has(`${r},${c}`)) {
            allRevealed = false;
            break;
          }
        }
        if (allRevealed) clueIds.add(clue.id);
      }
      setRevealedClueIds(clueIds);
    }
  };

  const handleResume = async (existingPuzzleId) => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await api.fetchCrossword(existingPuzzleId);
      // Backend should return revealedCells from CrosswordAttempt
      applyGridState(
        result.puzzle,
        result.puzzle.currentGrid,
        result.puzzle.revealedCells
      );
      setPuzzleId(result.puzzle.id);
      setSelectedCell(null);
      setSelectedClueId(null);
      setSelectedWord(null);
      setPhase('playing');
    } catch (err) {
      console.error('Failed to resume puzzle:', err);
      setError(err.message || 'Could not load puzzle.');
    } finally {
      setIsGenerating(false);
    }
  };

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
      applyGridState(result.puzzle, result.puzzle.initialGrid, []);
      setPuzzleId(result.puzzleId);
      setSelectedCell(null);
      setSelectedClueId(null);
      setSelectedWord(null);
      setPhase('playing');
    } catch (err) {
      console.error('Crossword generation failed:', err);
      setError(err.message || 'Could not generate puzzle. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  /* ---------- Placement ---------- */

  const findClueForCell = useCallback(
    (row, col) => {
      if (!puzzle) return null;
      // Prefer the currently selected clue if the cell belongs to it
      if (selectedClueId) {
        const clue = puzzle.clues.find((c) => c.id === selectedClueId);
        if (clue) {
          const inClue =
            (clue.direction === 'across' &&
              row === clue.startRow &&
              col >= clue.startCol &&
              col < clue.startCol + clue.length) ||
            (clue.direction === 'down' &&
              col === clue.startCol &&
              row >= clue.startRow &&
              row < clue.startRow + clue.length);
          if (inClue) return clue;
        }
      }
      // Otherwise pick the first clue that contains this cell
      for (const clue of puzzle.clues) {
        const inClue =
          (clue.direction === 'across' &&
            row === clue.startRow &&
            col >= clue.startCol &&
            col < clue.startCol + clue.length) ||
          (clue.direction === 'down' &&
            col === clue.startCol &&
            row >= clue.startRow &&
            row < clue.startRow + clue.length);
        if (inClue) return clue;
      }
      return null;
    },
    [puzzle, selectedClueId]
  );

  const handleCellClick = useCallback(
    (row, col) => {
      if (!selectedWord || !puzzle) return;

      const key = `${row},${col}`;
      if (revealedCells.has(key)) return;

      // The clicked cell becomes the anchor of the word if it belongs to
      // a clue. The word is placed starting at the clue's start position
      // in the direction of that clue.
      const clue = findClueForCell(row, col);
      if (!clue) {
        console.warn('[crossword] clicked cell belongs to no clue', { row, col });
        return;
      }

      // The word must match the clue's length? No — the player picks any
      // word from the bank and drops it into the clue's first cell.
      // We place the word starting at the clue's start, filling forward
      // until we run out of letters. If the word is shorter than the clue,
      // only the first N cells fill.
      const wordCells = Array.from(selectedWord);

      setCurrentGrid((prev) => {
        const next = prev.map((r) => [...r]);
        for (let i = 0; i < wordCells.length; i++) {
          const rr = clue.direction === 'down' ? clue.startRow + i : clue.startRow;
          const cc = clue.direction === 'across' ? clue.startCol + i : clue.startCol;
          if (!puzzle.emptyMask[rr]?.[cc]) break;
          const cellKey = `${rr},${cc}`;
          if (revealedCells.has(cellKey)) break;
          next[rr][cc] = wordCells[i];
        }
        return next;
      });

      // Keep the selected word so the player can place it in multiple cells
      // (they may want to try different positions). Deselect on Escape.
    },
    [selectedWord, puzzle, revealedCells, findClueForCell]
  );

  const handleSelectClue = (clue) => {
    setSelectedClueId(clue.id);
    setSelectedCell({ row: clue.startRow, col: clue.startCol });
  };

  /* ---------- Reveal answer ---------- */

  const handleRevealClue = useCallback(
    (clue) => {
      if (!puzzle?.solutionGrid) return;
      if (revealedClueIds.has(clue.id)) return;

      setCurrentGrid((prev) => {
        const next = prev.map((r) => [...r]);
        for (let i = 0; i < clue.length; i++) {
          const r = clue.direction === 'down' ? clue.startRow + i : clue.startRow;
          const c = clue.direction === 'across' ? clue.startCol + i : clue.startCol;
          const sol = puzzle.solutionGrid[r]?.[c];
          if (sol) next[r][c] = sol;
        }
        return next;
      });

      setRevealedCells((prev) => {
        const next = new Set(prev);
        for (let i = 0; i < clue.length; i++) {
          const r = clue.direction === 'down' ? clue.startRow + i : clue.startRow;
          const c = clue.direction === 'across' ? clue.startCol + i : clue.startCol;
          next.add(`${r},${c}`);
        }
        return next;
      });

      setRevealedClueIds((prev) => new Set([...prev, clue.id]));
    },
    [puzzle, revealedClueIds]
  );

  /* ---------- Auto-save ---------- */

  useEffect(() => {
    if (!puzzleId || !currentGrid) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(() => {
      const revealedArray = Array.from(revealedCells).map((k) => {
        const [row, col] = k.split(',').map(Number);
        return { row, col };
      });

      api
        .saveCrosswordProgress({
          puzzleId,
          userId,
          currentGrid,
          revealedCells: revealedArray,
        })
        .catch((err) =>
          console.warn('Crossword progress save failed:', err)
        );
    }, 2000);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [currentGrid, puzzleId, userId, revealedCells]);

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
      {/* Reveal counter */}
      {revealedCells.size > 0 && (
        <div className="nb-card" style={{ background: 'var(--nb-orange)' }}>
          <div className="nb-flex nb-flex-center nb-gap-sm">
            <MaterialIcon name="Visibility" size={18} color="var(--nb-black)" />
            <span className="nb-text-sm" style={{ fontWeight: 700 }}>
              {revealedClueIds.size} of {puzzle.clues.length} clues revealed
            </span>
          </div>
        </div>
      )}

      <CrosswordGrid
        size={puzzle.size}
        emptyMask={puzzle.emptyMask}
        currentGrid={currentGrid}
        clues={puzzle.clues}
        onCellClick={handleCellClick}
        selectedCell={selectedCell}
        onSelectCell={setSelectedCell}
        prefilledKeys={prefilledKeys}
        revealedKeys={revealedCells}
        hasSelectedWord={Boolean(selectedWord)}
      />

      <CrosswordWordBank
        words={availableWords}
        selectedWord={selectedWord}
        onSelectWord={setSelectedWord}
        placedWords={placedCorrectly}
      />

      <CrosswordClues
        clues={puzzle.clues}
        onSelectClue={handleSelectClue}
        selectedClueId={selectedClueId}
        onRevealClue={handleRevealClue}
        revealedClueIds={revealedClueIds}
      />
    </div>
  );
};