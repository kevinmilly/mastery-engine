import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useDueDrills } from '@/hooks/useDueDrills';
import { useSessionStore } from '@/store/sessionStore';
import { useDrillStore, Rating } from '@/store/index';
import { DrillCard } from './DrillCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface DrillSessionProps {
  focusTopics?: string[];
  onComplete: () => void;
}

function msUntilMidnight(): number {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime() - now.getTime();
}

function formatDuration(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function DrillSession({ focusTopics, onComplete }: DrillSessionProps) {
  const dueCards = useDueDrills(focusTopics);
  const { advanceDrill, updateMomentum, streak } = useSessionStore();
  const { rateCard, startSession, endSession } = useDrillStore();

  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const sessionStarted = useRef(false);
  const startTimeRef = useRef(Date.now());
  const ratedCountRef = useRef(0);
  const [cardsPerMin, setCardsPerMin] = useState(0);

  useEffect(() => {
    if (!sessionStarted.current && dueCards.length > 0) {
      sessionStarted.current = true;
      startSession();
      startTimeRef.current = Date.now();
    }
  }, [dueCards.length, startSession]);

  if (dueCards.length === 0) {
    const msLeft = msUntilMidnight();
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100svh - 52px)',
          gap: '1.5rem',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: '2rem',
            color: 'var(--color-accent-sage)',
          }}
        >
          All caught up.
        </div>
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.9rem',
            color: 'var(--color-text-muted)',
          }}
        >
          Next cards due in {formatDuration(msLeft)}
        </div>
        <Button variant="secondary" onClick={onComplete}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (done) {
    const goodOrEasy = ratings.filter((r) => r === Rating.Good || r === Rating.Easy).length;
    const accuracy = ratings.length > 0 ? Math.round((goodOrEasy / ratings.length) * 100) : 0;
    const topicsHit = [...new Set(dueCards.slice(0, ratings.length).map((c) => c.topicId))];

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100svh - 52px)',
          gap: '1.5rem',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: '2.2rem',
            color: 'var(--color-text-primary)',
          }}
        >
          Session Complete
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            maxWidth: 420,
            width: '100%',
          }}
        >
          {[
            { label: 'Reviewed', value: ratings.length },
            { label: 'Accuracy', value: `${accuracy}%` },
            { label: 'Topics', value: topicsHit.length },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                padding: '20px 12px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                  fontSize: '1.8rem',
                  color: 'var(--color-accent-sage)',
                }}
              >
                {value}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.75rem',
                  color: 'var(--color-text-muted)',
                  marginTop: 4,
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Topics */}
        {topicsHit.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
            {topicsHit.map((t) => (
              <Badge key={t} variant="sage">
                {t.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </Badge>
            ))}
          </div>
        )}

        {/* Momentum arc */}
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.82rem',
            color: 'var(--color-text-muted)',
          }}
        >
          {streak > 0 && `🔥 Day ${streak} streak`}
        </div>

        <Button variant="secondary" onClick={onComplete}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const currentCard = dueCards[index];

  async function handleRate(rating: Rating) {
    await rateCard(currentCard.id, rating);
    updateMomentum(rating);
    advanceDrill();

    const newRatings = [...ratings, rating];
    setRatings(newRatings);

    // Update velocity
    ratedCountRef.current++;
    const elapsed = (Date.now() - startTimeRef.current) / 60000;
    if (elapsed > 0) setCardsPerMin(ratedCountRef.current / elapsed);

    if (index + 1 >= dueCards.length) {
      await endSession('drill');
      setDone(true);
    } else {
      setIndex(index + 1);
    }
  }

  return (
    <AnimatePresence mode="wait">
      <DrillCard
        key={currentCard.id}
        card={currentCard}
        onRate={handleRate}
        cardNumber={index + 1}
        totalCards={dueCards.length}
        cardsPerMin={cardsPerMin}
      />
    </AnimatePresence>
  );
}
