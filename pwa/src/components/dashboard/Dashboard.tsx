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
}

export function Dashboard({ onStartReading, onStartDrills, onOpenCapstone: _onOpenCapstone }: DashboardProps = {}) {
  const { curricula, isLoading, isConnected, connect, error } = useCurriculumStore();
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
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 360px',
        gap: '1.5rem',
        padding: '1.5rem',
        maxWidth: 1200,
        margin: '0 auto',
        alignItems: 'start',
      }}
    >
      {/* Left column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <WhatNextCard block={nextBlock} onStart={handleStartReading} dueDrillsCount={dueCount} />

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
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
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

      {/* Right column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <StreakCard streak={streak} />
        <MomentumArc momentum={momentum} />
        <StudyHeatmap sessions={sessions} />
      </div>

      {/* Responsive: stack on small screens */}
      <style>{`
        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @keyframes skeletonPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
