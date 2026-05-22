import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '../../lib/i18n';
import {
  useCoursesStore,
  useSubscriptionStore,
} from '../../lib/stores';
import { useTelegram } from '../../lib/telegram/index';
import type { ModuleView } from '../../lib/api';
import {
  getImageUrl,
  isSubscriptionGatedCourse,
  moduleAppearsLocked,
} from '../../lib/api/courses';
import { AppImage } from '../../components/ui';
import { getFavoriteCardsByCourse } from '../../lib/api/favorites';
import PaywallBanner from '../../components/PaywallBanner';

function CourseDetailLoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="w-full h-64 bg-gray-200 dark:bg-gray-800" />
      <div className="px-4 pt-6">
        <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="flex gap-2 mt-3">
          <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
      </div>
      <div className="px-4 pt-4">
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mt-2" />
        <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mt-2" />
      </div>
      <div className="px-4 mt-6">
        <div className="h-32 w-full bg-gray-200 dark:bg-gray-700 rounded-2xl" />
      </div>
      <div className="px-4 mt-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 w-full bg-gray-200 dark:bg-gray-700 rounded-xl mb-3" />
        ))}
      </div>
    </div>
  );
}

const CourseDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { haptic } = useTelegram();
  const [favoritesCount, setFavoritesCount] = useState(0);
  const isPremium = useSubscriptionStore((s) => s.isPremium());

  const {
    currentCourse: course,
    isLoadingCourse,
    courseError,
    fetchCourse,
    addToLibrary,
    removeFromLibrary,
    clearCurrentCourse,
  } = useCoursesStore();

  // Fetch course on mount
  useEffect(() => {
    if (id) {
      fetchCourse(parseInt(id, 10));
    }

    return () => {
      clearCurrentCourse();
    };
  }, [id, fetchCourse, clearCurrentCourse]);

  // Fetch favorites count for this course
  useEffect(() => {
    if (id) {
      getFavoriteCardsByCourse(parseInt(id, 10))
        .then((cards) => setFavoritesCount(cards.length))
        .catch(() => setFavoritesCount(0));
    }
  }, [id]);

  const handleAddToLibrary = async () => {
    if (!course) return;
    haptic.impact('light');
    try {
      await addToLibrary(course.id);
      haptic.notification('success');
    } catch {
      haptic.notification('error');
    }
  };

  const handleRemoveFromLibrary = async () => {
    if (!course) return;
    haptic.impact('light');
    try {
      await removeFromLibrary(course.id);
    } catch {
      haptic.notification('error');
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

  // Error state
  if (courseError) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-white dark:bg-background-dark">
        <div className="text-center px-4">
          <span className="material-symbols-outlined text-5xl text-red-400 mb-3">error</span>
          <p className="text-gray-500 mb-4">{courseError}</p>
          <button
            onClick={() => navigate('/courses')}
            className="px-4 py-2 bg-primary text-white rounded-lg font-medium"
          >
            {t('courseDetail.backToCourses')}
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoadingCourse || !course) {
    return (
      <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto overflow-x-hidden bg-white dark:bg-background-dark">
        {/* Header */}
        <div className="sticky top-0 z-50 flex items-center bg-white/80 dark:bg-background-dark/80 backdrop-blur-md p-4 justify-between border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-800 dark:text-white flex size-10 shrink-0 items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="text-gray-800 dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center">
            {t('courseDetail.title')}
          </h2>
          <div className="w-10" />
        </div>
        <CourseDetailLoadingSkeleton />
      </div>
    );
  }

  // Get description based on locale
  const getDescription = (): string => {
    const enDesc = course.descriptions?.find((d) => d.locale === 'EN');
    const anyDesc = course.descriptions?.[0];
    return enDesc?.value || anyDesc?.value || t('courseDetail.noDescription');
  };

  const totalModules = course.modules?.length || 0;

  const renderModuleItem = (module: ModuleView, index: number) => {
    const showFreeBadge = module.isPublic ?? module.public ?? false;
    const isLocked = moduleAppearsLocked(module, course, isPremium);

    if (isLocked) {
      // Locked module
      return (
        <motion.div
          key={module.id}
          variants={itemVariants}
          className="mb-3 flex items-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 opacity-60"
        >
          <div className="bg-gray-200 dark:bg-gray-700 text-gray-500 rounded-full p-1.5 mr-4">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              lock
            </span>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-800 dark:text-white">
              {String(index + 1).padStart(2, '0')}. {module.title}
            </h4>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t('courseDetail.cards', { count: module.cards?.length || 0 })}
              </span>
              <span className="text-xs text-gray-400">{t('common.premium')}</span>
            </div>
          </div>
          <span className="material-symbols-outlined text-gray-300">lock</span>
        </motion.div>
      );
    }

    // Available module
    return (
      <motion.div
        key={module.id}
        variants={itemVariants}
        onClick={() => {
          haptic.impact('light');
          navigate(`/unit/${module.id}`, { state: { inLibrary: course?.inLibrary ?? false, courseId: course?.id } });
        }}
        className="mb-3 flex items-center p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 cursor-pointer active:scale-[0.98] transition-transform"
      >
        <div className="bg-primary/10 text-primary rounded-full p-1.5 mr-4">
          <span className="material-symbols-outlined text-sm">
            play_arrow
          </span>
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-800 dark:text-white">
            {String(index + 1).padStart(2, '0')}. {module.title}
          </h4>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t('courseDetail.cards', { count: module.cards?.length || 0 })}
            </span>
            {showFreeBadge && (
              <span className="text-xs font-bold text-green-600 dark:text-green-400">{t('common.free')}</span>
            )}
          </div>
        </div>
        <span className="material-symbols-outlined text-gray-400">chevron_right</span>
      </motion.div>
    );
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto overflow-x-hidden bg-white dark:bg-background-dark">
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center bg-white/80 dark:bg-background-dark/80 backdrop-blur-md p-4 justify-between border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-800 dark:text-white flex size-10 shrink-0 items-center justify-center cursor-pointer"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-gray-800 dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center">
          {t('courseDetail.title')}
        </h2>
        <div className="flex w-10 items-center justify-end">
          <button className="flex cursor-pointer items-center justify-center rounded-xl h-10 w-10 bg-transparent text-gray-800 dark:text-white">
            <span className="material-symbols-outlined">share</span>
          </button>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 pb-24"
      >
        {/* Hero Image */}
        <motion.div variants={itemVariants} className="relative min-h-64">
          <AppImage
            src={getImageUrl(course.cover)}
            alt={course.title}
            className="w-full h-64 object-cover bg-gray-200 dark:bg-gray-800"
            fallbackIcon="menu_book"
            fallbackClassName="w-full h-64 bg-gray-200 dark:bg-gray-800 flex items-center justify-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            {course.inLibrary && (
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-500 text-white text-xs font-bold mb-2">
                <span className="material-symbols-outlined text-sm mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
                {t('courseDetail.inYourLibrary')}
              </div>
            )}
          </div>
        </motion.div>

        {/* Title & Tags */}
        <motion.div variants={itemVariants} className="px-4 pt-6">
          <h1 className="text-gray-800 dark:text-white tracking-tight text-2xl font-bold leading-tight">
            {course.title}
          </h1>
          <div className="flex gap-2 mt-3 flex-wrap">
            {course.category && (
              <div className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-gray-100 dark:bg-gray-800 px-3">
                <span className="material-symbols-outlined text-primary text-sm">bar_chart</span>
                <p className="text-gray-800 dark:text-gray-200 text-sm font-medium">
                  {course.category.name || course.category.code}
                </p>
              </div>
            )}
            <div className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-gray-100 dark:bg-gray-800 px-3">
              <span className="material-symbols-outlined text-primary text-sm">school</span>
              <p className="text-gray-800 dark:text-gray-200 text-sm font-medium">
                {totalModules} {t('courseDetail.units')}
              </p>
            </div>
            {/* Favorites Button */}
            <button
              onClick={() => {
                haptic.impact('light');
                navigate(`/favorites/${course.id}`);
              }}
              className="relative flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 px-3 active:scale-95 transition-transform"
            >
              <span
                className="material-symbols-outlined text-amber-500 text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              <p className="text-amber-700 dark:text-amber-400 text-sm font-medium">
                {t('courseDetail.favorites')}
              </p>
              {favoritesCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
                  {favoritesCount > 99 ? '99+' : favoritesCount}
                </span>
              )}
            </button>
            {isSubscriptionGatedCourse(course) && (
              <div className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 px-3">
                <span className="material-symbols-outlined text-amber-600 text-sm">workspace_premium</span>
                <p className="text-amber-700 dark:text-amber-400 text-sm font-medium">
                  {t('common.premium')}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Description */}
        <motion.div variants={itemVariants} className="px-4 pt-4 pb-2">
          <p className="text-gray-600 dark:text-gray-400 text-base font-normal leading-relaxed">
            {getDescription()}
          </p>
        </motion.div>

        {/* Add to Library / Subscription Paywall — курсы с accessCode BASIC/PRO без подписки */}
        <motion.div variants={itemVariants} className="px-4 my-4">
          {course.inLibrary ? (
            <button
              onClick={handleRemoveFromLibrary}
              className="w-full py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              <span>{t('courseDetail.inLibrary')}</span>
            </button>
          ) : isSubscriptionGatedCourse(course) && !isPremium ? (
            <PaywallBanner variant="proOnly" className="mx-0" />
          ) : (
            <button
              onClick={handleAddToLibrary}
              className="w-full py-3 rounded-xl bg-primary text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              <span>{t('courseDetail.addToLibrary')}</span>
            </button>
          )}
        </motion.div>

        {/* Course Info Cards */}
        <motion.div variants={itemVariants} className="mx-4 my-4 p-5 rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/10">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t('courseDetail.totalUnits')}</p>
              <h3 className="text-2xl font-bold text-primary">{totalModules}</h3>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t('courseDetail.status')}</p>
              <p className="text-lg font-bold text-gray-800 dark:text-white">
                {!isSubscriptionGatedCourse(course) ? t('common.free') : t('common.premium')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Units List */}
        <motion.div variants={itemVariants} className="px-4">
          <h3 className="text-lg font-bold mb-4 px-1 text-gray-800 dark:text-white">
            {t('courseDetail.courseCurriculum')}
          </h3>
          {course.modules && course.modules.length > 0 ? (
            course.modules.map((module, index) => renderModuleItem(module, index))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <span className="material-symbols-outlined text-4xl mb-2">menu_book</span>
              <p>{t('courseDetail.unitsComingSoon')}</p>
            </div>
          )}
        </motion.div>
      </motion.div>

    </div>
  );
};

export default CourseDetail;
