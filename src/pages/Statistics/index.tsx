import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  useReportStore,
  useProfileStatsStore,
  useSubscriptionStore,
} from '../../lib/stores';
import { useTranslation } from '../../lib/i18n';
import PaywallBanner from '../../components/PaywallBanner';

const Statistics = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { report, isLoading, error, fetchReport } = useReportStore();
  const { rawSessions, fetchProfileStats } = useProfileStatsStore();
  const isPremium = useSubscriptionStore((s) => s.isPremium());
  const fetchSubscription = useSubscriptionStore((s) => s.fetchSubscription);

  useEffect(() => {
    // Subscription state may not have loaded yet — read once before locking.
    fetchSubscription();
  }, [fetchSubscription]);

  useEffect(() => {
    if (!isPremium) return;
    fetchReport();
    fetchProfileStats(); // needed for weekly activity fallback
  }, [isPremium, fetchReport, fetchProfileStats]);

  // Free users get a paywall instead of stats. Detailed analytics is a
  // premium-only feature per team decision.
  if (!isPremium) {
    return (
      <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto bg-gray-50 dark:bg-background-dark">
        <div className="sticky top-0 z-10 flex items-center bg-gray-50/80 dark:bg-background-dark/80 backdrop-blur-md p-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center text-gray-900 dark:text-white"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="flex-1 text-center text-lg font-bold text-gray-900 dark:text-white">
            {t('statistics.title')}
          </h1>
          <div className="w-10" />
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <PaywallBanner variant="locked" />
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Format minutes to hours and minutes
  const formatTime = (minutes: number | null | undefined) => {
    const m = minutes ?? 0;
    if (m <= 0) return '0m';
    if (m < 60) return `${m}m`;
    const hours = Math.floor(m / 60);
    const mins = m % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Handle both 0-1 decimal and 0-100 integer from backend
  const getProgressPercent = (progress: number | null | undefined): number => {
    const p = progress ?? 0;
    if (p <= 0) return 0;
    if (p > 1) return Math.min(Math.round(p), 100); // already a percentage
    return Math.min(Math.round(p * 100), 100);       // decimal 0-1
  };

  // Build last 7 days using LOCAL dates (not UTC) so they match backend dates
  const getLast7Days = () => {
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      // Use local date in YYYY-MM-DD to match backend
      const localDate = date.toLocaleDateString('en-CA');
      days.push({
        date: localDate,
        dayName: dayNames[date.getDay()],
        isToday: i === 0,
      });
    }
    return days;
  };

  const MAX_MINUTES = 120; // 2 hours = 100% bar height

  // Compute minutes spent for a specific date from raw sessions
  const getDailyMinutes = (date: string): number => {
    if (rawSessions.length === 0) return 0;
    let totalMs = 0;
    for (const s of rawSessions) {
      const sessionDate = new Date(s.startedAtUtc).toLocaleDateString('en-CA');
      if (sessionDate !== date) continue;
      const start = new Date(s.startedAtUtc).getTime();
      const end = new Date(s.endedAtUtc).getTime();
      const diff = end - start;
      if (diff > 0 && diff < 24 * 60 * 60 * 1000) {
        totalMs += diff;
      }
    }
    return Math.round(totalMs / (1000 * 60));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-white dark:bg-background-dark">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{t('statistics.loading')}</p>
        </div>
      </div>
    );
  }

  const last7Days = getLast7Days();

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto overflow-x-hidden bg-white dark:bg-background-dark">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white dark:bg-background-dark border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-gray-700 dark:text-gray-300">
              arrow_back
            </span>
          </button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            {t('statistics.title')}
          </h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          <button
            onClick={() => fetchReport()}
            className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium underline"
          >
            {t('common.tryAgain')}
          </button>
        </div>
      )}

      {/* Content */}
      {report && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 px-4 py-6 pb-24 space-y-6"
        >
          {/* Study Time Section */}
          <motion.div variants={itemVariants}>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              {t('statistics.studyTime')}
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <span className="material-symbols-outlined text-2xl opacity-80">today</span>
                <p className="text-2xl font-bold mt-2">{formatTime(report.sessions?.minutesToDay)}</p>
                <p className="text-xs opacity-80 mt-1">{t('statistics.today')}</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <span className="material-symbols-outlined text-2xl opacity-80">date_range</span>
                <p className="text-2xl font-bold mt-2">{formatTime(report.sessions?.minutesInWeek)}</p>
                <p className="text-xs opacity-80 mt-1">{t('statistics.thisWeek')}</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white">
                <span className="material-symbols-outlined text-2xl opacity-80">calendar_month</span>
                <p className="text-2xl font-bold mt-2">{formatTime(report.sessions?.minutesAllTime)}</p>
                <p className="text-xs opacity-80 mt-1">{t('statistics.allTime')}</p>
              </div>
            </div>
          </motion.div>

          {/* Weekly Activity Chart */}
          <motion.div variants={itemVariants}>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              {t('statistics.weeklyActivity')}
            </h2>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
              <div className="flex items-end justify-between gap-2" style={{ height: 160 }}>
                {last7Days.map((day) => {
                  const minutes = getDailyMinutes(day.date);
                  const pct = Math.min((minutes / MAX_MINUTES) * 100, 100);
                  const BAR_AREA = 120;
                  const barPx = minutes > 0 ? Math.max((pct / 100) * BAR_AREA, 6) : 4;
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center justify-end h-full">
                      {/* Time label */}
                      <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 tabular-nums mb-1 min-h-[14px]">
                        {minutes > 0 ? formatTime(minutes) : ''}
                      </span>
                      {/* Bar */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: barPx }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className={`w-full max-w-[32px] rounded-t-lg ${
                          day.isToday
                            ? 'bg-primary'
                            : minutes > 0
                            ? 'bg-primary/50'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                      {/* Day label */}
                      <span
                        className={`text-xs mt-2 ${
                          day.isToday
                            ? 'text-primary font-semibold'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {day.dayName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Learning Progress Section */}
          <motion.div variants={itemVariants}>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              {t('statistics.learningProgress')}
            </h2>
            <div className="space-y-3">
              {/* Cards Progress */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <span className="material-symbols-outlined text-amber-600 text-xl">
                        style
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{t('statistics.cardsLearned')}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('statistics.ofTotal', { known: String(report.cards?.known ?? 0), total: String(report.cards?.total ?? 0) })}
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-primary">
                    {getProgressPercent(report.cards?.progress)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${getProgressPercent(report.cards?.progress)}%` }}
                  />
                </div>
              </div>

              {/* Training Progress */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <span className="material-symbols-outlined text-green-600 text-xl">
                        fitness_center
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{t('statistics.trainingProgress')}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('statistics.ofTotal', { known: String(report.training?.known ?? 0), total: String(report.training?.total ?? 0) })}
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-primary">
                    {getProgressPercent(report.training?.progress)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${getProgressPercent(report.training?.progress)}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Courses Overview Section */}
          <motion.div variants={itemVariants}>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              {t('statistics.coursesOverview')}
            </h2>
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-primary">{report.courses?.total ?? 0}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('statistics.total')}</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-500">{report.courses?.active ?? 0}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('statistics.active')}</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-500">{report.courses?.complete ?? 0}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('statistics.completed')}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Achievements Preview */}
          <motion.div variants={itemVariants}>
            <div className="p-5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <span
                    className="material-symbols-outlined text-amber-500 text-3xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    emoji_events
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t('statistics.keepGoing')}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {t('statistics.studiedTotal', { time: formatTime(report.sessions?.minutesAllTime) })}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Empty State (if no report data) */}
      {!report && !isLoading && !error && (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
          <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
            analytics
          </span>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {t('statistics.noStatsYet')}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs">
            {t('statistics.noStatsDesc')}
          </p>
        </div>
      )}
    </div>
  );
};

export default Statistics;
