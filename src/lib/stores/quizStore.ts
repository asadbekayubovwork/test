import { create } from 'zustand';
import {
  getQuizByModule,
  resetQuizProgress,
  postQuizAnswer,
  type QuizQuestion,
  type QuizAnswerResponse,
  type QuizOption,
} from '../api/quiz';

interface QuizState {
  // Data
  questions: QuizQuestion[];
  currentQuestionIndex: number;

  // Loading states
  isLoading: boolean;
  isSubmitting: boolean;

  // Error state
  error: string | null;

  // Warning for non-blocking errors
  warning: string | null;

  // Stats
  correctCount: number;
  incorrectCount: number;

  // Answer tracking
  answers: Map<number, { selectedOptionId: number; correct: boolean }>;

  // Current answer state
  selectedOptionId: number | null;
  answerResult: QuizAnswerResponse | null;
  showResult: boolean;

  // Module ID
  currentModuleId: number | null;

  // Offline mode (when API submissions fail)
  isOfflineMode: boolean;

  // Actions
  fetchQuiz: (moduleId: number) => Promise<void>;
  selectOption: (optionId: number) => void;
  submitAnswer: () => Promise<void>;
  nextQuestion: () => void;
  resetQuiz: (moduleId: number) => Promise<void>;
  resetSession: () => void;
  clearWarning: () => void;

  // Computed getters
  getCurrentQuestion: () => QuizQuestion | null;
  getProgress: () => { current: number; total: number; percentage: number };
  isCompleted: () => boolean;
  getScore: () => { correct: number; incorrect: number; total: number; percentage: number; passed: boolean };
}

export const useQuizStore = create<QuizState>((set, get) => ({
  // Initial state
  questions: [],
  currentQuestionIndex: 0,
  isLoading: false,
  isSubmitting: false,
  error: null,
  warning: null,
  correctCount: 0,
  incorrectCount: 0,
  answers: new Map(),
  selectedOptionId: null,
  answerResult: null,
  showResult: false,
  currentModuleId: null,
  isOfflineMode: false,

  // Fetch quiz data for a module
  fetchQuiz: async (moduleId: number) => {
    set({ isLoading: true, error: null, currentModuleId: moduleId });

    try {
      const data = await getQuizByModule(moduleId);

      set({
        questions: data,
        currentQuestionIndex: 0,
        correctCount: 0,
        incorrectCount: 0,
        answers: new Map(),
        selectedOptionId: null,
        answerResult: null,
        showResult: false,
        isLoading: false,
        isOfflineMode: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load quiz';

      // Check if it's a payment/permission error - fall back to generating quiz from cards
      if (
        errorMessage.includes('not paid') ||
        errorMessage.includes('permission') ||
        errorMessage.includes('access') ||
        errorMessage.includes('404')
      ) {
        console.warn('[QuizStore] Quiz API blocked, trying to generate quiz from cards');

        try {
          // Import dynamically to avoid circular dependencies
          const { getModuleCards } = await import('../api/courses');
          const cards = await getModuleCards(moduleId);

          if (cards && cards.length >= 4) {
            // Generate quiz questions from cards
            const generatedQuestions: QuizQuestion[] = cards.map((card, index) => {
              // Get translation for this card
              const translation =
                card.translations?.find((t) => t.locale === 'RU') ||
                card.translations?.[0];

              // Get 3 random wrong translations from other cards
              const otherTranslations = cards
                .filter((c) => c.id !== card.id)
                .map((c) => c.translations?.find((t) => t.locale === 'RU') || c.translations?.[0])
                .filter((t) => t && t.value)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3);

              // Create options with correct answer at random position
              const correctIndex = Math.floor(Math.random() * 4);
              const options: QuizOption[] = [];
              let wrongIndex = 0;

              for (let i = 0; i < 4; i++) {
                if (i === correctIndex) {
                  options.push({
                    id: i + 1,
                    value: translation?.value || 'No translation',
                    isCorrect: true,
                  });
                } else if (otherTranslations[wrongIndex]) {
                  options.push({
                    id: i + 1,
                    value: otherTranslations[wrongIndex].value,
                    isCorrect: false,
                  });
                  wrongIndex++;
                } else {
                  options.push({
                    id: i + 1,
                    value: `Option ${i + 1}`,
                    isCorrect: false,
                  });
                }
              }

              return {
                id: index + 1,
                card,
                question: `What is the translation of "${card.term}"?`,
                options,
                correctOptionId: correctIndex + 1,
              };
            });

            set({
              questions: generatedQuestions,
              currentQuestionIndex: 0,
              correctCount: 0,
              incorrectCount: 0,
              answers: new Map(),
              selectedOptionId: null,
              answerResult: null,
              showResult: false,
              isLoading: false,
              isOfflineMode: true,
              warning: "Practice mode - quiz results won't be saved. Add course to library to track progress.",
            });
            return;
          }
        } catch (fallbackError) {
          console.error('[QuizStore] Fallback to cards also failed:', fallbackError);
        }
      }

      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  // Select an option
  selectOption: (optionId: number) => {
    const state = get();
    if (state.showResult) return; // Don't allow changing answer after submission
    set({ selectedOptionId: optionId });
  },

  // Submit answer for current question
  submitAnswer: async () => {
    const state = get();
    const currentQuestion = state.getCurrentQuestion();

    if (!currentQuestion || state.selectedOptionId === null || state.showResult) return;

    set({ isSubmitting: true });

    // Check if answer is correct locally using isCorrect on the option
    const selectedOption = currentQuestion.options.find(
      (opt: QuizOption) => opt.id === state.selectedOptionId
    );
    const isCorrect = selectedOption?.isCorrect || false;

    // Save answer to backend for quiz progress tracking (fire-and-forget)
    // Skip in offline mode — those are locally-generated quizzes
    if (!state.isOfflineMode && state.currentModuleId) {
      postQuizAnswer(state.currentModuleId, currentQuestion.id, state.selectedOptionId);
    }

    const newAnswers = new Map(state.answers);
    newAnswers.set(currentQuestion.id, {
      selectedOptionId: state.selectedOptionId,
      correct: isCorrect,
    });

    set({
      answers: newAnswers,
      correctCount: isCorrect ? state.correctCount + 1 : state.correctCount,
      incorrectCount: isCorrect ? state.incorrectCount : state.incorrectCount + 1,
      answerResult: {
        correct: isCorrect,
        correctOptionId: currentQuestion.correctOptionId,
      },
      showResult: true,
      isSubmitting: false,
    });
  },

  // Move to next question
  nextQuestion: () => {
    set((state) => {
      const nextIndex = state.currentQuestionIndex + 1;
      if (nextIndex < state.questions.length) {
        return {
          currentQuestionIndex: nextIndex,
          selectedOptionId: null,
          answerResult: null,
          showResult: false,
        };
      }
      return {
        selectedOptionId: null,
        answerResult: null,
        showResult: false,
      };
    });
  },

  // Reset quiz progress for module
  resetQuiz: async (moduleId: number) => {
    set({ isLoading: true, error: null });

    try {
      if (!get().isOfflineMode) {
        await resetQuizProgress(moduleId);
      }

      // Reset local state and refetch
      set({
        currentQuestionIndex: 0,
        correctCount: 0,
        incorrectCount: 0,
        answers: new Map(),
        selectedOptionId: null,
        answerResult: null,
        showResult: false,
      });

      // Refetch fresh data
      await get().fetchQuiz(moduleId);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to reset quiz',
        isLoading: false,
      });
    }
  },

  // Reset session (clear all state)
  resetSession: () => {
    set({
      questions: [],
      currentQuestionIndex: 0,
      isLoading: false,
      isSubmitting: false,
      error: null,
      warning: null,
      correctCount: 0,
      incorrectCount: 0,
      answers: new Map(),
      selectedOptionId: null,
      answerResult: null,
      showResult: false,
      currentModuleId: null,
      isOfflineMode: false,
    });
  },

  // Clear warning message
  clearWarning: () => {
    set({ warning: null });
  },

  // Get current question
  getCurrentQuestion: () => {
    const state = get();
    return state.questions[state.currentQuestionIndex] || null;
  },

  // Get progress stats
  getProgress: () => {
    const state = get();
    const total = state.questions.length;
    const current = state.currentQuestionIndex + 1;
    const percentage = total > 0 ? Math.round((state.currentQuestionIndex / total) * 100) : 0;
    return { current, total, percentage };
  },

  // Check if quiz is completed
  isCompleted: () => {
    const state = get();
    return (
      state.questions.length > 0 &&
      state.currentQuestionIndex >= state.questions.length - 1 &&
      state.showResult
    );
  },

  // Get final score
  getScore: () => {
    const state = get();
    const total = state.correctCount + state.incorrectCount;
    const percentage = total > 0 ? Math.round((state.correctCount / total) * 100) : 0;
    return {
      correct: state.correctCount,
      incorrect: state.incorrectCount,
      total,
      percentage,
      passed: percentage >= 70,
    };
  },
}));
