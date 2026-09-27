import React, { useState, useRef, useEffect } from 'react';

const BASE_CELL_SIZE = 44;
const MIN_CELL_SIZE = 24;
const MAX_CELL_SIZE = 80;

export const CrosswordGrid = ({
  size,
  emptyMask,
  currentGrid,
  clues,
  onCellChange,
  selectedCell,
  onSelectCell,
}) => {
  const [cellSize, setCellSize] = useState(BASE_CELL_SIZE);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef(null);
  const containerRef = useRef(null);

  // Bounding box of playable cells
  const bounds = React.useMemo(() => {
    let minR = size, maxR = -1, minC = size, maxC = -1;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (emptyMask[r][c]) {
          minR = Math.min(minR, r);
          maxR = Math.max(maxR, r);
          minC = Math.min(minC, c);
          maxC = Math.max(maxC, c);
        }
      }
    }
    if (maxR === -1) return { minR: 0, maxR: size - 1, minC: 0, maxC: size - 1 };
    return { minR, maxR, minC, maxC };
  }, [size, emptyMask]);

  const visibleCols = bounds.maxC - bounds.minC + 1;
  const visibleRows = bounds.maxR - bounds.minR + 1;
  const gridWidth = visibleCols * cellSize;
  const gridHeight = visibleRows * cellSize;

  // Cell numbers from clues
  const cellNumbers = React.useMemo(() => {
    const map = new Map();
    for (const clue of clues) {
      const k = `${clue.startRow},${clue.startCol}`;
      if (!map.has(k)) map.set(k, clue.number);
    }
    return map;
  }, [clues]);

  // Find which words a cell belongs to
  const cellToClues = React.useMemo(() => {
    const map = new Map();
    for (const clue of clues) {
      const len = clue.length;
      for (let i = 0; i < len; i++) {
        const r = clue.direction === 'down' ? clue.startRow + i : clue.startRow;
        const c = clue.direction === 'across' ? clue.startCol + i : clue.startCol;
        const k = `${r},${c}`;
        if (!map.has(k)) map.set(k, []);
        map.get(k).push(clue);
      }
    }
    return map;
  }, [clues]);

  /* ---------- Pan ---------- */

  const handleMouseDown = (e) => {
    dragRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };

  const handleMouseMove = (e) => {
    if (!dragRef.current) return;
    setOffset({
      x: dragRef.current.ox + (e.clientX - dragRef.current.x),
      y: dragRef.current.oy + (e.clientY - dragRef.current.y),
    });
  };

  const handleMouseUp = () => {
    dragRef.current = null;
  };

  /* ---------- Zoom ---------- */

  const handleWheel = (e) => {
    e.preventDefault();
    setCellSize((prev) => {
      const next = prev + (e.deltaY < 0 ? 4 : -4);
      return Math.max(MIN_CELL_SIZE, Math.min(MAX_CELL_SIZE, next));
    });
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  /* ---------- Cell click ---------- */

  const handleCellClick = (r, c) => {
    if (!emptyMask[r][c]) return;
    onSelectCell({ row: r, col: c });
  };

  /* ---------- Center on mount ---------- */

  const containerCenterX = (containerRef.current?.clientWidth || 800) / 2;
  const containerCenterY = 400;
  const baseX = containerCenterX - gridWidth / 2 + offset.x;
  const baseY = containerCenterY - gridHeight / 2 + offset.y;

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        width: '100%',
        height: '500px',
        background: 'var(--nb-dark-gray, #0f172a)',
        border: 'var(--nb-border)',
        overflow: 'hidden',
        cursor: dragRef.current ? 'grabbing' : 'grab',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      {Array.from({ length: visibleRows }).map((_, ri) => {
        const r = bounds.minR + ri;
        return Array.from({ length: visibleCols }).map((_, ci) => {
          const c = bounds.minC + ci;
          const isPlayable = emptyMask[r][c];
          const value = currentGrid[r][c];
          const k = `${r},${c}`;
          const num = cellNumbers.get(k);
          const isSelected =
            selectedCell && selectedCell.row === r && selectedCell.col === c;
          const belonging = cellToClues.get(k) || [];
          const isHighlighted =
            selectedCell &&
            belonging.some((clue) => {
              const cellInClue =
                (clue.direction === 'across' &&
                  r === clue.startRow &&
                  c >= clue.startCol &&
                  c < clue.startCol + clue.length) ||
                (clue.direction === 'down' &&
                  c === clue.startCol &&
                  r >= clue.startRow &&
                  r < clue.startRow + clue.length);
              return cellInClue;
            });

          const x = baseX + ci * cellSize;
          const y = baseY + ri * cellSize;

          return (
            <div
              key={k}
              onClick={() => handleCellClick(r, c)}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: cellSize,
                height: cellSize,
                background: !isPlayable
                  ? 'var(--nb-dark-gray, #1e293b)'
                  : isSelected
                  ? 'var(--nb-yellow)'
                  : isHighlighted
                  ? 'var(--nb-cyan)'
                  : 'var(--nb-white)',
                border: '1px solid #334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: cellSize * 0.5,
                fontWeight: 700,
                color: 'var(--nb-black)',
                cursor: isPlayable ? 'pointer' : 'default',
              }}
            >
              {num && (
                <span
                  style={{
                    position: 'absolute',
                    top: 2,
                    left: 3,
                    fontSize: cellSize * 0.22,
                    color: 'var(--nb-orange, #f97316)',
                    fontWeight: 700,
                  }}
                >
                  {num}
                </span>
              )}
              {value || ''}
            </div>
          );
        });
      })}

      {/* Zoom controls */}
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          right: 12,
          display: 'flex',
          gap: 6,
        }}
      >
        <button
          className="nb-button"
          onClick={() => setCellSize((s) => Math.max(MIN_CELL_SIZE, s - 6))}
          style={{ padding: '4px 10px' }}
        >
          −
        </button>
        <button
          className="nb-button"
          onClick={() => setCellSize((s) => Math.min(MAX_CELL_SIZE, s + 6))}
          style={{ padding: '4px 10px' }}
        >
          +
        </button>
        <button
          className="nb-button"
          onClick={() => setOffset({ x: 0, y: 0 })}
          style={{ padding: '4px 10px' }}
        >
          Center
        </button>
      </div>
    </div>
  );
};