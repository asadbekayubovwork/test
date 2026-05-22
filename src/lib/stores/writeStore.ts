import { create } from 'zustand';
import type { CardView } from '../api/courses';

export interface WriteQuestion {
  id: number;
  card: CardView;
  term: string;
  correctAnswer: string; // The translation to type
  hint: string; // First few letters as hint
}

interface WriteState {
  // Data
  allCards: CardView[];
  questions: WriteQuestion[];
  currentQuestionIndex: number;

  // User input
  userInput: string;
  isAnswerSubmitted: boolean;
  isCorrect: boolean | null;

  // Stats
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;

  // Hints
  hintsUsed: number;
  showHint: boolean;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Game status
  isComplete: boolean;

  // Actions
  initializeGame: (cards: CardView[]) => void;
  setUserInput: (input: string) => void;
  submitAnswer: () => void;
  skipQuestion: () => void;
  revealHint: () => void;
  nextQuestion: () => void;
  resetGame: () => void;
  resetSession: () => void;

  // Computed getters
  getCurrentQuestion: () => WriteQuestion | null;
  getProgress: () => { current: number; total: number; percentage: number };
  getScore: () => {
    correct: number;
    incorrect: number;
    skipped: number;
    total: number;
    percentage: number;
    passed: boolean;
  };
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

// Normalize text for comparison (remove extra spaces, lowercase)
const normalizeText = (text: string): string => {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
};

// Generate hint from answer (first 2-3 characters + dots)
const generateHint = (answer: string): string => {
  const hintLength = Math.min(3, Math.ceil(answer.length / 3));
  return answer.slice(0, hintLength) + '...';
};

export const useWriteStore = create<WriteState>((set, get) => ({
  // Initial state
  allCards: [],
  questions: [],
  currentQuestionIndex: 0,
  userInput: '',
  isAnswerSubmitted: false,
  isCorrect: null,
  correctCount: 0,
  incorrectCount: 0,
  skippedCount: 0,
  hintsUsed: 0,
  showHint: false,
  isLoading: false,
  error: null,
  isComplete: false,

  // Initialize game with cards
  initializeGame: (cards: CardView[]) => {
    const allCards = [...cards];

    // Shuffle and select cards (max 10 for write mode)
    const shuffledCards = shuffleArray(allCards);
    const selectedCards = shuffledCards.slice(0, Math.min(10, shuffledCards.length));

    // Create questions from cards
    const questions: WriteQuestion[] = selectedCards.map((card, index) => {
      // Get Russian translation as the answer
      const translation =
        card.translations?.find((t) => t.locale === 'RU') || card.translations?.[0];
      const correctAnswer = translation?.value || '';

      return {
        id: index + 1,
        card,
        term: card.term,
        correctAnswer,
        hint: generateHint(correctAnswer),
      };
    });

    set({
      allCards,
      questions,
      currentQuestionIndex: 0,
      userInput: '',
      isAnswerSubmitted: false,
      isCorrect: null,
      correctCount: 0,
      incorrectCount: 0,
      skippedCount: 0,
      hintsUsed: 0,
      showHint: false,
      isLoading: false,
      error: null,
      isComplete: false,
    });
  },

  // Set user input
  setUserInput: (input: string) => {
    set({ userInput: input });
  },

  // Submit answer
  submitAnswer: () => {
    const state = get();
    const currentQuestion = state.getCurrentQuestion();

    if (!currentQuestion || state.isAnswerSubmitted) return;

    const normalizedInput = normalizeText(state.userInput);
    const normalizedAnswer = normalizeText(currentQuestion.correctAnswer);

    const isCorrect = normalizedInput === normalizedAnswer;

    set({
      isAnswerSubmitted: true,
      isCorrect,
      correctCount: isCorrect ? state.correctCount + 1 : state.correctCount,
      incorrectCount: isCorrect ? state.incorrectCount : state.incorrectCount + 1,
    });
  },

  // Skip question
  skipQuestion: () => {
    const state = get();
    if (state.isAnswerSubmitted) return;

    set({
      isAnswerSubmitted: true,
      isCorrect: false,
      skippedCount: state.skippedCount + 1,
    });
  },

  // Reveal letter hint for current question
  revealHint: () => {
    const state = get();
    if (state.showHint || state.isAnswerSubmitted) return;

    set({
      showHint: true,
      hintsUsed: state.hintsUsed + 1,
    });
  },

  // Move to next question
  nextQuestion: () => {
    const state = get();
    const nextIndex = state.currentQuestionIndex + 1;

    if (nextIndex >= state.questions.length) {
      set({ isComplete: true });
      return;
    }

    set({
      currentQuestionIndex: nextIndex,
      userInput: '',
      isAnswerSubmitted: false,
      isCorrect: null,
      showHint: false,
    });
  },

  // Reset game with new random cards
  resetGame: () => {
    const state = get();
    if (state.allCards.length > 0) {
      get().initializeGame(state.allCards);
    }
  },

  // Reset session (clear all state)
  resetSession: () => {
    set({
      allCards: [],
      questions: [],
      currentQuestionIndex: 0,
      userInput: '',
      isAnswerSubmitted: false,
      isCorrect: null,
      correctCount: 0,
      incorrectCount: 0,
      skippedCount: 0,
      hintsUsed: 0,
      showHint: false,
      isLoading: false,
      error: null,
      isComplete: false,
    });
  },

  // Get current question
  getCurrentQuestion: () => {
    const state = get();
    return state.questions[state.currentQuestionIndex] || null;
  },

  // Get progress
  getProgress: () => {
    const state = get();
    const total = state.questions.length;
    const current = state.currentQuestionIndex + 1;
    const percentage = total > 0 ? Math.round((state.currentQuestionIndex / total) * 100) : 0;
    return { current, total, percentage };
  },

  // Get score
  getScore: () => {
    const state = get();
    const total = state.correctCount + state.incorrectCount + state.skippedCount;
    const percentage = total > 0 ? Math.round((state.correctCount / total) * 100) : 0;

    return {
      correct: state.correctCount,
      incorrect: state.incorrectCount,
      skipped: state.skippedCount,
      total,
      percentage,
      passed: percentage >= 70,
    };
  },
}));
