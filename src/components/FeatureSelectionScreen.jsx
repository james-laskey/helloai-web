import React from 'react';
import { MaterialIcon } from './landing-page/icons';

const FEATURES = [
  {
    id: 'reading',
    label: 'Reading Lesson',
    description: 'Read along with audio and answer comprehension questions',
    icon: 'MenuBook',
    color: 'var(--nb-yellow)',
  },
  {
    id: 'flashcards',
    label: 'Flashcards',
    description: 'Drill vocabulary with tap-to-flip cards',
    icon: 'Style',
    color: 'var(--nb-cyan)',
  },
  {
    id: 'quiz',
    label: 'Quiz',
    description: 'Test your knowledge with multiple-choice questions',
    icon: 'Quiz',
    color: 'var(--nb-orange)',
  },
  {
    id: 'crossword',
    label: 'Crossword Puzzle',
    description: 'Fill in a themed grid of characters or words',
    icon: 'GridView',
    color: 'var(--nb-lime)',
  },
];

export const FeatureSelectionScreen = ({
  topic,
  language,
  onSelectFeature,
  onBack,
  showStats,
  onToggleStats,
  userStats,
  onFetchStats,
}) => {
  return (
    <div className="nb-container" style={{ background: 'var(--nb-purple)' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--nb-space-md) var(--nb-space-lg)',
          background: 'var(--nb-white)',
          borderBottom: 'var(--nb-border)',
        }}
      >
        <button
          onClick={onBack}
          className="nb-button"
          style={{
            padding: 'var(--nb-space-sm) var(--nb-space-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <MaterialIcon name="ArrowBack" size={18} color="var(--nb-black)" />
          Topics
        </button>
        <h1 className="nb-heading nb-heading-md" style={{ margin: 0 }}>
          {topic.name}
        </h1>
        <div style={{ width: '100px' }} />
      </div>

      {/* Topic header */}
      <div
        style={{
          padding: 'var(--nb-space-xl) var(--nb-space-lg)',
          textAlign: 'center',
          background: 'var(--nb-yellow)',
          borderBottom: 'var(--nb-border)',
        }}
      >
        <div className="nb-badge nb-mb-sm" style={{ background: 'var(--nb-white)' }}>
          {topic.concept || 'Grammar'}
        </div>
        <h2
          className="nb-heading nb-heading-xl"
          style={{ margin: 0, marginBottom: 'var(--nb-space-sm)' }}
        >
          {topic.name}
        </h2>
        <p className="nb-text nb-text-muted" style={{ maxWidth: '600px', margin: '0 auto' }}>
          {topic.description}
        </p>
        {topic.example && (
          <div
            style={{
              maxWidth: '600px',
              margin: 'var(--nb-space-lg) auto 0',
              background: 'var(--nb-dark-gray)',
              color: 'var(--nb-white)',
              padding: 'var(--nb-space-md)',
              border: '2px solid var(--nb-black)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                color: 'var(--nb-lime)',
                marginBottom: 'var(--nb-space-xs)',
              }}
            >
              <MaterialIcon name="MenuBook" size={14} color="var(--nb-lime)" />
              Example
            </div>
            <p style={{ fontStyle: 'italic', margin: 0 }}>"{topic.example}"</p>
          </div>
        )}
      </div>

      {/* Feature grid */}
      <div
        style={{
          padding: 'var(--nb-space-xl) var(--nb-space-lg)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--nb-space-lg)',
          maxWidth: '1000px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {FEATURES.map((feature) => (
          <button
            key={feature.id}
            onClick={() => onSelectFeature(feature.id)}
            className="nb-card nb-card-hover"
            style={{
              background: feature.color,
              padding: 'var(--nb-space-lg)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 'var(--nb-space-md)',
              textAlign: 'left',
              cursor: 'pointer',
              fontFamily: 'var(--nb-font)',
              border: 'var(--nb-border)',
              boxShadow: 'var(--nb-shadow)',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                background: 'var(--nb-white)',
                border: 'var(--nb-border)',
                boxShadow: 'var(--nb-shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialIcon name={feature.icon} size={32} color="var(--nb-black)" />
            </div>
            <h3 className="nb-heading nb-heading-md" style={{ margin: 0 }}>
              {feature.label}
            </h3>
            <p className="nb-text nb-text-sm" style={{ margin: 0 }}>
              {feature.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};