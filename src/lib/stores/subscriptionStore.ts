import { create } from 'zustand';
import {
  cancelSubscription,
  type SubscriptionResponse,
} from '../api/subscription';
import type { PlanTier } from '../constants/freeTierLimits';

type FetchStatus = 'idle' | 'loading' | 'success' | 'error';

interface SubscriptionState {
  subscription: SubscriptionResponse | null;
  cancelStatus: 'idle' | 'cancelling' | 'success' | 'error';
  cancelError: string | null;
}

interface SubscriptionActions {
  setSubscription: (subscription: SubscriptionResponse | null) => void;
  cancel: () => Promise<boolean>;
  /**
   * Returns the user's effective plan tier. Defaults to `free` when no
   * subscription is active.
   */
  getCurrentTier: () => PlanTier;
  /** True when the user has any active subscription regardless of tier. */
  isPremium: () => boolean;
  reset: () => void;
}

type SubscriptionStore = SubscriptionState & SubscriptionActions;

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
  subscription: null,
  cancelStatus: 'idle',
  cancelError: null,

  setSubscription: (subscription: SubscriptionResponse | null) => {
    set({ subscription });
  },

  cancel: async () => {
    set({ cancelStatus: 'cancelling', cancelError: null });
    try {
      await cancelSubscription();
      // After cancel, subscription is cleared server-side.
      // userStore.refreshAccount() will sync the null subscription.
      get().setSubscription(null);
      set({ cancelStatus: 'success' });
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to cancel subscription';
      set({ cancelStatus: 'error', cancelError: message });
      return false;
    }
  },

  getCurrentTier: () => {
    const sub = get().subscription;
    if (!sub || sub.statusCode !== 'ACTIVE') return 'free';
    return sub.sourceCode === 'GOOGLE' ? 'basic' : 'basic';
  },

  isPremium: () => {
    const sub = get().subscription;
    return !!sub && sub.statusCode === 'ACTIVE';
  },

  reset: () => {
    set({
      subscription: null,
      cancelStatus: 'idle',
      cancelError: null,
    });
  },
}));
