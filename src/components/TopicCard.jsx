import React from 'react';
import { MaterialIcon } from './landing-page/icons';

export const TopicCard = ({ topic, languageColor, onSelect }) => {
  return (
    <button
      onClick={() => onSelect(topic)}
      className="nb-card nb-card-hover"
      style={{
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'left',
        cursor: 'pointer',
        fontFamily: 'var(--nb-font)',
        width: '100%',
        padding: 'var(--nb-space-md)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--nb-space-md)',
          width: '100%',
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
            width: '100%',
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

      {/* CTA hint */}
      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '6px',
          fontWeight: 600,
          fontSize: '0.875rem',
          color: 'var(--nb-black)',
        }}
      >
        Choose a mode
        <MaterialIcon name="ArrowForward" size={16} color="var(--nb-black)" />
      </div>
    </button>
  );
};