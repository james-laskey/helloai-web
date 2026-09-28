import React, { useState } from 'react';
import { MaterialIcon } from './icons';

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
    <div style={{ width: '100%' }}>
      <div
        style={{
          background: hasImage ? 'var(--nb-white)' : color,
          border: 'var(--nb-border-thick)',
          boxShadow: 'var(--nb-shadow)',
          padding: hasImage ? 'var(--nb-space-sm)' : 'var(--nb-space-lg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          overflow: 'hidden',
          // When the image is present, the aspect ratio comes from the
          // image itself. When it is missing, fall back to a phone-ish
          // 9:16 placeholder so the layout is not empty.
          aspectRatio: hasImage ? undefined : '9 / 16',
        }}
      >
        {hasImage ? (
          <img
            src={image}
            alt={title}
            onError={() => setImageError(true)}
            style={{
              display: 'block',
              width: '100%',
              height: 'auto',
              maxHeight: '520px',
              objectFit: 'contain',
            }}
          />
        ) : (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--nb-space-md)',
              }}
            >
              <MaterialIcon
                name={icon}
                size={64}
                color={iconColor || 'var(--nb-black)'}
              />
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