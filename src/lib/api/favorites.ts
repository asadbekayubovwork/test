import apiClient from './client';
import type { CardView } from './courses';
import type { NoContentView } from './auth';
import { type WordzenApiResponse, wordzenErrorMessage } from './wordzenEnvelope';

export interface CardsView {
  cards: CardView[];
}

export interface CardFavoritesRequest {
  cardId: number;
}

const favErr = (body: WordzenApiResponse<unknown>, fallback: string) =>
  wordzenErrorMessage(body, fallback);

/**
 * Get all favorite cards
 */
export const getFavoriteCards = async (): Promise<CardView[]> => {
  const response = await apiClient.get<WordzenApiResponse<CardsView>>('/api/v1/favorites/cards');

  if (response.data.success && response.data.data) {
    return response.data.data.cards;
  }

  throw new Error(favErr(response.data, 'Failed to fetch favorite cards'));
};

/**
 * Get favorite cards by course ID
 */
export const getFavoriteCardsByCourse = async (courseId: number): Promise<CardView[]> => {
  const response = await apiClient.get<WordzenApiResponse<CardsView>>(
    `/api/v1/favorites/courses/${courseId}/cards`
  );

  if (response.data.success && response.data.data) {
    return response.data.data.cards;
  }

  throw new Error(favErr(response.data, 'Failed to fetch favorite cards for course'));
};

/**
 * Get favorite cards by module ID
 */
export const getFavoriteCardsByModule = async (moduleId: number): Promise<CardView[]> => {
  const response = await apiClient.get<WordzenApiResponse<CardsView>>(
    `/api/v1/favorites/modules/${moduleId}/cards`
  );

  if (response.data.success && response.data.data) {
    return response.data.data.cards;
  }

  throw new Error(favErr(response.data, 'Failed to fetch favorite cards for module'));
};

/**
 * Add a card to favorites
 */
export const addCardToFavorites = async (cardId: number): Promise<void> => {
  const body: CardFavoritesRequest = { cardId };
  const response = await apiClient.post<WordzenApiResponse<NoContentView | null>>(
    '/api/v1/favorites/cards',
    body
  );

  if (!response.data.success) {
    throw new Error(favErr(response.data, 'Failed to add card to favorites'));
  }
};

/**
 * Remove a card from favorites
 */
export const removeCardFromFavorites = async (cardId: number): Promise<void> => {
  const response = await apiClient.delete<WordzenApiResponse<NoContentView | null>>(
    `/api/v1/favorites/cards/${cardId}`
  );

  if (!response.data.success) {
    throw new Error(favErr(response.data, 'Failed to remove card from favorites'));
  }
};
