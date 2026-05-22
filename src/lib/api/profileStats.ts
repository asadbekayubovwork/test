import apiClient from './client';
import { type WordzenApiResponse, wordzenErrorMessage } from './wordzenEnvelope';

export interface AnalyticsSession {
  startedAtUtc: string;
  endedAtUtc: string;
  timezoneOffset: string;
  timezone: string;
}

export interface QuizProgress {
  percent: number;
  success: number;
  failure: number;
  total: number;
}

// --- API Functions ---

/**
 * Get all analytics sessions for the current user.
 * Used to calculate total time learned and visit streak.
 */
export const getAnalyticsSessions = async (): Promise<AnalyticsSession[]> => {
  const response = await apiClient.get<WordzenApiResponse<AnalyticsSession[]>>(
    '/api/v1/analytics/sessions'
  );

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(wordzenErrorMessage(response.data, 'Failed to fetch analytics sessions'));
};

/**
 * Get overall quiz progress across all modules.
 * Returns accuracy percentage, success/failure counts, and total.
 */
export const getQuizProgress = async (): Promise<QuizProgress> => {
  const response = await apiClient.get<WordzenApiResponse<QuizProgress>>(
    '/api/v1/quiz/progress'
  );

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(wordzenErrorMessage(response.data, 'Failed to fetch quiz progress'));
};

/**
 * Get quiz progress for a specific course (with per-module breakdown).
 */
export interface QuizModuleProgress {
  moduleId: number;
  progress: QuizProgress;
}

export interface QuizCourseProgress {
  courseId: number;
  progress: QuizProgress;
  modules: QuizModuleProgress[];
}

export const getQuizCourseProgress = async (courseId: number): Promise<QuizCourseProgress> => {
  const response = await apiClient.get<WordzenApiResponse<QuizCourseProgress>>(
    `/api/v1/quiz/courses/${courseId}/progress`
  );

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(wordzenErrorMessage(response.data, 'Failed to fetch course progress'));
};

// --- Computation Helpers ---

/**
 * Calculate total time learned in minutes from session data.
 */
export const computeTotalTimeMinutes = (sessions: AnalyticsSession[]): number => {
  let totalMs = 0;

  for (const session of sessions) {
    const start = new Date(session.startedAtUtc).getTime();
    const end = new Date(session.endedAtUtc).getTime();
    const diff = end - start;

    // Skip invalid sessions (negative or > 24h which likely means a bug)
    if (diff > 0 && diff < 24 * 60 * 60 * 1000) {
      totalMs += diff;
    }
  }

  return Math.round(totalMs / (1000 * 60));
};

/**
 * Calculate current visit streak (consecutive days with at least one session).
 * Counts backwards from today.
 */
export const computeVisitStreak = (sessions: AnalyticsSession[]): number => {
  if (sessions.length === 0) return 0;

  // Get unique dates (in user's local timezone) that have sessions
  const sessionDates = new Set<string>();

  for (const session of sessions) {
    const date = new Date(session.startedAtUtc);
    // Use local date string as key (YYYY-MM-DD)
    const dateKey = date.toLocaleDateString('en-CA'); // en-CA gives YYYY-MM-DD format
    sessionDates.add(dateKey);
  }

  // Sort dates descending
  const sortedDates = Array.from(sessionDates).sort().reverse();

  if (sortedDates.length === 0) return 0;

  // Check if today or yesterday is in the list (streak must be current)
  const today = new Date();
  const todayKey = today.toLocaleDateString('en-CA');

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toLocaleDateString('en-CA');

  if (sortedDates[0] !== todayKey && sortedDates[0] !== yesterdayKey) {
    return 0; // Streak is broken
  }

  // Count consecutive days backwards from the most recent session date
  let streak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i - 1]);
    const prevDate = new Date(sortedDates[i]);

    const diffDays = Math.round(
      (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      streak++;
    } else {
      break; // Gap found, streak ends
    }
  }

  return streak;
};
