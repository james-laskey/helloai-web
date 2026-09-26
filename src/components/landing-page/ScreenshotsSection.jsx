import React from 'react';
import { SCREENSHOTS } from './constants';
import { SectionHeading } from './SectionHeading';
import { ScreenshotPlaceholder } from './ScreenshotPlaceholder';

export const ScreenshotsSection = () => {
  return (
    <section
      id="screenshots"
      style={{
        padding: 'var(--nb-space-2xl) var(--nb-space-lg)',
        background: 'var(--nb-white)',
        borderBottom: 'var(--nb-border-thick)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <SectionHeading
          badge="Screenshots"
          badgeColor="var(--nb-orange)"
          title="See Hello Ai in Action"
          subtitle="A sneak peek at the app experience. Replace these placeholders with actual screenshots."
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--nb-space-lg)',
          }}
        >
          {SCREENSHOTS.map((shot) => (
            <ScreenshotPlaceholder
              key={shot.title}
              icon={shot.icon}
              title={shot.title}
              image={shot.image}
              color={shot.color}
              iconColor={shot.iconColor}
              caption={shot.caption}
            />
          ))}
        </div>
      </div>
    </section>
  );
};