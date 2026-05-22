import { create } from 'zustand';
import {
  getAnalyticsSessions,
  getQuizProgress,
  computeTotalTimeMinutes,
  computeVisitStreak,
} from '../api/profileStats';
import type { AnalyticsSession, QuizProgress } from '../api/profileStats';

interface ProfileStats {
  // Computed stats
  totalTimeMinutes: number;
  visitStreak: number;
  quizProgress: QuizProgress | null;
  // Raw sessions exposed for weekly activity chart fallback in Statistics page
  rawSessions: AnalyticsSession[];

  // Loading / error
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProfileStats: () => Promise<void>;
  resetStats: () => void;
}

const initialState = {
  totalTimeMinutes: 0,
  visitStreak: 0,
  quizProgress: null,
  rawSessions: [] as AnalyticsSession[],
  isLoading: false,
  error: null,
};

export const useProfileStatsStore = create<ProfileStats>((set) => ({
  ...initialState,

  fetchProfileStats: async () => {
    set({ isLoading: true, error: null });

    // Fetch both endpoints in parallel, handle each independently
    const results = await Promise.allSettled([
      getAnalyticsSessions(),
      getQuizProgress(),
    ]);

    const [sessionsResult, quizResult] = results;

    // Process analytics sessions
    let totalTimeMinutes = 0;
    let visitStreak = 0;
    let rawSessions: AnalyticsSession[] = [];

    if (sessionsResult.status === 'fulfilled') {
      const sessions = sessionsResult.value;
      rawSessions = sessions;
      totalTimeMinutes = computeTotalTimeMinutes(sessions);
      visitStreak = computeVisitStreak(sessions);
    } else {
      console.warn('Failed to fetch analytics sessions:', sessionsResult.reason);
    }

    // Process quiz progress
    let quizProgress: QuizProgress | null = null;

    if (quizResult.status === 'fulfilled') {
      quizProgress = quizResult.value;
    } else {
      console.warn('Failed to fetch quiz progress:', quizResult.reason);
    }

    set({
      totalTimeMinutes,
      visitStreak,
      quizProgress,
      rawSessions,
      isLoading: false,
      // Only set error if both failed
      error:
        sessionsResult.status === 'rejected' && quizResult.status === 'rejected'
          ? 'Failed to load profile stats'
          : null,
    });
  },

  resetStats: () => {
    set(initialState);
  },
}));
