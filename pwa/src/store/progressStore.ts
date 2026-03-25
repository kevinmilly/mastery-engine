import { create } from 'zustand';
import { getDb } from '@/lib/db';
import type { ReadingProgress, ReadingBlock } from '@/types';

interface ProgressState {
  readingProgress: Map<string, ReadingProgress>;
  lastTopicId: string | null;

  // Reading
  markBlockStarted: (blockId: string) => Promise<void>;
  markBlockCompleted: (blockId: string) => Promise<void>;
  getBlockProgress: (blockId: string) => ReadingProgress | undefined;

  // Stats helpers
  getCompletedCountForCurriculum: (curriculumId: string, blocks: ReadingBlock[]) => number;
  getTotalCountForCurriculum: (curriculumId: string, blocks: ReadingBlock[]) => number;
  getCompletedCountForTier: (curriculumId: string, tier: string, blocks: ReadingBlock[]) => number;
  getTotalCountForTier: (curriculumId: string, tier: string, blocks: ReadingBlock[]) => number;

  // Internal
  _init: () => Promise<void>;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  readingProgress: new Map(),
  lastTopicId: null,

  _init: async () => {
    try {
      const db = await getDb();
      const all = await db.getAll('reading_progress');
      const map = new Map<string, ReadingProgress>();
      for (const record of all) {
        map.set(record.blockId, record);
      }
      set({ readingProgress: map });
    } catch (err) {
      console.warn('Failed to load reading progress from IDB:', err);
    }
  },

  markBlockStarted: async (blockId: string) => {
    const existing = get().readingProgress.get(blockId);
    if (existing?.status === 'completed') return; // don't regress

    const record: ReadingProgress = {
      blockId,
      status: 'in-progress',
      lastReadAt: Date.now(),
      completedAt: existing?.completedAt,
    };

    try {
      const db = await getDb();
      await db.put('reading_progress', record);
    } catch (err) {
      console.warn('Failed to persist reading progress:', err);
    }

    set((state) => {
      const next = new Map(state.readingProgress);
      next.set(blockId, record);
      return { readingProgress: next };
    });
  },

  markBlockCompleted: async (blockId: string) => {
    const now = Date.now();
    const existing = get().readingProgress.get(blockId);

    const record: ReadingProgress = {
      blockId,
      status: 'completed',
      lastReadAt: now,
      completedAt: existing?.completedAt ?? now,
    };

    try {
      const db = await getDb();
      await db.put('reading_progress', record);
    } catch (err) {
      console.warn('Failed to persist reading progress:', err);
    }

    // Derive lastTopicId from block id: "curriculumId/tier/topicSeq/block-N" -> topicId
    // Block id format: "curriculumId/foundations/01/block-2" -> topicId = "foundations-01"
    // We store the full blockId and let rotationEngine derive topicId
    set((state) => {
      const next = new Map(state.readingProgress);
      next.set(blockId, record);
      return { readingProgress: next, lastTopicId: blockId };
    });
  },

  getBlockProgress: (blockId: string) => {
    return get().readingProgress.get(blockId);
  },

  getCompletedCountForCurriculum: (curriculumId: string, blocks: ReadingBlock[]) => {
    const progress = get().readingProgress;
    return blocks.filter(
      (b) =>
        b.curriculumId === curriculumId &&
        progress.get(b.id)?.status === 'completed'
    ).length;
  },

  getTotalCountForCurriculum: (curriculumId: string, blocks: ReadingBlock[]) => {
    return blocks.filter((b) => b.curriculumId === curriculumId).length;
  },

  getCompletedCountForTier: (curriculumId: string, tier: string, blocks: ReadingBlock[]) => {
    const progress = get().readingProgress;
    return blocks.filter(
      (b) =>
        b.curriculumId === curriculumId &&
        b.tier === tier &&
        progress.get(b.id)?.status === 'completed'
    ).length;
  },

  getTotalCountForTier: (curriculumId: string, tier: string, blocks: ReadingBlock[]) => {
    return blocks.filter(
      (b) => b.curriculumId === curriculumId && b.tier === tier
    ).length;
  },
}));

// Initialize on module load
useProgressStore.getState()._init();
