import React from 'react';
import { FOOTER_LINKS, scrollToSection } from './constants';
import logo from './logo.svg'
export const Footer = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer
      style={{
        background: 'var(--nb-dark-gray)',
        color: 'var(--nb-white)',
        padding: 'var(--nb-space-2xl) var(--nb-space-lg) var(--nb-space-lg)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--nb-space-xl)',
            marginBottom: 'var(--nb-space-xl)',
          }}
        >
          {/* Brand */}
          <div>
            <div
              className="nb-flex nb-flex-center nb-gap-sm nb-mb-md"
              onClick={scrollToTop}
              style={{ cursor: 'pointer', width: 'fit-content' }}
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
              <span className="nb-heading nb-heading-sm">Hello Ai</span>
            </div>
            <p className="nb-text-sm" style={{ opacity: 0.7 }}>
              The "speak easy" language learning app powered by AI.
            </p>
          </div>

          {/* Product */}
          <FooterColumn
            title="Product"
            items={FOOTER_LINKS.product}
            onClickItem={(item) => scrollToSection(item.toLowerCase())}
            clickable
          />

          {/* Company */}
          <FooterColumn title="Company" items={FOOTER_LINKS.company} />

          {/* Legal */}
          <FooterColumn title="Legal" items={FOOTER_LINKS.legal} />
        </div>

        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: 'var(--nb-space-lg)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--nb-space-md)',
          }}
        >
          <p className="nb-text-sm" style={{ opacity: 0.5, margin: 0 }}>
            © {new Date().getFullYear()} Hello AI. All rights reserved.
          </p>
          <p className="nb-text-sm" style={{ opacity: 0.5, margin: 0 }}>
            Made for language learners everywhere
          </p>
        </div>
      </div>
    </footer>
  );
};

const FooterColumn = ({ title, items, onClickItem, clickable = false }) => (
  <div>
    <h4 className="nb-heading nb-heading-sm nb-mb-md">{title}</h4>
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {items.map((item) => (
        <li key={item} className="nb-mb-sm">
          {clickable ? (
            <button
              onClick={() => onClickItem(item)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--nb-white)',
                opacity: 0.7,
                cursor: 'pointer',
                fontFamily: 'var(--nb-font)',
                fontSize: '0.875rem',
                padding: 0,
              }}
            >
              {item}
            </button>
          ) : (
            <span style={{ opacity: 0.7, fontSize: '0.875rem' }}>{item}</span>
          )}
        </li>
      ))}
    </ul>
  </div>
);