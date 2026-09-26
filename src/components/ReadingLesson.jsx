import React, { useState, useEffect } from 'react';
import { MaterialIcon } from '../components/landing-page/icons';

/* =========================================================
   Wrapper — shows setup first, then the lesson
   ========================================================= */

export const ReadingLesson = ({
  lesson,
  language,
  speakText,
  stopSpeaking,
  isSpeaking,
  isMuted,
  onToggleMute,
  activeSentenceIndex,
  setActiveSentenceIndex,
  onComplete,
  onStart, // called with { questionCount, difficulty } when user confirms
  isGenerating, // true while backend is fetching a lesson
  generationError,
  onRetry,
}) => {
  const [started, setStarted] = useState(false);
  const [config, setConfig] = useState({
    questionCount: 4,
    difficulty: 'adaptive',
  });

  // If a lesson arrives, hide the setup screen
  useEffect(() => {
    if (lesson) setStarted(true);
  }, [lesson]);

  // Reset when parent clears the lesson (e.g., starting over)
  useEffect(() => {
    if (!lesson && !isGenerating) {
      setStarted(false);
    }
  }, [lesson, isGenerating]);

  const handleConfirm = () => {
    setStarted(true);
    onStart?.(config);
  };

  if (!started) {
    return (
      <ReadingLessonSetup
        language={language}
        config={config}
        setConfig={setConfig}
        onConfirm={handleConfirm}
        isGenerating={isGenerating}
        generationError={generationError}
        onRetry={onRetry}
      />
    );
  }

  if (isGenerating) {
    return (
      <div
        className="nb-flex nb-flex-center"
        style={{ minHeight: '400px', flexDirection: 'column' }}
      >
        <div className="nb-spinner" />
        <p className="nb-mt-md">Generating your reading lesson...</p>
        <p className="nb-text-sm nb-text-muted">
          {config.questionCount} questions · {config.difficulty}
        </p>
      </div>
    );
  }

  if (generationError) {
    return (
      <div className="nb-card nb-text-center" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h3 className="nb-heading nb-heading-md nb-mb-sm">
          Something went wrong
        </h3>
        <p className="nb-text nb-text-muted nb-mb-lg">{generationError}</p>
        <div className="nb-flex nb-gap-sm nb-flex-center">
          <button className="nb-button" onClick={() => setStarted(false)}>
            Change Settings
          </button>
          {onRetry && (
            <button className="nb-button nb-button-primary" onClick={onRetry}>
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!lesson) return null;

  return (
    <ReadingLessonPlayer
      lesson={lesson}
      language={language}
      speakText={speakText}
      stopSpeaking={stopSpeaking}
      isSpeaking={isSpeaking}
      isMuted={isMuted}
      onToggleMute={onToggleMute}
      activeSentenceIndex={activeSentenceIndex}
      setActiveSentenceIndex={setActiveSentenceIndex}
      onComplete={onComplete}
    />
  );
};

/* =========================================================
   Setup screen — question count + difficulty
   ========================================================= */

const QUESTION_COUNT_OPTIONS = [3, 4, 5, 6, 8, 10];

const DIFFICULTY_OPTIONS = [
  {
    value: 'easy',
    label: 'Easy',
    description: 'Simple sentences, common words',
    color: 'var(--nb-lime)',
  },
  {
    value: 'medium',
    label: 'Medium',
    description: 'Everyday conversation level',
    color: 'var(--nb-yellow)',
  },
  {
    value: 'hard',
    label: 'Hard',
    description: 'Richer vocabulary, longer sentences',
    color: 'var(--nb-orange)',
  },
  {
    value: 'adaptive',
    label: 'Adaptive',
    description: 'Matches your saved proficiency level',
    color: 'var(--nb-cyan)',
  },
];

const ReadingLessonSetup = ({
  language,
  config,
  setConfig,
  onConfirm,
  isGenerating,
  generationError,
  onRetry,
}) => {
  return (
    <div
      className="nb-card"
      style={{ maxWidth: '640px', margin: '0 auto', background: 'var(--nb-white)' }}
    >
      <div className="nb-flex nb-flex-center nb-gap-sm nb-mb-md">
        <MaterialIcon name="MenuBook" size={28} color="var(--nb-black)" />
        <h2 className="nb-heading nb-heading-md" style={{ margin: 0 }}>
          Reading Lesson
        </h2>
      </div>

      <p className="nb-text nb-text-muted nb-mb-lg">
        Choose how many questions you want and how difficult the lesson should
        be. The AI will build a custom passage for {language}.
      </p>

      {/* Question count */}
      <div className="nb-mb-lg">
        <label className="nb-label">Number of questions</label>
        <div className="nb-flex nb-gap-sm nb-flex-wrap">
          {QUESTION_COUNT_OPTIONS.map((n) => {
            const selected = config.questionCount === n;
            return (
              <button
                key={n}
                onClick={() =>
                  setConfig((c) => ({ ...c, questionCount: n }))
                }
                className="nb-button"
                style={{
                  minWidth: '56px',
                  padding: 'var(--nb-space-sm) var(--nb-space-md)',
                  background: selected ? 'var(--nb-lime)' : 'var(--nb-white)',
                  boxShadow: selected ? 'var(--nb-shadow-hover)' : 'var(--nb-shadow-sm)',
                  fontWeight: 700,
                }}
              >
                {n}
              </button>
            );
          })}
        </div>
      </div>

      {/* Difficulty */}
      <div className="nb-mb-lg">
        <label className="nb-label">Difficulty</label>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 'var(--nb-space-sm)',
          }}
        >
          {DIFFICULTY_OPTIONS.map((option) => {
            const selected = config.difficulty === option.value;
            return (
              <button
                key={option.value}
                onClick={() =>
                  setConfig((c) => ({ ...c, difficulty: option.value }))
                }
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '4px',
                  padding: 'var(--nb-space-md)',
                  background: selected ? option.color : 'var(--nb-white)',
                  border: 'var(--nb-border)',
                  boxShadow: selected
                    ? 'var(--nb-shadow-hover)'
                    : 'var(--nb-shadow-sm)',
                  cursor: 'pointer',
                  fontFamily: 'var(--nb-font)',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontWeight: 700 }}>{option.label}</span>
                <span className="nb-text-xs nb-text-muted">
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {generationError && (
        <div
          className="nb-card nb-mb-md"
          style={{
            background: 'var(--nb-red)',
            color: 'var(--nb-white)',
            padding: 'var(--nb-space-md)',
          }}
        >
          <p style={{ margin: 0, fontWeight: 600 }}>{generationError}</p>
        </div>
      )}

      <div className="nb-flex nb-gap-sm">
        <button
          className="nb-button nb-button-primary nb-button-full"
          onClick={onConfirm}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <span className="nb-flex nb-flex-center nb-gap-sm">
              <span
                className="nb-spinner"
                style={{ width: 18, height: 18, borderWidth: 2 }}
              />
              Generating...
            </span>
          ) : (
            <>
              <MaterialIcon name="PlayArrow" size={20} color="var(--nb-white)" />
              Start Lesson
            </>
          )}
        </button>
        {generationError && onRetry && (
          <button className="nb-button" onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

/* =========================================================
   Player — the actual lesson renderer
   ========================================================= */

const ReadingLessonPlayer = ({
  lesson,
  language,
  speakText,
  stopSpeaking,
  isSpeaking,
  isMuted,
  onToggleMute,
  activeSentenceIndex,
  setActiveSentenceIndex,
  onComplete,
}) => {
  const [playingAll, setPlayingAll] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const sentences = lesson?.passage || [];
  const vocabulary = lesson?.vocabulary || [];
  const questions = lesson?.questions || [];

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

  /* ---------- Playback ---------- */

  const playSentence = (index) => {
    if (isMuted) return;
    const sentence = sentences[index];
    if (!sentence) return;

    setActiveSentenceIndex(index);
    setPlayingAll(false);

    speakText(sentence.text, {
      onEnd: () => setActiveSentenceIndex(null),
    });
  };

  const playAll = async () => {
    if (isMuted || sentences.length === 0) return;
    setPlayingAll(true);

    for (let i = 0; i < sentences.length; i++) {
      setActiveSentenceIndex(i);
      await new Promise((resolve) => {
        speakText(sentences[i].text, {
          onEnd: resolve,
          onError: resolve,
        });
      });
    }

    setActiveSentenceIndex(null);
    setPlayingAll(false);
  };

  const stopAll = () => {
    stopSpeaking();
    setPlayingAll(false);
    setActiveSentenceIndex(null);
  };

  /* ---------- Quiz ---------- */

  const handleSelectAnswer = (qIndex, option) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const handleSubmitQuiz = () => {
    if (submitted) return;

    let correctCount = 0;
    const detailedAnswers = questions.map((q, i) => {
      const selected = answers[i];
      const isCorrect = selected === q.correctAnswer;
      if (isCorrect) correctCount += 1;
      return {
        questionIndex: i,
        question: q.question,
        selected,
        correctAnswer: q.correctAnswer,
        isCorrect,
      };
    });

    setSubmitted(true);

    onComplete?.({
      answers: detailedAnswers,
      correctCount,
      totalQuestions: questions.length,
    });
  };

  const allAnswered =
    questions.length > 0 && questions.every((_, i) => answers[i]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--nb-space-lg)',
      }}
    >
      {/* Header */}
      <div className="nb-card" style={{ background: 'var(--nb-white)' }}>
        <div className="nb-flex nb-flex-between nb-flex-center nb-flex-wrap nb-gap-sm">
          <div>
            <div
              className="nb-badge nb-mb-sm"
              style={{ background: 'var(--nb-lime)' }}
            >
              {lesson.level || 'Lesson'}
            </div>
            <h2 className="nb-heading nb-heading-md" style={{ margin: 0 }}>
              {lesson.title}
            </h2>
            <p
              className="nb-text-sm nb-text-muted nb-mt-xs"
              style={{ margin: 0 }}
            >
              {language} · {sentences.length} sentences · {vocabulary.length}{' '}
              words · {questions.length} questions
            </p>
          </div>

          <div className="nb-flex nb-gap-sm">
            <button
              className={`nb-button ${
                playingAll ? 'nb-button-danger' : 'nb-button-primary'
              }`}
              onClick={playingAll ? stopAll : playAll}
              disabled={isMuted}
            >
              <MaterialIcon
                name={playingAll ? 'Stop' : 'PlayArrow'}
                size={20}
                color="var(--nb-white)"
              />
              {playingAll ? 'Stop' : 'Play All'}
            </button>
            <button
              className="nb-button"
              onClick={onToggleMute}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              <MaterialIcon
                name={isMuted ? 'VolumeOff' : 'VolumeUp'}
                size={20}
                color="var(--nb-black)"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Passage */}
      <div className="nb-card" style={{ background: 'var(--nb-white)' }}>
        <h3 className="nb-heading nb-heading-sm nb-mb-md">
          <MaterialIcon name="MenuBook" size={20} color="var(--nb-black)" />{' '}
          Read Along
        </h3>

        <div className="nb-flex nb-flex-col nb-gap-sm">
          {sentences.map((sentence, index) => {
            const isActive = activeSentenceIndex === index;
            return (
              <button
                key={index}
                onClick={() => playSentence(index)}
                disabled={isMuted}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--nb-space-md)',
                  padding: 'var(--nb-space-md)',
                  background: isActive ? 'var(--nb-yellow)' : 'var(--nb-gray)',
                  border: 'var(--nb-border)',
                  boxShadow: isActive ? 'var(--nb-shadow-sm)' : 'none',
                  cursor: isMuted ? 'not-allowed' : 'pointer',
                  textAlign: 'left',
                  fontFamily: 'var(--nb-font)',
                  transition: 'background 0.15s ease',
                }}
              >
                <MaterialIcon
                  name={isActive ? 'VolumeUp' : 'PlayCircle'}
                  size={22}
                  color="var(--nb-black)"
                />
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      lineHeight: 1.4,
                    }}
                  >
                    {sentence.text}
                  </p>
                  {sentence.translation && (
                    <p
                      className="nb-text-sm nb-text-muted"
                      style={{ margin: '4px 0 0' }}
                    >
                      {sentence.translation}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Vocabulary */}
      {vocabulary.length > 0 && (
        <div className="nb-card" style={{ background: 'var(--nb-white)' }}>
          <h3 className="nb-heading nb-heading-sm nb-mb-md">
            <MaterialIcon name="Style" size={20} color="var(--nb-black)" />{' '}
            Key Vocabulary
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 'var(--nb-space-md)',
            }}
          >
            {vocabulary.map((vocab, index) => (
              <div
                key={index}
                className="nb-flex nb-flex-between nb-flex-center"
                style={{
                  padding: 'var(--nb-space-md)',
                  background: 'var(--nb-cyan)',
                  border: 'var(--nb-border)',
                  boxShadow: 'var(--nb-shadow-sm)',
                  gap: 'var(--nb-space-sm)',
                }}
              >
                <div>
                  <p style={{ margin: 0, fontWeight: 700 }}>{vocab.word}</p>
                  <p
                    className="nb-text-sm"
                    style={{ margin: 0, opacity: 0.75 }}
                  >
                    {vocab.translation}
                  </p>
                </div>
                <button
                  className="nb-button"
                  style={{ padding: '6px 10px' }}
                  onClick={() =>
                    speakText(vocab.word, {
                      onStart: () => setActiveSentenceIndex('vocab-' + index),
                      onEnd: () => setActiveSentenceIndex(null),
                    })
                  }
                  disabled={isMuted}
                  aria-label={`Play ${vocab.word}`}
                >
                  <MaterialIcon
                    name="VolumeUp"
                    size={18}
                    color="var(--nb-black)"
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comprehension */}
      {questions.length > 0 && (
        <div className="nb-card" style={{ background: 'var(--nb-white)' }}>
          <h3 className="nb-heading nb-heading-sm nb-mb-md">
            <MaterialIcon name="Quiz" size={20} color="var(--nb-black)" />{' '}
            Check Your Understanding
          </h3>

          <div className="nb-flex nb-flex-col nb-gap-lg">
            {questions.map((q, qIndex) => (
              <div key={qIndex}>
                <p
                  style={{
                    fontWeight: 700,
                    marginBottom: 'var(--nb-space-sm)',
                  }}
                >
                  {qIndex + 1}. {q.question}
                </p>

                <div className="nb-flex nb-flex-col nb-gap-sm">
                  {q.options.map((option) => {
                    const selected = answers[qIndex] === option;
                    const isCorrect = option === q.correctAnswer;

                    let bg = 'var(--nb-white)';
                    if (submitted) {
                      if (isCorrect) bg = 'var(--nb-lime)';
                      else if (selected) bg = 'var(--nb-red)';
                    } else if (selected) {
                      bg = 'var(--nb-yellow)';
                    }

                    return (
                      <button
                        key={option}
                        onClick={() => handleSelectAnswer(qIndex, option)}
                        disabled={submitted}
                        style={{
                          padding: 'var(--nb-space-md)',
                          background: bg,
                          border: 'var(--nb-border)',
                          boxShadow: selected ? 'var(--nb-shadow-sm)' : 'none',
                          cursor: submitted ? 'default' : 'pointer',
                          textAlign: 'left',
                          fontFamily: 'var(--nb-font)',
                          fontSize: '1rem',
                          color:
                            submitted && selected && !isCorrect
                              ? 'var(--nb-white)'
                              : 'inherit',
                        }}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                {submitted && (
                  <div
                    style={{
                      marginTop: 'var(--nb-space-sm)',
                      padding: 'var(--nb-space-sm)',
                      borderLeft: '4px solid var(--nb-black)',
                      background: 'var(--nb-gray)',
                    }}
                  >
                    <p className="nb-text-sm" style={{ margin: 0 }}>
                      <strong>Why:</strong> {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="nb-flex nb-gap-sm nb-mt-lg">
            {!submitted ? (
              <button
                className="nb-button nb-button-primary nb-button-full"
                onClick={handleSubmitQuiz}
                disabled={!allAnswered}
              >
                Submit Answers
              </button>
            ) : (
              <button
                className="nb-button nb-button-success nb-button-full"
                onClick={handleSubmitQuiz}
              >
                Continue
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};