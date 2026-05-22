import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '../../lib/i18n';
import { useCoursesStore } from '../../lib/stores';
import { Header, Input, Card, AppImage } from '../../components/ui';
import { isAuthenticated } from '../../lib/api';
import { useTelegram } from '../../lib/telegram/index';
import type { CourseView, CourseCategory } from '../../lib/api';
import { getImageUrl, isSubscriptionGatedCourse } from '../../lib/api/courses';

type FilterCategory = 'all' | CourseCategory;

const categoryColors: Record<CourseCategory, string> = {
  A1: 'bg-green-100 text-green-700',
  A2: 'bg-green-100 text-green-700',
  B1: 'bg-blue-100 text-blue-700',
  B2: 'bg-blue-100 text-blue-700',
  C1: 'bg-purple-100 text-purple-700',
  C2: 'bg-purple-100 text-purple-700',
  SPEAKING: 'bg-orange-100 text-orange-700',
  READING: 'bg-teal-100 text-teal-700',
  WRITING: 'bg-pink-100 text-pink-700',
};

function CourseCardSkeleton() {
  return (
    <div className="mb-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
      <div className="flex gap-3">
        <div className="w-20 h-20 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="flex-1">
          <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2" />
          <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2" />
        </div>
      </div>
    </div>
  );
}

const Courses = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>('all');
  const initialCoursesFetchRef = useRef(false);
  const { isTelegram, isReady, isAuthenticating } = useTelegram();

  const {
    courses,
    isLoadingCourses,
    isLoadingLibrary,
    coursesError,
    fetchCourses,
    fetchLibraryCourses,
  } = useCoursesStore();

  // Check auth status - this needs to be reactive
  const isLoggedIn = isAuthenticated();

  // Fetch courses only AFTER authentication is complete (isReady=true AND isAuthenticating=false)
  useEffect(() => {
    if (!isReady || isAuthenticating || !isLoggedIn || initialCoursesFetchRef.current) {
      return;
    }
    initialCoursesFetchRef.current = true;
    void fetchCourses();
    void fetchLibraryCourses();
  }, [fetchCourses, fetchLibraryCourses, isLoggedIn, isReady, isAuthenticating]);

  // Filter courses
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || course.category?.code === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Split into library and available courses
  const myCourses = filteredCourses.filter((c) => c.inLibrary);
  const availableCourses = filteredCourses.filter((c) => !c.inLibrary);

  const categoryOptions: { value: FilterCategory; label: string }[] = [
    { value: 'all', label: t('courses.all') },
    { value: 'A1', label: 'A1' },
    { value: 'A2', label: 'A2' },
    { value: 'B1', label: 'B1' },
    { value: 'B2', label: 'B2' },
    { value: 'C1', label: 'C1' },
    { value: 'C2', label: 'C2' },
  ];

  const skillOptions: { value: FilterCategory; label: string }[] = [
    { value: 'SPEAKING', label: t('courses.speaking') },
    { value: 'READING', label: t('courses.reading') },
    { value: 'WRITING', label: t('courses.writing') },
  ];

  const getDescription = (course: CourseView): string => {
    // Try to get English description first, then any available
    const enDesc = course.descriptions?.find((d) => d.locale === 'EN');
    const anyDesc = course.descriptions?.[0];
    return enDesc?.value || anyDesc?.value || '';
  };

  const CourseCard = ({ course }: { course: CourseView }) => {
    const coverUrl = getImageUrl(course.cover);

    return (
      <Card
        variant="pressable"
        onClick={() => navigate(`/courses/${course.id}`)}
        className="mb-3"
      >
        <div className="flex gap-3">
          <AppImage
            src={coverUrl}
            alt={course.title}
            className="w-20 h-20 rounded-lg object-cover bg-gray-100"
            fallbackIcon="menu_book"
            fallbackClassName="w-20 h-20 rounded-lg bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center"
          />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {course.title}
          </h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {course.category && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  categoryColors[course.category.code] || 'bg-gray-100 text-gray-600'
                }`}
              >
                {course.category.code}
              </span>
            )}
            {course.modules && course.modules.length > 0 && (
              <span className="text-xs text-gray-500">
                {t('courses.units', { count: course.modules.length })}
              </span>
            )}
          </div>
          {getDescription(course) && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {getDescription(course)}
            </p>
          )}
          <div className="mt-2 flex items-center gap-2">
            {course.inLibrary ? (
              <div className="flex items-center gap-1 text-green-600 text-xs">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
                <span>{t('common.inLibrary')}</span>
              </div>
            ) : isSubscriptionGatedCourse(course) && !course.purchased ? (
              <div className="flex items-center gap-1 text-amber-600 text-xs">
                <span className="material-symbols-outlined text-sm">lock</span>
                <span>{t('common.premium')}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-primary text-xs">
                <span className="material-symbols-outlined text-sm">add</span>
                <span>{t('common.free')}</span>
              </div>
            )}
          </div>
        </div>
        </div>
      </Card>
    );
  };

  const isLoading = isLoadingCourses || isLoadingLibrary;

  return (
    <div className="flex-1 flex flex-col pb-20 pt-12">
      <Header title={t('courses.title')} />

      <div className="px-4 py-4">
        {/* Search */}
        <Input
          variant="search"
          placeholder={t('courses.search')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Level Filters */}
        <div className="mt-4 space-y-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {categoryOptions.map((option) => (
              <motion.button
                key={option.value}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCategoryFilter(option.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                  categoryFilter === option.value
                    ? 'bg-primary text-white border-primary'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                }`}
              >
                {option.label}
              </motion.button>
            ))}
          </div>

          {/* Skill Filters */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {skillOptions.map((option) => (
              <motion.button
                key={option.value}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCategoryFilter(option.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                  categoryFilter === option.value
                    ? 'bg-primary text-white border-primary'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                }`}
              >
                {option.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 overflow-y-auto">
        {/* Not Authenticated State */}
        {!isLoggedIn && isReady && !isAuthenticating && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-primary text-4xl">
                lock
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('courses.loginRequired')}
            </h3>
            <p className="text-sm text-gray-500 mt-2 max-w-xs">
              {isTelegram
                ? t('courses.authInProgress')
                : t('courses.openTelegram')}
            </p>
            {!isTelegram && (
              <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl max-w-xs">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  <strong>{t('courses.devMode')}</strong> {t('courses.devModeDesc')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Error State */}
        {isLoggedIn && coursesError && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="material-symbols-outlined text-4xl text-red-400 mb-3">
              error
            </span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('courses.failedToLoad')}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{coursesError}</p>
            <button
              onClick={() => fetchCourses()}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium"
            >
              {t('common.tryAgain')}
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoggedIn && isLoading && !coursesError && (
          <div>
            <div className="mb-4">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3" />
              <CourseCardSkeleton />
              <CourseCardSkeleton />
            </div>
            <div>
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3" />
              <CourseCardSkeleton />
              <CourseCardSkeleton />
              <CourseCardSkeleton />
            </div>
          </div>
        )}

        {/* Content */}
        {isLoggedIn && !isLoading && !coursesError && (
          <>
            {/* My Courses */}
            {myCourses.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                  {t('courses.myCourses', { count: myCourses.length })}
                </h2>
                {myCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}

            {/* Available Courses */}
            {availableCourses.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                  {t('courses.availableCourses', { count: availableCourses.length })}
                </h2>
                {availableCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {filteredCourses.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">
                  search_off
                </span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('courses.noCourses')}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {t('courses.adjustFilters')}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Courses;
