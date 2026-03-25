import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Clock } from '@phosphor-icons/react';
import type { ReadingBlock } from '@/types';
import { useProgressStore } from '@/store/progressStore';
import { useSessionStore } from '@/store/sessionStore';
import { useNextBlock } from '@/hooks/useNextBlock';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface ReaderViewProps {
  block: ReadingBlock;
  onNext: () => void;
  onBack: () => void;
}

const TIER_VARIANT: Record<string, 'sage' | 'amber' | 'red'> = {
  Foundations: 'sage',
  Mechanics: 'amber',
  Mastery: 'red',
};

export function ReaderView({ block, onNext, onBack }: ReaderViewProps) {
  const markBlockStarted = useProgressStore((s) => s.markBlockStarted);
  const markBlockCompleted = useProgressStore((s) => s.markBlockCompleted);
  const updateStreak = useSessionStore((s) => s.updateStreak);
  const nextBlock = useNextBlock();

  // Mark as in-progress on mount
  useEffect(() => {
    markBlockStarted(block.id);
  }, [block.id, markBlockStarted]);

  async function handleNext() {
    await markBlockCompleted(block.id);
    updateStreak();
    onNext();
  }

  const tierVariant = TIER_VARIANT[block.tier] ?? 'muted';
  const breadcrumb = [block.curriculumId, block.tier, block.topicId].filter(Boolean).join(' › ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      {/* Top bar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: 'var(--color-bg)',
          borderBottom: '1px solid var(--color-border)',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft size={15} /> Dashboard
        </Button>
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.8rem',
            color: 'var(--color-text-muted)',
            flex: 1,
          }}
        >
          {breadcrumb}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Badge variant={tierVariant}>{block.tier}</Badge>
          <Badge variant="muted">
            <Clock size={11} style={{ marginRight: 3 }} />
            {block.estimatedMinutes} min
          </Badge>
        </div>
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          padding: 'clamp(1.5rem, 5vw, 3rem) clamp(1rem, 5vw, 2rem)',
          maxWidth: 800,
          width: '100%',
          margin: '0 auto',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontStyle: 'italic',
            fontWeight: 400,
            color: 'var(--color-text-primary)',
            margin: '0 0 2rem 0',
            lineHeight: 1.2,
          }}
        >
          {block.heading}
        </h1>
        <MarkdownRenderer content={block.content} />
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: '1px solid var(--color-border)',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          background: 'var(--color-bg)',
        }}
      >
        <div>
          {nextBlock && nextBlock.id !== block.id && (
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.8rem',
                color: 'var(--color-text-muted)',
              }}
            >
              Up next: {nextBlock.heading}
            </span>
          )}
        </div>
        <Button variant="primary" onClick={handleNext}>
          Next Topic <ArrowRight size={16} weight="bold" />
        </Button>
      </div>
    </motion.div>
  );
}
