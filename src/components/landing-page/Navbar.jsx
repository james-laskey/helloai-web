import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import { NAV_LINKS, scrollToSection } from './constants';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 769);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 769);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavClick = (id) => {
    scrollToSection(id);
    setMobileMenuOpen(false);
  };

  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--nb-white)',
        borderBottom: 'var(--nb-border-thick)',
        padding: 'var(--nb-space-md) var(--nb-space-lg)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <button
          onClick={scrollToTop}
          aria-label="Hello Ai — Home"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--nb-space-sm)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            fontFamily: 'var(--nb-font)',
          }}
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
          <span className="nb-heading nb-heading-md">Hello Ai</span>
        </button>

        {/* Desktop Nav Links */}
        {isDesktop && (
          <div className="nb-flex nb-gap-lg">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--nb-font)',
                  fontSize: '1rem',
                  fontWeight: '600',
                  padding: 'var(--nb-space-sm)',
                }}
              >
                {link.label}
              </button>
            ))}
          </div>
        )}

        {/* CTA + Mobile Menu Toggle */}
        <div className="nb-flex nb-gap-sm nb-flex-center">
          <button
            onClick={() => scrollToSection('signup')}
            className="nb-button nb-button-primary"
            style={{ padding: 'var(--nb-space-sm) var(--nb-space-md)' }}
          >
            Get Started
          </button>
          {!isDesktop && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="nb-button"
              style={{ padding: 'var(--nb-space-sm) var(--nb-space-md)' }}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {!isDesktop && mobileMenuOpen && (
        <div
          style={{
            marginTop: 'var(--nb-space-md)',
            borderTop: 'var(--nb-border)',
            paddingTop: 'var(--nb-space-md)',
          }}
        >
          <div className="nb-flex nb-flex-col nb-gap-sm">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className="nb-button"
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};