import { useCurriculumStore } from '@/store/curriculumStore';
import { useProgressStore } from '@/store/progressStore';
import { getNextReadingBlock } from '@/engine/rotationEngine';
import type { ReadingBlock } from '@/types';

export function useNextBlock(): ReadingBlock | null {
  const getAllReadingBlocks = useCurriculumStore((s) => s.getAllReadingBlocks);
  const readingProgress = useProgressStore((s) => s.readingProgress);
  const lastTopicId = useProgressStore((s) => s.lastTopicId);

  const blocks = getAllReadingBlocks();
  return getNextReadingBlock(blocks, readingProgress, lastTopicId);
}
