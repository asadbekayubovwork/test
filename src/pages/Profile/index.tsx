import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '../../lib/i18n';
import {
  useUserStore,
  useProfileStatsStore,
  useSubscriptionStore,
} from '../../lib/stores';
import { getAchievementProgress, allAchievements } from '../../lib/data';
import { useTelegram } from '../../lib/telegram/index';
import { logout } from '../../lib/api/auth';
import { isAuthenticated } from '../../lib/api/client';
import { updateMyUsername, isValidAccountUsername } from '../../lib/api/account';

const Profile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const updateUser = useUserStore((state) => state.updateUser);
  const refreshAccount = useUserStore((state) => state.refreshAccount);
  const achievementProgress = getAchievementProgress();
  const { user: telegramUser, haptic } = useTelegram();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [usernameDraft, setUsernameDraft] = useState('');
  const [usernameSaving, setUsernameSaving] = useState(false);
  const [usernameFieldError, setUsernameFieldError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLoggedIn = isAuthenticated();
  const subscription = useSubscriptionStore((s) => s.subscription);
  const isPremium = useSubscriptionStore((s) => s.isPremium());

  // Profile stats from real API
  const {
    totalTimeMinutes,
    visitStreak,
    quizProgress,
    isLoading: isLoadingStats,
    fetchProfileStats,
  } = useProfileStatsStore();

  useEffect(() => {
    if (isLoggedIn) {
      fetchProfileStats();
      refreshAccount();
    }
  }, [isLoggedIn, fetchProfileStats, refreshAccount]);

  // Get display name - prefer Telegram user name, fallback to local user
  const displayName = telegramUser
    ? `${telegramUser.first_name}${telegramUser.last_name ? ' ' + telegramUser.last_name : ''}`
    : user?.name || 'User';

  // Custom avatar takes priority over Telegram photo; fallback to generated avatar
  const displayAvatar = user?.avatar || telegramUser?.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`;

  const handleAvatarClick = () => {
    haptic.impact('light');
    fileInputRef.current?.click();
  };

  const openUsernameModal = () => {
    haptic.impact('light');
    setUsernameDraft(user?.name?.trim() || '');
    setUsernameFieldError(null);
    setShowUsernameModal(true);
  };

  const handleSaveUsername = async () => {
    if (!isValidAccountUsername(usernameDraft)) {
      setUsernameFieldError(t('profile.usernameInvalid'));
      haptic.notification('error');
      return;
    }
    setUsernameSaving(true);
    setUsernameFieldError(null);
    try {
      await updateMyUsername(usernameDraft.trim());
      await refreshAccount();
      setShowUsernameModal(false);
      haptic.notification('success');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : t('profile.usernameInvalid');
      setUsernameFieldError(message);
      haptic.notification('error');
    } finally {
      setUsernameSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      // Compress and crop to square via canvas before storing
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const SIZE = 300;
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        // Crop from center to make it square
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, SIZE, SIZE);
        const compressed = canvas.toDataURL('image/jpeg', 0.85);
        updateUser({ avatar: compressed });
        haptic.notification('success');
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    // Reset so same file can be picked again
    e.target.value = '';
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    haptic.impact('medium');

    try {
      await logout();
      haptic.notification('success');
      // Clear onboarding status to show intro again
      localStorage.removeItem('wordzen_onboarding_completed');
      localStorage.removeItem('wordzen_language_selected');
      localStorage.removeItem('wordzen_location_selected');
      navigate('/onboarding', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      haptic.notification('error');
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

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

  // Format time learned from real API data
  const formatTimeLearned = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
  };

  const stats = [
    {
      icon: 'schedule',
      value: isLoadingStats ? '...' : formatTimeLearned(totalTimeMinutes),
      label: t('profile.timeLearned'),
    },
    {
      icon: 'style',
      value: isLoadingStats ? '...' : (quizProgress?.total.toLocaleString() || '0'),
      label: t('profile.questionsDone'),
    },
    {
      icon: 'task_alt',
      value: isLoadingStats ? '...' : `${Math.round(quizProgress?.percent || 0)}%`,
      label: t('profile.testAccuracy'),
    },
    {
      icon: 'local_fire_department',
      value: isLoadingStats ? '...' : `${visitStreak} days`,
      label: t('profile.visitStreak'),
    },
  ];

  // Get achievements - unlocked first, then locked
  const unlockedAchievements = allAchievements.filter(a =>
    user?.achievements.some(ua => ua.id === a.id && ua.unlockedAt)
  );
  const lockedAchievements = allAchievements.filter(a =>
    !user?.achievements.some(ua => ua.id === a.id && ua.unlockedAt)
  );
  const displayAchievements = [...unlockedAchievements, ...lockedAchievements].slice(0, 6);

  const achievementIcons = ['emoji_events', 'rocket_launch', 'auto_awesome', 'military_tech', 'workspace_premium', 'school'];

  const xpProgress = user ? (user.xp / user.xpToNextLevel) * 100 : 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto overflow-x-hidden bg-gray-50 dark:bg-background-dark pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center bg-gray-50/80 dark:bg-background-dark/80 backdrop-blur-md p-4 pb-2 justify-between">
        <h1 className="text-gray-900 dark:text-white text-lg font-bold flex-1">{t('profile.title')}</h1>
        <button
          onClick={() => navigate('/settings')}
          className="flex items-center justify-center w-12 h-12 text-gray-900 dark:text-white"
        >
          <span className="material-symbols-outlined">settings</span>
        </button>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1"
      >
        {/* Profile Header */}
        <motion.div variants={itemVariants} className="flex p-4">
          <div className="flex w-full flex-col gap-4 items-center">
            <div className="flex gap-4 flex-col items-center">
              {/* Tappable avatar with camera edit button */}
              <div className="relative cursor-pointer" onClick={handleAvatarClick}>
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-24 w-24 border-4 border-primary/20"
                  style={{ backgroundImage: `url("${displayAvatar}")` }}
                />
                <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-md border-2 border-white dark:border-background-dark">
                  <span className="material-symbols-outlined text-white" style={{ fontSize: '14px' }}>
                    photo_camera
                  </span>
                </div>
              </div>
              {/* Hidden file input — opens gallery */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center justify-center">
                <p className="text-gray-900 dark:text-white text-2xl font-bold leading-tight text-center">
                  {displayName}
                </p>
                {telegramUser?.username && (
                  <p className="text-gray-500 text-sm">@{telegramUser.username}</p>
                )}
                {isLoggedIn && user?.name && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm text-center max-w-[280px]">
                    {t('profile.accountUsernameLine', { username: user.name })}
                  </p>
                )}
                <p className="text-primary dark:text-primary/80 text-base font-medium leading-normal text-center mt-1">
                  {t('rankings.level', { level: user?.level || 1 })} • ⭐ {user?.ratingPoints.toLocaleString() || 0} pts
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col gap-3 p-4 mx-4 bg-white dark:bg-white/5 rounded-xl shadow-sm border border-gray-100 dark:border-white/10"
        >
          <div className="flex gap-6 justify-between">
            <p className="text-gray-900 dark:text-white text-base font-medium">{t('profile.progressToNext')}</p>
            <p className="text-primary dark:text-primary/80 text-sm font-bold">
              {(user?.level || 0) + 1}
            </p>
          </div>
          <div className="rounded-full bg-gray-100 dark:bg-white/10 h-3 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="flex flex-wrap gap-4 p-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-5 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-primary text-xl">{stat.icon}</span>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{stat.label}</p>
              </div>
              <p className="text-gray-900 dark:text-white text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Achievements Section */}
        <motion.div variants={itemVariants}>
          <div className="flex justify-between items-end px-4 pt-4 pb-2">
            <h3 className="text-gray-900 dark:text-white text-lg font-bold">{t('profile.achievements')}</h3>
            <span className="text-primary text-sm font-bold">
              {t('profile.unlocked', { unlocked: achievementProgress.unlocked, total: achievementProgress.total })}
            </span>
          </div>
          <div className="flex gap-4 px-4 py-2 overflow-x-auto hide-scrollbar">
            {displayAchievements.map((achievement, index) => {
              const isUnlocked = user?.achievements.some(ua => ua.id === achievement.id && ua.unlockedAt);
              return (
                <div key={achievement.id} className="flex flex-col items-center gap-2 min-w-[70px]">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      isUnlocked
                        ? 'bg-primary/10 border-2 border-primary'
                        : 'bg-gray-200 dark:bg-white/10 grayscale opacity-50'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-3xl ${
                        isUnlocked ? 'text-primary' : 'text-gray-500'
                      }`}
                      style={{ fontVariationSettings: isUnlocked ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {achievementIcons[index] || 'stars'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Subscription Banner — sourced from subscriptionStore (server truth)
            rather than the mocked user.subscription. */}
        <motion.div variants={itemVariants} className="m-4">
          {isPremium ? (
            <div
              className="p-4 rounded-xl bg-gradient-to-r from-primary to-[#7b42f6] text-white flex items-center justify-between shadow-lg shadow-primary/20 cursor-pointer"
              onClick={() => navigate('/subscription')}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    workspace_premium
                  </span>
                </div>
                <div>
                  <p className="text-base font-bold">{t('profile.premiumLabel')}</p>
                  <p className="text-xs text-white/80">
                    {t('profile.renews', { date: subscription?.expiredAt ? formatDate(subscription.expiredAt) : 'N/A' })}
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined">chevron_right</span>
            </div>
          ) : (
            <div
              className="p-4 rounded-xl bg-white dark:bg-white/5 border-2 border-dashed border-gray-200 dark:border-white/20 flex items-center justify-between cursor-pointer"
              onClick={() => navigate('/subscription')}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-gray-400 text-2xl">
                    workspace_premium
                  </span>
                </div>
                <div>
                  <p className="text-base font-bold text-gray-900 dark:text-white">{t('profile.freePlan')}</p>
                  <p className="text-xs text-gray-500">{t('profile.upgradeToUnlock')}</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-primary text-white rounded-xl font-medium text-sm">
                {t('profile.upgrade')}
              </button>
            </div>
          )}
        </motion.div>

        {/* Quick Links */}
        <motion.div variants={itemVariants} className="px-4 pb-4 space-y-2">
          {isLoggedIn && (
            <div
              onClick={openUsernameModal}
              className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-700 dark:text-amber-300">
                  alternate_email
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 dark:text-white font-medium">{t('profile.changeUsername')}</p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.name ? user.name : t('profile.usernamePlaceholder')}
                </p>
              </div>
              <span className="material-symbols-outlined text-gray-400">chevron_right</span>
            </div>
          )}

          <div
            onClick={() => navigate('/statistics')}
            className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 cursor-pointer active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">analytics</span>
            </div>
            <div className="flex-1">
              <p className="text-gray-900 dark:text-white font-medium">{t('profile.statistics')}</p>
              <p className="text-xs text-gray-500">{t('profile.viewProgress')}</p>
            </div>
            <span className="material-symbols-outlined text-gray-400">chevron_right</span>
          </div>

          <div
            onClick={() => navigate('/friends')}
            className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 cursor-pointer active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">group</span>
            </div>
            <div className="flex-1">
              <p className="text-gray-900 dark:text-white font-medium">{t('profile.friendsLink')}</p>
              <p className="text-xs text-gray-500">{t('profile.friendsCount', { count: user?.friendsCount || 0 })}</p>
            </div>
            <span className="material-symbols-outlined text-gray-400">chevron_right</span>
          </div>

          <div
            onClick={() => navigate('/courses')}
            className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 cursor-pointer active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-green-600 dark:text-green-400">menu_book</span>
            </div>
            <div className="flex-1">
              <p className="text-gray-900 dark:text-white font-medium">{t('profile.myCourses')}</p>
              <p className="text-xs text-gray-500">{t('profile.coursesCount', { count: user?.purchasedCourses.length || 0 })}</p>
            </div>
            <span className="material-symbols-outlined text-gray-400">chevron_right</span>
          </div>

          <div
            onClick={() => navigate('/subscription')}
            className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 cursor-pointer active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">workspace_premium</span>
            </div>
            <div className="flex-1">
              <p className="text-gray-900 dark:text-white font-medium">{t('subscription.title')}</p>
              <p className="text-xs text-gray-500">
                {isPremium
                  ? t(`subscription.${useSubscriptionStore.getState().getCurrentTier()}`)
                  : t('subscription.free')}
              </p>
            </div>
            <span className="material-symbols-outlined text-gray-400">chevron_right</span>
          </div>

          {/* Logout Button */}
          {isLoggedIn && (
            <div
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-white/5 border border-red-200 dark:border-red-900/30 cursor-pointer active:scale-[0.98] transition-transform mt-4"
            >
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400">logout</span>
              </div>
              <div className="flex-1">
                <p className="text-red-600 dark:text-red-400 font-medium">{t('profile.logOut')}</p>
                <p className="text-xs text-gray-500">{t('profile.signOutDesc')}</p>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Username modal */}
      {showUsernameModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => !usernameSaving && setShowUsernameModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {t('profile.accountUsernameShort')}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{t('profile.usernameHint')}</p>
            <input
              type="text"
              autoComplete="username"
              value={usernameDraft}
              onChange={(e) => {
                setUsernameDraft(e.target.value);
                setUsernameFieldError(null);
              }}
              placeholder={t('profile.usernamePlaceholder')}
              disabled={usernameSaving}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
            />
            {usernameFieldError && (
              <p className="text-xs text-red-500 mt-2">{usernameFieldError}</p>
            )}
            <div className="flex gap-3 mt-5">
              <button
                type="button"
                disabled={usernameSaving}
                onClick={() => setShowUsernameModal(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium disabled:opacity-50"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                disabled={usernameSaving}
                onClick={handleSaveUsername}
                className="flex-1 py-3 px-4 rounded-xl bg-primary text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {usernameSaving ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                  </>
                ) : (
                  t('profile.saveUsername')
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-500 text-3xl">logout</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {t('profile.logOutQuestion')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {t('profile.logOutConfirm')}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-500 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoggingOut ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                      {t('profile.loggingOut')}
                    </>
                  ) : (
                    t('profile.logOut')
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Profile;
