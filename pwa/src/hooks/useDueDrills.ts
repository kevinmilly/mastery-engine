import { useCurriculumStore } from '@/store/curriculumStore';
import { useDrillStore } from '@/store/drillStore';
import type { DrillCard } from '@/types';

/**
 * Fisher-Yates shuffle (in-place).
 */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Reorders cards so no two consecutive cards share the same topicId.
 * Uses a greedy algorithm: at each position, pick a card whose topic differs
 * from the previous. Falls back to any remaining card if no valid candidate exists.
 */
function interleave(cards: DrillCard[]): DrillCard[] {
  if (cards.length <= 1) return cards;

  const remaining = [...cards];
  const result: DrillCard[] = [];

  while (remaining.length > 0) {
    const prevTopic = result.length > 0 ? result[result.length - 1].topicId : null;

    // Find first card whose topic differs from the previous
    const idx = remaining.findIndex((c) => c.topicId !== prevTopic);
    if (idx === -1) {
      // No valid interleaving possible — append whatever is left
      result.push(...remaining.splice(0));
    } else {
      result.push(...remaining.splice(idx, 1));
    }
  }

  return result;
}

export function useDueDrills(focusTopics?: string[]): DrillCard[] {
  const getAllDrillCards = useCurriculumStore((s) => s.getAllDrillCards);
  const getDueCardIds = useDrillStore((s) => s.getDueCardIds);

  let allCards = getAllDrillCards();

  // Filter by focusTopics if provided
  if (focusTopics && focusTopics.length > 0) {
    const topicSet = new Set(focusTopics);
    allCards = allCards.filter((c) => topicSet.has(c.topicId));
  }

  const allCardIds = allCards.map((c) => c.id);
  const dueIds = new Set(getDueCardIds(allCardIds));

  const dueCards = shuffle(allCards.filter((c) => dueIds.has(c.id)));
  return interleave(dueCards);
}
