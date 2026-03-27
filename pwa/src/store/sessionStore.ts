import { create } from 'zustand';
import { Rating } from '@/engine/fsrsEngine';
import type { ReadingBlock, DrillCard } from '@/types';

export type AppMode = 'dashboard' | 'reader' | 'drill' | 'pretest' | 'capstone' | 'curriculum-detail';

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------

const LS_KEY = 'mastery-engine-session';

interface PersistedSession {
  streak: number;
  lastStudyDate: string;
  momentum: number;
}

function loadPersisted(): PersistedSession {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { streak: 0, lastStudyDate: '', momentum: 0 };
    return JSON.parse(raw) as PersistedSession;
  } catch {
    return { streak: 0, lastStudyDate: '', momentum: 0 };
  }
}

function savePersisted(data: PersistedSession): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch {
    // Non-fatal
  }
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface SessionState {
  mode: AppMode;
  setMode: (mode: AppMode) => void;

  // Current reading context
  currentBlock: ReadingBlock | null;
  setCurrentBlock: (block: ReadingBlock | null) => void;

  // Focused curriculum reading (null = auto/all curricula)
  readingCurriculumId: string | null;
  setReadingCurriculumId: (id: string | null) => void;

  // Curriculum detail view
  detailCurriculumId: string | null;
  setDetailCurriculumId: (id: string | null) => void;

  // Current drill context
  currentDrillQueue: DrillCard[];
  currentDrillIndex: number;
  drillFocusTopics: string[];
  setDrillQueue: (cards: DrillCard[], focusTopics?: string[]) => void;
  advanceDrill: () => void;

  // Pre-test context
  pretestCards: DrillCard[];
  pretestIndex: number;
  setPretestCards: (cards: DrillCard[]) => void;
  advancePretest: () => void;

  // Gamification
  streak: number;
  lastStudyDate: string;
  momentum: number;
  updateStreak: () => void;
  updateMomentum: (rating: Rating) => void;

  // Friction log
  frictionLog: Map<string, string>;
  addFrictionLog: (cardId: string, reason: string) => void;
}

const persisted = loadPersisted();

export const useSessionStore = create<SessionState>((set, get) => ({
  mode: 'dashboard',
  setMode: (mode) => set({ mode }),

  currentBlock: null,
  setCurrentBlock: (block) => set({ currentBlock: block }),

  readingCurriculumId: null,
  setReadingCurriculumId: (id) => set({ readingCurriculumId: id }),

  detailCurriculumId: null,
  setDetailCurriculumId: (id) => set({ detailCurriculumId: id }),

  currentDrillQueue: [],
  currentDrillIndex: 0,
  drillFocusTopics: [],
  setDrillQueue: (cards, focusTopics = []) =>
    set({ currentDrillQueue: cards, currentDrillIndex: 0, drillFocusTopics: focusTopics }),
  advanceDrill: () =>
    set((state) => ({
      currentDrillIndex: Math.min(
        state.currentDrillIndex + 1,
        state.currentDrillQueue.length
      ),
    })),

  pretestCards: [],
  pretestIndex: 0,
  setPretestCards: (cards) => set({ pretestCards: cards, pretestIndex: 0 }),
  advancePretest: () =>
    set((state) => ({
      pretestIndex: Math.min(state.pretestIndex + 1, state.pretestCards.length),
    })),

  // Gamification — hydrated from localStorage
  streak: persisted.streak,
  lastStudyDate: persisted.lastStudyDate,
  momentum: persisted.momentum,

  updateStreak: () => {
    const today = todayIso();
    const { lastStudyDate, streak } = get();

    let newStreak = streak;
    if (lastStudyDate === today) {
      // Already updated today
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayIso = yesterday.toISOString().slice(0, 10);

    if (lastStudyDate === yesterdayIso) {
      newStreak = streak + 1;
    } else {
      newStreak = 1; // Reset streak
    }

    const data: PersistedSession = {
      streak: newStreak,
      lastStudyDate: today,
      momentum: get().momentum,
    };
    savePersisted(data);
    set({ streak: newStreak, lastStudyDate: today });
  },

  updateMomentum: (rating: Rating) => {
    const { momentum } = get();
    let delta = 0;
    if (rating === Rating.Easy) delta = 10;
    else if (rating === Rating.Good) delta = 5;
    else if (rating === Rating.Hard) delta = -5;
    else if (rating === Rating.Again) delta = -10;

    const newMomentum = Math.min(100, Math.max(0, momentum + delta));
    const data: PersistedSession = {
      streak: get().streak,
      lastStudyDate: get().lastStudyDate,
      momentum: newMomentum,
    };
    savePersisted(data);
    set({ momentum: newMomentum });
  },

  frictionLog: new Map(),
  addFrictionLog: (cardId, reason) =>
    set((state) => {
      const next = new Map(state.frictionLog);
      next.set(cardId, reason);
      return { frictionLog: next };
    }),
}));
