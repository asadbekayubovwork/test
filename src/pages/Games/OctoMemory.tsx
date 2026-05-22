import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '../../components/ui';
import { useTranslation } from '../../lib/i18n';
import { useGamesStore } from '../../lib/stores/gamesStore';

const OctoMemory = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    memory,
    memoryBestMoves,
    initOctoMemory,
    flipTile,
  } = useGamesStore();

  useEffect(() => {
    initOctoMemory();
  }, [initOctoMemory]);

  const isNewBest = memory.isComplete && (memoryBestMoves === null || memory.moves <= memoryBestMoves);

  // Complete screen
  if (memory.isComplete) {
    return (
      <div className="flex-1 flex flex-col pb-20 pt-12">
        <Header title={t('games.octoMemory')} showBack />
        <div className="flex-1 flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center w-full max-w-sm"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-5">
              <span className="material-symbols-outlined text-emerald-500 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('games.memoryComplete')}
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
                <p className="text-3xl font-bold text-primary">{memory.moves}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('games.moves')}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="text-3xl font-bold text-emerald-500">{memoryBestMoves ?? '-'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('games.bestMoves')}</p>
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
                onClick={() => initOctoMemory()}
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

  return (
    <div className="flex-1 flex flex-col pb-20 pt-12">
      {/* Header with stats */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between p-4 max-w-[430px] mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10"
          >
            <span className="material-symbols-outlined text-gray-800 dark:text-white">arrow_back</span>
          </button>
          <span className="font-bold text-gray-900 dark:text-white">{t('games.octoMemory')}</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm">
              <span className="material-symbols-outlined text-primary text-base">swap_horiz</span>
              <span className="font-bold text-gray-700 dark:text-gray-300">{memory.moves}</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className="material-symbols-outlined text-emerald-500 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              <span className="font-bold text-gray-700 dark:text-gray-300">
                {memory.matchedPairs}/{memory.totalPairs}
              </span>
            </div>
          </div>
        </div>
        {/* Progress */}
        <div className="h-1 bg-gray-100 dark:bg-gray-800">
          <motion.div
            className="h-full bg-emerald-500"
            animate={{ width: `${memory.totalPairs > 0 ? (memory.matchedPairs / memory.totalPairs) * 100 : 0}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Instruction */}
      <div className="px-4 pt-4 pb-2">
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          {t('games.tapToFlip')}
        </p>
      </div>

      {/* Grid */}
      <div className="flex-1 px-3 pb-4">
        <div className="grid grid-cols-4 gap-2 max-w-[400px] mx-auto">
          {memory.tiles.map((tile, idx) => {
            const isRevealed = tile.isFlipped || tile.isMatched;

            return (
              <motion.button
                key={tile.id}
                whileTap={!isRevealed && !memory.isLocked ? { scale: 0.93 } : undefined}
                onClick={() => flipTile(idx)}
                disabled={isRevealed || memory.isLocked}
                className="relative w-full aspect-square"
                initial={{ rotateY: 0 }}
                animate={{ rotateY: isRevealed ? 180 : 0 }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
                style={{ perspective: 600 }}
              >
                {/* Back face (hidden) */}
                <div
                  className={`absolute inset-0 rounded-xl flex items-center justify-center backface-hidden ${
                    tile.isMatched
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-300 dark:border-emerald-700'
                      : 'bg-primary/10 dark:bg-primary/20 border-2 border-primary/20 dark:border-primary/30'
                  }`}
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <span className={`text-xs font-semibold text-center px-1 leading-tight ${
                    tile.isMatched ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-800 dark:text-gray-200'
                  }`}>
                    {tile.value}
                  </span>
                  {tile.isMatched && (
                    <span className="absolute top-1 right-1 material-symbols-outlined text-emerald-500 text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check
                    </span>
                  )}
                </div>

                {/* Front face (question mark) */}
                <div
                  className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center border-2 border-primary/30"
                  style={{
                    backfaceVisibility: 'hidden',
                  }}
                >
                  <span className="material-symbols-outlined text-white/80 text-2xl">
                    question_mark
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OctoMemory;
