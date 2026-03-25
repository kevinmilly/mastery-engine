import { useEffect, useState } from 'react';
import { useCurriculumStore } from '@/store/curriculumStore';
import { useSessionStore } from '@/store/sessionStore';
import { useDrillStore } from '@/store/drillStore';
import { useNextBlock } from '@/hooks/useNextBlock';
import { getDb } from '@/lib/db';
import type { SessionLog } from '@/types';
import { Button } from '@/components/ui/Button';
import { StreakCard } from './StreakCard';
import { MomentumArc } from './MomentumArc';
import { StudyHeatmap } from './StudyHeatmap';
import { CurriculumCard } from './CurriculumCard';
import { WhatNextCard } from './WhatNextCard';

function SkeletonBlock({ height = 80 }: { height?: number }) {
  return (
    <div
      style={{
        height,
        borderRadius: 12,
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        animation: 'skeletonPulse 1.5s ease-in-out infinite',
      }}
    />
  );
}

interface CapstoneContext {
  scenario: string;
  tasks: string[];
  tier: string;
  curriculumTitle: string;
}

interface DashboardProps {
  onStartReading?: () => void;
  onStartDrills?: () => void;
  onOpenCapstone?: (ctx: CapstoneContext) => void;
  error?: string | null;
}

export function Dashboard({ onStartReading, onStartDrills, onOpenCapstone: _onOpenCapstone, error: errorProp }: DashboardProps = {}) {
  const { curricula, isLoading, isConnected, connect, sync, error: storeError } = useCurriculumStore();
  const error = errorProp ?? storeError;
  const { mode, setMode, setCurrentBlock, streak, momentum } = useSessionStore();
  const getAllDrillCards = useCurriculumStore((s) => s.getAllDrillCards);
  const getDueCardIds = useDrillStore((s) => s.getDueCardIds);
  const nextBlock = useNextBlock();
  const [sessions, setSessions] = useState<SessionLog[]>([]);

  // Load sessions from IDB for heatmap
  useEffect(() => {
    (async () => {
      try {
        const db = await getDb();
        const all = await db.getAll('session_log');
        setSessions(all as SessionLog[]);
      } catch {
        // ignore
      }
    })();
  }, [mode]);

  const allDrillIds = getAllDrillCards().map((c) => c.id);
  const dueCount = getDueCardIds(allDrillIds).length;

  if (!isConnected && !isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: '1.5rem',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.8rem',
            fontStyle: 'italic',
            fontWeight: 400,
            color: 'var(--color-text-primary)',
            margin: 0,
          }}
        >
          Connect your curricula folder
        </h2>
        <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text-secondary)', margin: 0, maxWidth: 400 }}>
          Grant access to your markdown curricula directory to begin studying.
        </p>
        {error && (
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--color-accent-red)', margin: 0 }}>
            {error}
          </p>
        )}
        <Button variant="primary" onClick={connect}>
          Choose Folder
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: '1.5rem',
          padding: '1.5rem',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <SkeletonBlock height={180} />
          <SkeletonBlock height={100} />
          <SkeletonBlock height={100} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <SkeletonBlock height={110} />
          <SkeletonBlock height={160} />
          <SkeletonBlock height={120} />
        </div>
        <style>{`
          @keyframes skeletonPulse {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  function handleStartReading() {
    if (onStartReading) {
      onStartReading();
    } else if (nextBlock) {
      setCurrentBlock(nextBlock);
      setMode('reader');
    }
  }

  function handleStartDrills() {
    if (onStartDrills) {
      onStartDrills();
    } else {
      setMode('drill');
    }
  }

  return (
    <div
      className="dashboard-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr)',
        gap: '1.25rem',
        padding: '1rem',
        maxWidth: 1200,
        margin: '0 auto',
        alignItems: 'start',
      }}
    >
      <style>{`
        @media (min-width: 768px) {
          .dashboard-grid { grid-template-columns: minmax(0, 1fr) 360px !important; padding: 1.5rem !important; }
          .dashboard-sidebar { display: flex !important; }
        }
        .dashboard-sidebar { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        @media (min-width: 768px) {
          .dashboard-sidebar { flex-direction: column !important; grid-template-columns: unset !important; }
        }
      `}</style>
      {/* Error banner — spans full width */}
      {error && (
        <div
          style={{
            gridColumn: '1 / -1',
            background: 'rgba(var(--color-accent-red-rgb, 220, 53, 69), 0.1)',
            border: '1px solid var(--color-accent-red)',
            borderRadius: 10,
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--color-accent-red)', margin: 0 }}>
            Failed to load curricula: {error}
          </p>
          <button
            onClick={isConnected ? sync : connect}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.85rem',
              color: 'var(--color-accent-red)',
              background: 'none',
              border: '1px solid var(--color-accent-red)',
              borderRadius: 6,
              padding: '4px 12px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Left column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <WhatNextCard block={nextBlock} onStart={handleStartReading} dueDrillsCount={dueCount} />

        {isConnected && curricula.length === 0 && !error && (
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: 0 }}>
            No curricula found. Tap the sync icon to reload.
          </p>
        )}

        {curricula.length > 0 && (
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
                margin: '0 0 0.75rem 0',
                letterSpacing: '0.02em',
              }}
            >
              Curricula
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '0.75rem',
              }}
            >
              {curricula.map((c) => (
                <CurriculumCard key={c.meta.id} curriculum={c} />
              ))}
            </div>
          </div>
        )}

        {dueCount > 0 && (
          <Button variant="secondary" onClick={handleStartDrills}>
            Start Drills ({dueCount} due)
          </Button>
        )}
      </div>

      {/* Right column — 2-col grid on mobile, stacked on desktop */}
      <div className="dashboard-sidebar">
        <StreakCard streak={streak} />
        <MomentumArc momentum={momentum} />
        <StudyHeatmap sessions={sessions} />
      </div>

      <style>{`
        @keyframes skeletonPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
