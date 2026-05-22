import { useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTelegram } from '../../lib/telegram/index';
import { useMatchStore } from '../../lib/stores/matchStore';
import { useCoursesStore } from '../../lib/stores';
import LibraryGuard from '../../components/ui/LibraryGuard';
import { useTranslation } from '../../lib/i18n';

const Match = () => {
  const navigate = useNavigate();
  const { unitId } = useParams<{ unitId: string }>();
  const { haptic } = useTelegram();
  const { t } = useTranslation();

  const {
    tiles,
    selectedTileId,
    matchedPairs,
    totalPairs,
    elapsedTime,
    isTimerRunning,
    isGameComplete,
    isGameStarted,
    initializeGame,
    selectTile,
    updateTimer,
    resetGame,
    resetSession,
    getProgress,
    getStats,
  } = useMatchStore();

  const {
    moduleCards: cards,
    isLoadingCards,
    cardsError,
    fetchModuleCards,
  } = useCoursesStore();

  // Fetch cards on mount and clean up on unmount
  useEffect(() => {
    if (unitId) {
      fetchModuleCards(parseInt(unitId, 10));
    }

    // Clean up on unmount
    return () => {
      resetSession();
    };
  }, [unitId, fetchModuleCards, resetSession]);

  // Initialize game when cards are loaded (always initialize fresh)
  useEffect(() => {
    if (cards.length > 0) {
      initializeGame(cards);
    }
  }, [cards, initializeGame]);

  // Timer update interval
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isTimerRunning) {
      interval = setInterval(() => {
        updateTimer();
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, updateTimer]);

  const handleTileClick = useCallback(
    (tileId: string) => {
      const tile = tiles.find(t => t.id === tileId);
      if (tile?.isMatched) return;

      haptic.selection();
      selectTile(tileId);
    },
    [tiles, haptic, selectTile]
  );

  const handlePlayAgain = useCallback(() => {
    haptic.impact('medium');
    resetGame();
  }, [haptic, resetGame]);

  const progress = getProgress();
  const stats = getStats();

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (isLoadingCards) {
    return (
      <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto bg-white dark:bg-background-dark">
        <div className="flex items-center p-4 justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-12 h-12 flex items-center justify-center text-gray-900 dark:text-white"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <h2 className="text-gray-900 dark:text-white text-lg font-bold flex-1 text-center pr-12">
            {t('common.loading')}
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-5xl text-primary animate-spin mb-4">
              progress_activity
            </span>
            <p className="text-gray-500">{t('match.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (cardsError || cards.length < 2) {
    return (
      <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto bg-white dark:bg-background-dark">
        <div className="flex items-center p-4 justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-12 h-12 flex items-center justify-center text-gray-900 dark:text-white"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <span className="material-symbols-outlined text-5xl text-red-400 mb-3">
              error_outline
            </span>
            <p className="text-gray-900 dark:text-white font-bold mb-2">
              {cardsError || t('match.notEnoughCards')}
            </p>
            <p className="text-gray-500 mb-4">
              {t('match.minCards')}
            </p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-primary text-white rounded-xl font-medium"
            >
              {t('common.goBack')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game Complete Screen
  if (isGameComplete) {
    return (
      <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto bg-white dark:bg-background-dark">
        {/* Header */}
        <div className="flex items-center p-4 justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-12 h-12 flex items-center justify-center text-gray-900 dark:text-white"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <h2 className="text-gray-900 dark:text-white text-lg font-bold flex-1 text-center pr-12">
            {t('match.gameComplete')}
          </h2>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="w-32 h-32 rounded-full flex items-center justify-center mb-6 bg-blue-100 dark:bg-blue-900/30"
          >
            <span
              className="material-symbols-outlined text-6xl text-blue-500"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              emoji_events
            </span>
          </motion.div>

          <h1 className="text-gray-900 dark:text-white text-2xl font-bold mb-2">
            {t('match.wellDone')}
          </h1>
          <p className="text-gray-500 text-center mb-8">
            {t('match.matchedAll')}
          </p>

          {/* Stats */}
          <div className="w-full max-w-xs grid grid-cols-3 gap-3 mb-8">
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-center">
              <span className="material-symbols-outlined text-2xl text-blue-500 mb-1">timer</span>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {formatTime(stats.time)}
              </p>
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70">{t('match.time')}</p>
            </div>
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 text-center">
              <span className="material-symbols-outlined text-2xl text-green-500 mb-1">touch_app</span>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats.attempts}</p>
              <p className="text-xs text-green-600/70 dark:text-green-400/70">{t('match.moves')}</p>
            </div>
            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-center">
              <span className="material-symbols-outlined text-2xl text-purple-500 mb-1">percent</span>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{stats.accuracy}%</p>
              <p className="text-xs text-purple-600/70 dark:text-purple-400/70">{t('match.accuracy')}</p>
            </div>
          </div>

          <div className="w-full max-w-xs space-y-3">
            <button
              onClick={handlePlayAgain}
              className="w-full py-4 rounded-xl bg-blue-500 text-white font-bold flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">replay</span>
              {t('match.playAgain')}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full py-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold"
            >
              {t('match.backToUnit')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game Screen
  return (
    <div className="relative flex min-h-screen w-full max-w-[430px] mx-auto flex-col bg-white dark:bg-background-dark overflow-x-hidden">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-background-dark/90 backdrop-blur-md">
        <div className="flex items-center p-4 pb-2 justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-12 h-12 flex items-center justify-center text-gray-900 dark:text-white"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <h2 className="text-gray-900 dark:text-white text-lg font-bold flex-1 text-center">
            {t('match.matchGame')}
          </h2>
          <button
            onClick={handlePlayAgain}
            className="w-12 h-12 flex items-center justify-center text-gray-500"
          >
            <span className="material-symbols-outlined">replay</span>
          </button>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center justify-between px-4 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500">timer</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {formatTime(elapsedTime)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-green-500">extension</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {matchedPairs}/{totalPairs}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-4 pb-3">
          <div className="rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <motion.div
              className="h-2 rounded-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress.percentage}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Game Instructions */}
      {!isGameStarted && (
        <div className="px-4 py-3 mx-4 mb-4 rounded-xl bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
            <span className="material-symbols-outlined text-lg">info</span>
            <p className="text-sm font-medium">{t('match.tapToMatch')}</p>
          </div>
        </div>
      )}

      {/* Tiles Grid */}
      <div className="flex-1 px-4 pb-8">
        <div className="grid grid-cols-3 gap-3">
          <AnimatePresence>
            {tiles.map((tile) => {
              const isSelected = tile.id === selectedTileId || tile.isSelected;

              let bgColor = 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
              let textColor = 'text-gray-900 dark:text-white';

              if (tile.isMatched) {
                bgColor = 'bg-green-100 dark:bg-green-900/30 border-green-500';
                textColor = 'text-green-700 dark:text-green-400';
              } else if (tile.isWrong) {
                bgColor = 'bg-red-100 dark:bg-red-900/30 border-red-500';
                textColor = 'text-red-700 dark:text-red-400';
              } else if (isSelected) {
                bgColor = 'bg-blue-100 dark:bg-blue-900/30 border-blue-500';
                textColor = 'text-blue-700 dark:text-blue-400';
              }

              return (
                <motion.button
                  key={tile.id}
                  onClick={() => handleTileClick(tile.id)}
                  disabled={tile.isMatched}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: tile.isWrong ? [1, 1.05, 0.95, 1] : 1,
                    opacity: tile.isMatched ? 0.6 : 1,
                  }}
                  whileTap={{ scale: tile.isMatched ? 1 : 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`relative aspect-square rounded-xl border-2 ${bgColor} flex items-center justify-center p-2 text-center transition-colors ${
                    tile.isMatched ? 'cursor-default' : 'cursor-pointer active:scale-95'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center">
                    {tile.type === 'term' && (
                      <span className="material-symbols-outlined text-xs text-gray-400 mb-1">
                        translate
                      </span>
                    )}
                    <p className={`text-sm font-medium leading-tight ${textColor}`}>
                      {tile.value}
                    </p>
                    {tile.isMatched && (
                      <span className="material-symbols-outlined text-green-500 text-lg mt-1">
                        check_circle
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const MatchWithGuard = () => (
  <LibraryGuard>
    <Match />
  </LibraryGuard>
);

export default MatchWithGuard;
