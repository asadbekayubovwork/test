import apiClient from './client';
import type { CardView } from './courses';
import type { NoContentView } from './auth';
import { type WordzenApiResponse, wordzenErrorMessage } from './wordzenEnvelope';

/** Вариант ответа в тесте (wire, wordzen-api.md использует `isCorrectAnswer`) */
export interface QuizAnswerWire {
  cardId: number;
  term: string;
  image?: string;
  isCorrectAnswer: boolean;
  translationRu: string;
  translationUz: string;
}

export interface QuizQuestionWire {
  card: CardView;
  answers: QuizAnswerWire[];
}

export interface QuizWrapperResponse {
  quizResponse: QuizQuestionWire[];
}

export interface AnswerQuizRequest {
  cardId: number;
  answerId: number;
}

/** Агрегированный прогресс квиза (wordzen-api.md) */
export interface ProgressQuizResponse {
  percent: number;
  success: number;
  failure: number;
  total: number;
}

export interface ProgressQuizModuleResponse {
  moduleId: number;
  progress: ProgressQuizResponse;
}

// Normalized types for UI
export interface QuizOption {
  id: number;
  value: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: number;
  card: CardView;
  question: string;
  options: QuizOption[];
  correctOptionId: number;
}

export interface QuizAnswerRequest {
  questionId: number;
  selectedOptionId: number;
}

export interface QuizAnswerResponse {
  correct: boolean;
  correctOptionId: number;
}

const quizErr = (body: WordzenApiResponse<unknown>, fallback: string) =>
  wordzenErrorMessage(body, fallback);

function isAnswerCorrect(answer: QuizAnswerWire): boolean {
  if (typeof answer.isCorrectAnswer === 'boolean') {
    return answer.isCorrectAnswer;
  }
  const legacy = answer as QuizAnswerWire & { correctAnswer?: boolean };
  return !!legacy.correctAnswer;
}

const transformQuizResponse = (apiResponse: QuizQuestionWire[]): QuizQuestion[] => {
  return apiResponse.map((item, index) => {
    const options: QuizOption[] = item.answers.map((answer, optIndex) => ({
      id: answer.cardId || optIndex,
      value: answer.translationRu,
      isCorrect: isAnswerCorrect(answer),
    }));

    const correctOption = options.find((opt) => opt.isCorrect);

    return {
      id: item.card.id || index,
      card: item.card,
      question: `What is the translation of "${item.card.term}"?`,
      options,
      correctOptionId: correctOption?.id || 0,
    };
  });
};

/**
 * Текущий квиз модуля
 */
export const getQuizByModule = async (moduleId: number): Promise<QuizQuestion[]> => {
  const response = await apiClient.get<WordzenApiResponse<QuizWrapperResponse>>(
    `/api/v1/quiz/modules/${moduleId}`
  );

  if (response.data.success && response.data.data) {
    const quizData = response.data.data;

    if (quizData.quizResponse && Array.isArray(quizData.quizResponse)) {
      return transformQuizResponse(quizData.quizResponse);
    }
  }

  throw new Error(quizErr(response.data, 'Failed to fetch quiz data'));
};

/**
 * Локальная проверка ответа (мгновенная обратная связь в UI)
 */
export const submitQuizAnswer = async (
  questionId: number,
  selectedOptionId: number,
  questions: QuizQuestion[]
): Promise<QuizAnswerResponse> => {
  const question = questions.find((q) => q.id === questionId);

  if (!question) {
    throw new Error('Question not found');
  }

  const selectedOption = question.options.find((opt) => opt.id === selectedOptionId);
  const correct = selectedOption?.isCorrect || false;

  return {
    correct,
    correctOptionId: question.correctOptionId,
  };
};

/**
 * `POST .../quiz/modules/{moduleId}` — `AnswerQuizRequest`
 */
export const postQuizAnswer = async (
  moduleId: number,
  cardId: number,
  answerId: number
): Promise<void> => {
  try {
    const response = await apiClient.post<WordzenApiResponse<QuizWrapperResponse>>(
      `/api/v1/quiz/modules/${moduleId}`,
      { cardId, answerId } satisfies AnswerQuizRequest
    );
    if (!response.data.success) {
      console.warn('[Quiz] Backend returned success=false:', response.data);
    }
  } catch (error) {
    console.warn('[Quiz] Failed to save answer to backend:', error);
  }
};

/**
 * Прогресс квиза по модулю (`GET .../quiz/modules/{moduleId}/progress`)
 */
export const getQuizModuleProgress = async (
  moduleId: number
): Promise<ProgressQuizModuleResponse> => {
  const response = await apiClient.get<WordzenApiResponse<ProgressQuizModuleResponse>>(
    `/api/v1/quiz/modules/${moduleId}/progress`
  );

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(quizErr(response.data, 'Failed to fetch quiz module progress'));
};

/**
 * @deprecated Используйте `getQuizModuleProgress`. Оставлено для совместимости: маппинг в старый вид отчёта.
 */
export interface QuizResultResponse {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
  passed: boolean;
}

export const getQuizResults = async (moduleId: number): Promise<QuizResultResponse> => {
  const mod = await getQuizModuleProgress(moduleId);
  const { success, failure, total, percent } = mod.progress;
  return {
    totalQuestions: total,
    correctAnswers: success,
    incorrectAnswers: failure,
    score: Math.round(percent),
    passed: total > 0 ? percent >= 70 : false,
  };
};

/**
 * Сброс прогресса квиза модуля (`DELETE .../quiz/modules/{moduleId}/progress`)
 */
export const resetQuizProgress = async (moduleId: number): Promise<void> => {
  const response = await apiClient.delete<WordzenApiResponse<NoContentView | null>>(
    `/api/v1/quiz/modules/${moduleId}/progress`
  );

  if (!response.data.success) {
    throw new Error(quizErr(response.data, 'Failed to reset quiz progress'));
  }
};

export type QuizAnswerOption = QuizAnswerWire;
export type QuizQuestionResponse = QuizQuestionWire;
export type QuizApiResponse = QuizWrapperResponse;
