import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useFavoritesStore } from '../../lib/stores/favoritesStore';
import { getImageUrl, getCourseById } from '../../lib/api/courses';
import type { CardView } from '../../lib/api/courses';
import { useTranslation } from '../../lib/i18n';

type ViewLevel = 'courses' | 'modules' | 'cards';

const Favorites = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId?: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState<CardView | null>(null);
  const [directCourseTitle, setDirectCourseTitle] = useState<string | null>(null);
  const hasAutoSelectedCourse = useRef(false);

  const {
    favoriteCards,
    favoriteCourses,
    currentCourse,
    currentModule,
    currentCards,
    isLoadingCourses,
    isLoadingModules,
    isLoadingCards,
    isProcessing,
    error,
    fetchFavoriteCoursesOverview,
    fetchCourseModulesWithFavorites,
    selectCourse,
    selectModule,
    clearSelection,
    removeFromFavorites,
  } = useFavoritesStore();

  // Fetch course overview first
  useEffect(() => {
    fetchFavoriteCoursesOverview();
  }, [fetchFavoriteCoursesOverview]);

  // Auto-select course if courseId is provided in URL
  useEffect(() => {
    if (courseId && !hasAutoSelectedCourse.current && !isLoadingCourses) {
      const numericCourseId = parseInt(courseId, 10);

      // Check if this course exists in favoriteCourses
      const foundCourse = favoriteCourses.find((fc) => fc.course.id === numericCourseId);

      if (foundCourse) {
        // Course has favorites, select it
        selectCourse(numericCourseId);
        hasAutoSelectedCourse.current = true;
      } else if (favoriteCourses.length > 0 || !isLoadingCourses) {
        // Course doesn't have favorites or not in library, but still show modules view
        // Fetch course title and modules directly
        hasAutoSelectedCourse.current = true;
        getCourseById(numericCourseId)
          .then((course) => {
            setDirectCourseTitle(course.title);
            fetchCourseModulesWithFavorites(numericCourseId);
          })
          .catch(() => {
            // Course not found, stay on courses view
          });
      }
    }
  }, [courseId, favoriteCourses, isLoadingCourses, selectCourse, fetchCourseModulesWithFavorites]);

  // Determine current view level
  const getCurrentView = (): ViewLevel => {
    if (currentModule) return 'cards';
    if (currentCourse || (courseId && directCourseTitle)) return 'modules';
    return 'courses';
  };

  const currentView = getCurrentView();

  // Check if we came directly to a specific course
  const isDirectCourseAccess = !!courseId;

  // Get title based on current view
  const getTitle = () => {
    if (currentModule) return currentModule.module.title;
    if (currentCourse) return currentCourse.course.title;
    if (directCourseTitle) return directCourseTitle;
    return t('favorites.title');
  };

  // Get breadcrumb
  const getBreadcrumb = () => {
    const parts: string[] = [];
    if (currentCourse) {
      parts.push(currentCourse.course.title);
    }
    if (currentModule) {
      parts.push(currentModule.module.title);
    }
    return parts;
  };

  // Filter cards based on search
  const filteredCards = currentCards.filter((card) =>
    card.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.translations.some((t) => t.value.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle back button
  const handleBack = () => {
    if (currentModule) {
      // Go back from cards to modules
      clearSelection();
    } else if (currentCourse && !isDirectCourseAccess) {
      // Go back from modules to courses list (only if we didn't come directly to a course)
      clearSelection();
    } else {
      // Go back to previous page (either from courses list, or from direct course access)
      navigate(-1);
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

  const getTranslation = (card: CardView, locale: string = 'EN') => {
    const translation = card.translations.find((t) => t.locale === locale);
    return translation?.value || card.translations[0]?.value || '';
  };

  const handleRemoveCard = async (cardId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await removeFromFavorites(cardId);
  };

  // Loading state
  const isLoading = isLoadingCourses || isLoadingModules || isLoadingCards;
  if (isLoading && favoriteCourses.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-white dark:bg-background-dark">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{t('favorites.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto overflow-x-hidden bg-white dark:bg-background-dark">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white dark:bg-background-dark border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-gray-700 dark:text-gray-300">
              arrow_back
            </span>
          </button>
          <div className="flex-1 text-center px-3">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {getTitle()}
            </h1>
            {/* Breadcrumb */}
            {currentView !== 'courses' && (
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <button
                  onClick={() => {
                    if (currentModule) clearSelection();
                    if (currentCourse && !currentModule) clearSelection();
                  }}
                  className="text-xs text-primary truncate max-w-[100px]"
                >
                  {getBreadcrumb()[0]}
                </button>
                {getBreadcrumb().length > 1 && (
                  <>
                    <span className="text-xs text-gray-400">/</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[100px]">
                      {getBreadcrumb()[1]}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="w-10 flex items-center justify-center">
            {/* Total count badge */}
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
              {favoriteCards.length}
            </span>
          </div>
        </div>

        {/* Search Bar - only show when viewing cards */}
        {currentView === 'cards' && (
          <div className="px-4 pb-4">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                search
              </span>
              <input
                type="text"
                placeholder={t('favorites.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Content based on current view */}
      <AnimatePresence mode="wait">
        {/* Courses List */}
        {currentView === 'courses' && (
          <motion.div
            key="courses"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 px-4 py-4 pb-24"
          >
            {/* Stats */}
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {favoriteCourses.length === 1
                ? t('favorites.coursesWithFavorites', { count: favoriteCourses.length })
                : t('favorites.coursesWithFavoritesPlural', { count: favoriteCourses.length })}
            </p>

            {favoriteCourses.length === 0 ? (
              <div className="text-center py-16">
                <span
                  className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  favorite
                </span>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('favorites.noFavorites')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                  {t('favorites.noFavoritesDesc')}
                </p>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                {favoriteCourses.map((fc) => (
                  <motion.div
                    key={fc.course.id}
                    variants={itemVariants}
                    onClick={() => selectCourse(fc.course.id)}
                    className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 cursor-pointer active:scale-[0.98] transition-transform"
                  >
                    <div className="flex items-center gap-4">
                      {/* Course Cover */}
                      <div
                        className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 bg-cover bg-center flex-shrink-0 flex items-center justify-center"
                        style={fc.course.cover ? { backgroundImage: `url("${getImageUrl(fc.course.cover)}")` } : undefined}
                      >
                        {!fc.course.cover && (
                          <span className="material-symbols-outlined text-2xl text-primary">
                            menu_book
                          </span>
                        )}
                      </div>

                      {/* Course Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-base truncate">
                          {fc.course.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            {fc.course.category.code}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {fc.favoriteCount === 1
                              ? t('favorites.wordsSaved', { count: fc.favoriteCount })
                              : t('favorites.wordsSavedPlural', { count: fc.favoriteCount })}
                          </span>
                        </div>
                      </div>

                      {/* Arrow */}
                      <span className="material-symbols-outlined text-gray-400">
                        chevron_right
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Modules List */}
        {currentView === 'modules' && currentCourse && (
          <motion.div
            key="modules"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 px-4 py-4 pb-24"
          >
            {/* Stats */}
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {(currentCourse.modules?.length || 0) === 1
                ? t('favorites.unitsWithFavorites', { count: currentCourse.modules?.length || 0 })
                : t('favorites.unitsWithFavoritesPlural', { count: currentCourse.modules?.length || 0 })}
            </p>

            {isLoadingModules ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !currentCourse.modules || currentCourse.modules.length === 0 ? (
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-4">
                  folder_open
                </span>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('favorites.noFavoritesInCourse')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('favorites.addFromCourse')}
                </p>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                {currentCourse.modules.map((fm, index) => (
                  <motion.div
                    key={fm.module.id}
                    variants={itemVariants}
                    onClick={() => selectModule(fm.module.id)}
                    className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 cursor-pointer active:scale-[0.98] transition-transform"
                  >
                    <div className="flex items-center gap-4">
                      {/* Module Number */}
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">
                          {index + 1}
                        </span>
                      </div>

                      {/* Module Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-base truncate">
                          {fm.module.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          {fm.favoriteCount === 1
                            ? t('favorites.wordsSaved', { count: fm.favoriteCount })
                            : t('favorites.wordsSavedPlural', { count: fm.favoriteCount })}
                        </p>
                      </div>

                      {/* Arrow */}
                      <span className="material-symbols-outlined text-gray-400">
                        chevron_right
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Cards List */}
        {currentView === 'cards' && (
          <motion.div
            key="cards"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 px-4 py-4 pb-24"
          >
            {/* Stats */}
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {filteredCards.length === 1
                ? t('favorites.wordsSaved', { count: filteredCards.length })
                : t('favorites.wordsSavedPlural', { count: filteredCards.length })}
            </p>

            {isLoadingCards ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredCards.length === 0 ? (
              <div className="text-center py-16">
                <span
                  className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-4"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {searchQuery ? 'search_off' : 'favorite'}
                </span>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {searchQuery ? t('favorites.noMatches') : t('favorites.noFavoriteWords')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {searchQuery ? t('favorites.tryDifferentSearch') : t('favorites.addWhileStudying')}
                </p>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                {filteredCards.map((card) => (
                  <motion.div
                    key={card.id}
                    variants={itemVariants}
                    onClick={() => setSelectedCard(card)}
                    className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 cursor-pointer active:scale-[0.98] transition-transform"
                  >
                    <div className="flex items-start gap-3">
                      {/* Card Image */}
                      {card.image && (
                        <div
                          className="w-14 h-14 rounded-lg bg-gray-200 dark:bg-gray-700 bg-cover bg-center flex-shrink-0"
                          style={{ backgroundImage: `url("${getImageUrl(card.image)}")` }}
                        />
                      )}

                      {/* Card Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                          {card.term}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                          {getTranslation(card)}
                        </p>
                        {card.samples.length > 0 && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate italic">
                            "{card.samples[0].value}"
                          </p>
                        )}
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={(e) => handleRemoveCard(card.id, e)}
                        disabled={isProcessing}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                      >
                        <span
                          className="material-symbols-outlined text-xl"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          favorite
                        </span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Detail Modal */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setSelectedCard(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl"
            >
              {/* Card Image */}
              {selectedCard.image && (
                <div
                  className="w-full h-48 bg-gray-200 dark:bg-gray-700 bg-cover bg-center"
                  style={{ backgroundImage: `url("${getImageUrl(selectedCard.image)}")` }}
                />
              )}

              {/* Card Content */}
              <div className="p-5">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedCard.term}
                </h2>

                {/* Translations */}
                <div className="space-y-2 mb-4">
                  {selectedCard.translations.map((translation) => (
                    <div
                      key={translation.id}
                      className="flex items-center gap-2"
                    >
                      <span className="text-xs font-medium text-gray-400 uppercase w-6">
                        {translation.locale}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {translation.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Examples */}
                {selectedCard.samples.length > 0 && (
                  <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                      {t('favorites.examples')}
                    </h4>
                    <div className="space-y-3">
                      {selectedCard.samples.map((sample) => (
                        <div key={sample.id} className="text-sm">
                          <p className="text-gray-800 dark:text-gray-200 italic">
                            "{sample.value}"
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 mt-0.5">
                            {sample.translation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => setSelectedCard(null)}
                    className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium"
                  >
                    {t('common.close')}
                  </button>
                  <button
                    onClick={async () => {
                      await removeFromFavorites(selectedCard.id);
                      setSelectedCard(null);
                    }}
                    disabled={isProcessing}
                    className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span
                      className="material-symbols-outlined text-lg"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      heart_broken
                    </span>
                    {t('common.remove')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Favorites;
