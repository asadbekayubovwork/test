import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../../types';
import { currentUser } from '../data/users';
import { getAccount, mapUserSubscriptionToUi } from '../api/account';

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

interface UserActions {
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  addXp: (amount: number) => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  addPurchasedCourse: (courseId: string) => void;
  unlockAchievement: (achievementId: string) => void;
  updateStats: (stats: Partial<User['stats']>) => void;
  logout: () => void;
  initializeUser: () => void;
  /**
   * Pulls authoritative account state from `GET /api/v1/users/me` and overlays
   * server-truth fields (coins, subscription) onto the persisted mock user.
   * Safe to call repeatedly — used after a payment confirms while the
   * backend asynchronously credits coins.
   */
  refreshAccount: () => Promise<void>;
}

type UserStore = UserState & UserActions;

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, error: null }),

      updateUser: (updates) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...updates } });
        }
      },

      addXp: (amount) => {
        const { user } = get();
        if (user) {
          let newXp = user.xp + amount;
          let newLevel = user.level;
          let newXpToNext = user.xpToNextLevel;

          // Level up logic
          while (newXp >= newXpToNext) {
            newXp -= newXpToNext;
            newLevel += 1;
            newXpToNext = Math.floor(newXpToNext * 1.2); // 20% more XP needed each level
          }

          set({
            user: {
              ...user,
              xp: newXp,
              level: newLevel,
              xpToNextLevel: newXpToNext,
            },
          });
        }
      },

      addCoins: (amount) => {
        const { user } = get();
        if (user) {
          set({
            user: {
              ...user,
              octoCoins: user.octoCoins + amount,
            },
          });
        }
      },

      spendCoins: (amount) => {
        const { user } = get();
        if (!user || user.octoCoins < amount) {
          return false;
        }
        set({
          user: {
            ...user,
            octoCoins: user.octoCoins - amount,
          },
        });
        return true;
      },

      addPurchasedCourse: (courseId) => {
        const { user } = get();
        if (user && !user.purchasedCourses.includes(courseId)) {
          set({
            user: {
              ...user,
              purchasedCourses: [...user.purchasedCourses, courseId],
            },
          });
        }
      },

      unlockAchievement: (achievementId) => {
        const { user } = get();
        if (user) {
          const achievements = user.achievements.map((a) =>
            a.id === achievementId
              ? { ...a, unlockedAt: new Date().toISOString() }
              : a
          );
          set({ user: { ...user, achievements } });
        }
      },

      updateStats: (stats) => {
        const { user } = get();
        if (user) {
          set({
            user: {
              ...user,
              stats: { ...user.stats, ...stats },
            },
          });
        }
      },

      logout: () => {
        set({ user: null, error: null });
      },

      initializeUser: () => {
        // Removed mock user initialization - rely on API calls (refreshAccount, getAccount)
        // User is loaded from API responses, not from mock data
        set({ user: null, isLoading: false });
      },

      refreshAccount: async () => {
        try {
          const account = await getAccount();
          const { user } = get();
          if (!user) return;

          const overlay: Partial<User> = {};
          const u = account.username?.trim();
          if (u) overlay.name = u;
          if (typeof account.coins === 'number') overlay.octoCoins = account.coins;
          if (typeof account.rating === 'number') {
            overlay.ratingPoints = account.rating;
          }
          if (account.level) {
            overlay.level = account.level.level;
          }
          overlay.subscription = mapUserSubscriptionToUi(account.subscription);

          set({ user: { ...user, ...overlay } });

          // Sync subscription to subscriptionStore from account data
          const { useSubscriptionStore } = await import('./subscriptionStore');
          if (account.subscription) {
            useSubscriptionStore.getState().setSubscription({
              id: 0,
              expiredAt: account.subscription.expirationDate,
              statusCode: 'ACTIVE',
              sourceCode: account.subscription.code === 'PRO' ? 'GOOGLE' : 'CLICK',
            });
          } else {
            // No active subscription — reset to null (free tier)
            useSubscriptionStore.getState().setSubscription(null);
          }
        } catch (err) {
          // Soft failure — caller (e.g. payment-confirmation poller) decides
          // how to react. Don't clobber existing state on transient errors.
          console.warn('[userStore] refreshAccount failed:', err);
        }
      },
    }),
    {
      name: 'wordzen-user',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
