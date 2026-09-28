import React from 'react';
import { SCREENSHOTS } from './constants';
import { SectionHeading } from './SectionHeading';
import { ScreenshotPlaceholder } from './ScreenshotPlaceholder';

export const ScreenshotsSection = () => {
  // Duplicate the list so the CSS animation loops without a visible gap.
  const track = [...SCREENSHOTS, ...SCREENSHOTS];

  return (
    <section
      id="screenshots"
      style={{
        padding: 'var(--nb-space-2xl) 0',
        background: 'var(--nb-white)',
        borderBottom: 'var(--nb-border-thick)',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 var(--nb-space-lg)' }}>
        <SectionHeading
          badge="Screenshots"
          badgeColor="var(--nb-orange)"
          title="See Hello Ai in Action"
          subtitle="A slow look at the app — phone, tablet, and desktop views."
        />
      </div>

      {/* Marquee viewport. The inner track is twice as wide as the
          content and translates -50% over the animation. */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          padding: 'var(--nb-space-lg) 0',
        }}
      >
        {/* Fade edges so images do not hard-cut at the boundaries */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: '80px',
            background: 'linear-gradient(to right, var(--nb-white), transparent)',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            width: '80px',
            background: 'linear-gradient(to left, var(--nb-white), transparent)',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />

        <div className="nb-screenshot-track">
          {track.map((shot, i) => (
            <div key={`${shot.title}-${i}`} className="nb-screenshot-slide">
              <ScreenshotPlaceholder
                icon={shot.icon}
                title={shot.title}
                image={shot.image}
                color={shot.color}
                iconColor={shot.iconColor}
                caption={shot.caption}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};