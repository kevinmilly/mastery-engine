import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DrillCard } from '@/types';
import { Button } from '@/components/ui/Button';

interface PretestCardProps {
  cards: DrillCard[];
  currentIndex: number;
  onAnswer: (cardId: string, skipped: boolean) => void;
  onComplete: () => void;
}

export function PretestCard({ cards, currentIndex, onAnswer, onComplete }: PretestCardProps) {
  const [inputValue, setInputValue] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const card = cards[currentIndex];

  useEffect(() => {
    setInputValue('');
    setSubmitted(false);
  }, [currentIndex]);

  if (!card) return null;

  function handleSkip() {
    onAnswer(card.id, true);
    if (currentIndex + 1 >= cards.length) {
      onComplete();
    }
  }

  function handleSubmit() {
    setSubmitted(true);
  }

  function handleContinue() {
    onAnswer(card.id, false);
    if (currentIndex + 1 >= cards.length) {
      onComplete();
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100svh - 52px)',
        padding: '1.5rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* Header */}
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.75rem',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
            letterSpacing: '0.06em',
            marginBottom: 8,
            textTransform: 'uppercase',
          }}
        >
          Before you read · Question {currentIndex + 1} of {cards.length}
        </div>

        {/* Sub-header */}
        <div
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: '0.9rem',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
            marginBottom: 32,
            lineHeight: 1.6,
          }}
        >
          Attempt this. Wrong answers are expected — the struggle primes your memory.
        </div>

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={card.id}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{
              padding: '40px 40px 32px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
            }}
          >
            {/* Question */}
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: '1.3rem',
                color: 'var(--color-text-primary)',
                textAlign: 'center',
                lineHeight: 1.5,
                marginBottom: 28,
              }}
            >
              {card.question}
            </div>

            {/* Input */}
            {!submitted && (
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Your answer... or leave blank if unsure"
                rows={2}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface-raised)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.9rem',
                  resize: 'none',
                  outline: 'none',
                  boxSizing: 'border-box',
                  marginBottom: 16,
                  transition: 'border-color 150ms',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent-sage)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
              />
            )}

            {/* Answer reveal */}
            <AnimatePresence>
              {submitted && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ marginBottom: 20 }}
                >
                  <div
                    style={{
                      height: 1,
                      background: 'var(--color-border)',
                      marginBottom: 16,
                    }}
                  />
                  <div
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.7rem',
                      color: 'var(--color-accent-sage)',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    Model Answer
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.95rem',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.6,
                    }}
                  >
                    {card.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              {!submitted ? (
                <>
                  <Button variant="ghost" onClick={handleSkip}>
                    Skip →
                  </Button>
                  <Button variant="secondary" onClick={handleSubmit}>
                    Submit &amp; See Answer →
                  </Button>
                </>
              ) : (
                <Button variant="secondary" onClick={handleContinue}>
                  Continue →
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 6,
            marginTop: 24,
          }}
        >
          {cards.map((_, i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background:
                  i < currentIndex
                    ? 'var(--color-accent-sage)'
                    : i === currentIndex
                    ? 'var(--color-text-secondary)'
                    : 'var(--color-border)',
                transition: 'background 200ms',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
