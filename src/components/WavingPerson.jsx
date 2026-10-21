import React, { useEffect, useMemo, useState } from 'react';
import './WavingPerson.css';

/**
 * The random "hello" words. Kept local to this component on purpose.
 * Add or remove entries freely; the picker re-rolls once per mount.
 */
const HELLO_WORDS = [
  { text: 'Hello', lang: 'en' },
  { text: 'Hola', lang: 'es' },
  { text: 'Bonjour', lang: 'fr' },
  { text: 'Hallo', lang: 'de' },
  { text: 'Ciao', lang: 'it' },
  { text: 'Olá', lang: 'pt' },
  { text: 'こんにちは', lang: 'ja' },
  { text: '안녕하세요', lang: 'ko' },
  { text: '你好', lang: 'zh' },
  { text: 'مرحبا', lang: 'ar' },
  { text: 'नमस्ते', lang: 'hi' },
  { text: 'Привет', lang: 'ru' },
];

/**
 * Animated waving character.
 *
 * Props:
 *   transparent (default false)
 *     When true, the component drops its dark gradient background and
 *     the three decorative blurred circles. Use this when embedding
 *     the character in a page that already provides its own surface
 *     (e.g. the landing-page hero). The splash screen leaves this
 *     false so it keeps the full animated backdrop.
 */
const WavingPerson = ({ transparent = false }) => {
  // Picked once per mount so the greeting doesn't change mid-animation.
  const greeting = useMemo(
    () => HELLO_WORDS[Math.floor(Math.random() * HELLO_WORDS.length)],
    []
  );

  // Entry stages: 'idle' -> 'text-in' -> 'person-in'
  const [entryStage, setEntryStage] = useState('idle');

  const [waveOffset, setWaveOffset] = useState(0); // left arm
  const [bodyOffset, setBodyOffset] = useState(0); // upper body sway

  /* ---------- Staged entrance ---------- */
  useEffect(() => {
    const t1 = setTimeout(() => setEntryStage('text-in'), 60);
    const t2 = setTimeout(() => setEntryStage('person-in'), 900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  /* ---------- Continuous wave + sway ---------- */
  useEffect(() => {
    let animationFrame;
    const startTime = performance.now();

    const animateWave = (time) => {
      const elapsed = (time - startTime) / 1000;

      // Left arm waves faster, like a hand waving "hello".
      const armWave = Math.sin(elapsed * 15) * 16;
      const armSubtle = Math.sin(elapsed * 6.8) * 3;
      setWaveOffset(armWave + armSubtle);

      // Upper body sways slower and smaller. Legs are not in this
      // layer, so they stay planted.
      const bodySway = Math.sin(elapsed * 4) * 3.5;
      const bodyBob = Math.sin(elapsed * 4) * 1.2;
      setBodyOffset(bodySway + bodyBob);

      animationFrame = requestAnimationFrame(animateWave);
    };

    animationFrame = requestAnimationFrame(animateWave);

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const rootClass = [
    'waving-scene',
    entryStage,
    transparent ? 'waving-scene--transparent' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      {/* Decorative blurs are part of the full-screen splash only. */}
      {!transparent && (
        <>
          <div className="bg-circle bg-circle-1" />
          <div className="bg-circle bg-circle-2" />
          <div className="bg-circle bg-circle-3" />
        </>
      )}

      <div className="content-wrapper">
        <h1
          className="greeting-text"
          lang={greeting.lang}
          aria-label="Hello"
        >
          <span className="greeting-word">{greeting.text}</span>
          <span className="greeting-exclaim">!</span>
        </h1>

        <div className="character-container">
          <div className="character">
            {/* Lower body: legs only, static. */}
            <div className="character-lower">
              <div className="legs-layer">
                <img
                  src="/images/h3110/leg-left.svg"
                  alt="left leg"
                  className="body-part leg leg-left"
                  draggable={false}
                />
                <img
                  src="/images/h3110/leg-right.svg"
                  alt="right leg"
                  className="body-part leg leg-right"
                  draggable={false}
                />
              </div>
            </div>

            {/* Upper body: torso, arms, head. This is the layer that
                sways; pivot at the hips (see .character-upper in CSS). */}
            <div
              className="character-upper"
              style={{ transform: `rotate(${bodyOffset}deg)` }}
            >
              <div className="torso-layer">
                <img
                  src="/images/h3110/torso.svg"
                  alt="torso"
                  className="body-part torso"
                  draggable={false}
                />
              </div>

              <div className="arm-layer arm-right-layer">
                <img
                  src="/images/h3110/arm-right.svg"
                  alt="right arm"
                  className="body-part arm arm-right"
                  draggable={false}
                />
              </div>

              <div
                className="arm-layer arm-left-layer waving-arm"
                style={{
                  transform: `scaleY(-1) rotate(${waveOffset + 300}deg)`,
                }}
              >
                <img
                  src="/images/h3110/arm-left.svg"
                  alt="left arm waving"
                  className="body-part arm arm-left"
                  draggable={false}
                />
              </div>

              <div className="head-layer">
                <img
                  src="/images/h3110/head.svg"
                  alt="head"
                  className="body-part head"
                  draggable={false}
                />

                <div className="face-features">
                  <img
                    src="/images/h3110/eyes.png"
                    alt="eyes"
                    className="body-part eyes"
                    draggable={false}
                  />
                  <img
                    src="/images/h3110/mouth.svg"
                    alt="mouth"
                    className="body-part mouth"
                    draggable={false}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Soft contact shadow under the feet */}
          <div className="character-shadow" />
        </div>
      </div>
    </div>
  );
};

export default WavingPerson;