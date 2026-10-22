import React, { useCallback, useEffect, useState } from 'react';
import { MaterialIcon } from '../components/landing-page/icons';
import { FlashcardComponent } from '../components/FlashcardComponent';
import { learningApi } from '../services/learningApi';

/**
 * Owns everything flashcard-related: previous sets, loading, request,
 * error, the active set, mastery updates, completion, and its own
 * Back button.
 *
 * Back behavior:
 *   - Inside an active set  -> return to the list.
 *   - In the list           -> call onBack() (parent decides what that
 *                              means; on the dashboard it resets the
 *                              reading lesson while keeping the
 *                              flashcards feature mounted).
 */
export const FlashcardsFeature = ({
  userId,
  userPreferences,
  language,
  selectedTopic,
  topics = [],
  onSelectTopic,
  onActivityComplete,
  onBack,
}) => {
  const nativeLanguage = userPreferences?.nativeLanguage || 'English';
  const topicForRequest = selectedTopic || topics[0] || null;

  /* ---------- Previous sets ---------- */
  const [sets, setSets] = useState([]);
  const [loadingSets, setLoadingSets] = useState(false);
  const [setsError, setSetsError] = useState(null);

  /* ---------- Active set ---------- */
  const [flashcards, setFlashcards] = useState(null);
  const [flashcardSetId, setFlashcardSetId] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  /* ---------- Generating a new set ---------- */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ---------------- Fetch previous sets ---------------- */
  const fetchPreviousSets = useCallback(async () => {
    if (!userId || !topicForRequest) return;
    setLoadingSets(true);
    setSetsError(null);
    try {
      const result = await learningApi.getPreviousFlashcardSets({
        userId,
        topicId: topicForRequest.id,
        language,
      });
      const nextSets = Array.isArray(result?.sets) ? result.sets : [];
      setSets(nextSets);
    } catch (err) {
      console.error('Error fetching previous flashcard sets:', err);
      setSetsError('Could not load your previous sets.');
      setSets([]);
    } finally {
      setLoadingSets(false);
    }
  }, [userId, topicForRequest?.id, language]);

  useEffect(() => {
    fetchPreviousSets();
  }, [fetchPreviousSets]);

  /* ---------------- Open an existing set ---------------- */
  const openSet = (set) => {
    if (!set?.cards || !Array.isArray(set.cards) || set.cards.length === 0) {
      return;
    }
    setFlashcards(set.cards);
    setFlashcardSetId(set.id);
    setSubmitted(false);
    setError(null);
  };

  /* ---------------- Generate a new set ---------------- */
  const generateFlashcards = async () => {
    if (!topicForRequest) {
      setError(
        'Pick a topic before generating flashcards. No topics are available for this language.'
      );
      return;
    }

    if (!selectedTopic) {
      onSelectTopic?.(topicForRequest);
    }

    setLoading(true);
    setError(null);
    setFlashcards(null);
    setFlashcardSetId(null);
    setSubmitted(false);

    try {
      const result = await learningApi.generateFlashcards({
        userId,
        topicId: topicForRequest.id,
        topicName: topicForRequest.name,
        language,
        userPreferences,
      });
      if (!result?.flashcards) throw new Error('No flashcards returned');
      setFlashcards(result.flashcards);
      setFlashcardSetId(result.setId);
      fetchPreviousSets();
    } catch (err) {
      console.error('Error generating flashcards:', err);
      setError('Could not generate flashcards. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Mastery + completion ---------------- */
  const updateFlashcardMastery = async (cardIndex, known) => {
    if (!flashcardSetId || submitted) return;
    try {
      await learningApi.updateFlashcardMastery({
        setId: flashcardSetId,
        userId,
        topicId: topicForRequest.id,
        cardIndex,
        known,
      });
    } catch (err) {
      console.error('Error updating flashcard mastery:', err);
    }
  };

  const submitFlashcardCompletion = async (knownCount, totalCount) => {
    if (!flashcardSetId || submitted) return;
    setSubmitted(true);
    try {
      await learningApi.completeFlashcardSet({
        setId: flashcardSetId,
        userId,
        knownCount,
        totalCount,
      });
      onActivityComplete?.();
    } catch (err) {
      console.error('Error completing flashcard set:', err);
    }
  };

  const handleComplete = async (knownCount, totalCount) => {
    await submitFlashcardCompletion(knownCount, totalCount);
    setFlashcards(null);
    setFlashcardSetId(null);
    setSubmitted(false);
    fetchPreviousSets();
  };

  /* ---------------- Back handler ---------------- */
  const handleBack = () => {
    if (flashcards?.length > 0) {
      // Inside an active set: return to the list, drop the active set.
      setFlashcards(null);
      setFlashcardSetId(null);
      setSubmitted(false);
      return;
    }
    // In the list: hand control to the parent.
    onBack?.();
  };

  /* ---------------- Header (Back + title) ---------------- */
  const Header = (
    <div className="dash-feature">
      <div className="dash-feature__bar">
        <button
          type="button"
          className="dash-feature__back"
          onClick={handleBack}
          aria-label="Back"
        >
          <MaterialIcon name="ArrowBack" size={16} color="var(--nb-black)" />
          Back
        </button>
        <div className="dash-feature__title-wrap">
          <span className="dash-feature__title">Flashcards</span>
          <span className="dash-feature__subtitle">
            {topicForRequest?.name || language}
          </span>
        </div>
      </div>
    </div>
  );

  /* ---------------- Render: active set ---------------- */
  if (flashcards?.length > 0) {
    return (
      <div>
        {Header}
        <FlashcardComponent
          flashcards={flashcards}
          onComplete={handleComplete}
          onUpdateMastery={updateFlashcardMastery}
          nativeLanguage={nativeLanguage}
        />
      </div>
    );
  }

  /* ---------------- Render: generating ---------------- */
  if (loading) {
    return (
      <div>
        {Header}
        <div className="dash-empty">
          <div className="nb-spinner" />
          <p className="dash-empty__text">Generating flashcards…</p>
        </div>
      </div>
    );
  }

  /* ---------------- Render: previous sets list ---------------- */
  if (loadingSets) {
    return (
      <div>
        {Header}
        <div className="dash-empty">
          <div className="nb-spinner" />
          <p className="dash-empty__text">Loading your flashcard sets…</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {Header}
      <div className="dash-flashcards">
        <div className="dash-flashcards__toolbar">
          <button
            className="dash-btn dash-btn--primary"
            onClick={generateFlashcards}
            disabled={!topicForRequest}
          >
            <MaterialIcon name="Style" size={18} color="var(--nb-black)" />
            Generate New Set
          </button>
          {error && <span className="dash-flashcards__error">{error}</span>}
        </div>

        {setsError && (
          <p className="dash-empty__text" style={{ color: 'var(--nb-red)' }}>
            {setsError}
          </p>
        )}

        {sets.length === 0 ? (
          <div className="dash-empty">
            <div className="dash-empty__icon">✦</div>
            <h2 className="dash-empty__title">No flashcard sets yet</h2>
            <p className="dash-empty__text">
              Generate a fresh set of cards for{' '}
              <strong>{topicForRequest?.name || 'this topic'}</strong> in{' '}
              {language} to get started.
            </p>
          </div>
        ) : (
          <div className="dash-flashcards__list">
            <p className="dash-flashcards__hint">
              Choose a set to study, or generate a new one.
            </p>
            {sets.map((set) => (
              <button
                key={set.id}
                type="button"
                className="dash-flashcards__card"
                onClick={() => openSet(set)}
              >
                <div className="dash-flashcards__card__title">
                  {set.title || `${topicForRequest?.name || 'Flashcards'}`}
                </div>
                <div className="dash-flashcards__card__meta">
                  <span>{set.cards?.length || 0} cards</span>
                  <span>
                    Mastery: {Math.round(Number(set.masteryLevel) || 0)}%
                  </span>
                  <span>Reviewed: {set.timesReviewed || 0}×</span>
                </div>
                <div className="dash-flashcards__card__date">
                  Created{' '}
                  {set.createdAt
                    ? new Date(set.createdAt).toLocaleDateString()
                    : '—'}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};