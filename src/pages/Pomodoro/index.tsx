import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePomodoroStore } from '../../lib/stores/pomodoroStore';
import type { TimerMode } from '../../lib/stores/pomodoroStore';
import { useCoursesStore } from '../../lib/stores';
import { useTranslation } from '../../lib/i18n';

const Pomodoro = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [showCourseSelector, setShowCourseSelector] = useState(false);

  const {
    focusDuration,
    shortBreakDuration,
    longBreakDuration,
    sessionsUntilLongBreak,
    currentMode,
    timeRemaining,
    isRunning,
    completedSessions,
    selectedCourseId,
    totalMinutesStudied,
    isSaving,
    setFocusDuration,
    setShortBreakDuration,
    setLongBreakDuration,
    startTimer,
    pauseTimer,
    resetTimer,
    tick,
    switchMode,
    selectCourse,
  } = usePomodoroStore();

  const { courses, fetchCourses } = useCoursesStore();

  // Fetch courses for selection
  useEffect(() => {
    if (courses.length === 0) {
      fetchCourses();
    }
  }, [courses.length, fetchCourses]);

  // Timer tick effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, tick]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get mode colors and labels
  const getModeInfo = (mode: TimerMode) => {
    switch (mode) {
      case 'focus':
        return {
          label: t('pomodoro.focusTime'),
          color: 'text-primary',
          bgColor: 'bg-primary',
          lightBg: 'bg-primary/10',
          icon: 'psychology',
        };
      case 'shortBreak':
        return {
          label: t('pomodoro.shortBreak'),
          color: 'text-green-500',
          bgColor: 'bg-green-500',
          lightBg: 'bg-green-500/10',
          icon: 'coffee',
        };
      case 'longBreak':
        return {
          label: t('pomodoro.longBreak'),
          color: 'text-blue-500',
          bgColor: 'bg-blue-500',
          lightBg: 'bg-blue-500/10',
          icon: 'self_improvement',
        };
    }
  };

  const modeInfo = getModeInfo(currentMode);

  // Calculate progress percentage
  const getTotalDuration = () => {
    switch (currentMode) {
      case 'focus':
        return focusDuration * 60;
      case 'shortBreak':
        return shortBreakDuration * 60;
      case 'longBreak':
        return longBreakDuration * 60;
    }
  };

  const progress = ((getTotalDuration() - timeRemaining) / getTotalDuration()) * 100;

  // Get selected course name
  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto overflow-x-hidden bg-gray-50 dark:bg-background-dark">
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
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">{t('pomodoro.title')}</h1>
          <button
            onClick={() => setShowSettings(true)}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-gray-700 dark:text-gray-300">
              settings
            </span>
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 pb-24">
        {/* Course Selector */}
        <button
          onClick={() => setShowCourseSelector(true)}
          className="w-full p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center gap-3 mb-6"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">menu_book</span>
          </div>
          <div className="flex-1 text-left">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('pomodoro.studying')}</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {selectedCourse?.title || t('pomodoro.selectCourse')}
            </p>
          </div>
          <span className="material-symbols-outlined text-gray-400">expand_more</span>
        </button>

        {/* Mode Tabs */}
        <div className="flex gap-2 p-1 rounded-xl bg-white dark:bg-gray-800 mb-6">
          {(['focus', 'shortBreak', 'longBreak'] as TimerMode[]).map((mode) => {
            const info = getModeInfo(mode);
            const isActive = currentMode === mode;
            return (
              <button
                key={mode}
                onClick={() => !isRunning && switchMode(mode)}
                disabled={isRunning}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? `${info.bgColor} text-white`
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                } disabled:opacity-50`}
              >
                {mode === 'focus' ? t('pomodoro.focus') : mode === 'shortBreak' ? t('pomodoro.short') : t('pomodoro.long')}
              </button>
            );
          })}
        </div>

        {/* Timer Display */}
        <div className="flex flex-col items-center mb-8">
          {/* Circular Progress */}
          <div className="relative w-64 h-64 mb-6">
            {/* Background circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-gray-200 dark:text-gray-700"
              />
              {/* Progress circle */}
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                className={modeInfo.color}
                strokeDasharray={2 * Math.PI * 120}
                strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>

            {/* Timer text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`material-symbols-outlined text-4xl ${modeInfo.color} mb-2`}>
                {modeInfo.icon}
              </span>
              <span className="text-5xl font-bold text-gray-900 dark:text-white tabular-nums">
                {formatTime(timeRemaining)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {modeInfo.label}
              </span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={resetTimer}
              disabled={isRunning}
              className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 disabled:opacity-50"
            >
              <span className="material-symbols-outlined">refresh</span>
            </button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={isRunning ? pauseTimer : startTimer}
              className={`w-20 h-20 rounded-full ${modeInfo.bgColor} flex items-center justify-center text-white shadow-lg`}
            >
              <span className="material-symbols-outlined text-4xl">
                {isRunning ? 'pause' : 'play_arrow'}
              </span>
            </motion.button>

            <button
              onClick={() => {
                if (currentMode === 'focus') {
                  switchMode('shortBreak');
                } else {
                  switchMode('focus');
                }
              }}
              disabled={isRunning}
              className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 disabled:opacity-50"
            >
              <span className="material-symbols-outlined">skip_next</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary text-lg">timer</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{t('pomodoro.sessionsToday')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {completedSessions}
              <span className="text-sm font-normal text-gray-400">/{sessionsUntilLongBreak}</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-green-500 text-lg">schedule</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{t('pomodoro.totalStudyTime')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalMinutesStudied}
              <span className="text-sm font-normal text-gray-400"> {t('pomodoro.min')}</span>
            </p>
          </div>
        </div>

        {/* Saving indicator */}
        {isSaving && (
          <div className="mt-4 text-center text-sm text-gray-500">
            <span className="material-symbols-outlined animate-spin text-sm mr-1">progress_activity</span>
            {t('pomodoro.savingSession')}
          </div>
        )}

        {/* Tips */}
        <div className="mt-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🍅</span>
            <div>
              <h4 className="font-medium text-amber-800 dark:text-amber-200">{t('pomodoro.pomodoroTechnique')}</h4>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                {t('pomodoro.pomodoroTip', { focus: String(focusDuration), shortBreak: String(shortBreakDuration), sessions: String(sessionsUntilLongBreak), longBreak: String(longBreakDuration) })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[430px] bg-white dark:bg-gray-800 rounded-t-3xl p-6 pb-8"
            >
              <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-6" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('pomodoro.timerSettings')}</h2>

              <div className="space-y-4">
                {/* Focus Duration */}
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">{t('pomodoro.focusDuration')}</label>
                  <div className="flex items-center gap-3 mt-2">
                    {[15, 25, 30, 45, 60].map((min) => (
                      <button
                        key={min}
                        onClick={() => setFocusDuration(min)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                          focusDuration === min
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {min}m
                      </button>
                    ))}
                  </div>
                </div>

                {/* Short Break */}
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">{t('pomodoro.shortBreak')}</label>
                  <div className="flex items-center gap-3 mt-2">
                    {[3, 5, 10].map((min) => (
                      <button
                        key={min}
                        onClick={() => setShortBreakDuration(min)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                          shortBreakDuration === min
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {min}m
                      </button>
                    ))}
                  </div>
                </div>

                {/* Long Break */}
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">{t('pomodoro.longBreak')}</label>
                  <div className="flex items-center gap-3 mt-2">
                    {[10, 15, 20, 30].map((min) => (
                      <button
                        key={min}
                        onClick={() => setLongBreakDuration(min)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                          longBreakDuration === min
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {min}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowSettings(false)}
                className="w-full mt-6 py-3 rounded-xl bg-primary text-white font-medium"
              >
                {t('common.done')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Course Selector Modal */}
      <AnimatePresence>
        {showCourseSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50"
            onClick={() => setShowCourseSelector(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[430px] max-h-[80vh] bg-white dark:bg-gray-800 rounded-t-3xl overflow-hidden"
            >
              <div className="sticky top-0 p-6 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 z-10">
                <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('pomodoro.selectCourseTitle')}</h2>
              </div>

              <div className="overflow-y-auto max-h-[60vh] p-4 pb-8">
                {courses.filter((c) => c.inLibrary).length === 0 ? (
                  <div className="text-center py-8">
                    <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">
                      menu_book
                    </span>
                    <p className="text-gray-500">{t('pomodoro.noCoursesInLibrary')}</p>
                    <button
                      onClick={() => {
                        setShowCourseSelector(false);
                        navigate('/courses');
                      }}
                      className="mt-3 text-primary font-medium"
                    >
                      {t('pomodoro.browseCourses')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {courses
                      .filter((c) => c.inLibrary)
                      .map((course) => (
                        <button
                          key={course.id}
                          onClick={() => {
                            selectCourse(course.id);
                            setShowCourseSelector(false);
                          }}
                          className={`w-full p-4 rounded-xl flex items-center gap-3 text-left transition-colors ${
                            selectedCourseId === course.id
                              ? 'bg-primary/10 border-2 border-primary'
                              : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary">menu_book</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">{course.title}</p>
                            {course.category && (
                              <p className="text-xs text-gray-500">{course.category.code}</p>
                            )}
                          </div>
                          {selectedCourseId === course.id && (
                            <span className="material-symbols-outlined text-primary">check_circle</span>
                          )}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Pomodoro;
