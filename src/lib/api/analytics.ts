import apiClient from './client';
import type { NoContentView } from './auth';
import { type WordzenApiResponse } from './wordzenEnvelope';

/** Одна запись в `SessionsAnalytics.sessions` (wordzen-api.md) */
export interface AnalyticsSessionPayload {
  startedAtUtc: string;
  endedAtUtc: string;
  timezone: string;
}

export interface SessionsAnalytics {
  sessions: AnalyticsSessionPayload[];
}

/**
 * `POST /api/v1/analytics/sessions`
 * Ошибки глушим — аналитика не должна ломать приложение.
 */
export const postAnalyticsSession = async (
  session: AnalyticsSessionPayload
): Promise<void> => {
  try {
    const body: SessionsAnalytics = { sessions: [session] };
    const response = await apiClient.post<WordzenApiResponse<NoContentView | null>>(
      '/api/v1/analytics/sessions',
      body
    );
    if (!response.data.success) {
      console.warn('[Analytics] API returned success=false:', response.data);
    }
  } catch (error) {
    console.warn('[Analytics] Failed to record session:', error);
  }
};
