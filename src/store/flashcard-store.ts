import { create } from "zustand";
import { CardState, createCardState, updateCardState, QualityRating } from "@/lib/spaced-repetition";

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  topic: string;
}

interface FlashcardState {
  cards: Flashcard[];
  cardStates: Record<string, CardState>;
  currentIndex: number;
  isFlipped: boolean;
  topic: string;

  setCards: (cards: Flashcard[], topic: string) => void;
  flip: () => void;
  rate: (quality: QualityRating) => void;
  next: () => void;
  reset: () => void;
  getDueCount: () => number;
  getProgress: () => { reviewed: number; remaining: number; total: number };
}

export const useFlashcardStore = create<FlashcardState>((set, get) => ({
  cards: [],
  cardStates: {},
  currentIndex: 0,
  isFlipped: false,
  topic: "",

  setCards: (cards, topic) => {
    const states: Record<string, CardState> = {};
    for (const card of cards) {
      states[card.id] = get().cardStates[card.id] || createCardState(card.id);
    }
    set({ cards, cardStates: states, currentIndex: 0, isFlipped: false, topic });
  },

  flip: () => set((s) => ({ isFlipped: !s.isFlipped })),

  rate: (quality) => {
    const state = get();
    const card = state.cards[state.currentIndex];
    if (!card) return;

    const currentState = state.cardStates[card.id] || createCardState(card.id);
    const updated = updateCardState(currentState, quality);

    set({
      cardStates: { ...state.cardStates, [card.id]: updated },
    });
  },

  next: () => {
    const state = get();
    const nextIdx = state.currentIndex + 1;
    if (nextIdx < state.cards.length) {
      set({ currentIndex: nextIdx, isFlipped: false });
    }
  },

  reset: () => set({ currentIndex: 0, isFlipped: false }),

  getDueCount: () => {
    const { cardStates } = get();
    const now = new Date();
    return Object.values(cardStates).filter(
      (cs) => new Date(cs.nextReview) <= now,
    ).length;
  },

  getProgress: () => {
    const { currentIndex, cards } = get();
    return {
      reviewed: currentIndex,
      remaining: cards.length - currentIndex,
      total: cards.length,
    };
  },
}));
