import React from 'react';
import { STEPS } from './constants';
import { SectionHeading } from './SectionHeading';

export const HowItWorksSection = () => {
  return (
    <section
      id="how-it-works"
      style={{
        padding: 'var(--nb-space-2xl) var(--nb-space-lg)',
        background: 'var(--nb-cyan)',
        borderBottom: 'var(--nb-border-thick)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <SectionHeading
          badge="How It Works"
          badgeColor="var(--nb-white)"
          title="Start Speaking in 3 Simple Steps"
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--nb-space-lg)',
          }}
        >
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="nb-card"
              style={{ position: 'relative' }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '-20px',
                  width: '60px',
                  height: '60px',
                  background: step.color,
                  border: 'var(--nb-border)',
                  boxShadow: 'var(--nb-shadow-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: '700',
                }}
              >
                {step.number}
              </div>
              <h3 className="nb-heading nb-heading-md nb-mb-md nb-mt-lg">
                {step.title}
              </h3>
              <p className="nb-text">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};