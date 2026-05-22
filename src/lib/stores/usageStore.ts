import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FREE_TIER_LIMITS } from '../constants/freeTierLimits';

const todayKey = (): string => {
  // Local-day boundary (matches user perception). Backend may enforce its
  // own boundary; this counter is only used for client-side soft gating.
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

interface DailyCounters {
  date: string;
  newWordIds: string[];
  repetitionsCount: number;
  gameSecondsByGame: Record<string, number>;
}

const emptyDaily = (): DailyCounters => ({
  date: todayKey(),
  newWordIds: [],
  repetitionsCount: 0,
  gameSecondsByGame: {},
});

interface UsageState {
  daily: DailyCounters;
  /** unitId -> ISO timestamp of completion. Kept indefinitely. */
  unitCompletions: Record<string, string>;
  /** Most recent unit completion timestamp (drives the 24h next-unit gate). */
  lastUnitCompletedAt: string | null;
}

export interface UnitUnlockStatus {
  allowed: boolean;
  /** ISO timestamp when the next unit becomes available (when allowed === false). */
  unlockAt?: string;
  /** Milliseconds remaining until unlock. */
  msRemaining?: number;
}

interface UsageActions {
  /** Resets daily counters if the persisted `date` is stale. Idempotent. */
  rollOverIfNewDay: () => void;
  recordUnitCompleted: (unitId: string) => void;
  recordNewWord: (wordId: string) => void;
  recordRepetition: () => void;
  recordGameTime: (gameId: string, seconds: number) => void;
  /** Free-tier check: may the user start a new (uncompleted) unit right now? */
  canStartNewUnit: () => UnitUnlockStatus;
  /** Has this specific unit already been completed? (no cooldown on review) */
  isUnitCompleted: (unitId: string) => boolean;
  remainingNewWords: () => number;
  remainingRepetitions: () => number;
  remainingGameSeconds: (gameId: string) => number;
  /** Wipe all counters + completions. For QA / sign-out. */
  resetAll: () => void;
}

type UsageStore = UsageState & UsageActions;

export const useUsageStore = create<UsageStore>()(
  persist(
    (set, get) => ({
      daily: emptyDaily(),
      unitCompletions: {},
      lastUnitCompletedAt: null,

      rollOverIfNewDay: () => {
        const today = todayKey();
        if (get().daily.date !== today) {
          set({ daily: emptyDaily() });
        }
      },

      recordUnitCompleted: (unitId) => {
        const now = new Date().toISOString();
        set((state) => ({
          unitCompletions: { ...state.unitCompletions, [unitId]: now },
          lastUnitCompletedAt: now,
        }));
      },

      recordNewWord: (wordId) => {
        get().rollOverIfNewDay();
        const { daily } = get();
        if (daily.newWordIds.includes(wordId)) return;
        set({
          daily: {
            ...daily,
            newWordIds: [...daily.newWordIds, wordId],
          },
        });
      },

      recordRepetition: () => {
        get().rollOverIfNewDay();
        const { daily } = get();
        set({
          daily: {
            ...daily,
            repetitionsCount: daily.repetitionsCount + 1,
          },
        });
      },

      recordGameTime: (gameId, seconds) => {
        get().rollOverIfNewDay();
        const { daily } = get();
        const current = daily.gameSecondsByGame[gameId] || 0;
        set({
          daily: {
            ...daily,
            gameSecondsByGame: {
              ...daily.gameSecondsByGame,
              [gameId]: current + seconds,
            },
          },
        });
      },

      canStartNewUnit: () => {
        const last = get().lastUnitCompletedAt;
        if (!last) return { allowed: true };
        const cooldownMs = FREE_TIER_LIMITS.UNIT_COOLDOWN_HOURS * 60 * 60 * 1000;
        const unlockMs = new Date(last).getTime() + cooldownMs;
        const now = Date.now();
        if (now >= unlockMs) return { allowed: true };
        return {
          allowed: false,
          unlockAt: new Date(unlockMs).toISOString(),
          msRemaining: unlockMs - now,
        };
      },

      isUnitCompleted: (unitId) => !!get().unitCompletions[unitId],

      remainingNewWords: () => {
        get().rollOverIfNewDay();
        return Math.max(
          0,
          FREE_TIER_LIMITS.NEW_WORDS_PER_DAY - get().daily.newWordIds.length,
        );
      },

      remainingRepetitions: () => {
        get().rollOverIfNewDay();
        return Math.max(
          0,
          FREE_TIER_LIMITS.REPETITIONS_PER_DAY - get().daily.repetitionsCount,
        );
      },

      remainingGameSeconds: (gameId) => {
        get().rollOverIfNewDay();
        const used = get().daily.gameSecondsByGame[gameId] || 0;
        return Math.max(0, FREE_TIER_LIMITS.GAME_DAILY_SECONDS - used);
      },

      resetAll: () => {
        set({
          daily: emptyDaily(),
          unitCompletions: {},
          lastUnitCompletedAt: null,
        });
      },
    }),
    { name: 'wordzen-usage' },
  ),
);
