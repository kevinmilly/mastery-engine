import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { ReadingProgress, SessionLog, PretestAttempt, DrillCard } from '@/types';

interface MasteryEngineDB extends DBSchema {
  reading_progress: {
    key: string;
    value: ReadingProgress;
    indexes: { by_status: string };
  };
  drill_state: {
    key: string;
    value: DrillCard & { fsrsState?: unknown };
  };
  session_log: {
    key: number;
    value: SessionLog;
    indexes: { by_date: number };
  };
  pretest_log: {
    key: string;
    value: PretestAttempt;
    indexes: { by_date: number };
  };
  file_cache: {
    key: string;
    value: { path: string; content: string; cachedAt: number };
  };
}

let dbInstance: IDBPDatabase<MasteryEngineDB> | null = null;

export async function getDb(): Promise<IDBPDatabase<MasteryEngineDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<MasteryEngineDB>('mastery-engine', 1, {
    upgrade(db) {
      // reading_progress
      const readingStore = db.createObjectStore('reading_progress', {
        keyPath: 'blockId',
      });
      readingStore.createIndex('by_status', 'status');

      // drill_state
      db.createObjectStore('drill_state', { keyPath: 'id' });

      // session_log
      const sessionStore = db.createObjectStore('session_log', {
        keyPath: 'id',
        autoIncrement: true,
      });
      sessionStore.createIndex('by_date', 'date');

      // pretest_log
      const pretestStore = db.createObjectStore('pretest_log', {
        keyPath: 'cardId',
      });
      pretestStore.createIndex('by_date', 'attemptedAt');

      // file_cache
      db.createObjectStore('file_cache', { keyPath: 'path' });
    },
  });

  return dbInstance;
}
