import type { CurriculumMeta, ReadingBlock, DrillCard } from '@/types';
import type { CurriculumSource } from './gitHubSource';
import {
  parseCurriculumMeta,
  parseReadingBlocks,
  parseDrillCards,
  parseGlossary,
  parseCapstone,
} from './parsers';
import { getDb } from '@/lib/db';

export interface LoadedCurriculum {
  meta: CurriculumMeta;
  readingBlocks: ReadingBlock[];
  drillCards: DrillCard[];
  capstones: Array<{ tier: string; content: { scenario: string; tasks: string[] } }>;
}

// ---------------------------------------------------------------------------
// Cache helpers
// ---------------------------------------------------------------------------

async function getCachedFile(
  path: string
): Promise<{ content: string; hash: string } | null> {
  try {
    const db = await getDb();
    const entry = await db.get('file_cache', path);
    if (!entry) return null;
    return { content: entry.content, hash: entry.content }; // hash stored in content for simplicity
  } catch {
    return null;
  }
}

async function cacheFile(path: string, content: string): Promise<void> {
  try {
    const db = await getDb();
    await db.put('file_cache', { path, content, cachedAt: Date.now() });
  } catch {
    // Non-fatal — continue without caching
  }
}

async function readWithCache(
  source: CurriculumSource,
  path: string
): Promise<string | null> {
  // Check cache first
  const cached = await getCachedFile(path);
  if (cached) return cached.content;

  // Cache miss — fetch from network
  const fresh = await source.readFile(path);
  if (fresh === null) return null;

  // Store in cache for next time
  await cacheFile(path, fresh);
  return fresh;
}

// ---------------------------------------------------------------------------
// Single curriculum loader
// ---------------------------------------------------------------------------

export async function loadCurriculum(
  source: CurriculumSource,
  folderName: string
): Promise<LoadedCurriculum | null> {
  // Read Overview + INDEX
  const [overviewContent, indexContent] = await Promise.all([
    readWithCache(source, `${folderName}/Overview.md`),
    readWithCache(source, `${folderName}/INDEX.md`),
  ]);

  if (!overviewContent) console.warn(`Missing Overview.md for ${folderName}`);
  if (!indexContent) console.warn(`Missing INDEX.md for ${folderName}`);
  if (!overviewContent || !indexContent) return null;

  const meta = parseCurriculumMeta(folderName, overviewContent, indexContent);
  if (!meta) console.warn(`Failed to parse meta for ${folderName}`);
  if (!meta) return null;

  const readingBlocks: ReadingBlock[] = [];
  const drillCards: DrillCard[] = [];
  const capstones: LoadedCurriculum['capstones'] = [];

  // Load each tier
  for (const tier of meta.tiers) {
    // Load topics
    for (const topic of tier.topics) {
      // Lesson
      const lessonPath = `${folderName}/${topic.lessonFile}`;
      const lessonContent = await readWithCache(source, lessonPath);
      if (lessonContent) {
        const blocks = parseReadingBlocks(topic, lessonContent, folderName);
        readingBlocks.push(...blocks);
      }

      // Practice
      if (topic.practiceFile) {
        const practicePath = `${folderName}/${topic.practiceFile}`;
        const practiceContent = await readWithCache(source, practicePath);
        if (practiceContent) {
          const cards = parseDrillCards(topic, practiceContent, folderName);
          drillCards.push(...cards);
        }
      }
    }

    // Capstone
    if (tier.capstoneFile) {
      const capstonePath = `${folderName}/${tier.capstoneFile}`;
      const capstoneContent = await readWithCache(source, capstonePath);
      if (capstoneContent) {
        const result = parseCapstone(tier.name, folderName, capstoneContent);
        if (result) {
          capstones.push({ tier: tier.name, content: result });
        }
      }
    }
  }

  // Glossary
  const glossaryContent = await readWithCache(
    source,
    `${folderName}/Glossary.md`
  );
  if (glossaryContent) {
    const glossaryCards = parseGlossary(folderName, glossaryContent);
    drillCards.push(...glossaryCards);
  }

  return { meta, readingBlocks, drillCards, capstones };
}

// ---------------------------------------------------------------------------
// All curricula loader
// ---------------------------------------------------------------------------

export async function loadAllCurricula(
  source: CurriculumSource,
  folderNames?: string[]
): Promise<LoadedCurriculum[]> {
  const names = folderNames ?? (await source.listCurricula());
  const results: LoadedCurriculum[] = [];

  await Promise.allSettled(
    names.map(async (name) => {
      try {
        const loaded = await loadCurriculum(source, name);
        if (loaded) results.push(loaded);
      } catch (err) {
        console.error(`Failed to load curriculum "${name}":`, err);
      }
    })
  );

  // Sort by folder name
  results.sort((a, b) => a.meta.id.localeCompare(b.meta.id));
  return results;
}
