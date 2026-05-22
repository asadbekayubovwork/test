import apiClient from './client';
import type { CardView } from './courses';
import type { NoContentView } from './auth';
import { type WordzenApiResponse, wordzenErrorMessage } from './wordzenEnvelope';

/** wordzen-api.md — `TrainingRequest` */
export interface TrainingRequest {
  cardId: number;
  known: boolean;
}

/** Прогресс в ответе API (контракт md: `isAnswered` / `isKnown` / `isFavorites`). */
export interface TrainingProgressView {
  isAnswered: boolean;
  isKnown: boolean;
  isFavorites: boolean;
}

export interface TrainingResponse {
  card: CardView;
  progress: TrainingProgressView;
}

type TrainingProgressWire = TrainingProgressView & {
  answered?: boolean;
  known?: boolean;
  favorites?: boolean;
};

function normalizeProgress(p: TrainingProgressWire): TrainingProgressView {
  if (typeof p.isAnswered === 'boolean') {
    return {
      isAnswered: p.isAnswered,
      isKnown: p.isKnown,
      isFavorites: p.isFavorites,
    };
  }
  return {
    isAnswered: !!p.answered,
    isKnown: !!p.known,
    isFavorites: !!p.favorites,
  };
}

function normalizeTrainingResponse(row: {
  card: CardView;
  progress?: TrainingProgressWire;
}): TrainingResponse {
  const merged: TrainingProgressWire = {
    isAnswered: false,
    isKnown: false,
    isFavorites: false,
    ...row.progress,
  };
  return {
    card: row.card,
    progress: normalizeProgress(merged),
  };
}

const trainErr = (body: WordzenApiResponse<unknown>, fallback: string) =>
  wordzenErrorMessage(body, fallback);

/**
 * Карточки модуля и прогресс swipe-training (`GET .../training/modules/{moduleId}`)
 */
export const getTrainingByModule = async (moduleId: number): Promise<TrainingResponse[]> => {
  const response = await apiClient.get<WordzenApiResponse<TrainingResponse[]>>(
    `/api/v1/training/modules/${moduleId}`
  );

  if (response.data.success && response.data.data) {
    return response.data.data.map((row) => normalizeTrainingResponse(row));
  }

  throw new Error(trainErr(response.data, 'Failed to fetch training data'));
};

/**
 * Сохранить результат по карточке (`POST /api/v1/training`)
 */
export const submitTrainingResult = async (cardId: number, known: boolean): Promise<void> => {
  const response = await apiClient.post<WordzenApiResponse<NoContentView | null>>('/api/v1/training', {
    cardId,
    known,
  } satisfies TrainingRequest);

  if (!response.data.success) {
    throw new Error(trainErr(response.data, 'Failed to submit training result'));
  }
};

/**
 * Сброс прогресса тренировки по модулю
 */
export const resetTrainingProgress = async (moduleId: number): Promise<void> => {
  const response = await apiClient.delete<WordzenApiResponse<NoContentView | null>>(
    `/api/v1/training/modules/${moduleId}`
  );

  if (!response.data.success) {
    throw new Error(trainErr(response.data, 'Failed to reset training progress'));
  }
};

/** @deprecated используйте TrainingProgressView */
export type TrainingProgressResponse = TrainingProgressView;

/** @deprecated не запрашивается отдельным эндпоинтом в текущем контракте */
export interface TrainingReportResponse {
  known: number;
  total: number;
  progress: number;
}
