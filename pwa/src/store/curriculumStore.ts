import { create } from 'zustand';
import { gitHubSource } from '@/engine/gitHubSource';
import { loadAllCurricula, type LoadedCurriculum } from '@/engine/curriculumLoader';
import type { ReadingBlock, DrillCard } from '@/types';
import { getDb } from '@/lib/db';

interface CurriculumState {
  curricula: LoadedCurriculum[];
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
  syncProgress: { fetched: number; total: number } | null;
  lastSynced: number | null;

  connect: () => Promise<void>;
  reload: () => Promise<void>;
  sync: () => Promise<void>;
  getCurriculumById: (id: string) => LoadedCurriculum | undefined;
  getAllReadingBlocks: () => ReadingBlock[];
  getAllDrillCards: () => DrillCard[];
}

async function isCacheEmpty(): Promise<boolean> {
  try {
    const db = await getDb();
    const count = await db.count('file_cache');
    return count === 0;
  } catch {
    return true;
  }
}

async function clearFileCache(): Promise<void> {
  try {
    const db = await getDb();
    await db.clear('file_cache');
  } catch {
    // Non-fatal
  }
}

export const useCurriculumStore = create<CurriculumState>((set, get) => ({
  curricula: [],
  isLoading: false,
  isConnected: false,
  error: null,
  syncProgress: null,
  lastSynced: null,

  connect: async () => {
    set({ isLoading: true, error: null, syncProgress: null });
    try {
      await gitHubSource.requestAccess();
      const folderNames = await gitHubSource.listCurricula();

      const empty = await isCacheEmpty();
      if (empty) {
        // First load — prefetch all files with progress tracking
        await gitHubSource.prefetchAll(folderNames, (fetched, total) => {
          set({ syncProgress: { fetched, total } });
        });
        set({ syncProgress: null });
      }

      const curricula = await loadAllCurricula(gitHubSource, folderNames);
      set({
        curricula,
        isConnected: true,
        isLoading: false,
        lastSynced: Date.now(),
      });
    } catch (err) {
      set({
        isLoading: false,
        syncProgress: null,
        error: err instanceof Error ? err.message : 'Failed to connect.',
      });
    }
  },

  reload: async () => {
    set({ isLoading: true, error: null });
    try {
      const curricula = await loadAllCurricula(gitHubSource);
      set({ curricula, isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to reload.',
      });
    }
  },

  sync: async () => {
    set({ isLoading: true, error: null, syncProgress: null });
    try {
      await clearFileCache();
      const folderNames = await gitHubSource.listCurricula();

      await gitHubSource.prefetchAll(folderNames, (fetched, total) => {
        set({ syncProgress: { fetched, total } });
      });
      set({ syncProgress: null });

      const curricula = await loadAllCurricula(gitHubSource, folderNames);
      set({
        curricula,
        isConnected: true,
        isLoading: false,
        lastSynced: Date.now(),
      });
    } catch (err) {
      set({
        isLoading: false,
        syncProgress: null,
        error: err instanceof Error ? err.message : 'Failed to sync.',
      });
    }
  },

  getCurriculumById: (id: string) => {
    return get().curricula.find((c) => c.meta.id === id);
  },

  getAllReadingBlocks: () => {
    return get().curricula.flatMap((c) => c.readingBlocks);
  },

  getAllDrillCards: () => {
    return get().curricula.flatMap((c) => c.drillCards);
  },
}));
