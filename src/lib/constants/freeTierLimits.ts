/**
 * Free-tier limits, per the team's locked decisions:
 *
 * — 24h cooldown from previous unit completion before next unlocks
 * — 10 new words per day
 * — Limited repetitions per day (exact cap pending team confirmation)
 * — "Super dope" courses fully closed; only first units of basic courses open
 * — One game closed entirely; complex games unavailable; simple games time-limited
 * — Statistics / detailed analytics fully locked
 * — Ads appear rarely
 *
 * Specific game classifications and "super dope" course IDs come from a
 * backend tag (Кудрат defines). Lists below are intentionally empty until
 * the tag ships — gating must fail closed (assume premium-only) for any
 * course explicitly tagged, otherwise treat as free-accessible with limits.
 */

export const FREE_TIER_LIMITS = {
  /** New unique words a free user may study per day. */
  NEW_WORDS_PER_DAY: 10,
  /** Repetitions (review answers) a free user may submit per day. TBD by team. */
  REPETITIONS_PER_DAY: 30,
  /** Hours after a unit completion before the next unit unlocks for free users. */
  UNIT_COOLDOWN_HOURS: 24,
  /** Daily playtime cap (seconds) for any single "simple" game. TBD by team. */
  GAME_DAILY_SECONDS: 5 * 60,
} as const;

/**
 * Game IDs entirely closed for free users.
 * One game gets closed per team decision — exact id pending Кудрат.
 */
export const CLOSED_GAMES_FREE: readonly string[] = [];

/**
 * Game IDs marked "complex" — unavailable for free users.
 */
export const COMPLEX_GAMES_FREE: readonly string[] = [];

/**
 * Game IDs marked "simple" — playable but time-limited for free users.
 * Default: any game not in CLOSED_GAMES_FREE / COMPLEX_GAMES_FREE.
 */
export const SIMPLE_GAMES_FREE: readonly string[] = [];

/**
 * Plan tiers as understood by the client. Maps onto subscription
 * `statusCode === 'ACTIVE'` plus a future course-level tag for basic vs pro.
 */
export type PlanTier = 'free' | 'basic' | 'pro';
