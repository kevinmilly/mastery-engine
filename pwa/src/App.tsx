import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSessionStore } from '@/store/sessionStore';
import { useCurriculumStore } from '@/store/curriculumStore';
import { useProgressStore } from '@/store/progressStore';
import { useNextBlock } from '@/hooks/useNextBlock';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { ReaderView } from '@/components/reader/ReaderView';
import { DrillSession } from '@/components/drill/DrillSession';
import { FocusModeSelector } from '@/components/drill/FocusModeSelector';
import { PretestCard } from '@/components/pretest/PretestCard';
import { CapstoneView } from '@/components/capstone/CapstoneView';

const MODE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  reader: 'Reading',
  drill: 'Drilling',
  pretest: 'Pre-Test',
  capstone: 'Capstone',
};

// ArrowsClockwise icon (Phosphor-style, inline SVG)
function SyncIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16h28.69L196.12,79.43a80,80,0,1,0,3.38,113.65,8,8,0,0,1,11.32,11.32A96,96,0,1,1,192.67,65.51L208,80.43V56a8,8,0,0,1,16,0Z" />
    </svg>
  );
}

function NavBar() {
  const { mode, setMode } = useSessionStore();
  const { sync, isLoading } = useCurriculumStore();

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        padding: '0 1.5rem',
        height: 48,
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        gap: '1.25rem',
      }}
    >
      <button
        onClick={() => setMode('dashboard')}
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.1rem',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          letterSpacing: '-0.01em',
        }}
      >
        Mastery Engine
      </button>

      <div style={{ flex: 1 }} />

      {/* Sync button */}
      <button
        onClick={sync}
        disabled={isLoading}
        title="Sync curricula from GitHub"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-secondary)',
          background: 'none',
          border: 'none',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          padding: '4px',
          borderRadius: 4,
          opacity: isLoading ? 0.4 : 1,
          transition: 'color 150ms, opacity 150ms',
        }}
        onMouseEnter={(e) => {
          if (!isLoading) e.currentTarget.style.color = 'var(--color-text-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--color-text-secondary)';
        }}
      >
        <SyncIcon size={18} />
      </button>

      {mode !== 'dashboard' && (
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.72rem',
            color: 'var(--color-accent-amber)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '3px 8px',
            background: 'rgba(212,168,83,0.1)',
            border: '1px solid rgba(212,168,83,0.3)',
            borderRadius: 4,
          }}
        >
          {MODE_LABELS[mode] ?? mode}
        </span>
      )}

      <button
        onClick={() => setMode('dashboard')}
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.85rem',
          color: mode === 'dashboard' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: 4,
          transition: 'color 150ms',
        }}
      >
        Dashboard
      </button>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Capstone state (which capstone to show)
// ---------------------------------------------------------------------------
interface CapstoneContext {
  scenario: string;
  tasks: string[];
  tier: string;
  curriculumTitle: string;
}

function AppContent() {
  const {
    mode, setMode,
    currentBlock, setCurrentBlock,
    pretestCards, pretestIndex, setPretestCards, advancePretest,
  } = useSessionStore();

  const { curricula, error: curriculumError } = useCurriculumStore();
  const { readingProgress } = useProgressStore();
  const nextBlock = useNextBlock();

  const [drillFocusSelected, setDrillFocusSelected] = useState(false);
  const [drillFocusTopicsState, setDrillFocusTopicsState] = useState<string[]>([]);
  const [capstoneCtx, setCapstoneCtx] = useState<CapstoneContext | null>(null);

  // -----------------------------------------------------------------------
  // Reading → pretest logic
  // -----------------------------------------------------------------------
  function handleStartReading() {
    if (!nextBlock) return;

    const topicBlocks = curricula
      .flatMap((c) => c.readingBlocks)
      .filter((b) => b.topicId === nextBlock.topicId && b.curriculumId === nextBlock.curriculumId);

    const topicHasBeenStarted = topicBlocks.some((b) => {
      const prog = readingProgress.get(b.id);
      return prog?.status === 'in-progress' || prog?.status === 'completed';
    });

    if (!topicHasBeenStarted) {
      const topicCards = curricula
        .flatMap((c) => c.drillCards)
        .filter((c) => c.topicId === nextBlock.topicId && c.curriculumId === nextBlock.curriculumId)
        .slice(0, 3);

      if (topicCards.length > 0) {
        setPretestCards(topicCards);
        setCurrentBlock(nextBlock);
        setMode('pretest');
        return;
      }
    }

    setCurrentBlock(nextBlock);
    setMode('reader');
  }

  function handlePretestAnswer(_cardId: string, _skipped: boolean) {
    advancePretest();
  }

  function handlePretestComplete() {
    setMode('reader');
  }

  function handleReaderNext() {
    const next = nextBlock;
    if (next && next.id !== currentBlock?.id) {
      setCurrentBlock(next);
      setMode('reader');
    } else {
      setMode('dashboard');
    }
  }

  function handleReaderBack() {
    setMode('dashboard');
  }

  // -----------------------------------------------------------------------
  // Drill mode
  // -----------------------------------------------------------------------
  function handleDrillChaos() {
    setDrillFocusTopicsState([]);
    setDrillFocusSelected(true);
  }

  function handleDrillFocusConfirm(topicIds: string[]) {
    setDrillFocusTopicsState(topicIds);
    setDrillFocusSelected(true);
  }

  function handleDrillComplete() {
    setDrillFocusSelected(false);
    setDrillFocusTopicsState([]);
    setMode('dashboard');
  }

  // -----------------------------------------------------------------------
  // Mode key for AnimatePresence
  // -----------------------------------------------------------------------
  const key =
    mode === 'reader'
      ? `reader-${currentBlock?.id ?? ''}`
      : mode === 'pretest'
      ? `pretest-${pretestIndex}`
      : mode;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        style={{ minHeight: 'calc(100svh - 48px)' }}
      >
        {/* Reader */}
        {mode === 'reader' && currentBlock && (
          <ReaderView
            block={currentBlock}
            onNext={handleReaderNext}
            onBack={handleReaderBack}
          />
        )}

        {/* Pretest */}
        {mode === 'pretest' && pretestCards.length > 0 && (
          <PretestCard
            cards={pretestCards}
            currentIndex={pretestIndex}
            onAnswer={handlePretestAnswer}
            onComplete={handlePretestComplete}
          />
        )}

        {/* Drill */}
        {mode === 'drill' && !drillFocusSelected && (
          <FocusModeSelector
            curricula={curricula}
            onConfirm={handleDrillFocusConfirm}
            onChaos={handleDrillChaos}
          />
        )}
        {mode === 'drill' && drillFocusSelected && (
          <DrillSession
            focusTopics={drillFocusTopicsState.length > 0 ? drillFocusTopicsState : undefined}
            onComplete={handleDrillComplete}
          />
        )}

        {/* Capstone */}
        {mode === 'capstone' && capstoneCtx && (
          <CapstoneView
            capstone={capstoneCtx}
            tier={capstoneCtx.tier}
            curriculumTitle={capstoneCtx.curriculumTitle}
            onBack={() => setMode('dashboard')}
          />
        )}

        {/* Dashboard (default) */}
        {(mode === 'dashboard' ||
          (mode === 'reader' && !currentBlock) ||
          (mode === 'pretest' && pretestCards.length === 0) ||
          (mode === 'capstone' && !capstoneCtx)) && (
          <Dashboard
            onStartReading={handleStartReading}
            onStartDrills={() => {
              setDrillFocusSelected(false);
              setDrillFocusTopicsState([]);
              setMode('drill');
            }}
            onOpenCapstone={(ctx) => {
              setCapstoneCtx(ctx);
              setMode('capstone');
            }}
            error={curriculumError}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Loading screens
// ---------------------------------------------------------------------------

function SyncProgressScreen({ fetched, total }: { fetched: number; total: number }) {
  const pct = total > 0 ? (fetched / total) * 100 : 0;

  return (
    <div
      style={{
        minHeight: '100svh',
        background: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '3rem',
          fontStyle: 'italic',
          fontWeight: 400,
          color: 'var(--color-text-primary)',
          margin: 0,
          letterSpacing: '-0.02em',
        }}
      >
        Mastery Engine
      </h1>

      {/* Progress bar */}
      <div
        style={{
          width: '100%',
          maxWidth: 360,
          height: 6,
          background: 'var(--color-border)',
          borderRadius: 999,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: 'var(--color-accent-amber)',
            borderRadius: 999,
            transition: 'width 200ms ease',
          }}
        />
      </div>

      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.9rem',
          color: 'var(--color-text-muted)',
          margin: 0,
        }}
      >
        Syncing curricula... {fetched} / {total} files
      </p>
    </div>
  );
}

function SpinnerScreen() {
  return (
    <div
      style={{
        minHeight: '100svh',
        background: 'var(--color-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        width={40}
        height={40}
        viewBox="0 0 40 40"
        style={{ animation: 'spin 0.9s linear infinite' }}
        aria-label="Loading"
      >
        <circle
          cx={20}
          cy={20}
          r={16}
          fill="none"
          stroke="var(--color-accent-amber)"
          strokeWidth={3}
          strokeDasharray="75 25"
          strokeLinecap="round"
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </svg>
    </div>
  );
}

function App() {
  const { connect, isConnected, isLoading, syncProgress } = useCurriculumStore();

  // Auto-connect on mount — no user action needed
  useEffect(() => {
    if (!isConnected) {
      connect();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // First-load prefetch progress screen
  if (syncProgress !== null) {
    return <SyncProgressScreen fetched={syncProgress.fetched} total={syncProgress.total} />;
  }

  // Parsing / loading spinner
  if (isLoading || !isConnected) {
    return <SpinnerScreen />;
  }

  return (
    <div style={{ minHeight: '100svh', background: 'var(--color-bg)' }}>
      <NavBar />
      <AppContent />
    </div>
  );
}

export default App;
