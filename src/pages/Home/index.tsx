import { useEffect, useState, useCallback, Component, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUserStore, useCoursesStore, useProfileStatsStore } from '../../lib/stores';
import { useTelegram } from '../../lib/telegram/index';
import { getImageUrl } from '../../lib/api/courses';
import type { CourseView, ModuleView } from '../../lib/api/courses';
import { getQuizCourseProgress } from '../../lib/api/profileStats';
import type { QuizModuleProgress } from '../../lib/api/profileStats';
import { isAuthenticated } from '../../lib/api/client';
import { useTranslation } from '../../lib/i18n';

// Error boundary content - uses hook so must be a function component
const HomeErrorContent = ({
  errorMsg,
  copied,
  onCopyDebug,
  onTryAgain,
}: {
  errorMsg: string;
  copied: boolean;
  onCopyDebug: () => void;
  onTryAgain: () => void;
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-background-dark p-6 text-center">
      <span className="material-symbols-outlined text-5xl text-gray-300 mb-4">home</span>
      <h2 className="text-gray-800 dark:text-white font-bold text-lg mb-2">{t('common.somethingWentWrong')}</h2>
      <p className="text-gray-500 text-sm mb-2">{t('common.pleaseRestart')}</p>
      <p className="text-gray-400 text-xs mb-4 font-mono">{errorMsg}</p>
      <div className="flex gap-3">
        <button onClick={onTryAgain} className="px-6 py-3 bg-primary text-white rounded-xl font-medium">
          {t('common.tryAgain')}
        </button>
        <button
          onClick={onCopyDebug}
          className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">
            {copied ? 'check' : 'content_copy'}
          </span>
          {copied ? t('common.copied') : t('common.copyDebug')}
        </button>
      </div>
    </div>
  );
};

// Error boundary to prevent white screen on unexpected crashes
class HomeErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; errorMsg: string; errorStack: string; copied: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMsg: '', errorStack: '', copied: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMsg: error?.message || 'Unknown error' };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[Home] Render crashed:', error.message);
    console.error('[Home] Stack:', info.componentStack);
    this.setState({
      errorStack: `${error.message}\n\n--- Component Stack ---\n${info.componentStack || 'N/A'}\n\n--- JS Stack ---\n${error.stack || 'N/A'}`,
    });
  }
  handleCopyDebug = () => {
    const debugInfo = `Error: ${this.state.errorMsg}\n\nFull Stack:\n${this.state.errorStack}\n\nTimestamp: ${new Date().toISOString()}\nURL: ${window.location.href}\nUserAgent: ${navigator.userAgent}`;
    navigator.clipboard.writeText(debugInfo).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    });
  };
  render() {
    if (this.state.hasError) {
      return (
        <HomeErrorContent
          errorMsg={this.state.errorMsg}
          copied={this.state.copied}
          onCopyDebug={this.handleCopyDebug}
          onTryAgain={() => this.setState({ hasError: false, errorMsg: '', errorStack: '', copied: false })}
        />
      );
    }
    return this.props.children;
  }
}

interface ContinueLearningData {
  course: CourseView;
  modules: ModuleView[];
  moduleProgress: QuizModuleProgress[];
  completedModules: number;
  totalModules: number;
  progressPercent: number;
  nextModule: ModuleView | null;
}

const Home = () => {
  const navigate = useNavigate();
  const { t, ta } = useTranslation();
  const user = useUserStore((state) => state.user);
  const { user: tgUser, isTelegram, haptic, isAuthenticating } = useTelegram();

  const {
    libraryCourses,
    isLoadingLibrary,
    fetchLibraryCourses,
  } = useCoursesStore();

  const {
    visitStreak,
    fetchProfileStats,
  } = useProfileStatsStore();

  const [continueData, setContinueData] = useState<ContinueLearningData | null>(null);
  const [isLoadingContinue, setIsLoadingContinue] = useState(true);

  // Get display name - prefer Telegram user if available
  const displayName = tgUser?.first_name || user?.name || t('home.learner');

  // Fetch only after auth is settled — isAuthenticating is reactive (from TelegramProvider state)
  // This fixes the bug where isAuthenticated() was read as a non-reactive localStorage call
  useEffect(() => {
    if (!isAuthenticating && isAuthenticated()) {
      fetchLibraryCourses();
      fetchProfileStats();
    }
  }, [isAuthenticating, fetchLibraryCourses, fetchProfileStats]);

  // If auth is settled and user is NOT logged in, stop the loading spinner immediately
  useEffect(() => {
    if (!isAuthenticating && !isAuthenticated()) {
      setIsLoadingContinue(false);
    }
  }, [isAuthenticating]);

  // Build continue learning data from first library course
  const buildContinueData = useCallback(async (course: CourseView) => {
    try {
      // Fetch modules if not embedded in course
      let modules = course.modules || [];
      if (modules.length === 0) {
        const { getCourseModules } = await import('../../lib/api/courses');
        const fetched = await getCourseModules(course.id);
        modules = fetched || [];
      }

      // Fetch quiz progress for this course
      let moduleProgress: QuizModuleProgress[] = [];
      let overallPercent = 0;
      try {
        const courseProgress = await getQuizCourseProgress(course.id);
        moduleProgress = courseProgress?.modules || [];
        overallPercent = courseProgress?.progress?.percent || 0;
      } catch {
        // Quiz progress not available yet — that's fine
      }

      // Count completed modules (>= 70% considered completed)
      // Guard against null/undefined progress from API
      const completedModules = moduleProgress.filter(
        (mp) => mp.progress != null && mp.progress.total > 0 && mp.progress.percent >= 70
      ).length;

      // Find next incomplete module
      const completedModuleIds = new Set(
        moduleProgress
          .filter((mp) => mp.progress != null && mp.progress.total > 0 && mp.progress.percent >= 70)
          .map((mp) => mp.moduleId)
      );
      const nextModule = modules.find((m) => !completedModuleIds.has(m.id)) || modules[0] || null;

      setContinueData({
        course,
        modules,
        moduleProgress,
        completedModules,
        totalModules: modules.length,
        progressPercent: Math.round(overallPercent),
        nextModule,
      });
    } catch (err) {
      console.warn('Failed to build continue learning data:', err);
      setContinueData(null);
    } finally {
      setIsLoadingContinue(false);
    }
  }, []);

  // When library courses load, pick the first one
  useEffect(() => {
    if (libraryCourses && libraryCourses.length > 0) {
      buildContinueData(libraryCourses[0]);
    } else if (!isLoadingLibrary) {
      setIsLoadingContinue(false);
    }
  }, [libraryCourses, isLoadingLibrary, buildContinueData]);

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

  // Get course description for subtitle
  const getCourseDescription = (course: CourseView): string => {
    const desc = course.descriptions?.find((d) => d.locale === 'EN') || course.descriptions?.[0];
    return desc?.value || course.category?.name || '';
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col max-w-[430px] mx-auto overflow-x-hidden bg-white dark:bg-background-dark">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center bg-white dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10"
      >
        <div className="flex items-center gap-3">
          {tgUser?.photo_url ? (
            <img
              src={tgUser.photo_url}
              alt={displayName}
              className="size-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-10 shrink-0 items-center justify-center bg-primary/10 rounded-full">
              <span className="material-symbols-outlined text-primary text-2xl">eco</span>
            </div>
          )}
          <div>
            <h2 className="text-gray-800 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
              {t('home.greeting', { name: displayName })}
            </h2>
            {isTelegram && (
              <p className="text-xs text-gray-500">{t('home.letsLearn')}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/shop')}
            className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <span className="material-symbols-outlined text-[#686189] dark:text-gray-400">shopping_cart</span>
          </button>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1"
      >
        {/* Continue Learning Card */}
        <motion.div variants={itemVariants} className="p-4">
          {isLoadingContinue ? (
            <div className="flex flex-col items-stretch rounded-xl bg-white dark:bg-gray-900 overflow-hidden border border-gray-100 dark:border-gray-800 animate-pulse">
              <div className="w-full aspect-[21/9] bg-gray-200 dark:bg-gray-700" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full w-full" />
              </div>
            </div>
          ) : continueData ? (
            <div
              onClick={() => navigate(`/courses/${continueData.course.id}`)}
              className="flex flex-col items-stretch justify-start rounded-xl shadow-card bg-white dark:bg-gray-900 overflow-hidden border border-gray-100 dark:border-gray-800 cursor-pointer hover:shadow-card-hover transition-shadow"
            >
              <div
                className="w-full bg-center bg-no-repeat aspect-[21/9] bg-cover bg-gray-200 dark:bg-gray-700"
                style={{
                  backgroundImage: continueData.course.cover
                    ? `url("${getImageUrl(continueData.course.cover)}")`
                    : undefined,
                }}
              >
                <div className="w-full h-full bg-gradient-to-t from-gray-800/60 to-transparent flex items-end p-4">
                  <span className="bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                    {continueData.course.category?.name || continueData.course.title}
                  </span>
                </div>
              </div>
              <div className="flex w-full flex-col items-stretch justify-center gap-3 p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-gray-800 dark:text-white text-lg font-bold leading-tight">
                      {t('home.continueLearning')}
                    </p>
                    <p className="text-[#686189] dark:text-gray-400 text-sm font-medium truncate">
                      {continueData.nextModule
                        ? `${continueData.course.title} — ${continueData.nextModule.title}`
                        : getCourseDescription(continueData.course) || continueData.course.title}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      haptic.impact('light');
                      if (continueData.nextModule) {
                        navigate(`/unit/${continueData.nextModule.id}`);
                      } else {
                        navigate(`/courses/${continueData.course.id}`);
                      }
                    }}
                    className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-xl h-9 px-4 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20"
                  >
                    {t('common.continue')}
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-bold text-primary">
                    <span>{t('home.percentComplete', { percent: continueData.progressPercent })}</span>
                    <span>{t('home.unitsProgress', { completed: continueData.completedModules, total: continueData.totalModules })}</span>
                  </div>
                  <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${continueData.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => navigate('/courses')}
              className="flex flex-col items-center justify-center rounded-xl bg-white dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-700 p-8 cursor-pointer"
            >
              <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-2">menu_book</span>
              <p className="text-gray-800 dark:text-white font-bold mb-1">{t('home.noCourses')}</p>
              <p className="text-gray-500 text-sm text-center">{t('home.noCoursesDesc')}</p>
            </div>
          )}
        </motion.div>

        {/* Weekly Progress */}
        <motion.div variants={itemVariants} className="px-4 py-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-800 dark:text-white text-lg font-bold tracking-tight">
              {t('home.weeklyProgress')}
            </h3>
            <div className="flex items-center gap-1.5 text-orange-500 font-bold">
              <span className="material-symbols-outlined fill-1 text-xl">local_fire_department</span>
              <span>{t('home.dayStreak', { count: visitStreak })}</span>
            </div>
          </div>
          <div className="flex justify-between bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
            {(() => {
              const dayLabels = ta('home.dayLabels');
              const today = new Date();
              const todayDow = today.getDay(); // 0=Sun
              // Shift so Monday=0: Mon=0, Tue=1, ..., Sun=6
              const todayIdx = todayDow === 0 ? 6 : todayDow - 1;

              return dayLabels.map((label, index) => {
                const isToday = index === todayIdx;
                // Mark days as completed based on visitStreak counting back from today
                const daysAgo = todayIdx - index;
                const isCompleted = daysAgo > 0 && daysAgo <= visitStreak;
                const isFuture = index > todayIdx;

                return (
                  <div key={index} className="flex flex-col items-center gap-2">
                    {isCompleted ? (
                      <div className="flex items-center justify-center size-8 rounded-full bg-primary text-white">
                        <span className="material-symbols-outlined text-lg">check</span>
                      </div>
                    ) : isToday ? (
                      <div className="flex items-center justify-center size-8 rounded-full border-2 border-dashed border-primary/50 text-primary">
                        <span className="material-symbols-outlined text-lg">schedule</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center size-8 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-300" />
                    )}
                    <span className={`text-xs font-medium ${isToday ? 'text-gray-800 dark:text-white font-bold' : isFuture ? 'text-gray-400' : 'text-gray-500'}`}>
                      {label}
                    </span>
                  </div>
                );
              });
            })()}
          </div>
        </motion.div>

        {/* Daily Mission Card */}
        <motion.div variants={itemVariants} className="p-4">
          <div className="bg-gradient-to-br from-indigo-600 to-primary rounded-xl p-5 text-white shadow-xl relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-20">
              <span className="material-symbols-outlined text-9xl">eco</span>
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-bold">{t('home.dailyMission')}</h4>
                  <p className="text-indigo-100 text-xs">{t('home.complete50Words')}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-md px-2 py-1 rounded flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">timer</span>
                  <span className="text-[10px] font-bold">14h 22m</span>
                </div>
              </div>

              {/* Progress Track with Octopus */}
              <div className="relative h-12 flex items-center mb-4">
                <div className="absolute w-full h-1 bg-white/20 rounded-full" />
                <div className="absolute h-1 bg-white rounded-full" style={{ width: '70%' }} />
                <div className="absolute left-[70%] -translate-x-1/2 -top-6 flex flex-col items-center">
                  <div className="bg-white p-1 rounded-full shadow-lg">
                    <span className="material-symbols-outlined text-primary text-xl fill-1">eco</span>
                  </div>
                  <div className="w-1 h-2 bg-white mt-1" />
                </div>
                <div className="absolute right-0 -top-1">
                  <span className="material-symbols-outlined text-amber-300">flag</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="bg-amber-400 p-1.5 rounded-full border-2 border-indigo-600">
                      <span className="material-symbols-outlined text-white text-[10px] fill-1">database</span>
                    </div>
                    <div className="bg-emerald-400 p-1.5 rounded-full border-2 border-indigo-600">
                      <span className="material-symbols-outlined text-white text-[10px] fill-1">bolt</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold">{t('home.octoCoinsReward')}</span>
                </div>
                <span className="text-xs font-medium">{t('home.wordsProgress')}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="px-4 py-2">
          <h3 className="text-gray-800 dark:text-white text-lg font-bold tracking-tight mb-3">
            {t('home.quickActions')}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Pomodoro Timer */}
            <button
              onClick={() => {
                haptic.impact('light');
                navigate('/pomodoro');
              }}
              className="flex flex-col items-start p-4 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-100 dark:border-red-900/30 text-left active:scale-[0.98] transition-transform"
            >
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-3">
                <span className="text-xl">🍅</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{t('home.pomodoro')}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('home.focusTimer')}</p>
            </button>

            {/* Favorites */}
            <button
              onClick={() => {
                haptic.impact('light');
                navigate('/favorites');
              }}
              className="flex flex-col items-start p-4 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-100 dark:border-amber-900/30 text-left active:scale-[0.98] transition-transform"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{t('home.favorites')}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('home.savedWords')}</p>
            </button>

            {/* Games */}
            <button
              onClick={() => {
                haptic.impact('light');
                navigate('/games');
              }}
              className="flex flex-col items-start p-4 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-100 dark:border-purple-900/30 text-left active:scale-[0.98] transition-transform"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-purple-500">extension</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{t('home.games')}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('home.learnPlay')}</p>
            </button>

            {/* Tests */}
            <button
              onClick={() => {
                haptic.impact('light');
                navigate('/tests');
              }}
              className="flex flex-col items-start p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-900/30 text-left active:scale-[0.98] transition-transform"
            >
              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-green-500">quiz</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{t('home.tests')}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('home.checkKnowledge')}</p>
            </button>
          </div>
        </motion.div>

        {/* Ranking Section */}
        <motion.div variants={itemVariants} className="px-4 py-2 pb-24">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-800 dark:text-white text-lg font-bold tracking-tight">{t('home.ranking')}</h3>
            <button
              onClick={() => navigate('/rankings')}
              className="text-primary text-sm font-bold"
            >
              {t('home.viewLeaderboard')}
            </button>
          </div>
          <div className="space-y-3">
            {/* Global Ranking */}
            <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-8 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <span className="material-symbols-outlined text-gray-400 text-lg">public</span>
                </div>
                <div>
                  <p className="text-sm font-bold">{t('home.globalRanking')}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{t('home.topPercent', { percent: 5 })}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">#{user?.rankPosition || '2,401'}</p>
                <p className="text-[10px] text-emerald-500 font-bold">{t('home.positions', { count: 12 })}</p>
              </div>
            </div>

            {/* Country Ranking */}
            <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-8 rounded-lg bg-gray-50 dark:bg-gray-800 overflow-hidden">
                  <span className="text-lg">🇺🇿</span>
                </div>
                <div>
                  <p className="text-sm font-bold">{t('home.uzbekistan')}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{t('home.topPercent', { percent: 2 })}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">#412</p>
                <p className="text-[10px] text-emerald-500 font-bold">{t('home.positions', { count: 3 })}</p>
              </div>
            </div>

            {/* Regional Ranking */}
            <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-8 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <span className="material-symbols-outlined text-gray-400 text-lg">location_on</span>
                </div>
                <div>
                  <p className="text-sm font-bold">{t('home.tashkent')}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{t('home.diamondLeague')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">#15</p>
                <p className="text-[10px] text-gray-400 font-bold">{t('home.static')}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

const HomeWithErrorBoundary = () => (
  <HomeErrorBoundary>
    <Home />
  </HomeErrorBoundary>
);

export default HomeWithErrorBoundary;
