import React from 'react';
import { MaterialIcon } from './landing-page/icons';

export const TopicCard = ({
  topic,
  languageColor,
  onStartReadingLesson,
  onStartFlashcards,
  onStartQuiz,
}) => {
  return (
    <div className="nb-card" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--nb-space-md)',
        }}
      >
        <span
          className="nb-badge"
          style={{ background: languageColor || 'var(--nb-lime)' }}
        >
          {topic.concept || 'Grammar'}
        </span>
        {topic.level && (
          <span className="nb-text-xs nb-text-muted">{topic.level}</span>
        )}
      </div>

      {/* Title */}
      <h3 className="nb-heading nb-heading-md nb-mb-sm">{topic.name}</h3>

      {/* Description */}
      <p className="nb-text nb-text-sm nb-text-muted nb-mb-md">
        {topic.description}
      </p>

      {/* Example */}
      {topic.example && (
        <div
          style={{
            background: 'var(--nb-dark-gray)',
            color: 'var(--nb-white)',
            padding: 'var(--nb-space-md)',
            border: '2px solid var(--nb-black)',
            marginBottom: 'var(--nb-space-md)',
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
            
            Example
          </div>
          <p
            style={{
              fontStyle: 'italic',
              fontSize: '0.875rem',
              margin: 0,
            }}
          >
            "{topic.example}"
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--nb-space-sm)',
          marginTop: 'auto',
        }}
      >
        <button
          onClick={() => onStartReadingLesson(topic)}
          className="nb-button nb-button-primary"
          style={{
            flex: 1,
            padding: 'var(--nb-space-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <MaterialIcon name="MenuBook" size={16} color="var(--nb-black)" />
          Read
        </button>

        <button
          onClick={() => onStartFlashcards(topic)}
          className="nb-button nb-button-secondary"
          style={{
            flex: 1,
            padding: 'var(--nb-space-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <MaterialIcon name="Style" size={16} color="var(--nb-black)" />
          Cards
        </button>

        <button
          onClick={() => onStartQuiz(topic)}
          className="nb-button"
          style={{
            flex: 1,
            padding: 'var(--nb-space-sm)',
            background: 'var(--nb-orange)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <MaterialIcon name="Quiz" size={16} color="var(--nb-black)" />
          Quiz
        </button>
      </div>
    </div>
  );
};