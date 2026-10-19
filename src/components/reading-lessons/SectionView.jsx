import React, { useState } from 'react';
import { MaterialIcon } from '../landing-page/icons';
import { SectionQuiz } from './SectionQuiz';

export const SectionView = ({
  section,
  index,
  totalSections,
  language,
  speakText,
  isMuted,
  submitted,
  answers,
  onAnswerChange,
  onSectionSubmit,
  onSectionGraded,
  sectionResult,
}) => {
  const [showTranslation, setShowTranslation] = useState(false);

  const handleWordClick = (word) => {
    if (isMuted) return;
    speakText?.(word);
  };

  return (
    <div
      className="nb-card nb-mb-lg"
      style={{ background: 'var(--nb-white)' }}
    >
      {/* Heading */}
      <div className="nb-flex nb-flex-between nb-flex-center nb-flex-wrap nb-mb-md">
        <h3 className="nb-heading nb-heading-md" style={{ margin: 0 }}>
          {section.heading}
        </h3>
        <div className="nb-flex nb-gap-sm nb-flex-center">
          <span className="nb-badge" style={{ background: 'var(--nb-cyan)' }}>
            Section {index + 1} of {totalSections}
          </span>
          {submitted && sectionResult && (
            <span className="nb-badge" style={{ background: 'var(--nb-lime)' }}>
              {sectionResult.correct}/{sectionResult.total} correct
            </span>
          )}
        </div>
      </div>

      {/* Academic content */}
      <div
        style={{
          fontFamily: 'var(--nb-font)',
          fontSize: '1.05rem',
          lineHeight: 1.7,
          whiteSpace: 'pre-wrap',
          marginBottom: 'var(--nb-space-md)',
        }}
      >
        {section.content}
      </div>
      {section.examples?.length > 0 && (
        <div className="nb-mb-md">
          <div className="nb-flex nb-flex-center nb-gap-sm nb-mb-sm" style={{ fontWeight: 700, fontSize: '0.875rem' }}>
            <MaterialIcon name="Translate" size={18} color="var(--nb-black)" />
            Examples
          </div>
          <div className="nb-flex nb-flex-col nb-gap-sm">
            {section.examples.map((ex, i) => (
              <div key={i} className="nb-card" style={{ background: 'var(--nb-gray)', padding: 'var(--nb-space-md)' }}>
                <p style={{ margin: 0, fontWeight: 600 }}>{ex.target}</p>
                <p className="nb-text-sm nb-text-muted" style={{ margin: '4px 0 0' }}>{ex.native}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Translation (collapsible) */}
      {section.translation && (
        <div className="nb-mb-md">
          <button
            className="nb-button"
            onClick={() => setShowTranslation((v) => !v)}
            style={{
              padding: 'var(--nb-space-xs) var(--nb-space-md)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.875rem',
            }}
          >
            <MaterialIcon
              name={showTranslation ? 'ExpandLess' : 'ExpandMore'}
              size={18}
              color="var(--nb-black)"
            />
            {showTranslation ? 'Hide translation' : 'Show translation'}
          </button>
          {showTranslation && (
            <div
              className="nb-card nb-mt-sm"
              style={{
                background: 'var(--nb-gray)',
                padding: 'var(--nb-space-md)',
                fontFamily: 'var(--nb-font)',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}
            >
              {section.translation}
            </div>
          )}
        </div>
      )}

      {/* Vocabulary */}
      {section.vocabulary?.length > 0 && (
        <div className="nb-mb-md">
          <div
            className="nb-flex nb-flex-center nb-gap-sm nb-mb-sm"
            style={{ fontWeight: 700, fontSize: '0.875rem' }}
          >
            <MaterialIcon name="Style" size={18} color="var(--nb-black)" />
            Key Terms
          </div>
          <div className="nb-flex nb-flex-wrap nb-gap-sm">
            {section.vocabulary.map((v, i) => (
              <button
                key={`${v.word}-${i}`}
                type="button"
                onClick={() => handleWordClick(v.word)}
                disabled={isMuted}
                title={isMuted ? 'Unmute to hear pronunciation' : 'Tap to hear'}
                style={{
                  padding: 'var(--nb-space-sm) var(--nb-space-md)',
                  background: 'var(--nb-yellow)',
                  border: 'var(--nb-border)',
                  boxShadow: 'var(--nb-shadow-sm)',
                  cursor: isMuted ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--nb-font)',
                  fontSize: '0.875rem',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                <span style={{ fontWeight: 700 }}>{v.word}</span>
                <span className="nb-text-xs nb-text-muted">
                  {v.translation}
                  {v.partOfSpeech ? ` · ${v.partOfSpeech}` : ''}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quiz */}
      <div
        style={{
          borderTop: '2px solid var(--nb-black)',
          paddingTop: 'var(--nb-space-md)',
        }}
      >
        <SectionQuiz
          section={section}
          answers={answers}
          onAnswerChange={onAnswerChange}
          submitted={submitted}
          onSubmit={() => onSectionSubmit?.(section.id)}
          onGraded={(result) => onSectionGraded?.(section.id, result)}
        />
      </div>
    </div>
  );
};