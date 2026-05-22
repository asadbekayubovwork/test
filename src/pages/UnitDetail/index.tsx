import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../lib/i18n';
import {
  useCoursesStore,
  useFavoritesStore,
  useSubscriptionStore,
  useUsageStore,
} from '../../lib/stores';
import { getImageUrl } from '../../lib/api/courses';
import { AppImage } from '../../components/ui';
import PaywallBanner from '../../components/PaywallBanner';
import type { CardView } from '../../lib/api';

interface LocationState {
  inLibrary?: boolean;
  courseId?: number;
}

type UnitCardPreviewProps = {
  card: CardView;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isProcessing: boolean;
};

function UnitCardPreview({
  card,
  isFavorite,
  onToggleFavorite,
  isProcessing,
}: UnitCardPreviewProps) {
  // Get translation (first one or English preferred)
  const translation =
    card.translations?.find((t) => t.locale === 'EN') || card.translations?.[0];
  const sample = card.samples?.[0];

  return (
    <div className="w-full max-w-[340px] mx-auto flex flex-col rounded-2xl bg-white dark:bg-gray-800 shadow-xl border-2 border-gray-200 dark:border-gray-600 overflow-hidden">
      {/* Card Image */}
      {card.image && (
        <div className="h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <AppImage
            src={getImageUrl(card.image)}
            alt={card.term}
            className="w-full h-full object-cover"
            fallbackIcon="image"
          />
        </div>
      )}

      {/* Card Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-gray-900 dark:text-white text-3xl font-bold leading-tight">
          {card.term}
        </h1>
        {translation && (
          <p className="text-gray-700 dark:text-gray-300 text-lg font-medium leading-relaxed mt-4">
            {translation.value}
          </p>
        )}
        {sample && (
          <p className="text-gray-500 dark:text-gray-400 text-sm italic mt-3">
            {`"${sample.value}"`}
          </p>
        )}
      </div>

      {/* Action Buttons on Card */}
      <div className="w-full flex justify-between items-center p-6 bg-gray-50 dark:bg-gray-700/50 border-t-2 border-gray-200 dark:border-gray-600">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          disabled={isProcessing}
          className={`flex w-12 h-12 items-center justify-center rounded-full border transition-colors disabled:opacity-50 ${
            isFavorite
              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-500 border-amber-300 dark:border-amber-600'
              : 'bg-white dark:bg-gray-600 text-gray-400 border-gray-200 dark:border-gray-500 hover:bg-amber-50 hover:text-amber-400'
          }`}
        >
          <span
            className="material-symbols-outlined text-2xl"
            style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}
          >
            star
          </span>
        </button>
        <button className="flex w-12 h-12 items-center justify-center rounded-full bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-500">
          <span className="material-symbols-outlined text-2xl">volume_up</span>
        </button>
      </div>
    </div>
  );
}

const UnitDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { unitId } = useParams<{ unitId: string }>();
  const routeState = (location.state as LocationState) || {};
  const inLibrary = routeState.inLibrary ?? true; // default true for direct URL access
  const courseId = routeState.courseId;

  const {
    currentModule: module,
    moduleCards: cards,
    isLoadingModule,
    isLoadingCards,
    moduleError,
    cardsError,
    fetchModule,
    fetchModuleCards,
    clearCurrentModule,
  } = useCoursesStore();

  const {
    favoriteCardIds,
    isProcessing: isFavoriteProcessing,
    fetchFavorites,
    toggleFavorite,
  } = useFavoritesStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showAllCards, setShowAllCards] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Free-tier 24h next-unit gate. Premium users always pass; users who've
  // already started this unit can keep practising it without cooldown.
  const isPremium = useSubscriptionStore((s) => s.isPremium());
  const isUnitCompleted = useUsageStore((s) =>
    unitId ? s.isUnitCompleted(unitId) : false,
  );
  const canStartNewUnit = useUsageStore((s) => s.canStartNewUnit());
  const isLockedByCooldown =
    !isPremium && !isUnitCompleted && !canStartNewUnit.allowed;

  // Fetch module and cards on mount
  useEffect(() => {
    if (unitId) {
      const moduleId = parseInt(unitId, 10);
      fetchModule(moduleId);
      fetchModuleCards(moduleId);
    }
    // Fetch favorites to know which cards are favorited
    fetchFavorites();

    return () => {
      clearCurrentModule();
    };
  }, [unitId, fetchModule, fetchModuleCards, clearCurrentModule, fetchFavorites]);

  const isLoading = isLoadingModule || isLoadingCards;
  const error = moduleError || cardsError;

  // Loading state
  if (isLoading) {
    return (
      <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto overflow-x-hidden bg-gray-50 dark:bg-background-dark">
        <div className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center p-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center text-gray-900 dark:text-white"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="flex-1 text-center">
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse" />
            </div>
            <div className="w-10" />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-5xl text-primary animate-spin mb-4">
              progress_activity
            </span>
            <p className="text-gray-500">{t('unitDetail.loadingUnit')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !module) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-50 dark:bg-background-dark">
        <div className="text-center px-4">
          <span className="material-symbols-outlined text-5xl text-red-400 mb-3">
            error_outline
          </span>
          <p className="text-gray-900 dark:text-white font-bold mb-2">{t('unitDetail.unitNotFound')}</p>
          <p className="text-gray-500 mb-4">{error || t('unitDetail.couldNotLoad')}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-primary text-white rounded-xl font-medium"
          >
            {t('common.goBack')}
          </button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    if (newDirection > 0 && currentIndex < cards.length - 1) {
      setDirection(1);
      setCurrentIndex(currentIndex + 1);
    } else if (newDirection < 0 && currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToCard = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
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

  const gameState = { inLibrary, courseId };

  const actions = [
    {
      id: 'flashcards',
      icon: 'style',
      label: t('unitDetail.flashcards'),
      description: t('unitDetail.flashcardsDesc'),
      color: 'bg-primary/10 text-primary',
      onClick: () => navigate(`/unit/${unitId}/flashcards`, { state: gameState }),
    },
    {
      id: 'test',
      icon: 'quiz',
      label: t('unitDetail.test'),
      description: t('unitDetail.testDesc'),
      color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      onClick: () => navigate(`/unit/${unitId}/test`, { state: gameState }),
    },
    {
      id: 'match',
      icon: 'extension',
      label: t('unitDetail.matchGame'),
      description: t('unitDetail.matchGameDesc'),
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      onClick: () => navigate(`/unit/${unitId}/match`, { state: gameState }),
    },
    {
      id: 'write',
      icon: 'edit_note',
      label: t('unitDetail.write'),
      description: t('unitDetail.writeDesc'),
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      onClick: () => navigate(`/unit/${unitId}/write`, { state: gameState }),
    },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto overflow-x-hidden bg-gray-50 dark:bg-background-dark">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center p-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center text-gray-900 dark:text-white"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-gray-900 dark:text-white text-base font-bold">{module.title}</h1>
            <p className="text-xs text-gray-500">{t('unitDetail.cards', { count: cards.length })}</p>
          </div>
          <div className="w-10" />
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 pb-24"
      >
        {/* Card Swiper */}
        {cards.length > 0 && (
          <motion.div variants={itemVariants} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-gray-900 dark:text-white text-base font-semibold">{t('unitDetail.previewCards')}</h2>
              <span className="text-sm text-gray-500">{currentIndex + 1} / {cards.length}</span>
            </div>

            {/* Card Swiper */}
            <div
              ref={containerRef}
              className="relative overflow-visible"
              style={{ height: '480px' }}
            >
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: 'spring', stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={1}
                  onDragEnd={(_e, { offset, velocity }) => {
                    const swipe = swipePower(offset.x, velocity.x);
                    if (swipe < -swipeConfidenceThreshold) {
                      paginate(1);
                    } else if (swipe > swipeConfidenceThreshold) {
                      paginate(-1);
                    }
                  }}
                  className="absolute w-full"
                >
                  {currentCard && (
                    <UnitCardPreview
                      card={currentCard}
                      isFavorite={favoriteCardIds.has(currentCard.id)}
                      onToggleFavorite={() => toggleFavorite(currentCard)}
                      isProcessing={isFavoriteProcessing}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Dots */}
            <div className="relative z-20 flex items-center justify-center gap-1.5 mt-6 w-full">
              {cards.slice(0, 10).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToCard(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-primary w-6'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
              {cards.length > 10 && (
                <span className="text-xs text-gray-400 ml-1">+{cards.length - 10}</span>
              )}
            </div>

            {/* Swipe Hint */}
            <p className="text-center text-gray-400 text-xs mt-3">
              {t('unitDetail.swipeToBrowse')}
            </p>
          </motion.div>
        )}

        {/* No Cards State */}
        {cards.length === 0 && (
          <motion.div variants={itemVariants} className="p-4">
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl">
              <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">
                style
              </span>
              <p className="text-gray-500">{t('unitDetail.noCardsYet')}</p>
            </div>
          </motion.div>
        )}

        {/* Learning Actions */}
        <motion.div variants={itemVariants} className="p-4">
          <h2 className="text-gray-900 dark:text-white text-base font-semibold mb-3">
            {t('unitDetail.startLearning')}
          </h2>

          {/* 24h cooldown paywall — shown to free users who finished a
              recent unit and are trying to open a new one. */}
          {inLibrary && isLockedByCooldown && (
            <PaywallBanner
              variant="nextUnitLocked"
              msRemaining={canStartNewUnit.msRemaining}
              className="mx-0"
            />
          )}

          {/* Not in library banner */}
          {!inLibrary && (
            <div className="mb-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-amber-500 text-xl mt-0.5">lock</span>
                <div className="flex-1">
                  <p className="text-amber-800 dark:text-amber-300 font-semibold text-sm">
                    {t('unitDetail.addCourseToLibrary')}
                  </p>
                  <p className="text-amber-600 dark:text-amber-400 text-xs mt-0.5">
                    {t('unitDetail.addCourseDesc')}
                  </p>
                  {courseId && (
                    <button
                      onClick={() => navigate(`/courses/${courseId}`)}
                      className="mt-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-xs font-bold"
                    >
                      {t('unitDetail.goToCourse')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {actions.map((action) => {
              const actionDisabled =
                cards.length === 0 || !inLibrary || isLockedByCooldown;
              return (
                <button
                  key={action.id}
                  onClick={!actionDisabled ? action.onClick : undefined}
                  disabled={actionDisabled}
                  className={`flex flex-col items-start p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-left transition-transform disabled:opacity-50 disabled:cursor-not-allowed ${!actionDisabled ? 'active:scale-[0.98]' : ''}`}
                >
                  <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-3 relative`}>
                    <span className="material-symbols-outlined text-2xl">{action.icon}</span>
                    {(!inLibrary || isLockedByCooldown) && (
                      <span className="absolute -top-1 -right-1 material-symbols-outlined text-amber-500 text-sm bg-white dark:bg-gray-800 rounded-full">lock</span>
                    )}
                  </div>
                  <h3 className="text-gray-900 dark:text-white font-semibold">{action.label}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Card List */}
        {cards.length > 0 && (
          <motion.div variants={itemVariants} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-gray-900 dark:text-white text-base font-semibold">{t('unitDetail.allCards')}</h2>
              <span className="text-gray-500 text-sm">{t('unitDetail.total', { count: cards.length })}</span>
            </div>
            <div className="space-y-2">
              {(showAllCards ? cards : cards.slice(0, 5)).map((card, index) => {
                const translation = card.translations?.find(t => t.locale === 'EN') || card.translations?.[0];
                const isCardFavorite = favoriteCardIds.has(card.id);
                return (
                  <div
                    key={card.id}
                    onClick={() => goToCard(index)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 cursor-pointer active:scale-[0.98] transition-transform"
                  >
                    <AppImage
                      src={card.image ? getImageUrl(card.image) : undefined}
                      alt={card.term}
                      className="w-10 h-10 rounded-lg object-cover"
                      fallbackIcon="style"
                      fallbackClassName="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-gray-900 dark:text-white font-medium truncate">{card.term}</h3>
                      <p className="text-xs text-gray-500 truncate">{translation?.value || t('common.noTranslation')}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(card);
                      }}
                      disabled={isFavoriteProcessing}
                      className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors disabled:opacity-50 ${
                        isCardFavorite
                          ? 'text-amber-500'
                          : 'text-gray-300 hover:text-amber-400'
                      }`}
                    >
                      <span
                        className="material-symbols-outlined text-xl"
                        style={{ fontVariationSettings: isCardFavorite ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        star
                      </span>
                    </button>
                    <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                  </div>
                );
              })}
              {cards.length > 5 && !showAllCards && (
                <button
                  onClick={() => setShowAllCards(true)}
                  className="w-full text-center text-primary font-medium text-sm py-2 rounded-xl hover:bg-primary/5 active:bg-primary/10 transition-colors cursor-pointer"
                >
                  {t('unitDetail.moreCards', { count: cards.length - 5 })}
                </button>
              )}
              {cards.length > 5 && showAllCards && (
                <button
                  onClick={() => setShowAllCards(false)}
                  className="w-full text-center text-primary font-medium text-sm py-2 rounded-xl hover:bg-primary/5 active:bg-primary/10 transition-colors cursor-pointer"
                >
                  {t('unitDetail.showLess')}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default UnitDetail;
