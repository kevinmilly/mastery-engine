export interface CurriculumMeta {
  id: string;           // folder name
  title: string;        // parsed from Overview.md H1
  path: string;         // full folder path
  tiers: TierMeta[];
}

export interface TierMeta {
  name: 'Foundations' | 'Mechanics' | 'Mastery';
  topics: TopicMeta[];
  capstoneFile: string;
}

export interface TopicMeta {
  id: string;           // e.g. "foundations-01"
  title: string;
  tier: string;
  sequence: number;
  lessonFile: string;
  practiceFile: string;
}

export interface ReadingBlock {
  id: string;           // e.g. "sys-design/foundations/01/block-2"
  curriculumId: string;
  topicId: string;
  tier: string;
  heading: string;
  content: string;
  blockIndex: number;
  estimatedMinutes: number;
}

export interface DrillCard {
  id: string;           // e.g. "sys-design/foundations/01/ex-3"
  curriculumId: string;
  topicId: string;
  tier: string;
  question: string;
  answer: string;
  source: 'practice' | 'glossary' | 'pretest';
}

export interface ReadingProgress {
  blockId: string;
  status: 'unread' | 'in-progress' | 'completed';
  lastReadAt?: number;
  completedAt?: number;
}

export interface SessionLog {
  id?: number;
  date: number;
  mode: 'reading' | 'drill' | 'pretest';
  topicsHit: string[];
  cardsReviewed: number;
  accuracy: number;
  durationMs: number;
}

export interface PretestAttempt {
  cardId: string;
  attemptedAt: number;
  skipped: boolean;
}
