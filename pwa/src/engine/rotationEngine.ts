import type { ReadingBlock, ReadingProgress } from '@/types';

/**
 * Weighted round-robin reading scheduler.
 *
 * Rules:
 * 1. Only considers blocks where status is 'unread' or 'in-progress'.
 * 2. Never returns a block from the same topicId as lastTopicId.
 * 3. Enforces tier ordering: Mechanics blocks require >50% of Foundations
 *    blocks in the same curriculum to be completed first.
 * 4. Scores topics by time since lastReadAt — longer gap = higher score.
 * 5. Returns the first block (lowest blockIndex) of the highest-scored topic.
 */
export function getNextReadingBlock(
  blocks: ReadingBlock[],
  progress: Map<string, ReadingProgress>,
  lastTopicId: string | null
): ReadingBlock | null {
  if (blocks.length === 0) return null;

  // Build a quick lookup: blockId → progress
  const getProgress = (blockId: string): ReadingProgress =>
    progress.get(blockId) ?? { blockId, status: 'unread' };

  // Filter eligible blocks
  const eligible = blocks.filter((b) => {
    const p = getProgress(b.id);
    return p.status === 'unread' || p.status === 'in-progress';
  });

  if (eligible.length === 0) return null;

  // Compute per-curriculum Foundations completion rate
  const foundationsStats = new Map<
    string,
    { total: number; completed: number }
  >();
  for (const b of blocks) {
    if (b.tier !== 'Foundations') continue;
    const key = b.curriculumId;
    const stat = foundationsStats.get(key) ?? { total: 0, completed: 0 };
    stat.total++;
    const p = getProgress(b.id);
    if (p.status === 'completed') stat.completed++;
    foundationsStats.set(key, stat);
  }

  const foundationsUnlocked = (curriculumId: string): boolean => {
    const stat = foundationsStats.get(curriculumId);
    if (!stat || stat.total === 0) return true; // no foundations → unlocked
    return stat.completed / stat.total > 0.5;
  };

  // Filter by tier gating and skip same topic
  const candidates = eligible.filter((b) => {
    if (b.topicId === lastTopicId) return false;
    if (b.tier === 'Mechanics' || b.tier === 'Mastery') {
      if (!foundationsUnlocked(b.curriculumId)) return false;
    }
    return true;
  });

  if (candidates.length === 0) {
    // Relax the same-topic constraint if nothing else is available
    const fallback = eligible.filter((b) => {
      if (b.tier === 'Mechanics' || b.tier === 'Mastery') {
        if (!foundationsUnlocked(b.curriculumId)) return false;
      }
      return true;
    });
    if (fallback.length === 0) return null;
    return pickBestBlock(fallback, progress);
  }

  return pickBestBlock(candidates, progress);
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

interface TopicScore {
  curriculumId: string;
  topicId: string;
  score: number;
  blocks: ReadingBlock[];
}

function pickBestBlock(
  candidates: ReadingBlock[],
  progress: Map<string, ReadingProgress>
): ReadingBlock | null {
  const now = Date.now();

  // Group by curriculumId + topicId
  const topicMap = new Map<string, TopicScore>();
  for (const b of candidates) {
    const key = `${b.curriculumId}::${b.topicId}`;
    if (!topicMap.has(key)) {
      topicMap.set(key, {
        curriculumId: b.curriculumId,
        topicId: b.topicId,
        score: 0,
        blocks: [],
      });
    }
    topicMap.get(key)!.blocks.push(b);
  }

  // Score each topic by max time-since-lastReadAt across its blocks
  for (const ts of topicMap.values()) {
    let maxScore = 0;
    for (const b of ts.blocks) {
      const p = progress.get(b.id);
      const lastReadAt = p?.lastReadAt ?? 0;
      const gap = now - lastReadAt; // 0 → never read = maximum gap
      if (gap > maxScore) maxScore = gap;
    }
    ts.score = maxScore;
  }

  // Find highest-scored topic
  let best: TopicScore | null = null;
  for (const ts of topicMap.values()) {
    if (!best || ts.score > best.score) best = ts;
  }

  if (!best) return null;

  // Return the first (lowest blockIndex) block of that topic
  best.blocks.sort((a, b) => a.blockIndex - b.blockIndex);
  return best.blocks[0];
}
