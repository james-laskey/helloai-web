import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  STARTING_LIVES,
  SCORE_CORRECT,
  COMBO_BONUS,
  SPAWN_STAGGER_MS,
} from './constants';

const GROUND_Y_OFFSET = 80;
const SPAWN_Y_OFFSET = 60;
const WORD_PADDING_X = 28;
const WORD_FONT = '700 28px system-ui, sans-serif';

export const NinjaPlay = ({
  questions,
  language,
  timerSeconds,      // NEW: seconds per question, from the setup screen
  onComplete,
  onExit,
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const stateRef = useRef({
    running: false,
    questions: [],
    questionIndex: 0,
    words: [],
    canvasW: 0,
    canvasH: 0,
    lives: STARTING_LIVES,
    score: 0,
    combo: 0,
    correctCount: 0,
    wrongCount: 0,
    missCount: 0,
    questionStartTime: 0,
    questionTimeMs: 0,
    lastFrameTime: 0,
    startTime: 0,
    rafId: null,
    spawnTimers: [],
    resultTimer: null,
    advancing: false,
  });

  const [hud, setHud] = useState({
    lives: STARTING_LIVES,
    score: 0,
    combo: 0,
    timeLeftMs: 0,
    questionIndex: 0,
    total: 0,
    hint: '',
    topic: '',
    phase: 'playing',
  });

  /* ---------- Resize ---------- */

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const w = container.clientWidth;
    const h = container.clientHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    stateRef.current.canvasW = w;
    stateRef.current.canvasH = h;
  }, []);

  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [resize]);

  /* ---------- Drawing ---------- */

  const measureWord = (ctx, text) => {
    ctx.font = WORD_FONT;
    const metrics = ctx.measureText(text);
    return { width: metrics.width + WORD_PADDING_X * 2, height: 56 };
  };

  const roundRect = (ctx, x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  const drawWord = (ctx, word) => {
    const { x, y, w, h, text, color, alpha } = word;
    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;

    roundRect(ctx, x - w / 2, y - h / 2, w, h, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.font = WORD_FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y + 1);

    ctx.restore();
  };

  /* ---------- Spawn ---------- */

  const spawnQuestion = (qIndex) => {
    const s = stateRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const q = s.questions[qIndex];
    if (!q) return;

    s.questionStartTime = performance.now();
    s.questionTimeMs = timerSeconds * 1000;
    s.advancing = false;

    const items = [
      { text: q.correctWord, correct: true },
      ...q.decoys.map((d) => ({ text: d, correct: false })),
    ].sort(() => Math.random() - 0.5);

    // Calculate the fall duration for each word. Every word should be
    // able to reach the ground before the timer expires, so the fall
    // speed is derived from the slowest word (the last one spawned).
    const totalWordCount = items.length;
    const lastSpawnDelay = (totalWordCount - 1) * SPAWN_STAGGER_MS;
    const availableFallMs = Math.max(1000, s.questionTimeMs - lastSpawnDelay);

    const lanes = items.length;
    const laneWidth = s.canvasW / (lanes + 1);

    items.forEach((item, i) => {
      const timer = setTimeout(() => {
        if (!s.running || s.questionIndex !== qIndex) return;

        const measured = measureWord(ctx, item.text);
        const laneCenter = laneWidth * (i + 1);
        const jitter = (Math.random() - 0.5) * (laneWidth * 0.4);
        const x = Math.max(
          measured.width / 2 + 8,
          Math.min(s.canvasW - measured.width / 2 - 8, laneCenter + jitter)
        );

        s.words.push({
          text: item.text,
          correct: item.correct,
          x,
          baseX: x,
          y: SPAWN_Y_OFFSET,
          w: measured.width,
          h: measured.height,
          color: '#7dd3fc',
          alpha: 1,
          resolved: false,
          wobblePhase: Math.random() * Math.PI * 2,
          spawnTime: performance.now(),
          // Each word falls at the same speed, taking availableFallMs
          // to travel from spawn to ground.
          fallDurationMs: availableFallMs,
        });
      }, i * SPAWN_STAGGER_MS);

      s.spawnTimers.push(timer);
    });

    setHud((prev) => ({
      ...prev,
      questionIndex: qIndex,
      total: s.questions.length,
      hint: q.hint,
      topic: q.topic,
      timeLeftMs: s.questionTimeMs,
    }));
  };

  /* ---------- Clicks ---------- */

  const handlePointerDown = (e) => {
    const s = stateRef.current;
    if (!s.running) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    for (let i = s.words.length - 1; i >= 0; i--) {
      const w = s.words[i];
      if (w.resolved) continue;
      const dx = Math.abs(px - w.x);
      const dy = Math.abs(py - w.y);
      if (dx <= w.w / 2 && dy <= w.h / 2) {
        handleWordClick(w);
        return;
      }
    }
  };

  const handleWordClick = (word) => {
    const s = stateRef.current;

    if (word.correct) {
      word.resolved = true;
      word.color = '#53C691';
      s.score += SCORE_CORRECT + s.combo * COMBO_BONUS;
      s.combo += 1;
      s.correctCount += 1;
    } else {
      word.resolved = true;
      word.color = '#ff4757';
      s.combo = 0;
      s.wrongCount += 1;
      s.lives = Math.max(0, s.lives - 1);
    }

    word.fadeOut = 300;
    word.fadeOutStartedAt = performance.now();

    setHud((prev) => ({
      ...prev,
      score: s.score,
      combo: s.combo,
      lives: s.lives,
    }));

    const unresolved = s.words.filter((w) => !w.resolved).length;
    if (unresolved === 0 && s.lives > 0) {
      endQuestionEarly();
    }

    if (s.lives <= 0) {
      endGame(false);
    }
  };

  /* ---------- Transitions ---------- */

  const endQuestionEarly = () => {
    const s = stateRef.current;
    if (!s.running || s.advancing) return;

    s.advancing = true;
    setTimeout(() => {
      if (!s.running) return;
      s.words = [];
      advanceQuestion();
    }, 500);
  };

  const advanceQuestion = () => {
    const s = stateRef.current;
    s.questionIndex += 1;

    if (s.questionIndex >= s.questions.length) {
      endGame(true);
      return;
    }

    spawnQuestion(s.questionIndex);
  };

  const endGame = (completed) => {
    const s = stateRef.current;
    if (!s.running && s.rafId === null) return;
    s.running = false;

    s.spawnTimers.forEach((id) => clearTimeout(id));
    s.spawnTimers = [];
    if (s.resultTimer) clearTimeout(s.resultTimer);
    if (s.rafId) cancelAnimationFrame(s.rafId);
    s.rafId = null;

    setHud((prev) => ({
      ...prev,
      lives: s.lives,
      score: s.score,
      combo: s.combo,
      phase: completed ? 'complete' : 'game-over',
      timeLeftMs: 0,
    }));

    const timeSpent = Math.floor((performance.now() - s.startTime) / 1000);

    onComplete?.({
      score: s.score,
      correctCount: s.correctCount,
      wrongCount: s.wrongCount,
      missCount: s.missCount,
      livesLeft: s.lives,
      completed,
      timeSpent,
    });
  };

  /* ---------- Main loop ---------- */

  const loop = useCallback((now) => {
    const s = stateRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dt = now - (s.lastFrameTime || now);
    s.lastFrameTime = now;

    ctx.clearRect(0, 0, s.canvasW, s.canvasH);

    const grad = ctx.createLinearGradient(0, 0, 0, s.canvasH);
    grad.addColorStop(0, '#0a0a1a');
    grad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, s.canvasW, s.canvasH);

    const groundY = s.canvasH - GROUND_Y_OFFSET;
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(0, groundY, s.canvasW, 6);

    const glow = ctx.createLinearGradient(0, groundY, 0, groundY + 40);
    glow.addColorStop(0, 'rgba(239, 68, 68, 0.35)');
    glow.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, groundY, s.canvasW, 40);

    if (!s.running) {
      s.words.forEach((w) => drawWord(ctx, w));
      return;
    }

    const elapsed = now - s.questionStartTime;
    const remaining = Math.max(0, s.questionTimeMs - elapsed);

    for (let i = s.words.length - 1; i >= 0; i--) {
      const w = s.words[i];

      if (w.fadeOut) {
        const sinceFade = now - w.fadeOutStartedAt;
        w.alpha = Math.max(0, 1 - sinceFade / w.fadeOut);
        if (w.alpha <= 0) {
          s.words.splice(i, 1);
          continue;
        }
        drawWord(ctx, w);
        continue;
      }

      // Position based on the word's own fall duration, not the question
      // timer. The word reaches the ground at spawnTime + fallDurationMs.
      const fallElapsed = now - w.spawnTime;
      const fallProgress = Math.min(1, fallElapsed / w.fallDurationMs);
      const topY = SPAWN_Y_OFFSET + w.h / 2;
      const bottomY = groundY - w.h / 2;
      w.y = topY + fallProgress * (bottomY - topY);
      w.x = w.baseX + Math.sin(now * 0.0015 + w.wobblePhase) * 8;

      if (w.y >= bottomY - 0.5 && !w.resolved) {
        w.resolved = true;
        if (w.correct) {
          s.lives = Math.max(0, s.lives - 1);
          s.combo = 0;
          s.missCount += 1;
          setHud((prev) => ({ ...prev, lives: s.lives, combo: 0 }));
          if (s.lives <= 0) {
            endGame(false);
            return;
          }
        }
        w.fadeOut = 250;
        w.fadeOutStartedAt = now;
        w.alpha = 1;
        w.color = w.correct ? '#ef4444' : '#64748b';
        drawWord(ctx, w);
        continue;
      }

      drawWord(ctx, w);
    }

    if (Math.floor(elapsed / 100) !== Math.floor((elapsed - dt) / 100)) {
      setHud((prev) => ({ ...prev, timeLeftMs: remaining }));
    }

    // Question timer expired — mark all remaining as missed and advance.
    if (remaining <= 0 && !s.advancing) {
      s.advancing = true;
      const unresolved = s.words.filter((w) => !w.resolved);
      unresolved.forEach((w) => {
        if (w.correct) {
          s.lives = Math.max(0, s.lives - 1);
          s.combo = 0;
          s.missCount += 1;
        }
        w.resolved = true;
        w.fadeOut = 250;
        w.fadeOutStartedAt = now;
      });

      setHud((prev) => ({ ...prev, lives: s.lives, combo: 0 }));

      if (s.lives <= 0) {
        endGame(false);
        return;
      }

      s.resultTimer = setTimeout(() => {
        if (!s.running) return;
        s.words = [];
        advanceQuestion();
      }, 600);
    }

    s.rafId = requestAnimationFrame(loop);
  }, [timerSeconds]);

  /* ---------- Lifecycle ---------- */

  useEffect(() => {
    const s = stateRef.current;
    s.questions = questions;
    s.running = true;
    s.questionIndex = 0;
    s.lives = STARTING_LIVES;
    s.score = 0;
    s.combo = 0;
    s.correctCount = 0;
    s.wrongCount = 0;
    s.missCount = 0;
    s.advancing = false;
    s.startTime = performance.now();
    s.lastFrameTime = performance.now();

    resize();
    spawnQuestion(0);
    s.rafId = requestAnimationFrame(loop);

    return () => {
      s.running = false;
      s.spawnTimers.forEach((id) => clearTimeout(id));
      if (s.resultTimer) clearTimeout(s.resultTimer);
      if (s.rafId) cancelAnimationFrame(s.rafId);
    };
  }, [questions, timerSeconds, resize, loop]);

  /* ---------- Render ---------- */

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '500px',
      }}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          touchAction: 'none',
          cursor: hud.phase === 'playing' ? 'crosshair' : 'default',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          background: 'rgba(0,0,0,0.55)',
          padding: '12px 18px',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.15)',
          maxWidth: 460,
          color: 'white',
          fontFamily: 'var(--nb-font)',
        }}
      >
        <div
          style={{
            fontSize: 12,
            letterSpacing: 2,
            color: '#7dd3fc',
            textTransform: 'uppercase',
          }}
        >
          {hud.topic || 'Question'}
        </div>
        <div style={{ fontSize: 18, marginTop: 6, lineHeight: 1.35 }}>
          {hud.hint}
        </div>
        <div style={{ fontSize: 12, marginTop: 8, color: '#94a3b8' }}>
          Question {hud.questionIndex + 1} of {hud.total}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          background: 'rgba(0,0,0,0.55)',
          padding: '12px 18px',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.15)',
          textAlign: 'right',
          color: 'white',
          fontFamily: 'var(--nb-font)',
        }}
      >
        <div style={{ fontSize: 16 }}>
          {'♥'.repeat(hud.lives)}
          {'♡'.repeat(Math.max(0, STARTING_LIVES - hud.lives))}
        </div>
        <div style={{ fontSize: 22, marginTop: 6, fontWeight: 700 }}>
          {hud.score}
        </div>
        {hud.combo > 1 && (
          <div style={{ fontSize: 13, color: '#fde047' }}>
            x{hud.combo} combo
          </div>
        )}
        <div style={{ fontSize: 13, marginTop: 6, color: '#94a3b8' }}>
          {(hud.timeLeftMs / 1000).toFixed(1)}s
        </div>
      </div>

      <button
        onClick={onExit}
        className="nb-button"
        style={{
          position: 'absolute',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '6px 14px',
          fontSize: '0.875rem',
        }}
      >
        Quit
      </button>
    </div>
  );
};