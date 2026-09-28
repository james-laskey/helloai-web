import React from 'react';
import { scrollToSection, HERO } from './constants';
import { MaterialIcon } from './icons';

export const HeroSection = () => {
  return (
    <section
      style={{
        padding: 'var(--nb-space-2xl) var(--nb-space-lg)',
        background: 'var(--nb-yellow)',
        borderBottom: 'var(--nb-border-thick)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--nb-space-xl)',
          alignItems: 'center',
        }}
      >
        {/* Hero Text */}
        <div>
          <div
            className="nb-badge nb-mb-md"
            style={{ background: 'var(--nb-pink)' }}
          >
            {HERO.badge}
          </div>
          <h1
            className="nb-heading"
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              lineHeight: '1.1',
              marginBottom: 'var(--nb-space-lg)',
            }}
          >
            Speak a New Language{' '}
            <span
              style={{
                background: 'var(--nb-lime)',
                padding: '0 var(--nb-space-sm)',
                border: 'var(--nb-border)',
                display: 'inline-block',
              }}
            >
              in Days
            </span>
            , Not Years
          </h1>
          <p
            className="nb-text nb-mb-lg"
            style={{ fontSize: '1.25rem', maxWidth: '600px' }}
          >
            {HERO.subtitle}
          </p>

          <div className="nb-flex nb-gap-md nb-flex-wrap nb-mb-md">
            <button
              onClick={() => scrollToSection('signup')}
              className="nb-button nb-button-primary"
              style={{
                padding: 'var(--nb-space-md) var(--nb-space-xl)',
                fontSize: '1.125rem',
              }}
            >
              Start Learning Free
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="nb-button"
              style={{
                padding: 'var(--nb-space-md) var(--nb-space-xl)',
                fontSize: '1.125rem',
              }}
            >
              → See How It Works
            </button>
          </div>

          {/* Price Anchor */}
          <div
            className="nb-flex nb-flex-center nb-gap-sm nb-flex-wrap nb-mb-lg"
            style={{
              fontSize: '0.95rem',
              fontWeight: '600',
            }}
          >
            <span className="nb-badge" style={{ background: 'var(--nb-lime)' }}>
              Free forever
            </span>
            <span className="nb-text-muted" style={{ fontSize: '0.875rem' }}>
              ·
            </span>
            <span className="nb-badge" style={{ background: 'var(--nb-cyan)' }}>
              Virtually Unlimited Rate Limitations
            </span>
          </div>

          {/* Trust Badges */}
          <div className="nb-flex nb-gap-lg nb-flex-wrap">
            {HERO.trustBadges.map((badge) => (
              <div
                key={badge.label}
                className="nb-flex nb-flex-center nb-gap-sm"
              >
                <span style={{ fontSize: '1.5rem' }}><MaterialIcon
                  name={badge.icon}
                  size={32}
                  color={badge.iconColor || 'var(--nb-black)'}
                /></span>
                <span className="nb-text-sm" style={{ fontWeight: '600' }}>
                  {badge.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Screenshot */}
        <div>
          <HeroScreenshot />
        </div>
      </div>
    </section>
  );
};

/* ---------- Hero Screenshot (image with placeholder fallback) ---------- */

const HeroScreenshot = () => {
  const [imageError, setImageError] = React.useState(false);
  const hasImage = HERO.image && !imageError;

  return (
    <div
      style={{
        background: hasImage ? 'var(--nb-white)' : 'var(--nb-cyan)',
        border: 'var(--nb-border-thick)',
        boxShadow: 'var(--nb-shadow-lg)',
        padding: hasImage ? 'var(--nb-space-sm)' : 'var(--nb-space-lg)',
        aspectRatio: '9/16',
        maxWidth: '350px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      {hasImage ? (
        <img
          src={HERO.image}
          alt={HERO.imageAlt}
          onError={() => setImageError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <>
          <div
            style={{ fontSize: '5rem', marginBottom: 'var(--nb-space-md)' }}
          >
            📱
          </div>
          <div className="nb-heading nb-heading-md nb-mb-sm">App Demo</div>
          <p className="nb-text-sm nb-text-muted">Screenshot placeholder</p>
          <p className="nb-text-xs nb-text-muted nb-mt-sm">
            Add <code>hero.png</code> to <code>/images/screenshots/</code>
          </p>
        </>
      )}
    </div>
  );
};