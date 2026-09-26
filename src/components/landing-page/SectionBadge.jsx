import React from 'react';

export const SectionBadge = ({ children, color = 'var(--nb-lime)' }) => (
  <div className="nb-badge nb-mb-md" style={{ background: color }}>
    {children}
  </div>
);