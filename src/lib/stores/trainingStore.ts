import { create } from 'zustand';
import {
  getTrainingByModule,
  submitTrainingResult,
  resetTrainingProgress,
  type TrainingResponse,
} from '../api/training';

interface TrainingState {
  // Data
  trainingCards: TrainingResponse[];
  currentCardIndex: number;

  // Loading states
  isLoading: boolean;
  isSubmitting: boolean;

  // Error state
  error: string | null;

  // Warning for non-blocking errors (e.g., progress not saved)
  warning: string | null;

  // Stats
  knownCount: number;
  unknownCount: number;

  // Module ID
  currentModuleId: number | null;

  // Offline mode (when API submissions fail)
  isOfflineMode: boolean;

  // Actions
  fetchTraining: (moduleId: number) => Promise<void>;
  submitAnswer: (cardId: number, known: boolean) => Promise<void>;
  nextCard: () => void;
  previousCard: () => void;
  resetProgress: (moduleId: number) => Promise<void>;
  resetSession: () => void;
  clearWarning: () => void;

  // Computed getters
  getCurrentCard: () => TrainingResponse | null;
  getProgress: () => { current: number; total: number; percentage: number };
  isCompleted: () => boolean;
  getUnansweredCards: () => TrainingResponse[];
}

export const useTrainingStore = create<TrainingState>((set, get) => ({
  // Initial state
  trainingCards: [],
  currentCardIndex: 0,
  isLoading: false,
  isSubmitting: false,
  error: null,
  warning: null,
  knownCount: 0,
  unknownCount: 0,
  currentModuleId: null,
  isOfflineMode: false,

  // Fetch training data for a module
  fetchTraining: async (moduleId: number) => {
    set({ isLoading: true, error: null, currentModuleId: moduleId });

    try {
      const data = await getTrainingByModule(moduleId);

      // Calculate initial stats from already answered cards
      const knownCount = data.filter((t) => t.progress.isAnswered && t.progress.isKnown).length;
      const unknownCount = data.filter((t) => t.progress.isAnswered && !t.progress.isKnown).length;

      // Find first unanswered card index
      const firstUnansweredIndex = data.findIndex((t) => !t.progress.isAnswered);

      set({
        trainingCards: data,
        currentCardIndex: firstUnansweredIndex >= 0 ? firstUnansweredIndex : 0,
        knownCount,
        unknownCount,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load training';

      // Check if it's a payment/permission error - try to load cards directly for practice mode
      if (errorMessage.includes('not paid') || errorMessage.includes('permission') || errorMessage.includes('access') || errorMessage.includes('404')) {
        console.warn('[TrainingStore] Training API blocked, trying to load cards directly for practice mode');

        try {
          // Import dynamically to avoid circular dependencies
          const { getModuleCards } = await import('../api/courses');
          const cards = await getModuleCards(moduleId);

          if (cards && cards.length > 0) {
            // Convert cards to training format with empty progress
            const trainingData: TrainingResponse[] = cards.map((card) => ({
              card,
              progress: {
                isKnown: false,
                isAnswered: false,
                isFavorites: false,
              },
            }));

            set({
              trainingCards: trainingData,
              currentCardIndex: 0,
              knownCount: 0,
              unknownCount: 0,
              isLoading: false,
              isOfflineMode: true,
              warning: 'Practice mode - progress won\'t be saved. Purchase the course to track progress.',
            });
            return;
          }
        } catch (fallbackError) {
          console.error('[TrainingStore] Fallback to cards also failed:', fallbackError);
        }
      }

      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  // Submit answer for current card
  submitAnswer: async (cardId: number, known: boolean) => {
    const state = get();

    // If already in offline mode, just update locally
    if (state.isOfflineMode) {
      set((state) => {
        const updatedCards = state.trainingCards.map((tc) =>
          tc.card.id === cardId
            ? {
                ...tc,
                progress: { ...tc.progress, isAnswered: true, isKnown: known },
              }
            : tc
        );

        return {
          trainingCards: updatedCards,
          knownCount: known ? state.knownCount + 1 : state.knownCount,
          unknownCount: known ? state.unknownCount : state.unknownCount + 1,
        };
      });
      return;
    }

    set({ isSubmitting: true });

    try {
      await submitTrainingResult(cardId, known);

      // Update local state
      set((state) => {
        const updatedCards = state.trainingCards.map((tc) =>
          tc.card.id === cardId
            ? {
                ...tc,
                progress: { ...tc.progress, isAnswered: true, isKnown: known },
              }
            : tc
        );

        return {
          trainingCards: updatedCards,
          knownCount: known ? state.knownCount + 1 : state.knownCount,
          unknownCount: known ? state.unknownCount : state.unknownCount + 1,
          isSubmitting: false,
        };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit answer';

      // Check if it's a recoverable error — switch to offline mode so user can keep practicing
      const isRecoverable =
        errorMessage.includes('not paid') ||
        errorMessage.includes('permission') ||
        errorMessage.includes('access') ||
        errorMessage.includes('404') ||
        errorMessage.includes('Not Found');

      if (isRecoverable) {
        console.warn('[TrainingStore] Switching to offline mode:', errorMessage);

        // Still update local state so user can practice
        set((state) => {
          const updatedCards = state.trainingCards.map((tc) =>
            tc.card.id === cardId
              ? {
                  ...tc,
                  progress: { ...tc.progress, isAnswered: true, isKnown: known },
                }
              : tc
          );

          return {
            trainingCards: updatedCards,
            knownCount: known ? state.knownCount + 1 : state.knownCount,
            unknownCount: known ? state.unknownCount : state.unknownCount + 1,
            isSubmitting: false,
            isOfflineMode: true,
            warning: 'Practice mode — progress may not be saved to server.',
          };
        });
      } else {
        set({
          error: errorMessage,
          isSubmitting: false,
        });
      }
    }
  },

  // Navigate to next card
  nextCard: () => {
    set((state) => {
      const nextIndex = state.currentCardIndex + 1;
      if (nextIndex < state.trainingCards.length) {
        return { currentCardIndex: nextIndex };
      }
      return state;
    });
  },

  // Navigate to previous card
  previousCard: () => {
    set((state) => {
      const prevIndex = state.currentCardIndex - 1;
      if (prevIndex >= 0) {
        return { currentCardIndex: prevIndex };
      }
      return state;
    });
  },

  // Reset progress for module
  resetProgress: async (moduleId: number) => {
    set({ isLoading: true, error: null });

    try {
      await resetTrainingProgress(moduleId);

      // Reset local state and refetch
      set({
        currentCardIndex: 0,
        knownCount: 0,
        unknownCount: 0,
      });

      // Refetch fresh data
      await get().fetchTraining(moduleId);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to reset progress',
        isLoading: false,
      });
    }
  },

  // Reset session (clear all state)
  resetSession: () => {
    set({
      trainingCards: [],
      currentCardIndex: 0,
      isLoading: false,
      isSubmitting: false,
      error: null,
      warning: null,
      knownCount: 0,
      unknownCount: 0,
      currentModuleId: null,
      isOfflineMode: false,
    });
  },

  // Clear warning message
  clearWarning: () => {
    set({ warning: null });
  },

  // Get current card
  getCurrentCard: () => {
    const state = get();
    return state.trainingCards[state.currentCardIndex] || null;
  },

  // Get progress stats
  getProgress: () => {
    const state = get();
    const total = state.trainingCards.length;
    const answered = state.knownCount + state.unknownCount;
    const percentage = total > 0 ? Math.round((answered / total) * 100) : 0;
    return { current: answered, total, percentage };
  },

  // Check if all cards are answered
  isCompleted: () => {
    const state = get();
    return state.trainingCards.length > 0 &&
           state.trainingCards.every((t) => t.progress.isAnswered);
  },

  // Get unanswered cards
  getUnansweredCards: () => {
    const state = get();
    return state.trainingCards.filter((t) => !t.progress.isAnswered);
  },
}));
