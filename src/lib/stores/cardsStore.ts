import { create } from 'zustand';
import type { WordCard, FlashcardSession } from '../../types';
import { vocabularyCards } from '../data/words';

interface CardsState {
  allCards: WordCard[];
  currentSession: FlashcardSession | null;
  favorites: string[];
}

interface CardsActions {
  // Session management
  startSession: (courseId: string, cards: WordCard[]) => void;
  endSession: () => void;

  // Card interactions
  swipeCard: (known: boolean) => void;
  toggleFavorite: (cardId: string) => void;
  markAsLearned: (cardId: string) => void;

  // Getters
  getCurrentCard: () => WordCard | null;
  getSessionProgress: () => { current: number; total: number; known: number; unknown: number };
  getFavoriteCards: () => WordCard[];
}

type CardsStore = CardsState & CardsActions;

export const useCardsStore = create<CardsStore>((set, get) => ({
  allCards: vocabularyCards,
  currentSession: null,
  favorites: [],

  startSession: (courseId, cards) => {
    set({
      currentSession: {
        courseId,
        cards,
        currentIndex: 0,
        knownCards: [],
        unknownCards: [],
        startedAt: new Date().toISOString(),
      },
    });
  },

  endSession: () => {
    set({ currentSession: null });
  },

  swipeCard: (known) => {
    const { currentSession } = get();
    if (!currentSession) return;

    const currentCard = currentSession.cards[currentSession.currentIndex];
    if (!currentCard) return;

    const newKnownCards = known
      ? [...currentSession.knownCards, currentCard.id]
      : currentSession.knownCards;

    const newUnknownCards = !known
      ? [...currentSession.unknownCards, currentCard.id]
      : currentSession.unknownCards;

    set({
      currentSession: {
        ...currentSession,
        currentIndex: currentSession.currentIndex + 1,
        knownCards: newKnownCards,
        unknownCards: newUnknownCards,
      },
    });
  },

  toggleFavorite: (cardId) => {
    const { favorites, allCards } = get();
    const isFavorite = favorites.includes(cardId);

    const newFavorites = isFavorite
      ? favorites.filter((id) => id !== cardId)
      : [...favorites, cardId];

    const newAllCards = allCards.map((card) =>
      card.id === cardId ? { ...card, isFavorite: !isFavorite } : card
    );

    set({ favorites: newFavorites, allCards: newAllCards });
  },

  markAsLearned: (cardId) => {
    const { allCards } = get();
    const newAllCards = allCards.map((card) =>
      card.id === cardId
        ? {
            ...card,
            learned: true,
            lastReviewed: new Date().toISOString(),
            reviewCount: card.reviewCount + 1,
          }
        : card
    );
    set({ allCards: newAllCards });
  },

  getCurrentCard: () => {
    const { currentSession } = get();
    if (!currentSession) return null;
    return currentSession.cards[currentSession.currentIndex] || null;
  },

  getSessionProgress: () => {
    const { currentSession } = get();
    if (!currentSession) {
      return { current: 0, total: 0, known: 0, unknown: 0 };
    }
    return {
      current: currentSession.currentIndex,
      total: currentSession.cards.length,
      known: currentSession.knownCards.length,
      unknown: currentSession.unknownCards.length,
    };
  },

  getFavoriteCards: () => {
    const { allCards, favorites } = get();
    return allCards.filter((card) => favorites.includes(card.id));
  },
}));
