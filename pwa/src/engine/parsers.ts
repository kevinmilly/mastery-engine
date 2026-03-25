import matter from 'gray-matter';
import type { CurriculumMeta, TierMeta, TopicMeta, ReadingBlock, DrillCard } from '@/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Extract the first H1 line from markdown content */
function extractH1(content: string): string | null {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

/**
 * Parse an INDEX.md that contains tier sections and markdown tables.
 * Returns tier → topics mapping.
 *
 * Table columns: Status | Topic | Lesson | Practice
 * Links look like: [Read](Foundations/01-foundations-01.md)
 */
function parseIndexTable(indexContent: string): TierMeta[] | null {
  const tierNames: Array<'Foundations' | 'Mechanics' | 'Mastery'> = [
    'Foundations',
    'Mechanics',
    'Mastery',
  ];

  const tiers: TierMeta[] = [];

  for (const tierName of tierNames) {
    // Find the tier section heading
    const tierRegex = new RegExp(
      `###\\s+${tierName}\\s*\\n([\\s\\S]*?)(?=###\\s+|$)`,
      'i'
    );
    const tierMatch = indexContent.match(tierRegex);
    if (!tierMatch) continue;

    const tierSection = tierMatch[1];
    const topics: TopicMeta[] = [];
    let capstoneFile = '';
    let sequence = 0;

    // Split into lines and look for table rows (start with |)
    const lines = tierSection.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('|')) continue;

      // Skip separator lines like |:---|:---|
      if (/^\|[\s:|-]+\|$/.test(trimmed)) continue;

      // Parse cells
      const cells = trimmed
        .split('|')
        .map((c) => c.trim())
        .filter((c) => c !== '');

      if (cells.length < 3) continue;

      // Check for capstone row: [**Capstone: ...**](path)
      const capstoneLink = cells.find((c) =>
        /\[.*[Cc]apstone.*\]\((.+)\)/.test(c)
      );
      if (capstoneLink) {
        const m = capstoneLink.match(/\[.*\]\((.+)\)/);
        if (m) capstoneFile = m[1];
        continue;
      }

      // Normal topic row: cells[0]=status, cells[1]=topic title, cells[2]=lesson link, cells[3]=practice link
      const topicTitle = cells[1];
      if (!topicTitle) continue;

      const lessonCell = cells[2] ?? '';
      const practiceCell = cells[3] ?? '';

      const lessonMatch = lessonCell.match(/\[.*?\]\((.+?)\)/);
      const practiceMatch = practiceCell.match(/\[.*?\]\((.+?)\)/);

      if (!lessonMatch) continue;

      const lessonFile = lessonMatch[1];
      const practiceFile = practiceMatch ? practiceMatch[1] : '';

      // Derive topic id from lessonFile filename, e.g. Foundations/01-foundations-01.md → foundations-01
      const fileBasename = lessonFile.split('/').pop() ?? '';
      const idMatch = fileBasename.match(/^\d+-(.+?)\.md$/);
      const topicId = idMatch
        ? idMatch[1]
        : fileBasename.replace('.md', '');

      sequence++;
      topics.push({
        id: topicId,
        title: topicTitle,
        tier: tierName,
        sequence,
        lessonFile,
        practiceFile,
      });
    }

    tiers.push({ name: tierName, topics, capstoneFile });
  }

  return tiers.length > 0 ? tiers : null;
}

// ---------------------------------------------------------------------------
// Exported parsers
// ---------------------------------------------------------------------------

export function parseCurriculumMeta(
  folderName: string,
  overviewContent: string,
  indexContent: string
): CurriculumMeta | null {
  if (!overviewContent || !indexContent) return null;

  const rawTitle = extractH1(overviewContent);
  if (!rawTitle) return null;
  // Strip "Curriculum Overview: " prefix if present
  const title = rawTitle.replace(/^curriculum\s+overview:\s*/i, '').trim();

  const tiers = parseIndexTable(indexContent);
  if (!tiers) return null;

  return {
    id: folderName,
    title,
    path: folderName,
    tiers,
  };
}

// ---------------------------------------------------------------------------

export function parseReadingBlocks(
  topicMeta: TopicMeta,
  lessonContent: string,
  curriculumId: string
): ReadingBlock[] {
  if (!lessonContent) return [];

  // Strip frontmatter
  const { content } = matter(lessonContent);

  // Split by H2 headings
  const sections = content.split(/^## /m);
  const blocks: ReadingBlock[] = [];
  let blockIndex = 0;

  for (const section of sections) {
    if (!section.trim()) continue;

    // First line is the heading (after the split removed "## ")
    const newlineIdx = section.indexOf('\n');
    const heading =
      newlineIdx !== -1
        ? section.substring(0, newlineIdx).trim()
        : section.trim();
    const body =
      newlineIdx !== -1 ? section.substring(newlineIdx + 1).trim() : '';

    const wc = wordCount(body);
    if (wc < 50) continue;

    const estimatedMinutes = Math.max(1, Math.ceil(wc / 200));

    blocks.push({
      id: `${curriculumId}/${topicMeta.id}/block-${blockIndex}`,
      curriculumId,
      topicId: topicMeta.id,
      tier: topicMeta.tier,
      heading,
      content: body,
      blockIndex,
      estimatedMinutes,
    });

    blockIndex++;
  }

  return blocks;
}

// ---------------------------------------------------------------------------

export function parseDrillCards(
  topicMeta: TopicMeta,
  practiceContent: string,
  curriculumId: string
): DrillCard[] {
  if (!practiceContent) return [];

  const { content } = matter(practiceContent);

  // Split into Exercises and Answer Key sections
  const exercisesSectionMatch = content.match(
    /^## Exercises\s*\n([\s\S]*?)(?=^## Answer Key|$)/m
  );
  const answerKeySectionMatch = content.match(/^## Answer Key\s*\n([\s\S]*)/m);

  if (!exercisesSectionMatch) return [];

  const exercisesSection = exercisesSectionMatch[1];
  const answerKeySection = answerKeySectionMatch
    ? answerKeySectionMatch[1]
    : '';

  // Parse exercise blocks
  const exerciseMap = new Map<number, string>();
  const exerciseBlocks = exercisesSection.split(/(?=\*\*Exercise \d+\*\*)/);
  for (const block of exerciseBlocks) {
    const numMatch = block.match(/^\*\*Exercise (\d+)\*\*/);
    if (!numMatch) continue;
    const num = parseInt(numMatch[1], 10);
    const text = block.replace(/^\*\*Exercise \d+\*\*\s*/, '').trim();
    exerciseMap.set(num, text);
  }

  // Parse answer blocks
  const answerMap = new Map<number, string>();
  const answerBlocks = answerKeySection.split(/(?=\*\*Answer \d+\*\*)/);
  for (const block of answerBlocks) {
    const numMatch = block.match(/^\*\*Answer (\d+)\*\*/);
    if (!numMatch) continue;
    const num = parseInt(numMatch[1], 10);
    const text = block.replace(/^\*\*Answer \d+\*\*\s*/, '').trim();
    answerMap.set(num, text);
  }

  const cards: DrillCard[] = [];
  for (const [num, question] of exerciseMap) {
    const answer = answerMap.get(num) ?? '';
    cards.push({
      id: `${curriculumId}/${topicMeta.id}/ex-${num}`,
      curriculumId,
      topicId: topicMeta.id,
      tier: topicMeta.tier,
      question,
      answer,
      source: 'practice',
    });
  }

  return cards;
}

// ---------------------------------------------------------------------------

export function parseGlossary(
  curriculumId: string,
  glossaryContent: string
): DrillCard[] {
  if (!glossaryContent) return [];

  const { content } = matter(glossaryContent);
  const cards: DrillCard[] = [];
  let index = 0;

  const lines = content.split('\n');

  // Strategy 1: Check for a markdown table with Term/Definition columns
  const headerLineIdx = lines.findIndex((l) =>
    /\|\s*[Tt]erm\s*\|/.test(l)
  );
  if (headerLineIdx !== -1) {
    for (let i = headerLineIdx + 2; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line.startsWith('|')) break;
      const cells = line
        .split('|')
        .map((c) => c.trim())
        .filter(Boolean);
      if (cells.length >= 2 && cells[0] && cells[1]) {
        cards.push({
          id: `${curriculumId}/glossary/${index++}`,
          curriculumId,
          topicId: 'glossary',
          tier: 'Foundations',
          question: cells[0],
          answer: cells[1],
          source: 'glossary',
        });
      }
    }
    if (cards.length > 0) return cards;
  }

  // Strategy 2: `- **Term**: definition` list items
  // Strategy 3: `**Term**\ndefinition paragraph`
  // Process line by line
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Pattern: `- **Term**: definition` or `* **Term**: definition`
    const listMatch = line.match(/^[-*]\s+\*\*(.+?)\*\*[:\s]+(.+)$/);
    if (listMatch) {
      cards.push({
        id: `${curriculumId}/glossary/${index++}`,
        curriculumId,
        topicId: 'glossary',
        tier: 'Foundations',
        question: listMatch[1].trim(),
        answer: listMatch[2].trim(),
        source: 'glossary',
      });
      i++;
      continue;
    }

    // Pattern: `**Term**` on its own line, followed by definition paragraph
    const termLineMatch = line.match(/^\*\*(.+?)\*\*\s*$/);
    if (termLineMatch) {
      // Collect following non-empty, non-heading lines as definition
      const defLines: string[] = [];
      let j = i + 1;
      while (j < lines.length) {
        const next = lines[j].trim();
        if (!next || next.startsWith('#') || next.startsWith('**')) break;
        defLines.push(next);
        j++;
      }
      const definition = defLines.join(' ').trim();
      if (definition) {
        cards.push({
          id: `${curriculumId}/glossary/${index++}`,
          curriculumId,
          topicId: 'glossary',
          tier: 'Foundations',
          question: termLineMatch[1].trim(),
          answer: definition,
          source: 'glossary',
        });
        i = j;
        continue;
      }
    }

    i++;
  }

  return cards;
}

// ---------------------------------------------------------------------------

export function parseCapstone(
  tierName: string,
  _curriculumId: string,
  capstoneContent: string
): { scenario: string; tasks: string[] } | null {
  if (!capstoneContent || capstoneContent.trim().length < 100) return null;

  const { content } = matter(capstoneContent);

  // Find "### Your Tasks" or similar heading
  const tasksHeadingMatch = content.match(
    /^###\s+(?:Your\s+)?Tasks?\s*\n([\s\S]*?)(?=^###\s+|$)/im
  );

  // Scenario: everything before the tasks heading (or before a "### " heading)
  let scenario = '';
  if (tasksHeadingMatch) {
    const tasksStart = content.indexOf(tasksHeadingMatch[0]);
    scenario = content.substring(0, tasksStart).trim();
  } else {
    // Take the first paragraph block
    const firstHeadingMatch = content.match(/^###\s+/m);
    scenario = firstHeadingMatch
      ? content.substring(0, content.indexOf(firstHeadingMatch[0])).trim()
      : content.trim();
  }

  // Strip the H2/H3 heading from the top of scenario if present
  scenario = scenario.replace(/^#+\s.*\n/, '').trim();

  // Extract tasks as numbered list items
  const tasksSection = tasksHeadingMatch ? tasksHeadingMatch[1] : '';
  const tasks: string[] = [];
  if (tasksSection) {
    // Match `1.  **Title:** text` or `1. text` patterns
    const taskMatches = tasksSection.matchAll(
      /^\d+\.\s+(?:\*\*.*?\*\*[:\s]*)?([\s\S]*?)(?=^\d+\.\s+|$)/gm
    );
    for (const m of taskMatches) {
      const taskText = m[0]
        .replace(/^\d+\.\s+/, '')
        .trim();
      if (taskText) tasks.push(taskText);
    }
  }

  if (!scenario && tasks.length === 0) return null;

  return {
    scenario: scenario || `${tierName} Capstone`,
    tasks,
  };
}

// Re-export tier name type for convenience
export type TierName = 'Foundations' | 'Mechanics' | 'Mastery';
