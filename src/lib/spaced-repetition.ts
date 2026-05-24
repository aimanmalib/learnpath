/**
 * SM-2 Spaced Repetition Algorithm
 *
 * Based on Piotr Wozniak's SuperMemo 2 algorithm.
 * Used for adaptive flashcard scheduling in LearnPath.
 */

export interface CardState {
  id: string;
  /** Easiness factor (>= 1.3) */
  easiness: number;
  /** Current repetition interval in days */
  interval: number;
  /** Number of consecutive correct responses */
  repetitions: number;
  /** Next review date as ISO string */
  nextReview: string;
  /** Total reviews */
  totalReviews: number;
  /** Total correct */
  correctCount: number;
}

export type QualityRating = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Create initial card state for a new flashcard.
 */
export function createCardState(id: string): CardState {
  return {
    id,
    easiness: 2.5,
    interval: 0,
    repetitions: 0,
    nextReview: new Date().toISOString(),
    totalReviews: 0,
    correctCount: 0,
  };
}

/**
 * Apply SM-2 algorithm to update card state based on quality of response.
 *
 * Quality ratings:
 *   0 = Complete blackout
 *   1 = Incorrect, but recalled upon seeing answer
 *   2 = Incorrect, but easy to recall
 *   3 = Correct with serious difficulty
 *   4 = Correct with some hesitation
 *   5 = Perfect response
 *
 * @returns Updated CardState
 */
export function updateCardState(
  state: CardState,
  quality: QualityRating,
): CardState {
  const now = new Date();
  let { easiness, interval, repetitions } = state;

  // Update easiness factor
  easiness += 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  easiness = Math.max(1.3, easiness);

  // Update interval and repetitions
  if (quality < 3) {
    // Failed — reset
    repetitions = 0;
    interval = 1;
  } else {
    // Passed
    repetitions++;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easiness);
    }
  }

  // Calculate next review date
  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    ...state,
    easiness: Math.round(easiness * 100) / 100,
    interval,
    repetitions,
    nextReview: nextReview.toISOString(),
    totalReviews: state.totalReviews + 1,
    correctCount: state.correctCount + (quality >= 3 ? 1 : 0),
  };
}

/**
 * Get cards due for review, sorted by urgency.
 */
export function getDueCards(cards: CardState[]): CardState[] {
  const now = new Date();
  return cards
    .filter((card) => new Date(card.nextReview) <= now)
    .sort(
      (a, b) =>
        new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime(),
    );
}

/**
 * Calculate retention rate for a set of cards.
 */
export function calculateRetention(cards: CardState[]): number {
  if (cards.length === 0) return 0;
  const totalCorrect = cards.reduce((sum, c) => sum + c.correctCount, 0);
  const totalReviews = cards.reduce((sum, c) => sum + c.totalReviews, 0);
  return totalReviews === 0 ? 0 : totalCorrect / totalReviews;
}

/**
 * Get mastery level description based on easiness factor.
 */
export function getMasteryLevel(easiness: number): string {
  if (easiness >= 2.5) return "Mastered";
  if (easiness >= 2.0) return "Familiar";
  if (easiness >= 1.7) return "Learning";
  return "Struggling";
}
