import React, { useState } from 'react';

/**
 * ScreenshotPlaceholder
 *
 * Renders an image if `image` is provided (and loads successfully),
 * otherwise falls back to a styled placeholder.
 *
 * To swap in real screenshots, just put the files in `public/images/screenshots/`
 * and the component will automatically pick them up.
 */
export const ScreenshotPlaceholder = ({
  icon,
  title,
  image,
  color,
  iconColor,
  caption,
}) => {
  const [imageError, setImageError] = useState(false);
  const hasImage = image && !imageError;

  return (
    <div>
      <div
        style={{
          background: hasImage ? 'var(--nb-white)' : color,
          border: 'var(--nb-border-thick)',
          boxShadow: 'var(--nb-shadow)',
          padding: hasImage ? 'var(--nb-space-sm)' : 'var(--nb-space-lg)',
          aspectRatio: '9/16',
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
            src={image}
            alt={title}
            onError={() => setImageError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <>
            <div style={{ fontSize: '4rem', marginBottom: 'var(--nb-space-md)' }}>
              {icon}
            </div>
            <div
              className="nb-heading nb-heading-sm nb-mb-sm"
              style={{ color: iconColor || 'inherit' }}
            >
              {title}
            </div>
            <p
              className="nb-text-xs"
              style={{ color: iconColor ? 'rgba(255,255,255,0.8)' : '#666' }}
            >
              Screenshot placeholder
            </p>
          </>
        )}
      </div>
      {caption && (
        <p
          className="nb-text-sm nb-text-center nb-mt-md"
          style={{ fontWeight: '600' }}
        >
          {caption}
        </p>
      )}
    </div>
  );
};