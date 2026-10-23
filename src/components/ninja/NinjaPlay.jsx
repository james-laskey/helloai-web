import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  STARTING_LIVES,
  SCORE_CORRECT,
  COMBO_BONUS,
} from './constants';

const GROUND_Y_OFFSET = 80;
const WORD_PADDING_X = 28;
const WORD_FONT = '700 28px system-ui, sans-serif';

/* ---------- Tunables ---------- */

const SPAWN_GAP_MS = 1400;

/* Slower descent than before (was 550). Rise stays fast so the throw
   reads as snappy, and the return to the ground is gentle. */
const GRAVITY_UP   = 2000;  // px / s²
const GRAVITY_DOWN =  380;  // px / s²

const MIN_APEX_HEIGHT = 0.35;
const MAX_APEX_HEIGHT = 0.85;

const FLASH_HOLD_MS = 1100;
const FLASH_FADE_MS = 300;

export const NinjaPlay = ({
  questions,
  language,
  timerSeconds,
  onComplete,
  onExit,
  backgroundImage = '/images/ninja/bg.png',
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
    groundY: 0,
    lives: STARTING_LIVES,
    score: 0,
    combo: 0,
    correctCount: 0,
    wrongCount: 0,
    missCount: 0,
    lastFrameTime: 0,
    startTime: 0,
    rafId: null,
    spawnTimers: [],
    flashTimers: [],
    roundReady: false,
    advancing: false,
    bgImage: null,
    bgReady: false,
  });

  const [hud, setHud] = useState({
    lives: STARTING_LIVES,
    score: 0,
    combo: 0,
    questionIndex: 0,
    total: 0,
    hint: '',
    topic: '',
    phase: 'playing',
    flash: null,
    flashOpacity: 0,
  });

  /* ---------- Background image ---------- */

  useEffect(() => {
    const s = stateRef.current;
    if (!backgroundImage) {
      s.bgImage = null;
      s.bgReady = false;
      return;
    }
    const img = new Image();
    img.onload = () => {
      s.bgImage = img;
      s.bgReady = true;
    };
    img.onerror = () => {
      s.bgImage = null;
      s.bgReady = false;
      console.warn(`NinjaPlay: could not load background "${backgroundImage}"`);
    };
    img.src = backgroundImage;
  }, [backgroundImage]);

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
    stateRef.current.groundY = h - GROUND_Y_OFFSET;
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

  const drawBackground = (ctx) => {
    const s = stateRef.current;
    const { canvasW, canvasH } = s;

    if (s.bgReady && s.bgImage) {
      const img = s.bgImage;
      const scale = Math.max(canvasW / img.width, canvasH / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = (canvasW - dw) / 2;
      const dy = (canvasH - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fillRect(0, 0, canvasW, canvasH);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, canvasH);
      grad.addColorStop(0, '#0a0a1a');
      grad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvasW, canvasH);
    }
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

  /* ---------- Question flash ---------- */

  const showQuestionFlash = (hint, topic, onDone) => {
    const s = stateRef.current;

    s.flashTimers.forEach((id) => clearTimeout(id));
    s.flashTimers = [];

    setHud((prev) => ({
      ...prev,
      hint,
      topic,
      flash: 'fade-in',
      flashOpacity: 0,
    }));

    requestAnimationFrame(() => {
      setHud((prev) => ({ ...prev, flashOpacity: 1 }));
    });

    const holdTimer = setTimeout(() => {
      setHud((prev) => ({ ...prev, flash: 'fade-out', flashOpacity: 0 }));

      const endTimer = setTimeout(() => {
        setHud((prev) => ({ ...prev, flash: null, flashOpacity: 0 }));
        s.flashTimers = [];
        onDone?.();
      }, FLASH_FADE_MS);

      s.flashTimers.push(endTimer);
    }, FLASH_FADE_MS + FLASH_HOLD_MS);

    s.flashTimers.push(holdTimer);
  };

  /* ---------- Spawn ---------- */

  const spawnQuestion = (qIndex) => {
    const s = stateRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const q = s.questions[qIndex];
    if (!q) return;

    s.advancing = false;
    s.roundReady = false;

    const items = [
      { text: q.correctWord, correct: true },
      ...q.decoys.map((d) => ({ text: d, correct: false })),
    ].sort(() => Math.random() - 0.5);

    const lanes = items.length;
    const laneWidth = s.canvasW / (lanes + 1);
    const groundY = s.groundY;

    const spawn = () => {
      if (!s.running || s.questionIndex !== qIndex) return;

      s.roundReady = true;

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

          const apexFraction =
            MIN_APEX_HEIGHT +
            Math.random() * (MAX_APEX_HEIGHT - MIN_APEX_HEIGHT);
          const maxRise = groundY - measured.height / 2;
          const apexY = Math.max(
            measured.height / 2 + 40,
            maxRise - maxRise * apexFraction
          );
          const riseDistance = groundY - apexY;

          const vy0 = -Math.sqrt(2 * GRAVITY_UP * riseDistance);
          const vx = (Math.random() - 0.5) * 30;

          s.words.push({
            text: item.text,
            correct: item.correct,
            x,
            baseX: x,
            y: groundY,
            w: measured.width,
            h: measured.height,
            vx,
            vy: vy0,
            color: '#7dd3fc',
            alpha: 1,
            resolved: false,
            wobblePhase: Math.random() * Math.PI * 2,
            spawnTime: performance.now(),
          });
        }, i * SPAWN_GAP_MS);

        s.spawnTimers.push(timer);
      });
    };

    setHud((prev) => ({
      ...prev,
      questionIndex: qIndex,
      total: s.questions.length,
    }));

    showQuestionFlash(q.hint, q.topic, spawn);
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
    if (word.resolved) return;

    if (word.correct) {
      word.resolved = true;
      word.color = '#53C691';
      s.score += SCORE_CORRECT + s.combo * COMBO_BONUS;
      s.combo += 1;
      s.correctCount += 1;

      word.fadeOut = 300;
      word.fadeOutStartedAt = performance.now();

      setHud((prev) => ({
        ...prev,
        score: s.score,
        combo: s.combo,
      }));

      endQuestionAndAdvance(500);
      return;
    }

    word.resolved = true;
    word.color = '#ff4757';
    s.combo = 0;
    s.wrongCount += 1;
    s.lives = Math.max(0, s.lives - 1);

    word.fadeOut = 300;
    word.fadeOutStartedAt = performance.now();

    setHud((prev) => ({
      ...prev,
      score: s.score,
      combo: s.combo,
      lives: s.lives,
    }));

    if (s.lives <= 0) {
      endGame(false);
      return;
    }

    maybeAdvanceIfAllResolved();
  };

  /* ---------- Transitions ---------- */

  const maybeAdvanceIfAllResolved = () => {
    const s = stateRef.current;
    if (!s.running || s.advancing) return;
    if (!s.roundReady) return;
    if (s.words.length === 0) return;
    if (s.words.some((w) => !w.resolved)) return;
    endQuestionAndAdvance(500);
  };

  const endQuestionAndAdvance = (delayMs) => {
    const s = stateRef.current;
    if (!s.running || s.advancing) return;
    s.advancing = true;
    s.roundReady = false;

    setTimeout(() => {
      if (!s.running) return;
      s.words = [];
      advanceQuestion();
    }, delayMs);
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
    s.flashTimers.forEach((id) => clearTimeout(id));
    s.flashTimers = [];
    if (s.rafId) cancelAnimationFrame(s.rafId);
    s.rafId = null;

    setHud((prev) => ({
      ...prev,
      lives: s.lives,
      score: s.score,
      combo: s.combo,
      phase: completed ? 'complete' : 'game-over',
      flash: null,
      flashOpacity: 0,
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
    const dt = Math.min(0.05, (now - (s.lastFrameTime || now)) / 1000);
    s.lastFrameTime = now;

    ctx.clearRect(0, 0, s.canvasW, s.canvasH);
    drawBackground(ctx);

    const groundY = s.groundY;
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

    let justResolvedSomething = false;

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

      const g = w.vy < 0 ? GRAVITY_UP : GRAVITY_DOWN;
      w.vy += g * dt;
      w.y += w.vy * dt;
      w.baseX += w.vx * dt;

      w.x = w.baseX + Math.sin(now * 0.0015 + w.wobblePhase) * 4;

      const minX = w.w / 2 + 8;
      const maxX = s.canvasW - w.w / 2 - 8;
      if (w.x < minX) { w.x = minX; w.baseX = minX; w.vx = Math.abs(w.vx); }
      if (w.x > maxX) { w.x = maxX; w.baseX = maxX; w.vx = -Math.abs(w.vx); }

      const bottomEdge = w.y + w.h / 2;
      if (bottomEdge >= groundY && w.vy > 0 && !w.resolved) {
        w.resolved = true;
        justResolvedSomething = true;
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
        w.y = groundY - w.h / 2;
        w.fadeOut = 250;
        w.fadeOutStartedAt = now;
        w.alpha = 1;
        w.color = w.correct ? '#ef4444' : '#64748b';
        drawWord(ctx, w);
        continue;
      }

      drawWord(ctx, w);
    }

    if (justResolvedSomething) {
      maybeAdvanceIfAllResolved();
    }

    s.rafId = requestAnimationFrame(loop);
  }, []);

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
    s.roundReady = false;
    s.words = [];
    s.spawnTimers.forEach((id) => clearTimeout(id));
    s.spawnTimers = [];
    s.flashTimers.forEach((id) => clearTimeout(id));
    s.flashTimers = [];
    s.startTime = performance.now();
    s.lastFrameTime = performance.now();

    resize();
    spawnQuestion(0);
    s.rafId = requestAnimationFrame(loop);

    return () => {
      s.running = false;
      s.spawnTimers.forEach((id) => clearTimeout(id));
      s.flashTimers.forEach((id) => clearTimeout(id));
      if (s.rafId) cancelAnimationFrame(s.rafId);
    };
  }, [questions, resize, loop]);

  /* ---------- Render ---------- */

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        /* Fill the parent — the parent decides the height. */
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

      {/* HUD: topic/hint card */}
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

      {/* HUD: lives, score, combo */}
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
      </div>

      {/* Question flash — top center, momentarily before each round */}
      {hud.flash && (
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.78)',
            border: '2px solid #7dd3fc',
            borderRadius: 14,
            padding: '14px 22px',
            color: 'white',
            fontFamily: 'var(--nb-font)',
            textAlign: 'center',
            maxWidth: 'min(560px, 80vw)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.45)',
            pointerEvents: 'none',
            opacity: hud.flashOpacity,
            transition: `opacity ${FLASH_FADE_MS}ms ease`,
          }}
        >
          <div
            style={{
              fontSize: 12,
              letterSpacing: 2,
              color: '#7dd3fc',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            {hud.topic || 'Question'}
          </div>
          <div style={{ fontSize: 20, lineHeight: 1.35 }}>{hud.hint}</div>
        </div>
      )}

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