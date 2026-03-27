import { useCurriculumStore } from '@/store/curriculumStore';
import { useProgressStore } from '@/store/progressStore';
import { useSessionStore } from '@/store/sessionStore';
import { getNextReadingBlock } from '@/engine/rotationEngine';
import type { ReadingBlock } from '@/types';

export function useNextBlock(): ReadingBlock | null {
  const getAllReadingBlocks = useCurriculumStore((s) => s.getAllReadingBlocks);
  const readingProgress = useProgressStore((s) => s.readingProgress);
  const lastTopicId = useProgressStore((s) => s.lastTopicId);
  const readingCurriculumId = useSessionStore((s) => s.readingCurriculumId);

  const allBlocks = getAllReadingBlocks();
  const blocks = readingCurriculumId
    ? allBlocks.filter((b) => b.curriculumId === readingCurriculumId)
    : allBlocks;

  return getNextReadingBlock(blocks, readingProgress, lastTopicId);
}
