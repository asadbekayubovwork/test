import { create } from 'zustand';
import type { CardView } from '../api/courses';

export interface MatchTile {
  id: string;
  cardId: number;
  type: 'term' | 'translation';
  value: string;
  isMatched: boolean;
  isSelected: boolean;
  isWrong: boolean;
}

interface MatchState {
  // Data
  allCards: CardView[]; // All cards from module
  cards: CardView[]; // Selected cards for current game
  tiles: MatchTile[];

  // Game state
  selectedTileId: string | null;
  matchedPairs: number;
  totalPairs: number;
  attempts: number;
  wrongAttempts: number;

  // Timer
  startTime: number | null;
  elapsedTime: number;
  isTimerRunning: boolean;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Game status
  isGameComplete: boolean;
  isGameStarted: boolean;

  // Module ID
  currentModuleId: number | null;

  // Actions
  initializeGame: (cards: CardView[]) => void;
  selectTile: (tileId: string) => void;
  startTimer: () => void;
  stopTimer: () => void;
  updateTimer: () => void;
  resetGame: () => void;
  resetSession: () => void;
  shuffleTiles: () => void;

  // Computed getters
  getProgress: () => { matched: number; total: number; percentage: number };
  getStats: () => { time: number; attempts: number; accuracy: number };
}

// Fisher-Yates shuffle
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const useMatchStore = create<MatchState>((set, get) => ({
  // Initial state
  allCards: [],
  cards: [],
  tiles: [],
  selectedTileId: null,
  matchedPairs: 0,
  totalPairs: 0,
  attempts: 0,
  wrongAttempts: 0,
  startTime: null,
  elapsedTime: 0,
  isTimerRunning: false,
  isLoading: false,
  error: null,
  isGameComplete: false,
  isGameStarted: false,
  currentModuleId: null,

  // Initialize game with cards
  initializeGame: (cards: CardView[]) => {
    // Store all cards for replay
    const allCards = [...cards];

    // Randomly select 6 cards for the match game (12 tiles total)
    const shuffledCards = shuffleArray(allCards);
    const gameCards = shuffledCards.slice(0, Math.min(6, shuffledCards.length));

    // Create tiles for terms and translations
    const tiles: MatchTile[] = [];

    gameCards.forEach((card) => {
      // Get English translation (term is in Russian/source language, translation is in English)
      const translation = card.translations?.find(t => t.locale === 'EN') || card.translations?.[0];

      // Skip cards without valid translations
      if (!translation?.value) return;

      // Term tile (Russian/source word)
      tiles.push({
        id: `term-${card.id}`,
        cardId: card.id,
        type: 'term',
        value: card.term,
        isMatched: false,
        isSelected: false,
        isWrong: false,
      });

      // Translation tile (English)
      tiles.push({
        id: `translation-${card.id}`,
        cardId: card.id,
        type: 'translation',
        value: translation.value,
        isMatched: false,
        isSelected: false,
        isWrong: false,
      });
    });

    // Shuffle tiles
    const shuffledTiles = shuffleArray(tiles);

    // Total pairs is based on actual tiles created (tiles / 2)
    const actualPairs = Math.floor(tiles.length / 2);

    set({
      allCards,
      cards: gameCards,
      tiles: shuffledTiles,
      selectedTileId: null,
      matchedPairs: 0,
      totalPairs: actualPairs,
      attempts: 0,
      wrongAttempts: 0,
      startTime: null,
      elapsedTime: 0,
      isTimerRunning: false,
      isLoading: false,
      error: null,
      isGameComplete: false,
      isGameStarted: false,
    });
  },

  // Select a tile
  selectTile: (tileId: string) => {
    const state = get();

    // Find the selected tile
    const tile = state.tiles.find(t => t.id === tileId);
    if (!tile || tile.isMatched || tile.isWrong) return;

    // Start timer on first selection
    if (!state.isGameStarted) {
      get().startTimer();
      set({ isGameStarted: true });
    }

    // If same tile clicked, deselect
    if (state.selectedTileId === tileId) {
      set({
        selectedTileId: null,
        tiles: state.tiles.map(t => ({
          ...t,
          isSelected: false,
        })),
      });
      return;
    }

    // If no tile selected, select this one
    if (!state.selectedTileId) {
      set({
        selectedTileId: tileId,
        tiles: state.tiles.map(t => ({
          ...t,
          isSelected: t.id === tileId,
        })),
      });
      return;
    }

    // Second tile selected - check for match
    const firstTile = state.tiles.find(t => t.id === state.selectedTileId);
    if (!firstTile) return;

    const newAttempts = state.attempts + 1;

    // Check if they match (same cardId, different types)
    const isMatch = firstTile.cardId === tile.cardId && firstTile.type !== tile.type;

    if (isMatch) {
      // Match found!
      const newMatchedPairs = state.matchedPairs + 1;
      const isComplete = newMatchedPairs === state.totalPairs;

      if (isComplete) {
        get().stopTimer();
      }

      set({
        selectedTileId: null,
        matchedPairs: newMatchedPairs,
        attempts: newAttempts,
        isGameComplete: isComplete,
        tiles: state.tiles.map(t => ({
          ...t,
          isMatched: t.cardId === tile.cardId ? true : t.isMatched,
          isSelected: false,
        })),
      });
    } else {
      // No match - show wrong animation briefly
      set({
        wrongAttempts: state.wrongAttempts + 1,
        attempts: newAttempts,
        tiles: state.tiles.map(t => ({
          ...t,
          isWrong: t.id === state.selectedTileId || t.id === tileId,
          isSelected: t.id === state.selectedTileId || t.id === tileId,
        })),
      });

      // Reset wrong state after animation
      setTimeout(() => {
        set(s => ({
          selectedTileId: null,
          tiles: s.tiles.map(t => ({
            ...t,
            isWrong: false,
            isSelected: false,
          })),
        }));
      }, 500);
    }
  },

  // Timer functions
  startTimer: () => {
    set({
      startTime: Date.now(),
      isTimerRunning: true,
    });
  },

  stopTimer: () => {
    const state = get();
    if (state.startTime) {
      set({
        elapsedTime: Math.floor((Date.now() - state.startTime) / 1000),
        isTimerRunning: false,
      });
    }
  },

  updateTimer: () => {
    const state = get();
    if (state.isTimerRunning && state.startTime) {
      set({
        elapsedTime: Math.floor((Date.now() - state.startTime) / 1000),
      });
    }
  },

  // Reset game - uses allCards to get new random selection
  resetGame: () => {
    const state = get();
    if (state.allCards.length > 0) {
      get().initializeGame(state.allCards);
    }
  },

  // Reset session - clear all state (for navigation cleanup)
  resetSession: () => {
    set({
      allCards: [],
      cards: [],
      tiles: [],
      selectedTileId: null,
      matchedPairs: 0,
      totalPairs: 0,
      attempts: 0,
      wrongAttempts: 0,
      startTime: null,
      elapsedTime: 0,
      isTimerRunning: false,
      isLoading: false,
      error: null,
      isGameComplete: false,
      isGameStarted: false,
      currentModuleId: null,
    });
  },

  // Shuffle tiles
  shuffleTiles: () => {
    const state = get();
    set({
      tiles: shuffleArray(state.tiles),
    });
  },

  // Get progress
  getProgress: () => {
    const state = get();
    return {
      matched: state.matchedPairs,
      total: state.totalPairs,
      percentage: state.totalPairs > 0
        ? Math.round((state.matchedPairs / state.totalPairs) * 100)
        : 0,
    };
  },

  // Get stats
  getStats: () => {
    const state = get();
    const accuracy = state.attempts > 0
      ? Math.round((state.matchedPairs / state.attempts) * 100)
      : 0;

    return {
      time: state.elapsedTime,
      attempts: state.attempts,
      accuracy,
    };
  },
}));
