import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '../../components/ui';
import { useTranslation } from '../../lib/i18n';
import { useGamesStore } from '../../lib/stores/gamesStore';

const TOTAL_TIME = 60;

const WordRush = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    rush,
    rushBestScore,
    initWordRush,
    startWordRush,
    answerRush,
    tickRush,
  } = useGamesStore();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    initWordRush();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [initWordRush]);

  useEffect(() => {
    if (rush.isPlaying && !timerRef.current) {
      timerRef.current = setInterval(() => {
        tickRush();
      }, 1000);
    }
    if (!rush.isPlaying && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [rush.isPlaying, tickRush]);

  const q = rush.questions[rush.currentIndex];
  const timeProgress = (rush.timeRemaining / TOTAL_TIME) * 100;
  const isNewBest = rush.isComplete && rush.score > rushBestScore;

  // Pre-game start screen
  if (!rush.isPlaying && !rush.isComplete) {
    return (
      <div className="flex-1 flex flex-col pb-20 pt-12">
        <Header title={t('games.wordRush')} showBack />
        <div className="flex-1 flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="material-symbols-outlined text-white text-5xl">bolt</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('games.rushReady')}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto">
              {t('games.rushDesc')}
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={startWordRush}
              className="px-12 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold text-lg shadow-lg"
            >
              {t('games.rushStart')}
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Complete screen
  if (rush.isComplete) {
    const accuracy = rush.totalAnswered > 0
      ? Math.round((rush.correctAnswers / rush.totalAnswered) * 100)
      : 0;

    return (
      <div className="flex-1 flex flex-col pb-20 pt-12">
        <Header title={t('games.wordRush')} showBack />
        <div className="flex-1 flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center w-full max-w-sm"
          >
            <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-5">
              <span className="material-symbols-outlined text-blue-500 text-4xl">bolt</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('games.rushComplete')}
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

            <div className="grid grid-cols-3 gap-3 mt-6 mb-6">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="text-3xl font-bold text-primary">{rush.score}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('games.score')}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="text-3xl font-bold text-green-500">{accuracy}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('games.accuracy')}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="text-3xl font-bold text-blue-500">{rush.totalAnswered}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('games.answered')}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/games')}
                className="flex-1 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-600 dark:text-gray-300"
              >
                {t('games.backToGames')}
              </button>
              <button
                onClick={() => initWordRush()}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-bold"
              >
                {t('games.playAgain')}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!q) return null;

  const timeColor = rush.timeRemaining <= 10 ? 'bg-red-500' : rush.timeRemaining <= 20 ? 'bg-amber-500' : 'bg-blue-500';

  return (
    <div className="flex-1 flex flex-col pb-20 pt-12">
      {/* Header with timer */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between p-4 max-w-[430px] mx-auto">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">bolt</span>
            <span className="font-bold text-gray-900 dark:text-white">{t('games.wordRush')}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                stars
              </span>
              <span className="font-bold text-primary text-lg">{rush.score}</span>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${rush.timeRemaining <= 10 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
              <span className={`material-symbols-outlined text-lg ${rush.timeRemaining <= 10 ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}>
                timer
              </span>
              <span className={`font-bold text-lg tabular-nums ${rush.timeRemaining <= 10 ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                {rush.timeRemaining}
              </span>
            </div>
          </div>
        </div>
        {/* Timer bar */}
        <div className="h-1 bg-gray-100 dark:bg-gray-800">
          <motion.div
            className={`h-full ${timeColor}`}
            animate={{ width: `${timeProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={rush.currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            {/* Word */}
            <div className="text-center mb-8">
              <div className="inline-block px-8 py-5 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {q.word.word}
                </h2>
              </div>
            </div>

            {/* Options - 2x2 grid */}
            <div className="grid grid-cols-2 gap-3">
              {q.options.map((option, idx) => {
                let btnClass = 'bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white active:scale-[0.97]';
                if (rush.answerStatus !== 'idle' && rush.selectedAnswer !== null) {
                  if (idx === q.correctIndex) {
                    btnClass = 'bg-green-50 dark:bg-green-900/30 border-2 border-green-400 text-green-700 dark:text-green-400';
                  } else if (idx === rush.selectedAnswer && rush.answerStatus === 'wrong') {
                    btnClass = 'bg-red-50 dark:bg-red-900/30 border-2 border-red-400 text-red-700 dark:text-red-400';
                  } else {
                    btnClass = 'bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-100 dark:border-gray-700 text-gray-300 dark:text-gray-600';
                  }
                }

                return (
                  <motion.button
                    key={idx}
                    whileTap={rush.answerStatus === 'idle' ? { scale: 0.95 } : undefined}
                    onClick={() => answerRush(idx)}
                    disabled={rush.answerStatus !== 'idle'}
                    className={`p-4 rounded-xl font-medium text-sm text-center transition-colors ${btnClass}`}
                  >
                    {option}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WordRush;
