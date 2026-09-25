import React, { useState } from 'react';

export const QuizComponent = ({ quiz, onSubmit, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = quiz[currentIndex];
  const totalQuestions = quiz.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  const handleSelectOption = (option) => {
    setSelectedOption(option);
  };

  const handleCheck = () => {
    setShowExplanation(true);
  };

  const handleNext = () => {
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    const newAnswers = [...answers, {
      question: currentQuestion.question,
      selected: selectedOption,
      correct: isCorrect,
      correctAnswer: currentQuestion.correctAnswer,
      explanation: currentQuestion.explanation
    }];
    setAnswers(newAnswers);

    if (isCorrect) {
      setScore(score + 1);
    }

    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setCompleted(true);
      onSubmit(newAnswers);
    }
  };

  const getOptionStyle = (option) => {
    const baseStyle = {
      padding: 'var(--nb-space-md)',
      border: 'var(--nb-border)',
      cursor: showExplanation ? 'default' : 'pointer',
      fontFamily: 'var(--nb-font)',
      fontSize: '1rem',
      fontWeight: '500',
      textAlign: 'left',
      width: '100%',
      transition: 'all 0.1s ease'
    };

    if (!showExplanation) {
      if (selectedOption === option) {
        return { ...baseStyle, background: 'var(--nb-lime)', boxShadow: 'var(--nb-shadow-sm)' };
      }
      return { ...baseStyle, background: 'var(--nb-white)', boxShadow: 'var(--nb-shadow-sm)' };
    }

    if (option === currentQuestion.correctAnswer) {
      return { ...baseStyle, background: 'var(--nb-green)', color: 'var(--nb-white)' };
    }

    if (selectedOption === option && option !== currentQuestion.correctAnswer) {
      return { ...baseStyle, background: 'var(--nb-red)', color: 'var(--nb-white)' };
    }

    return { ...baseStyle, background: 'var(--nb-white)', opacity: 0.5 };
  };

  if (completed) {
    const finalScore = Math.round((score / totalQuestions) * 100);
    return (
      <div className="nb-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="nb-text-center nb-mb-lg">
          <div style={{ fontSize: '4rem', marginBottom: 'var(--nb-space-md)' }}>🏆</div>
          <h2 className="nb-heading nb-heading-lg">Quiz Complete!</h2>
        </div>

        <div className="nb-text-center nb-mb-lg">
          <div style={{ fontSize: '3rem', fontWeight: '700', color: 'var(--nb-green)' }}>
            {score}/{totalQuestions}
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>{finalScore}%</div>
        </div>

        <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: 'var(--nb-space-lg)' }}>
          <h3 className="nb-heading nb-heading-sm nb-mb-md">Review Answers:</h3>
          {answers.map((answer, index) => (
            <div key={index} className="nb-card nb-mb-sm" style={{
              padding: 'var(--nb-space-md)',
              background: answer.correct ? 'var(--nb-lime)' : 'var(--nb-red)',
              color: answer.correct ? 'var(--nb-black)' : 'var(--nb-white)'
            }}>
              <div style={{ display: 'flex', gap: 'var(--nb-space-sm)', alignItems: 'flex-start' }}>
                <span>{answer.correct ? '✓' : '✕'}</span>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                    {index + 1}. {answer.question}
                  </div>
                  {!answer.correct && (
                    <div style={{ fontSize: '0.75rem', marginTop: 'var(--nb-space-xs)' }}>
                      {answer.explanation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          className="nb-button nb-button-primary nb-button-full"
          onClick={() => onComplete(score, totalQuestions, answers)}
        >
          Continue Learning
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* Progress */}
      <div className="nb-mb-lg">
        <div style={{
          height: '12px',
          background: 'var(--nb-white)',
          border: '2px solid var(--nb-black)',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'var(--nb-lime)',
            transition: 'width 0.3s ease'
          }} />
        </div>
        <p className="nb-text-sm nb-text-center nb-mt-sm">
          Question {currentIndex + 1} of {totalQuestions}
        </p>
      </div>

      {/* Question */}
      <div className="nb-card nb-mb-lg" style={{ background: 'var(--nb-white)' }}>
        <h3 className="nb-heading nb-heading-md nb-text-center">
          {currentQuestion.question}
        </h3>
      </div>

      {/* Options */}
      <div className="nb-flex nb-flex-col nb-gap-md nb-mb-lg">
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            onClick={() => !showExplanation && handleSelectOption(option)}
            disabled={showExplanation}
            style={getOptionStyle(option)}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Explanation */}
      {showExplanation && (
        <div className="nb-card nb-mb-lg" style={{ background: 'var(--nb-cyan)' }}>
          <div className="nb-heading nb-heading-sm nb-mb-sm">Explanation:</div>
          <p className="nb-text">{currentQuestion.explanation}</p>
        </div>
      )}

      {/* Actions */}
      <div className="nb-flex nb-gap-md">
        {!showExplanation && selectedOption && (
          <button className="nb-button nb-button-secondary nb-button-full" onClick={handleCheck}>
            Check Answer
          </button>
        )}

        {showExplanation && (
          <button className="nb-button nb-button-primary nb-button-full" onClick={handleNext}>
            {currentIndex + 1 === totalQuestions ? 'Finish Quiz' : 'Next Question →'}
          </button>
        )}
      </div>
    </div>
  );
};