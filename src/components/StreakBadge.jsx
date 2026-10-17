import React from 'react';
import { MaterialIcon } from './landing-page/icons';

/**
 * StreakBadge
 *
 * Renders a flame icon with the current streak count. Renders nothing
 * when the streak is 0 or unknown. Turns orange when the streak is at
 * risk (user has not yet completed an activity today).
 */
export const StreakBadge = ({ streak, size = 'md' }) => {
  if (!streak || !streak.currentStreak || streak.currentStreak < 1) {
    return null;
  }

  const isAtRisk = streak.atRisk;
  const colors = {
    md: { padding: '6px 12px', font: '1rem', icon: 18 },
    sm: { padding: '4px 8px', font: '0.875rem', icon: 14 },
  };
  const s = colors[size] || colors.md;

  return (
    <div
      className="nb-badge"
      title={
        isAtRisk
          ? `Your ${streak.currentStreak}-day streak ends today — practice to keep it alive!`
          : `${streak.currentStreak}-day streak`
      }
      style={{
        background: isAtRisk ? 'var(--nb-orange)' : 'var(--nb-yellow)',
        color: 'var(--nb-black)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: s.padding,
        fontWeight: 700,
        fontSize: s.font,
        border: '2px solid var(--nb-black)',
      }}
    >
      <MaterialIcon
        name="LocalFireDepartment"
        size={s.icon}
        color="var(--nb-black)"
      />
      {streak.currentStreak}
    </div>
  );
};