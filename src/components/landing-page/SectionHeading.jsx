import React from 'react';

export const SectionHeading = ({
  badge,
  badgeColor,
  title,
  subtitle,
  titleColor,
  subtitleColor,
  centered = true,
  maxWidth = '1200px',
}) => {
  return (
    <div className={centered ? 'nb-text-center nb-mb-xl' : 'nb-mb-xl'}>
      {badge && (
        <div
          className="nb-badge nb-mb-md"
          style={{ background: badgeColor || 'var(--nb-lime)' }}
        >
          {badge}
        </div>
      )}
      <h2
        className="nb-heading"
        style={{
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          color: titleColor,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="nb-text nb-mt-md"
          style={{
            color: subtitleColor || 'var(--nb-text-muted)',
            maxWidth: '600px',
            margin: 'var(--nb-space-md) auto 0',
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};