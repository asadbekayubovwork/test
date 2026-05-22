import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../lib/i18n';
import { globalRankings, countryRankings, regionRankings } from '../../lib/data';
import { useUserStore } from '../../lib/stores';
import type { RankingEntry, RankingType, RankingPeriod } from '../../types';

const Rankings = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<RankingType>('global');
  const [activePeriod, setActivePeriod] = useState<RankingPeriod>('weekly');
  const user = useUserStore((state) => state.user);

  const tabs: { id: RankingType; label: string }[] = [
    { id: 'global', label: t('rankings.global') },
    { id: 'country', label: t('rankings.country') },
    { id: 'region', label: t('rankings.region') },
  ];

  const periods: { id: RankingPeriod; label: string }[] = [
    { id: 'all_time', label: t('rankings.allTime') },
    { id: 'weekly', label: t('rankings.weekly') },
    { id: 'monthly', label: t('rankings.monthly') },
  ];

  const getRankings = () => {
    switch (activeTab) {
      case 'global':
        return globalRankings;
      case 'country':
        return countryRankings;
      case 'region':
        return regionRankings;
      default:
        return globalRankings;
    }
  };

  const rankings = getRankings();
  const topThree = rankings.slice(0, 3);
  const restRankings = rankings.slice(3);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const getRankChangeDisplay = (change: number | undefined) => {
    if (change === undefined || change === 0) {
      return (
        <div className="flex items-center gap-1 text-gray-400">
          <span className="material-symbols-outlined text-sm">remove</span>
          <span className="text-xs font-bold">0</span>
        </div>
      );
    }
    if (change > 0) {
      return (
        <div className="flex items-center gap-1 text-green-500">
          <span className="material-symbols-outlined text-sm">arrow_upward</span>
          <span className="text-xs font-bold">{change}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-red-500">
        <span className="material-symbols-outlined text-sm">arrow_downward</span>
        <span className="text-xs font-bold">{Math.abs(change)}</span>
      </div>
    );
  };

  const RankingCard = ({ entry }: { entry: RankingEntry }) => (
    <motion.div
      variants={itemVariants}
      className="flex items-center gap-3 p-3 bg-white dark:bg-[#1a2b34] rounded-xl shadow-sm"
    >
      <p className="w-6 text-center text-gray-500 dark:text-gray-400 font-bold">
        {entry.position}
      </p>
      <div className="relative">
        <div
          className="w-10 h-10 rounded-full bg-cover bg-center"
          style={{ backgroundImage: `url("${entry.avatar}")` }}
        />
        {entry.countryFlag && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-[10px] border border-white">
            {entry.countryFlag}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{entry.name}</p>
        <p className="text-[10px] text-gray-500 dark:text-gray-400">{t('rankings.level', { level: entry.level })}</p>
      </div>
      {getRankChangeDisplay(entry.rankChange)}
      <p className="text-sm font-bold text-gray-900 dark:text-white">
        {entry.ratingPoints.toLocaleString()}
      </p>
    </motion.div>
  );

  // Podium colors
  const podiumColors = {
    gold: { border: '#FFD700', bg: 'bg-[#FFD700]/20 dark:bg-[#FFD700]/10' },
    silver: { border: '#C0C0C0', bg: 'bg-[#C0C0C0]/20 dark:bg-[#C0C0C0]/10' },
    bronze: { border: '#CD7F32', bg: 'bg-[#CD7F32]/20 dark:bg-[#CD7F32]/10' },
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto overflow-x-hidden bg-gray-50 dark:bg-background-dark">
      {/* Header */}
      <div className="sticky top-12 z-50 bg-gray-50 dark:bg-background-dark">
        <div className="flex items-center justify-center p-4 pb-2">
          <h1 className="text-gray-900 dark:text-white text-lg font-bold">{t('rankings.title')}</h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-4 justify-between">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center border-b-[3px] pb-3 pt-4 flex-1 transition-colors ${
                activeTab === tab.id
                  ? 'border-b-primary text-primary'
                  : 'border-b-transparent text-gray-500'
              }`}
            >
              <p className="text-sm font-bold">{tab.label}</p>
            </button>
          ))}
        </div>

        {/* Period Selector */}
        <div className="flex px-4 py-3">
          <div className="flex h-10 flex-1 items-center justify-center rounded-xl bg-gray-200 dark:bg-[#1a2b34] p-1">
            {periods.map((period) => (
              <label
                key={period.id}
                className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 text-sm font-medium transition-all ${
                  activePeriod === period.id
                    ? 'bg-white dark:bg-[#2d3a43] shadow-sm text-gray-900 dark:text-white'
                    : 'text-gray-500'
                }`}
              >
                <span className="truncate">{period.label}</span>
                <input
                  className="invisible w-0"
                  name="period"
                  type="radio"
                  value={period.id}
                  checked={activePeriod === period.id}
                  onChange={() => setActivePeriod(period.id)}
                />
              </label>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 pb-32"
      >
        {/* Podium Section */}
        <motion.div
          variants={itemVariants}
          className="flex items-end justify-center gap-2 px-4 py-8 mb-4"
        >
          {/* 2nd Place */}
          {topThree[1] && (
            <div className="flex flex-col items-center flex-1">
              <div className="relative mb-2">
                <div
                  className="w-16 h-16 rounded-full border-4 overflow-hidden bg-cover bg-center"
                  style={{
                    borderColor: podiumColors.silver.border,
                    backgroundImage: `url("${topThree[1].avatar}")`,
                  }}
                />
                <div
                  className="absolute -bottom-1 -right-1 text-white text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-gray-50 dark:border-background-dark"
                  style={{ backgroundColor: podiumColors.silver.border }}
                >
                  2
                </div>
              </div>
              <p className="text-sm font-bold truncate w-full text-center text-gray-900 dark:text-white">
                {topThree[1].name.split(' ')[0]}
              </p>
              <p className="text-xs text-gray-500">{topThree[1].ratingPoints.toLocaleString()} pts</p>
              <div className={`w-full h-16 ${podiumColors.silver.bg} mt-2 rounded-t-lg`} />
            </div>
          )}

          {/* 1st Place */}
          {topThree[0] && (
            <div className="flex flex-col items-center flex-1">
              <span
                className="material-symbols-outlined text-[#FFD700] mb-1"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                workspace_premium
              </span>
              <div className="relative mb-2">
                <div
                  className="w-20 h-20 rounded-full border-4 overflow-hidden bg-cover bg-center"
                  style={{
                    borderColor: podiumColors.gold.border,
                    backgroundImage: `url("${topThree[0].avatar}")`,
                  }}
                />
                <div
                  className="absolute -bottom-1 -right-1 text-black text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center border-2 border-gray-50 dark:border-background-dark"
                  style={{ backgroundColor: podiumColors.gold.border }}
                >
                  1
                </div>
              </div>
              <p className="text-base font-bold truncate w-full text-center text-gray-900 dark:text-white">
                {topThree[0].name.split(' ')[0]}
              </p>
              <p className="text-sm text-primary font-bold">
                {topThree[0].ratingPoints.toLocaleString()} pts
              </p>
              <div className={`w-full h-24 ${podiumColors.gold.bg} mt-2 rounded-t-lg`} />
            </div>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <div className="flex flex-col items-center flex-1">
              <div className="relative mb-2">
                <div
                  className="w-14 h-14 rounded-full border-4 overflow-hidden bg-cover bg-center"
                  style={{
                    borderColor: podiumColors.bronze.border,
                    backgroundImage: `url("${topThree[2].avatar}")`,
                  }}
                />
                <div
                  className="absolute -bottom-1 -right-1 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-gray-50 dark:border-background-dark"
                  style={{ backgroundColor: podiumColors.bronze.border }}
                >
                  3
                </div>
              </div>
              <p className="text-sm font-bold truncate w-full text-center text-gray-900 dark:text-white">
                {topThree[2].name.split(' ')[0]}
              </p>
              <p className="text-xs text-gray-500">{topThree[2].ratingPoints.toLocaleString()} pts</p>
              <div className={`w-full h-12 ${podiumColors.bronze.bg} mt-2 rounded-t-lg`} />
            </div>
          )}
        </motion.div>

        {/* Rest of Rankings */}
        <div className="flex flex-col px-4 gap-2">
          {restRankings.map((entry) => (
            <RankingCard key={entry.userId} entry={entry} />
          ))}
        </div>
      </motion.div>

      {/* Sticky Current User Rank */}
      {user && (
        <div className="fixed bottom-20 left-0 right-0 z-30 px-4 max-w-[430px] mx-auto">
          <div className="flex items-center gap-3 p-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/30">
            <p className="w-6 text-center font-bold">{user.rankPosition}</p>
            <div className="relative">
              <div
                className="w-10 h-10 rounded-full border-2 border-white/40 bg-cover bg-center"
                style={{ backgroundImage: `url("${user.avatar}")` }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">{t('rankings.you', { name: user.name.split(' ')[0] })}</p>
              <p className="text-[10px] opacity-80">{t('rankings.level', { level: user.level })}</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">arrow_upward</span>
              <span className="text-xs font-bold">2</span>
            </div>
            <p className="text-sm font-bold">{user.ratingPoints.toLocaleString()} pts</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rankings;
