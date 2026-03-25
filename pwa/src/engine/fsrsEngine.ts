import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  Rating,
  type Card,
  type RecordLog,
} from 'ts-fsrs';

export { Rating };
export type { Card };

const params = generatorParameters();
const scheduler = fsrs(params);

export function createCard(): Card {
  return createEmptyCard();
}

export function scheduleCard(
  card: Card,
  rating: Rating
): { card: Card; log: RecordLog } {
  const now = new Date();
  // scheduler.repeat returns an IPreview record. We cast through unknown to
  // access it by numeric key since ts-fsrs types don't expose a plain index sig.
  const recordLogs = scheduler.repeat(card, now) as unknown as Record<
    number,
    { card: Card; log: RecordLog }
  >;
  const result = recordLogs[rating as number];
  return { card: result.card, log: result.log };
}

export function isDue(card: Card): boolean {
  return new Date(card.due) <= new Date();
}

export function getDueCards(cards: Map<string, Card>): string[] {
  const due: string[] = [];
  for (const [id, card] of cards) {
    if (isDue(card)) due.push(id);
  }
  return due;
}
