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

/**
 * Builds the initial word bank from the puzzle sentences.
 * Returns an object mapping word -> remaining count.
 * Multiple occurrences of the same word (like "is") increment the count.
 */
function buildInitialBank(puzzle) {
  if (!puzzle?.solutionGrid) return {};
  const bank = {};
  const size = puzzle.size;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const word = puzzle.solutionGrid[r]?.[c];
      if (!word) continue;
      bank[word] = (bank[word] || 0) + 1;
    }
  }

  return bank;
}

/**
 * Removes one occurrence of `word` from the bank.
 * Returns a new bank object (does not mutate the input).
 */
function decrementBank(bank, word) {
  const next = { ...bank };
  if (!next[word]) return next;
  next[word] -= 1;
  if (next[word] <= 0) delete next[word];
  return next;
}

/**
 * Adds one occurrence of `word` back to the bank.
 */
function incrementBank(bank, word) {
  const next = { ...bank };
  next[word] = (next[word] || 0) + 1;
  return next;
}

export const CrosswordGame = ({
  userId,
  language,
  topicId,
  topicName,
  onBack,
}) => {
  const [phase, setPhase] = useState('setup'); // 'setup' | 'playing' | 'complete'
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const [puzzle, setPuzzle] = useState(null);
  const [puzzleId, setPuzzleId] = useState(null);
  const [currentGrid, setCurrentGrid] = useState(null);
  const [wordBank, setWordBank] = useState({});       // { word: count }
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

  /* ---------- Bank-derived sorted word list ---------- */

  const bankWords = useMemo(() => {
    return Object.keys(wordBank).sort();
  }, [wordBank]);

  /* ---------- Correct cells (green feedback) ---------- */

  const correctlyFilledCells = useMemo(() => {
    if (!puzzle?.solutionGrid || !currentGrid) return new Set();
    const set = new Set();
    for (let r = 0; r < puzzle.size; r++) {
      for (let c = 0; c < puzzle.size; c++) {
        const val = currentGrid[r]?.[c];
        if (val && puzzle.solutionGrid[r]?.[c] === val) {
          set.add(`${r},${c}`);
        }
      }
    }
    return set;
  }, [puzzle, currentGrid]);

  /* ---------- Derived bank from grid (for resume consistency) ---------- */

  const buildBankFromGrid = useCallback(
    (puzzleData, grid) => {
      if (!puzzleData || !grid) return {};
      // Start with all words in the puzzle, decrement for each cell that
      // already holds a word (excluding revealed and prefilled cells).
      let bank = buildInitialBank(puzzleData);

      for (let r = 0; r < puzzleData.size; r++) {
        for (let c = 0; c < puzzleData.size; c++) {
          const val = grid[r]?.[c];
          if (!val) continue;
          // Prefilled hint cells are already "spent" and never come back
          const k = `${r},${c}`;
          const isPrefilled = (puzzleData.prefilledCells || []).some(
            (pc) => pc.row === r && pc.col === c
          );
          if (isPrefilled) {
            bank = decrementBank(bank, val);
          } else {
            bank = decrementBank(bank, val);
          }
        }
      }

      return bank;
    },
    []
  );

  /* ---------- Load / generate ---------- */

  const applyGridState = (puzzleData, savedGrid, savedRevealed) => {
    setPuzzle(puzzleData);

    const grid =
      savedGrid ??
      puzzleData.initialGrid ??
      puzzleData.emptyMask.map((row) => row.map(() => null));
    setCurrentGrid(grid);

    // Rebuild bank by subtracting every word currently on the grid
    // (prefilled hints included) from the full puzzle vocabulary.
    const bank = buildBankFromGrid(puzzleData, grid);
    setWordBank(bank);

    const revealedSet = new Set();
    if (Array.isArray(savedRevealed)) {
      for (const cell of savedRevealed) {
        revealedSet.add(`${cell.row},${cell.col}`);
      }
    }
    setRevealedCells(revealedSet);

    if (puzzleData.clues) {
      const clueIds = new Set();
      for (const clue of puzzleData.clues) {
        let allRevealed = true;
        for (let i = 0; i < clue.length; i++) {
          const r =
            clue.direction === 'down' ? clue.startRow + i : clue.startRow;
          const c =
            clue.direction === 'across' ? clue.startCol + i : clue.startCol;
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
      const result = await api.fetchCrossword(existingPuzzleId, userId);
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

  /* ---------- Completion detection ---------- */

  useEffect(() => {
    if (phase !== 'playing') return;
    if (!puzzle) return;
    // Complete when the bank is empty
    if (Object.keys(wordBank).length === 0) {
      setPhase('complete');
    }
  }, [wordBank, phase, puzzle]);

  /* ---------- Cell interaction ---------- */

  const handleCellClick = useCallback(
    (row, col) => {
      if (!puzzle) return;

      const cellKey = `${row},${col}`;

      // Locked cells: prefilled hints and revealed answers
      if (prefilledKeys.has(cellKey)) return;
      if (revealedCells.has(cellKey)) return;

      // Placing a word
      if (selectedWord) {
        if (!wordBank[selectedWord]) {
          // Should not happen, but guard against stale selection
          setSelectedWord(null);
          return;
        }

        setCurrentGrid((prev) => {
          const next = prev.map((r) => [...r]);
          next[row][col] = selectedWord;
          return next;
        });

        setWordBank((prev) => decrementBank(prev, selectedWord));
        setSelectedWord(null);
        return;
      }

      // Removing a word from a cell
      const existing = currentGrid?.[row]?.[col];
      if (existing) {
        setCurrentGrid((prev) => {
          const next = prev.map((r) => [...r]);
          next[row][col] = null;
          return next;
        });
        setWordBank((prev) => incrementBank(prev, existing));
      }
    },
    [puzzle, selectedWord, wordBank, prefilledKeys, revealedCells, currentGrid]
  );

  const handleSelectClue = (clue) => {
    setSelectedClueId(clue.id);
    setSelectedCell({ row: clue.startRow, col: clue.startCol });
  };

  const handleSelectWord = (word) => {
    setSelectedWord((prev) => (prev === word ? null : word));
  };

  /* ---------- Reveal ---------- */

  const handleRevealClue = useCallback(
    (clue) => {
      if (!puzzle?.solutionGrid) return;
      if (revealedClueIds.has(clue.id)) return;

      // Removing any words currently in the clue's cells back to the bank
      // before overwriting with the solution.
      const newGrid = currentGrid.map((r) => [...r]);
      let bank = { ...wordBank };

      for (let i = 0; i < clue.length; i++) {
        const r =
          clue.direction === 'down' ? clue.startRow + i : clue.startRow;
        const c =
          clue.direction === 'across' ? clue.startCol + i : clue.startCol;
        const existing = newGrid[r]?.[c];
        if (existing) {
          bank = incrementBank(bank, existing);
        }
      }

      // Now fill in the solution and mark all cells as revealed
      const revealedAdded = [];
      for (let i = 0; i < clue.length; i++) {
        const r =
          clue.direction === 'down' ? clue.startRow + i : clue.startRow;
        const c =
          clue.direction === 'across' ? clue.startCol + i : clue.startCol;
        const sol = puzzle.solutionGrid[r]?.[c];
        if (sol) {
          newGrid[r][c] = sol;
          // Do not decrement the bank — the word is already "consumed"
          // by being placed as a reveal. But if the same word exists in
          // the bank elsewhere, leave it alone.
        }
        revealedAdded.push(`${r},${c}`);
      }

      // Since revealed cells do not consume bank words, we need to make
      // sure the correct solution word does not return to the bank.
      // The words we pulled back above (existing) were pulled because
      // the player had placed them; those get returned. The revealed
      // solution words are new placements that never came from the bank.

      setCurrentGrid(newGrid);
      setWordBank(bank);
      setRevealedCells((prev) => {
        const next = new Set(prev);
        for (const k of revealedAdded) next.add(k);
        return next;
      });
      setRevealedClueIds((prev) => new Set([...prev, clue.id]));
      setSelectedWord(null);
    },
    [puzzle, currentGrid, wordBank, revealedClueIds]
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

  /* ---------- Completion card ---------- */

  if (phase === 'complete') {
    const totalClues = puzzle?.clues?.length ?? 0;
    const revealedCount = revealedClueIds.size;

    return (
      <div
        className="nb-flex nb-flex-center"
        style={{ minHeight: '400px', flexDirection: 'column' }}
      >
        <div
          className="nb-card nb-text-center"
          style={{
            maxWidth: '500px',
            background: 'var(--nb-lime)',
            padding: 'var(--nb-space-xl)',
          }}
        >
          <div style={{ marginBottom: 'var(--nb-space-md)' }}>
            <MaterialIcon name="EmojiEvents" size={64} color="var(--nb-black)" />
          </div>
          <h2 className="nb-heading nb-heading-lg nb-mb-md">
            Puzzle Complete!
          </h2>
          <p className="nb-text nb-mb-lg">
            You filled every cell.
            {revealedCount > 0
              ? ` ${revealedCount} of ${totalClues} clues were revealed.`
              : ' No hints used.'}
          </p>
          <div className="nb-flex nb-gap-sm nb-flex-center">
            <button className="nb-button" onClick={onBack}>
              Back to Crosswords
            </button>
            <button
              className="nb-button nb-button-primary"
              onClick={() => {
                setPhase('setup');
                setPuzzle(null);
                setPuzzleId(null);
                setCurrentGrid(null);
                setWordBank({});
                setRevealedCells(new Set());
                setRevealedClueIds(new Set());
                setSelectedWord(null);
                setSelectedCell(null);
                setSelectedClueId(null);
              }}
            >
              New Puzzle
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Playing ---------- */

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
      {/* Status bar */}
      <div
        className="nb-card"
        style={{
          background:
            revealedCells.size > 0 ? 'var(--nb-orange)' : 'var(--nb-white)',
        }}
      >
        <div className="nb-flex nb-flex-center nb-gap-md nb-flex-wrap">
          <div className="nb-flex nb-flex-center nb-gap-sm">
            <MaterialIcon name="Abc" size={18} color="var(--nb-black)" />
            <span className="nb-text-sm" style={{ fontWeight: 700 }}>
              {Object.values(wordBank).reduce((a, b) => a + b, 0)} words left
            </span>
          </div>
          {revealedClueIds.size > 0 && (
            <div className="nb-flex nb-flex-center nb-gap-sm">
              <MaterialIcon
                name="Visibility"
                size={18}
                color="var(--nb-black)"
              />
              <span className="nb-text-sm" style={{ fontWeight: 700 }}>
                {revealedClueIds.size} of {puzzle.clues.length} revealed
              </span>
            </div>
          )}
        </div>
      </div>

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
        correctKeys={correctlyFilledCells}
        hasSelectedWord={Boolean(selectedWord)}
      />

      <CrosswordWordBank
        bank={wordBank}
        selectedWord={selectedWord}
        onSelectWord={handleSelectWord}
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