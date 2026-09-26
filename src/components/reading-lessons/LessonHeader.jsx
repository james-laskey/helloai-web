import React from 'react';
import { MaterialIcon } from '../landing-page/icons';

export const LessonHeader = ({
  lesson,
  language,
  sentenceCount,
  vocabCount,
  questionCount,
  playingAll,
  onPlayAllToggle,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="nb-card" style={{ background: 'var(--nb-white)' }}>
      <div className="nb-flex nb-flex-between nb-flex-center nb-flex-wrap nb-gap-sm">
        <div>
          <div
            className="nb-badge nb-mb-sm"
            style={{ background: 'var(--nb-lime)' }}
          >
            {lesson.level || 'Lesson'}
          </div>
          <h2 className="nb-heading nb-heading-md" style={{ margin: 0 }}>
            {lesson.title}
          </h2>
          <p className="nb-text-sm nb-text-muted nb-mt-xs" style={{ margin: 0 }}>
            {language} · {sentenceCount} sentences · {vocabCount} words ·{' '}
            {questionCount} questions
          </p>
        </div>

        <div className="nb-flex nb-gap-sm">
          <button
            className={`nb-button ${
              playingAll ? 'nb-button-danger' : 'nb-button-primary'
            }`}
            onClick={onPlayAllToggle}
            disabled={isMuted}
          >
            <MaterialIcon
              name={playingAll ? 'Stop' : 'PlayArrow'}
              size={20}
              color="var(--nb-white)"
            />
            {playingAll ? 'Stop' : 'Play All'}
          </button>
          <button
            className="nb-button"
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            <MaterialIcon
              name={isMuted ? 'VolumeOff' : 'VolumeUp'}
              size={20}
              color="var(--nb-black)"
            />
          </button>
        </div>
      </div>
    </div>
  );
};