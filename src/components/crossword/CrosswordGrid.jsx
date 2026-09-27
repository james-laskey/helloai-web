import React, { useState, useRef, useEffect, useMemo } from 'react';

const BASE_CELL_SIZE = 44;
const MIN_CELL_SIZE = 24;
const MAX_CELL_SIZE = 80;

export const CrosswordGrid = ({
  size,
  emptyMask,
  currentGrid,
  clues,
  onCellChange,
  onCellInput,
  selectedCell,
  onSelectCell,
  prefilledKeys = new Set(),
  isCharacterLanguage = false,
}) => {
  const [cellSize, setCellSize] = useState(BASE_CELL_SIZE);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef(null);
  const containerRef = useRef(null);

  /* ---------- Bounding box of playable cells ---------- */
  const bounds = useMemo(() => {
    let minR = size,
      maxR = -1,
      minC = size,
      maxC = -1;
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
    if (maxR === -1)
      return { minR: 0, maxR: size - 1, minC: 0, maxC: size - 1 };
    return { minR, maxR, minC, maxC };
  }, [size, emptyMask]);

  const visibleCols = bounds.maxC - bounds.minC + 1;
  const visibleRows = bounds.maxR - bounds.minR + 1;
  const gridWidth = visibleCols * cellSize;
  const gridHeight = visibleRows * cellSize;

  /* ---------- Cell numbers from clues ---------- */
  const cellNumbers = useMemo(() => {
    const map = new Map();
    for (const clue of clues) {
      const k = `${clue.startRow},${clue.startCol}`;
      if (!map.has(k)) map.set(k, clue.number);
    }
    return map;
  }, [clues]);

  /* ---------- Which clues each cell belongs to ---------- */
  const cellToClues = useMemo(() => {
    const map = new Map();
    for (const clue of clues) {
      for (let i = 0; i < clue.length; i++) {
        const r = clue.direction === 'down' ? clue.startRow + i : clue.startRow;
        const c = clue.direction === 'across' ? clue.startCol + i : clue.startCol;
        const k = `${r},${c}`;
        if (!map.has(k)) map.set(k, []);
        map.get(k).push(clue);
      }
    }
    return map;
  }, [clues]);

  /* ---------- Pan handlers ---------- */
  const handleMouseDown = (e) => {
    dragRef.current = {
      x: e.clientX,
      y: e.clientY,
      ox: offset.x,
      oy: offset.y,
    };
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

  /* ---------- Grid positioning ---------- */
  const containerCenterX = (containerRef.current?.clientWidth || 800) / 2;
  const containerCenterY = 400;
  const baseX = containerCenterX - gridWidth / 2 + offset.x;
  const baseY = containerCenterY - gridHeight / 2 + offset.y;

  /* ---------- Render ---------- */
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
          const value = currentGrid?.[r]?.[c] ?? null;
          const k = `${r},${c}`;
          const num = cellNumbers.get(k);
          const isSelected =
            selectedCell && selectedCell.row === r && selectedCell.col === c;
          const isPrefilled = prefilledKeys.has(k);
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

          let bg = 'var(--nb-white)';
          if (!isPlayable) bg = 'var(--nb-dark-gray, #1e293b)';
          else if (isSelected) bg = 'var(--nb-yellow)';
          else if (isPrefilled) bg = 'var(--nb-cyan)';
          else if (isHighlighted) bg = '#cfe9ff';

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
                background: bg,
                border: '1px solid #334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isPlayable ? 'text' : 'default',
                color: 'var(--nb-black)',
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
                    pointerEvents: 'none',
                  }}
                >
                  {num}
                </span>
              )}

              {isSelected && !isPrefilled ? (
                <input
                  key={`${r}-${c}`}
                  type="text"
                  value={value || ''}
                  onChange={(e) => onCellInput?.(r, c, e.target.value)}
                  autoFocus
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    background: 'transparent',
                    textAlign: 'center',
                    fontSize: cellSize * 0.5,
                    fontWeight: 700,
                    color: 'var(--nb-black)',
                    fontFamily: 'var(--nb-font)',
                    outline: 'none',
                    padding: 0,
                  }}
                />
              ) : (
                <span
                  style={{
                    fontSize: cellSize * 0.5,
                    fontWeight: 700,
                  }}
                >
                  {value || ''}
                </span>
              )}
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
          zIndex: 10,
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