import React from 'react';
import {
  Navbar,
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  ScreenshotsSection,
  PricingSection,
  AuthSection,
  Footer,
} from '../components/landing-page';

export const AuthScreen = ({ onAuthComplete }) => {
  return (
    <div style={{ background: 'var(--nb-yellow)', minHeight: '100vh' }}>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ScreenshotsSection />
      <PricingSection />
      <AuthSection onAuthComplete={onAuthComplete} />
      <Footer />
    </div>
  );
};