import { useEffect, useRef, useCallback } from 'react';
import { isAuthenticated } from '../api/client';
import { postAnalyticsSession } from '../api/analytics';

// Minimum session length to record — ignore micro-visits under 10 seconds
const MIN_SESSION_MS = 10_000;

// Flush the current session to the backend every 60 seconds while the app is active.
// This is critical for Telegram Mini App WebView where visibilitychange / pagehide
// may not fire reliably.
const FLUSH_INTERVAL_MS = 60_000;

/**
 * Tracks how long the authenticated user spends in the app.
 * Sends a session to POST /api/v1/analytics/sessions:
 *   - Every 60 seconds while the app is active (periodic flush)
 *   - When the page becomes hidden (visibilitychange)
 *   - When the page is about to unload (pagehide)
 *   - When the component unmounts
 *
 * This powers: Study Time (today/week/all time), Weekly Activity chart,
 * and Visit Streak on the Statistics and Profile pages.
 *
 * @param isAuthenticating - pass from useTelegram() so we start the
 *   session only after Telegram auth is fully settled.
 */
export const useSessionTracking = (isAuthenticating: boolean) => {
  const sessionStart = useRef<Date | null>(null);

  // Send the session to backend and immediately start a new one
  const flushSession = useCallback(async () => {
    if (!sessionStart.current || !isAuthenticated()) return;

    const start = sessionStart.current;
    const end = new Date();

    // Only send if the session meets the minimum duration
    if (end.getTime() - start.getTime() < MIN_SESSION_MS) return;

    // Restart the clock immediately so no time is lost
    sessionStart.current = new Date();

    await postAnalyticsSession({
      startedAtUtc: start.toISOString(),
      endedAtUtc: end.toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  }, []);

  // End the session without restarting (used on page hide / unmount)
  const endSession = useCallback(async () => {
    if (!sessionStart.current || !isAuthenticated()) return;

    const start = sessionStart.current;
    const end = new Date();
    sessionStart.current = null;

    if (end.getTime() - start.getTime() < MIN_SESSION_MS) return;

    await postAnalyticsSession({
      startedAtUtc: start.toISOString(),
      endedAtUtc: end.toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  }, []);

  // Start a new session
  const startSession = useCallback(() => {
    if (!isAuthenticated()) return;
    sessionStart.current = new Date();
  }, []);

  // Start the very first session once auth is settled
  useEffect(() => {
    if (!isAuthenticating && isAuthenticated()) {
      startSession();
    }
  }, [isAuthenticating, startSession]);

  // Periodic flush — sends accumulated time every 60 seconds
  // This is the most reliable method for Telegram WebView
  useEffect(() => {
    const interval = setInterval(() => {
      flushSession();
    }, FLUSH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [flushSession]);

  // Also listen for visibility changes and page unload as backup
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        endSession();
      } else {
        startSession();
      }
    };

    const handlePageHide = () => {
      endSession();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      endSession();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [endSession, startSession]);
};
