import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header, Card } from '../../components/ui';
import { useTranslation } from '../../lib/i18n';
import { useGamesStore } from '../../lib/stores/gamesStore';
import { useSubscriptionStore } from '../../lib/stores';
import {
  CLOSED_GAMES_FREE,
  COMPLEX_GAMES_FREE,
} from '../../lib/constants/freeTierLimits';

const gameCards = [
  {
    id: 'daily-challenge',
    titleKey: 'games.dailyChallenge' as const,
    descKey: 'games.dailyChallengeDesc' as const,
    icon: 'today',
    color: 'from-amber-400 to-orange-500',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
    path: '/games/daily-challenge',
  },
  {
    id: 'word-rush',
    titleKey: 'games.wordRush' as const,
    descKey: 'games.wordRushDesc' as const,
    icon: 'bolt',
    color: 'from-blue-400 to-indigo-500',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-600',
    path: '/games/word-rush',
  },
  {
    id: 'octo-memory',
    titleKey: 'games.octoMemory' as const,
    descKey: 'games.octoMemoryDesc' as const,
    icon: 'grid_view',
    color: 'from-emerald-400 to-teal-500',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    path: '/games/octo-memory',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Games = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { dailyStreak, rushBestScore, memoryBestMoves, totalGamesPlayed } =
    useGamesStore();
  const isPremium = useSubscriptionStore((s) => s.isPremium());

  const isGameLocked = (gameId: string): boolean => {
    if (isPremium) return false;
    return (
      CLOSED_GAMES_FREE.includes(gameId) ||
      COMPLEX_GAMES_FREE.includes(gameId)
    );
  };

  const getStatForGame = (id: string): string | null => {
    if (id === 'daily-challenge' && dailyStreak > 0) return t('games.dayStreak', { count: dailyStreak });
    if (id === 'word-rush' && rushBestScore > 0) return `${t('games.bestScore')}: ${rushBestScore}`;
    if (id === 'octo-memory' && memoryBestMoves !== null) return `${t('games.bestMoves')}: ${memoryBestMoves}`;
    return null;
  };

  return (
    <div className="flex-1 flex flex-col pb-20 pt-12">
      <Header title={t('games.title')} showBack />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 px-4 py-4 overflow-y-auto"
      >
        {gameCards.map((game) => {
          const stat = getStatForGame(game.id);
          const locked = isGameLocked(game.id);
          return (
            <motion.div key={game.id} variants={itemVariants}>
              <Card
                variant="pressable"
                className={`mb-4 ${locked ? 'opacity-70' : ''}`}
                onClick={() =>
                  locked ? navigate('/subscription') : navigate(game.path)
                }
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center shadow-md relative`}
                  >
                    <span className="material-symbols-outlined text-white text-2xl">
                      {game.icon}
                    </span>
                    {locked && (
                      <span
                        className="absolute -top-1 -right-1 material-symbols-outlined text-amber-500 text-base bg-white dark:bg-background-dark rounded-full"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        lock
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white text-base">
                      {t(game.titleKey)}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {locked ? t('paywall.proOnly') : t(game.descKey)}
                    </p>
                    {stat && !locked && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span
                          className={`material-symbols-outlined text-sm ${game.textColor}`}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          emoji_events
                        </span>
                        <span className={`text-xs font-semibold ${game.textColor}`}>
                          {stat}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="material-symbols-outlined text-gray-400 dark:text-gray-500">
                    {locked ? 'workspace_premium' : 'chevron_right'}
                  </span>
                </div>
              </Card>
            </motion.div>
          );
        })}

        {/* Stats summary */}
        <motion.div variants={itemVariants} className="mt-4">
          <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 p-5">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
              {t('games.yourStats')}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalGamesPlayed}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('games.totalPlayed')}
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-500">
                  {dailyStreak}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('games.streak')}
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-500">
                  {rushBestScore}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('games.bestScore')}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Games;
