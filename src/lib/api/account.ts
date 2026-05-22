import type { Subscription } from '../../types';
import accountClient from './accountClient';
import { type WordzenApiResponse, wordzenErrorMessage } from './wordzenEnvelope';

/** `account-api.md` — вложенная подписка в `UserResponse`. */
export type AccountSubscriptionCode = 'BASIC' | 'PRO';

export interface UserResponseSubscription {
  updatedAt: string;
  code: AccountSubscriptionCode;
  expirationDate: string;
}

export interface UserResponseLevel {
  level: number;
  name: string;
  minXp: number;
  maxXp: number;
}

/** `account-api.md` — профиль текущего пользователя (`GET /users/me` и др.). */
export interface UserResponse {
  uid: string;
  username: string;
  coins: number;
  rating: number;
  level?: UserResponseLevel;
  createdAt: string;
  subscription?: UserResponseSubscription | null;
}

export type FriendshipStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

/** `account-api.md` — заявка в друзья. */
export interface FriendshipResponse {
  id: number;
  requesterUid: string;
  addresseeUid: string;
  status: FriendshipStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUsernameRequest {
  username: string;
}

export function isValidAccountUsername(raw: string): boolean {
  const s = raw.trim();
  if (s.length < 1 || s.length > 40) return false;
  return /^[\p{L}\p{N}._-]+$/u.test(s);
}

function mapUserSubscriptionToUi(
  sub: UserResponseSubscription | null | undefined,
): Subscription {
  if (!sub) {
    return { type: 'free', autoRenew: false };
  }
  const expires = Date.parse(sub.expirationDate);
  const active = !Number.isNaN(expires) && expires > Date.now();
  const type =
    sub.code === 'PRO' ? 'pro' : sub.code === 'BASIC' ? 'premium' : 'free';
  return {
    type: active ? type : 'free',
    expiresAt: sub.expirationDate,
    autoRenew: active,
  };
}

/** Маппинг вложенной подписки account-api → поле `User.subscription` в UI. */
export { mapUserSubscriptionToUi };

/**
 * Текущий профиль (coins, rating, подписка по контракту account-api).
 */
export const getAccount = async (): Promise<UserResponse> => {
  const response = await accountClient.get<WordzenApiResponse<UserResponse>>(
    '/api/v1/users/me',
  );
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(wordzenErrorMessage(response.data, 'Failed to fetch account'));
};

/**
 * Текущий пользователь по `GET /api/v1/coins` (Bearer без `userUid`).
 * Тот же `UserResponse`, что и у `/users/me` — удобно для лёгкого опроса баланса.
 */
export const getMyCoinsProfile = async (): Promise<UserResponse> => {
  const response = await accountClient.get<WordzenApiResponse<UserResponse>>(
    '/api/v1/coins',
  );
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(wordzenErrorMessage(response.data, 'Failed to fetch coins'));
};

/**
 * Текущий пользователь по `GET /api/v1/rating` (Bearer без `userUid`).
 */
export const getMyRatingProfile = async (): Promise<UserResponse> => {
  const response = await accountClient.get<WordzenApiResponse<UserResponse>>(
    '/api/v1/rating',
  );
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(wordzenErrorMessage(response.data, 'Failed to fetch rating'));
};

export const updateMyUsername = async (
  username: string,
): Promise<UserResponse> => {
  const response = await accountClient.patch<WordzenApiResponse<UserResponse>>(
    '/api/v1/users/me/username',
    { username } satisfies UpdateUsernameRequest,
  );
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(
    wordzenErrorMessage(response.data, 'Failed to update username'),
  );
};
