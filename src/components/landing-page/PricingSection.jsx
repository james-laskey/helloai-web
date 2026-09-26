import React from 'react';
import { PRICING_PLANS, PRICING_FAQ, SUSTAINABILITY, scrollToSection } from './constants';
import { SectionHeading } from './SectionHeading';
import { MaterialIcon } from './icons';

export const PricingSection = () => {
  return (
    <section
      id="pricing"
      style={{
        padding: 'var(--nb-space-2xl) var(--nb-space-lg)',
        background: 'var(--nb-lime)',
        borderBottom: 'var(--nb-border-thick)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <SectionHeading
          badge="Pricing"
          badgeColor="var(--nb-white)"
          title="Language Learning, Priced for Everyone"
          subtitle="Start free. Unlock everything forever for less than a coffee."
        />

        {/* ===== Plan Cards ===== */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--nb-space-lg)',
            maxWidth: '900px',
            margin: '0 auto var(--nb-space-2xl)',
          }}
        >
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.name}
              className="nb-card"
              style={{
                background: plan.featured ? 'var(--nb-yellow)' : 'var(--nb-white)',
                transform: plan.featured ? 'scale(1.05)' : 'none',
                position: 'relative',
              }}
            >
              {plan.badge && (
                <div
                  className="nb-badge nb-badge-success"
                  style={{
                    position: 'absolute',
                    top: '-15px',
                    right: '20px',
                  }}
                >
                  {plan.badge}
                </div>
              )}

              <h3 className="nb-heading nb-heading-md nb-mb-xs">{plan.name}</h3>

              {plan.tagline && (
                <p
                  className="nb-text-sm nb-text-muted nb-mb-md"
                  style={{ fontStyle: 'italic' }}
                >
                  {plan.tagline}
                </p>
              )}

              <div
                style={{
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  marginBottom: 'var(--nb-space-md)',
                }}
              >
                {plan.price}
                <span style={{ fontSize: '1rem', fontWeight: '400' }}>
                  {plan.period}
                </span>
              </div>

              <ul
                className="nb-flex nb-flex-col nb-gap-sm nb-mb-lg"
                style={{ listStyle: 'none', padding: 0 }}
              >
                {plan.features.map((feature) => (
                  <li key={feature}>✅ {feature}</li>
                ))}
              </ul>

              <button
                onClick={() => scrollToSection('signup')}
                className={`nb-button nb-button-full ${
                  plan.featured ? 'nb-button-primary' : ''
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* ===== Behind the Price Info Card ===== */}
        <div
          className="nb-card"
          style={{
            maxWidth: '1000px',
            margin: '0 auto',
            background: 'var(--nb-white)',
            padding: 'var(--nb-space-xl)',
          }}
        >
          {/* Header */}
          <div className="nb-text-center nb-mb-xl">
            <div
              className="nb-badge nb-mb-md"
              style={{ background: 'var(--nb-cyan)' }}
            >
              Real Numbers, Real Transparency
            </div>
            <h3
              className="nb-heading"
              style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}
            >
              {PRICING_FAQ.title}
            </h3>
            <p
              className="nb-text nb-mt-md"
              style={{
                maxWidth: '650px',
                margin: 'var(--nb-space-md) auto 0',
                color: 'var(--nb-text-muted)',
              }}
            >
              {PRICING_FAQ.subtitle}
            </p>
          </div>

          {/* Real Numbers Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 'var(--nb-space-md)',
              marginBottom: 'var(--nb-space-xl)',
            }}
          >
            {PRICING_FAQ.stats.map((stat) => (
              <div
                key={stat.label}
                className="nb-card"
                style={{
                  background: stat.color,
                  padding: 'var(--nb-space-md)',
                  textAlign: 'center',
                  boxShadow: 'var(--nb-shadow-sm)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: 'var(--nb-space-xs)',
                  }}
                >
                  <MaterialIcon name={stat.icon} size={32} color="var(--nb-black)" />
                </div>
                <div
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    lineHeight: 1.1,
                    marginBottom: 'var(--nb-space-xs)',
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: 'var(--nb-space-xs)',
                  }}
                >
                  {stat.label}
                </div>
                <div className="nb-text-xs" style={{ opacity: 0.75 }}>
                  {stat.detail}
                </div>
              </div>
            ))}
          </div>

          {/* Explanation Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 'var(--nb-space-lg)',
            }}
          >
            {PRICING_FAQ.explanation.map((item) => (
              <div
                key={item.title}
                className="nb-flex nb-gap-md"
                style={{ alignItems: 'flex-start' }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    width: '48px',
                    height: '48px',
                    background: 'var(--nb-yellow)',
                    border: 'var(--nb-border)',
                    boxShadow: 'var(--nb-shadow-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MaterialIcon name={item.icon} size={24} color="var(--nb-black)" />
                </div>
                <div>
                  <h4 className="nb-heading nb-heading-sm nb-mb-xs">
                    {item.title}
                  </h4>
                  <p className="nb-text-sm nb-text-muted">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== Sustainability Block ===== */}
        <div
          className="nb-card"
          style={{
            maxWidth: '1000px',
            margin: 'var(--nb-space-xl) auto 0',
            background: 'var(--nb-dark-gray)',
            color: 'var(--nb-white)',
            padding: 'var(--nb-space-xl)',
          }}
        >
          {/* Header */}
          <div className="nb-text-center nb-mb-xl">
            <div
              className="nb-badge nb-mb-md"
              style={{ background: 'var(--nb-lime)', color: 'var(--nb-black)' }}
            >
              {SUSTAINABILITY.badge}
            </div>
            <h3
              className="nb-heading"
              style={{
                fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                color: 'var(--nb-white)',
              }}
            >
              {SUSTAINABILITY.title}
            </h3>
            <p
              className="nb-text nb-mt-md"
              style={{
                maxWidth: '650px',
                margin: 'var(--nb-space-md) auto 0',
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              {SUSTAINABILITY.subtitle}
            </p>
          </div>

          {/* Metrics Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: 'var(--nb-space-md)',
              marginBottom: 'var(--nb-space-xl)',
            }}
          >
            {SUSTAINABILITY.metrics.map((metric) => (
              <div
                key={metric.label}
                style={{
                  border: '2px solid var(--nb-white)',
                  padding: 'var(--nb-space-md)',
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.03)',
                }}
              >
                <div
                  className="nb-text-xs"
                  style={{
                    opacity: 0.6,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: 'var(--nb-space-xs)',
                  }}
                >
                  {metric.label}
                </div>
                <div
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    lineHeight: 1.1,
                    marginBottom: 'var(--nb-space-xs)',
                    color: metric.highlight || 'var(--nb-white)',
                  }}
                >
                  {metric.value}
                </div>
                <div className="nb-text-xs" style={{ opacity: 0.5 }}>
                  {metric.note}
                </div>
              </div>
            ))}
          </div>

          {/* Sustainability Notes */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 'var(--nb-space-lg)',
            }}
          >
            {SUSTAINABILITY.notes.map((note) => (
              <div
                key={note.title}
                className="nb-flex nb-gap-md"
                style={{ alignItems: 'flex-start' }}
              >
                <div>
                  <h4
                    className="nb-heading nb-heading-sm nb-mb-xs"
                    style={{ color: 'var(--nb-white)' }}
                  >
                    {note.title}
                  </h4>
                  <p
                    className="nb-text-sm"
                    style={{ color: 'rgba(255,255,255,0.65)' }}
                  >
                    {note.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Note */}
          <div
            style={{
              marginTop: 'var(--nb-space-xl)',
              paddingTop: 'var(--nb-space-lg)',
              borderTop: '1px solid rgba(255,255,255,0.15)',
              textAlign: 'center',
            }}
          >
            <p
              className="nb-text-sm"
              style={{
                color: 'rgba(255,255,255,0.7)',
                marginBottom: 'var(--nb-space-md)',
              }}
            >
              {SUSTAINABILITY.footer}
            </p>
            <div className="nb-flex nb-gap-sm nb-flex-center nb-flex-wrap">
              {SUSTAINABILITY.badges.map((badge) => (
                <div
                  key={badge.label}
                  className="nb-badge"
                  style={{
                    background: badge.color,
                    color: badge.textColor || 'var(--nb-black)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <MaterialIcon
                    name={badge.icon}
                    size={14}
                    color={badge.textColor || 'var(--nb-black)'}
                  />
                  {badge.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== Mission Footer ===== */}
        <div
          style={{
            maxWidth: '1000px',
            margin: 'var(--nb-space-xl) auto 0',
            paddingTop: 'var(--nb-space-lg)',
            textAlign: 'center',
          }}
        >
          <p
            className="nb-text"
            style={{ fontWeight: '600', marginBottom: 'var(--nb-space-md)' }}
          >
            Mission: make language education accessible to everyone. No
            subscriptions. No ads. Just learning.
          </p>
          <button
            onClick={() => scrollToSection('signup')}
            className="nb-button nb-button-primary"
            style={{ padding: 'var(--nb-space-md) var(--nb-space-xl)' }}
          >
            ↪ Start Learning Free
          </button>
        </div>
      </div>
    </section>
  );
};