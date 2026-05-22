import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '../../components/ui';
import { useTranslation } from '../../lib/i18n';
import { useGamesStore } from '../../lib/stores/gamesStore';

const DailyChallenge = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    daily,
    dailyStreak,
    dailyBestScore,
    initDailyChallenge,
    answerDaily,
    nextDailyQuestion,
  } = useGamesStore();

  useEffect(() => {
    initDailyChallenge();
  }, [initDailyChallenge]);

  const q = daily.questions[daily.currentIndex];

  // Already played today
  if (daily.alreadyPlayedToday) {
    return (
      <div className="flex-1 flex flex-col pb-20 pt-12">
        <Header title={t('games.dailyChallenge')} showBack />
        <div className="flex-1 flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-5">
              <span className="material-symbols-outlined text-amber-500 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('games.alreadyPlayed')}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              {t('games.alreadyPlayedDesc')}
            </p>
            {dailyStreak > 0 && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 mt-4">
                <span className="material-symbols-outlined text-amber-500 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                  local_fire_department
                </span>
                <span className="text-amber-600 dark:text-amber-400 font-bold text-sm">
                  {t('games.dayStreak', { count: dailyStreak })}
                </span>
              </div>
            )}
            <div className="mt-6">
              <button
                onClick={() => navigate('/games')}
                className="px-6 py-3 bg-primary text-white rounded-xl font-semibold"
              >
                {t('games.backToGames')}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Complete screen
  if (daily.isComplete) {
    const isNewBest = daily.score > dailyBestScore;
    return (
      <div className="flex-1 flex flex-col pb-20 pt-12">
        <Header title={t('games.dailyChallenge')} showBack />
        <div className="flex-1 flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center w-full max-w-sm"
          >
            <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-5">
              <span className="material-symbols-outlined text-amber-500 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                emoji_events
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('games.dailyComplete')}
            </h2>
            {isNewBest && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold mb-3"
              >
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                {t('games.newBest')}
              </motion.div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-6 mb-6">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="text-3xl font-bold text-primary">{daily.score}/5</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('games.score')}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="text-3xl font-bold text-amber-500">{dailyStreak}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('games.streak')}</p>
              </div>
            </div>

            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              {t('games.playAgainTomorrow')}
            </p>

            <button
              onClick={() => navigate('/games')}
              className="w-full py-3 bg-primary text-white rounded-xl font-bold"
            >
              {t('games.backToGames')}
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!q) return null;

  const progress = ((daily.currentIndex) / daily.questions.length) * 100;

  return (
    <div className="flex-1 flex flex-col pb-20 pt-12">
      <Header
        title={t('games.dailyChallenge')}
        showBack
        rightAction={
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            {t('games.questionOf', { current: daily.currentIndex + 1, total: daily.questions.length })}
          </span>
        }
      />

      <div className="px-4 pt-2">
        <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={daily.currentIndex}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            {/* Word display */}
            <div className="text-center mb-8">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {t('games.todaysWords')}
              </p>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {q.word.word}
              </h2>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                {q.word.transcription}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {q.options.map((option, idx) => {
                let btnClass = 'bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white';
                if (daily.answerStatus !== 'idle' && daily.selectedAnswer !== null) {
                  if (idx === q.correctIndex) {
                    btnClass = 'bg-green-50 dark:bg-green-900/30 border-2 border-green-400 text-green-700 dark:text-green-400';
                  } else if (idx === daily.selectedAnswer && daily.answerStatus === 'wrong') {
                    btnClass = 'bg-red-50 dark:bg-red-900/30 border-2 border-red-400 text-red-700 dark:text-red-400';
                  } else {
                    btnClass = 'bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 text-gray-400 dark:text-gray-500';
                  }
                }

                return (
                  <motion.button
                    key={idx}
                    whileTap={daily.answerStatus === 'idle' ? { scale: 0.98 } : undefined}
                    onClick={() => answerDaily(idx)}
                    disabled={daily.answerStatus !== 'idle'}
                    className={`w-full p-4 rounded-xl font-medium text-left transition-colors ${btnClass}`}
                  >
                    <span className="text-sm font-bold opacity-50 mr-2">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    {option}
                  </motion.button>
                );
              })}
            </div>

            {/* Feedback + Next */}
            <AnimatePresence>
              {daily.answerStatus !== 'idle' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-6 text-center"
                >
                  <p className={`text-lg font-bold mb-4 ${daily.answerStatus === 'correct' ? 'text-green-600' : 'text-red-500'}`}>
                    {daily.answerStatus === 'correct' ? t('games.correct') : t('games.wrong')}
                  </p>
                  <button
                    onClick={nextDailyQuestion}
                    className="px-8 py-3 bg-primary text-white rounded-xl font-bold"
                  >
                    {daily.currentIndex < daily.questions.length - 1 ? t('common.continue') : t('common.done')}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DailyChallenge;
