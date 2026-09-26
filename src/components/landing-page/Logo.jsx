import React from 'react';
import logo from './logo.svg'
export const Logo = ({ size = 'md', onClick }) => {
  const sizes = {
    sm: { box: '40px', font: '1.25rem', text: 'nb-heading-sm' },
    md: { box: '50px', font: '1.5rem', text: 'nb-heading-md' },
    lg: { box: '80px', font: '2.5rem', text: 'nb-heading-lg' },
  };

  const s = sizes[size] || sizes.md;

  return (
    <div
      className="nb-flex nb-flex-center nb-gap-sm"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <img
        src={logo}
        alt="Hello Ai logo"
        style={{
          width: '50px',
          height: '50px',
          border: 'var(--nb-border)',
          boxShadow: 'var(--nb-shadow-sm)',
          background: 'var(--nb-yellow)',
          objectFit: 'contain',
          display: 'block',
        }}
      />
      <span className={`nb-heading ${s.text}`}>Hello Ai</span>
    </div>
  );
};