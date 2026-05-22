import { create } from 'zustand';
import { getCurrentUser } from '../api/auth';
import {
  listAcceptedFriendships,
  listIncomingFriendships,
  listOutgoingFriendships,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  deleteFriendship,
  toFriendListItem,
  type FriendListItem,
  type FriendshipResponse,
} from '../api/friends';

interface FriendsState {
  friends: FriendListItem[];
  selectedFriend: FriendListItem | null;
  incomingRequests: FriendshipResponse[];
  outgoingRequests: FriendshipResponse[];

  isLoading: boolean;
  isLoadingFriend: boolean;
  isProcessingRequest: boolean;

  error: string | null;

  fetchFriends: () => Promise<void>;
  fetchFriendById: (friendshipId: number) => Promise<void>;
  fetchFriendRequests: () => Promise<void>;
  sendRequest: (targetUid: string) => Promise<void>;
  acceptRequest: (requestId: number) => Promise<void>;
  rejectRequest: (requestId: number) => Promise<void>;
  cancelRequest: (friendshipId: number) => Promise<void>;
  removeFriendById: (friendshipId: number) => Promise<void>;
  clearError: () => void;
  resetStore: () => void;
}

const initialState = {
  friends: [],
  selectedFriend: null,
  incomingRequests: [],
  outgoingRequests: [],
  isLoading: false,
  isLoadingFriend: false,
  isProcessingRequest: false,
  error: null,
};

export const useFriendsStore = create<FriendsState>((set, get) => ({
  ...initialState,

  fetchFriends: async () => {
    set({ isLoading: true, error: null });
    try {
      const me = await getCurrentUser();
      const rows = await listAcceptedFriendships();
      const friends = rows
        .map((f) => toFriendListItem(f, me.uid))
        .filter((x): x is FriendListItem => x != null);
      set({ friends, isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load friends';
      set({ friends: [], isLoading: false, error: message });
    }
  },

  fetchFriendById: async (friendshipId: number) => {
    const cached = get().friends.find((f) => f.friendshipId === friendshipId);
    if (cached) {
      set({ selectedFriend: cached, isLoadingFriend: false, error: null });
      return;
    }

    set({ isLoadingFriend: true, error: null, selectedFriend: null });
    try {
      const me = await getCurrentUser();
      const rows = await listAcceptedFriendships();
      const friends = rows
        .map((f) => toFriendListItem(f, me.uid))
        .filter((x): x is FriendListItem => x != null);
      const found = friends.find((f) => f.friendshipId === friendshipId) ?? null;
      set({ friends, selectedFriend: found, isLoadingFriend: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load friend';
      set({
        selectedFriend: null,
        isLoadingFriend: false,
        error: message,
      });
    }
  },

  fetchFriendRequests: async () => {
    try {
      const [incoming, outgoing] = await Promise.all([
        listIncomingFriendships(),
        listOutgoingFriendships(),
      ]);
      set({ incomingRequests: incoming, outgoingRequests: outgoing });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load friend requests';
      set({ incomingRequests: [], outgoingRequests: [], error: message });
    }
  },

  sendRequest: async (targetUid: string) => {
    set({ isProcessingRequest: true, error: null });
    try {
      await sendFriendRequest(targetUid);
      await get().fetchFriendRequests();
      set({ isProcessingRequest: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to send friend request';
      set({ isProcessingRequest: false, error: message });
    }
  },

  acceptRequest: async (requestId: number) => {
    set({ isProcessingRequest: true, error: null });
    try {
      await acceptFriendRequest(requestId);
      await Promise.all([get().fetchFriends(), get().fetchFriendRequests()]);
      set({ isProcessingRequest: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to accept request';
      set({ isProcessingRequest: false, error: message });
    }
  },

  rejectRequest: async (requestId: number) => {
    set({ isProcessingRequest: true, error: null });
    try {
      await declineFriendRequest(requestId);
      await get().fetchFriendRequests();
      set({ isProcessingRequest: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to decline request';
      set({ isProcessingRequest: false, error: message });
    }
  },

  cancelRequest: async (friendshipId: number) => {
    set({ isProcessingRequest: true, error: null });
    try {
      await deleteFriendship(friendshipId);
      await get().fetchFriendRequests();
      set({ isProcessingRequest: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to cancel request';
      set({ isProcessingRequest: false, error: message });
    }
  },

  removeFriendById: async (friendshipId: number) => {
    set({ isProcessingRequest: true, error: null });
    try {
      await deleteFriendship(friendshipId);
      await get().fetchFriends();
      set({ isProcessingRequest: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to remove friend';
      set({ isProcessingRequest: false, error: message });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  resetStore: () => {
    set(initialState);
  },
}));
