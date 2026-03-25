import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DrillCard as DrillCardType } from '@/types';
import { Rating } from '@/store/index';
import { Badge } from '@/components/ui/Badge';

interface DrillCardProps {
  card: DrillCardType;
  onRate: (rating: Rating) => void;
  cardNumber: number;
  totalCards: number;
  cardsPerMin?: number;
}

interface RatingButtonProps {
  label: string;
  shortcut: string;
  onClick: () => void;
  bg: string;
  borderColor: string;
  color: string;
  solid?: boolean;
  index: number;
  visible: boolean;
}

function RatingButton({ label, shortcut, onClick, bg, borderColor, color, solid, index, visible }: RatingButtonProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
      transition={{ duration: 0.18, delay: visible ? index * 0.05 : 0 }}
      onClick={onClick}
      style={{
        flex: 1,
        padding: '0.55em 0',
        borderRadius: 8,
        border: `1px solid ${borderColor}`,
        background: bg,
        color: solid ? '#fff' : color,
        fontFamily: 'var(--font-sans)',
        fontSize: '0.82rem',
        fontWeight: 500,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        transition: 'filter 120ms',
      }}
    >
      <span>{label}</span>
      <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>[{shortcut}]</span>
    </motion.button>
  );
}

export function DrillCard({ card, onRate, cardNumber, totalCards, cardsPerMin = 0 }: DrillCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [showFriction, setShowFriction] = useState(false);
  const [frictionText, setFrictionText] = useState('');
  const frictionRef = useRef<HTMLTextAreaElement>(null);

  // Reset when card changes
  useEffect(() => {
    setFlipped(false);
    setShowFriction(false);
    setFrictionText('');
  }, [card.id]);

  const flip = useCallback(() => {
    if (!flipped) setFlipped(true);
  }, [flipped]);

  const handleRate = useCallback((rating: Rating) => {
    if (rating === Rating.Again) {
      setShowFriction(true);
      // focus textarea after render
      setTimeout(() => frictionRef.current?.focus(), 50);
    } else {
      onRate(rating);
    }
  }, [onRate]);

  const submitFriction = useCallback(() => {
    onRate(Rating.Again);
    setShowFriction(false);
  }, [onRate]);

  // Keyboard shortcuts
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      // Don't capture if typing in an input/textarea (except friction log Enter)
      const target = e.target as HTMLElement;
      const inTextArea = target.tagName === 'TEXTAREA' || target.tagName === 'INPUT';

      if (showFriction) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          submitFriction();
        }
        return;
      }

      if (inTextArea) return;

      if (!flipped && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        flip();
        return;
      }
      if (flipped) {
        if (e.key === '1') handleRate(Rating.Again);
        else if (e.key === '2') handleRate(Rating.Hard);
        else if (e.key === '3') handleRate(Rating.Good);
        else if (e.key === '4') handleRate(Rating.Easy);
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [flipped, flip, handleRate, showFriction, submitFriction]);

  // Derive topic label from topicId: "foundations-01" → "Foundations 01"
  const topicLabel = card.topicId
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <motion.div
      key={card.id}
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -60, opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100svh - 52px)',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          padding: '48px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          position: 'relative',
        }}
      >
        {/* Top row: topic badge + velocity */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Badge variant="sage">{topicLabel}</Badge>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.72rem',
              color: 'var(--color-text-muted)',
            }}
          >
            {cardsPerMin > 0 ? `${cardsPerMin.toFixed(1)}/min` : '—'}
          </span>
        </div>

        {/* Counter */}
        <div
          style={{
            textAlign: 'center',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.72rem',
            color: 'var(--color-text-muted)',
            marginBottom: 16,
            letterSpacing: '0.06em',
          }}
        >
          {cardNumber} / {totalCards}
        </div>

        {/* Question */}
        <div
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: '1.4rem',
            lineHeight: 1.5,
            color: 'var(--color-text-primary)',
            textAlign: 'center',
            minHeight: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: flipped ? 'default' : 'pointer',
          }}
          onClick={!flipped ? flip : undefined}
        >
          {card.question}
        </div>

        {/* Tap to reveal hint */}
        <AnimatePresence>
          {!flipped && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                textAlign: 'center',
                marginTop: 20,
                fontFamily: 'var(--font-sans)',
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
              }}
            >
              <style>{`
                @keyframes subtlePulse {
                  0%, 100% { opacity: 0.5; }
                  50% { opacity: 1; }
                }
                .tap-hint { animation: subtlePulse 2.5s ease-in-out infinite; }
              `}</style>
              <span className="tap-hint">Tap to reveal · Space</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Answer area */}
        <AnimatePresence>
          {flipped && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div
                style={{
                  height: 1,
                  background: 'var(--color-border)',
                  margin: '24px 0',
                }}
              />
              <div
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '1rem',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.6,
                  textAlign: 'center',
                }}
              >
                {card.answer}
              </div>

              {/* Rating buttons */}
              {!showFriction && (
                <div style={{ display: 'flex', gap: 8, marginTop: 32 }}>
                  <RatingButton
                    label="Again"
                    shortcut="1"
                    index={0}
                    visible={true}
                    onClick={() => handleRate(Rating.Again)}
                    bg="rgba(192,57,43,0.15)"
                    borderColor="var(--color-accent-red)"
                    color="var(--color-accent-red)"
                  />
                  <RatingButton
                    label="Hard"
                    shortcut="2"
                    index={1}
                    visible={true}
                    onClick={() => handleRate(Rating.Hard)}
                    bg="rgba(212,168,83,0.15)"
                    borderColor="var(--color-accent-amber)"
                    color="var(--color-accent-amber)"
                  />
                  <RatingButton
                    label="Good"
                    shortcut="3"
                    index={2}
                    visible={true}
                    onClick={() => handleRate(Rating.Good)}
                    bg="rgba(122,155,138,0.15)"
                    borderColor="var(--color-accent-sage)"
                    color="var(--color-accent-sage)"
                  />
                  <RatingButton
                    label="Easy"
                    shortcut="4"
                    index={3}
                    visible={true}
                    onClick={() => handleRate(Rating.Easy)}
                    bg="var(--color-accent-sage)"
                    borderColor="var(--color-accent-sage)"
                    color="var(--color-accent-sage)"
                    solid
                  />
                </div>
              )}

              {/* Keyboard shortcut hint — desktop only */}
              {!showFriction && (
                <div
                  className="hidden md:block"
                  style={{
                    marginTop: 12,
                    textAlign: 'center',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.7rem',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  Space to flip · 1 Again · 2 Hard · 3 Good · 4 Easy
                </div>
              )}

              {/* Friction log */}
              <AnimatePresence>
                {showFriction && (
                  <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 40, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    style={{ marginTop: 24 }}
                  >
                    <textarea
                      ref={frictionRef}
                      value={frictionText}
                      onChange={(e) => setFrictionText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          submitFriction();
                        }
                      }}
                      onBlur={submitFriction}
                      placeholder="Why did I miss this? (optional, press Enter to skip)"
                      rows={2}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-surface-raised)',
                        color: 'var(--color-text-primary)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.88rem',
                        resize: 'none',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                    <div
                      style={{
                        fontSize: '0.7rem',
                        color: 'var(--color-text-muted)',
                        marginTop: 4,
                        textAlign: 'right',
                      }}
                    >
                      Enter to continue
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
