import { create } from 'zustand';
import { getDb } from '@/lib/db';
import {
  createCard,
  scheduleCard,
  getDueCards,
  Rating,
  type Card,
} from '@/engine/fsrsEngine';
import type { SessionLog } from '@/types';

export { Rating };

interface CurrentSession {
  startTime: number;
  reviewed: string[];
  ratings: Rating[];
  topicsHit: Set<string>;
}

interface DrillState {
  cards: Map<string, Card>;

  initCard: (cardId: string) => Promise<void>;
  rateCard: (cardId: string, rating: Rating) => Promise<void>;
  getDueCardIds: (allCardIds: string[]) => string[];
  getCardStats: (cardId: string) => Card | undefined;

  // Session tracking
  currentSession: CurrentSession | null;
  startSession: () => void;
  endSession: (mode: 'reading' | 'drill' | 'pretest') => Promise<void>;

  // Internal
  _init: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// IDB helpers — drill_state stores DrillCard & { fsrsState?: unknown }
// We use only the fsrsState field keyed by cardId. We store a minimal stub
// with just id + fsrsState so the keyPath ('id') constraint is satisfied.
// ---------------------------------------------------------------------------

async function loadCardFromDb(cardId: string): Promise<Card | null> {
  try {
    const db = await getDb();
    const record = await db.get('drill_state', cardId);
    if (!record?.fsrsState) return null;
    return record.fsrsState as Card;
  } catch {
    return null;
  }
}

async function saveCardToDb(cardId: string, card: Card): Promise<void> {
  try {
    const db = await getDb();
    // Preserve existing fields; only update fsrsState
    const existing = await db.get('drill_state', cardId);
    await db.put('drill_state', {
      ...(existing ?? {
        id: cardId,
        curriculumId: '',
        topicId: '',
        tier: '',
        question: '',
        answer: '',
        source: 'practice' as const,
      }),
      fsrsState: card,
    });
  } catch (err) {
    console.warn('Failed to persist drill state:', err);
  }
}

export const useDrillStore = create<DrillState>((set, get) => ({
  cards: new Map(),
  currentSession: null,

  _init: async () => {
    try {
      const db = await getDb();
      const all = await db.getAll('drill_state');
      const map = new Map<string, Card>();
      for (const record of all) {
        if (record.fsrsState) {
          map.set(record.id, record.fsrsState as Card);
        }
      }
      set({ cards: map });
    } catch (err) {
      console.warn('Failed to load drill states from IDB:', err);
    }
  },

  initCard: async (cardId: string) => {
    if (get().cards.has(cardId)) return;

    // Try to load from IDB first (in case store was reset)
    const existing = await loadCardFromDb(cardId);
    if (existing) {
      set((state) => {
        const next = new Map(state.cards);
        next.set(cardId, existing);
        return { cards: next };
      });
      return;
    }

    const card = createCard();
    await saveCardToDb(cardId, card);
    set((state) => {
      const next = new Map(state.cards);
      next.set(cardId, card);
      return { cards: next };
    });
  },

  rateCard: async (cardId: string, rating: Rating) => {
    let card = get().cards.get(cardId);
    if (!card) {
      card = createCard();
    }

    const { card: updated } = scheduleCard(card, rating);
    await saveCardToDb(cardId, updated);

    set((state) => {
      const next = new Map(state.cards);
      next.set(cardId, updated);
      return { cards: next };
    });

    // Track in current session
    const session = get().currentSession;
    if (session) {
      set({
        currentSession: {
          ...session,
          reviewed: [...session.reviewed, cardId],
          ratings: [...session.ratings, rating],
        },
      });
    }
  },

  getDueCardIds: (allCardIds: string[]) => {
    const { cards } = get();
    // Cards that exist in the store and are due, plus new cards (not yet initialized)
    const dueFromStore = getDueCards(cards);
    const dueSet = new Set(dueFromStore);
    // New cards (not yet in store) are always "due"
    for (const id of allCardIds) {
      if (!cards.has(id)) dueSet.add(id);
    }
    // Return only those in allCardIds
    return allCardIds.filter((id) => dueSet.has(id));
  },

  getCardStats: (cardId: string) => {
    return get().cards.get(cardId);
  },

  startSession: () => {
    set({
      currentSession: {
        startTime: Date.now(),
        reviewed: [],
        ratings: [],
        topicsHit: new Set(),
      },
    });
  },

  endSession: async (mode: 'reading' | 'drill' | 'pretest') => {
    const session = get().currentSession;
    if (!session) return;

    const durationMs = Date.now() - session.startTime;
    const cardsReviewed = session.reviewed.length;
    const goodOrEasy = session.ratings.filter(
      (r) => r === Rating.Good || r === Rating.Easy
    ).length;
    const accuracy =
      cardsReviewed > 0 ? Math.round((goodOrEasy / cardsReviewed) * 100) : 0;

    const log: SessionLog = {
      date: Date.now(),
      mode,
      topicsHit: Array.from(session.topicsHit),
      cardsReviewed,
      accuracy,
      durationMs,
    };

    try {
      const db = await getDb();
      await db.add('session_log', log);
    } catch (err) {
      console.warn('Failed to save session log:', err);
    }

    set({ currentSession: null });
  },
}));

// Initialize on module load
useDrillStore.getState()._init();
