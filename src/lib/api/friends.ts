import accountClient from './accountClient';
import type { FriendshipResponse } from './account';
import { type WordzenApiResponse, wordzenErrorMessage } from './wordzenEnvelope';

export type { FriendshipResponse } from './account';
export type { FriendshipStatus } from './account';

/** Пользователь из списка принятых друзей (`GET /friends/list`). */
export interface FriendListItem {
  friendshipId: number;
  otherUid: string;
  createdAt: string;
  updatedAt: string;
}

export function otherUidInFriendship(
  f: FriendshipResponse,
  myUid: string,
): string {
  return f.requesterUid === myUid ? f.addresseeUid : f.requesterUid;
}

export function toFriendListItem(
  f: FriendshipResponse,
  myUid: string,
): FriendListItem | null {
  if (f.status !== 'ACCEPTED') return null;
  return {
    friendshipId: f.id,
    otherUid: otherUidInFriendship(f, myUid),
    createdAt: f.createdAt,
    updatedAt: f.updatedAt,
  };
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuidString(value: string): boolean {
  return UUID_RE.test(value.trim());
}

function unwrapList(
  envelope: WordzenApiResponse<FriendshipResponse[] | null>,
): FriendshipResponse[] {
  if (!envelope.success || envelope.data == null) return [];
  return Array.isArray(envelope.data) ? envelope.data : [];
}

/** Принятые дружбы (`account-api.md`). */
export const listAcceptedFriendships = async (): Promise<FriendshipResponse[]> => {
  const response = await accountClient.get<
    WordzenApiResponse<FriendshipResponse[] | null>
  >('/api/v1/friends/list');
  return unwrapList(response.data);
};

export const listIncomingFriendships = async (): Promise<FriendshipResponse[]> => {
  const response = await accountClient.get<
    WordzenApiResponse<FriendshipResponse[] | null>
  >('/api/v1/friends/incoming');
  return unwrapList(response.data);
};

export const listOutgoingFriendships = async (): Promise<FriendshipResponse[]> => {
  const response = await accountClient.get<
    WordzenApiResponse<FriendshipResponse[] | null>
  >('/api/v1/friends/outgoing');
  return unwrapList(response.data);
};

export const sendFriendRequest = async (
  targetUid: string,
): Promise<FriendshipResponse> => {
  const response = await accountClient.post<
    WordzenApiResponse<FriendshipResponse | null>
  >('/api/v1/friends/request', { targetUid: targetUid.trim() });
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(
    wordzenErrorMessage(response.data, 'Failed to send friend request'),
  );
};

export const acceptFriendRequest = async (
  requestId: number,
): Promise<FriendshipResponse> => {
  const response = await accountClient.post<
    WordzenApiResponse<FriendshipResponse | null>
  >('/api/v1/friends/accept', { requestId });
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(
    wordzenErrorMessage(response.data, 'Failed to accept friend request'),
  );
};

export const declineFriendRequest = async (requestId: number): Promise<void> => {
  const response = await accountClient.post<WordzenApiResponse<null | unknown>>(
    '/api/v1/friends/decline',
    { requestId },
  );
  if (!response.data.success) {
    throw new Error(
      wordzenErrorMessage(response.data, 'Failed to decline friend request'),
    );
  }
};

/** Удаление записи дружбы (в т.ч. отклонение исходящей заявки через `DELETE`). */
export const deleteFriendship = async (friendshipId: number): Promise<void> => {
  const response = await accountClient.delete<WordzenApiResponse<null | unknown>>(
    `/api/v1/friends/${friendshipId}`,
  );
  if (!response.data.success) {
    throw new Error(wordzenErrorMessage(response.data, 'Failed to remove friend'));
  }
};
