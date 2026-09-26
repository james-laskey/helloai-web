import React from 'react';
import { FEATURES } from './constants';
import { SectionHeading } from './SectionHeading';
import { MaterialIcon } from './icons';

export const FeaturesSection = () => {
  return (
    <section
      id="features"
      style={{
        padding: 'var(--nb-space-2xl) var(--nb-space-lg)',
        background: 'var(--nb-white)',
        borderBottom: 'var(--nb-border-thick)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <SectionHeading
          badge="Features"
          badgeColor="var(--nb-lime)"
          title="Everything You Need to Master a Language"
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--nb-space-lg)',
          }}
        >
          {FEATURES.map((feature) => (
            <div key={feature.title} className="nb-card nb-card-hover">
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  background: feature.color,
                  border: 'var(--nb-border)',
                  boxShadow: 'var(--nb-shadow-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--nb-space-md)',
                  color: feature.iconColor || 'inherit',
                }}
              >
                <MaterialIcon
                  name={feature.icon}
                  size={32}
                  color={feature.iconColor || 'var(--nb-black)'}
                />
              </div>
              <h3 className="nb-heading nb-heading-md nb-mb-sm">
                {feature.title}
              </h3>
              <p className="nb-text">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};