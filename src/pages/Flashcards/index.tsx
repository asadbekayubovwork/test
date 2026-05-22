import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { useTranslation } from '../../lib/i18n';
import { useTelegram } from '../../lib/telegram/index';
import {
  useTrainingStore,
  useSubscriptionStore,
  useUsageStore,
} from '../../lib/stores';
import { getImageUrl } from '../../lib/api/courses';
import { AppImage } from '../../components/ui';
import LibraryGuard from '../../components/ui/LibraryGuard';
import PaywallBanner from '../../components/PaywallBanner';
import { FREE_TIER_LIMITS } from '../../lib/constants/freeTierLimits';
import type { TrainingResponse } from '../../lib/api';

const SWIPE_THRESHOLD = 100;
const ROTATION_RANGE = 15;

// Separate SwipeCard component with its own motion values
interface SwipeCardProps {
  training: TrainingResponse;
  onSwipe: (direction: 'left' | 'right', cardId: number) => Promise<void>;
  swipeFeedback: 'left' | 'right' | null;
  setSwipeFeedback: (feedback: 'left' | 'right' | null) => void;
  isSubmitting: boolean;
  isFlipped: boolean;
  onFlip: () => void;
}

const SwipeCard = ({
  training,
  onSwipe,
  swipeFeedback,
  setSwipeFeedback,
  isSubmitting,
  isFlipped,
  onFlip,
}: SwipeCardProps) => {
  const { t } = useTranslation();
  // Each card has its own motion values - this is the key fix!
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-ROTATION_RANGE, ROTATION_RANGE]);

  const card = training.card;
  const translation = card.translations?.find(t => t.locale === 'EN') || card.translations?.[0];
  const sample = card.samples?.[0];

  const handleDragEnd = async (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (isSubmitting) return;

    const swipeDistance = info.offset.x;
    const velocity = info.velocity.x;

    // Check if swipe is strong enough
    if (Math.abs(swipeDistance) > SWIPE_THRESHOLD || Math.abs(velocity) > 500) {
      const direction = swipeDistance > 0 ? 'right' : 'left';
      await onSwipe(direction, card.id);
    } else {
      // Snap back to center if swipe wasn't strong enough
      setSwipeFeedback(null);
    }
  };

  const handleDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const dragX = info.offset.x;

    if (dragX > SWIPE_THRESHOLD / 2) {
      setSwipeFeedback('right');
    } else if (dragX < -SWIPE_THRESHOLD / 2) {
      setSwipeFeedback('left');
    } else {
      setSwipeFeedback(null);
    }
  };

  return (
    <motion.div
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0, x: 0 }}
      animate={{ scale: 1, opacity: 1, x: 0 }}
      exit={{
        x: swipeFeedback === 'right' ? 400 : swipeFeedback === 'left' ? -400 : 0,
        opacity: 0,
        transition: { duration: 0.3 }
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="absolute w-full max-w-[340px] cursor-grab active:cursor-grabbing z-10"
    >
      <div
        className="w-full rounded-xl bg-white dark:bg-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden border border-gray-100 dark:border-gray-700 relative select-none"
        style={{ aspectRatio: '3/4' }}
        onClick={onFlip}
      >
        {/* Card Image */}
        {card.image && (
          <div className="h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <AppImage
              src={getImageUrl(card.image)}
              alt={card.term}
              className="w-full h-full object-cover"
              draggable={false}
              fallbackIcon="image"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
          <p className="text-primary text-xs font-semibold uppercase tracking-wider mb-2">
            {isFlipped ? t('flashcards.translation') : t('flashcards.term')}
          </p>

          {!isFlipped ? (
            <>
              <h1 className="text-gray-900 dark:text-white text-3xl font-bold leading-tight mb-4">
                {card.term}
              </h1>
              {sample && (
                <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                  "{sample.value}"
                </p>
              )}
            </>
          ) : (
            <>
              <h1 className="text-gray-900 dark:text-white text-2xl font-bold leading-tight mb-4">
                {translation?.value || t('common.noTranslation')}
              </h1>
              {sample?.translation && (
                <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                  "{sample.translation}"
                </p>
              )}
            </>
          )}

          <p className="text-gray-400 text-xs mt-4">
            {isFlipped ? t('flashcards.tapToSeeTerm') : t('flashcards.tapToSeeTranslation')}
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 flex justify-between items-center border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {training.progress.isAnswered && (
              <span className={`px-2 py-1 rounded-full ${training.progress.isKnown ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {training.progress.isKnown ? t('flashcards.known') : t('flashcards.learning')}
              </span>
            )}
            {training.progress.isFavorites && (
              <span className="material-symbols-outlined text-yellow-500 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Add audio playback
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary font-medium text-sm"
          >
            <span className="material-symbols-outlined text-lg">volume_up</span>
          </button>
        </div>

        {/* Swipe Feedback Overlay */}
        <AnimatePresence>
          {swipeFeedback === 'right' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-green-500/20 backdrop-blur-[1px] flex items-center justify-center pointer-events-none rounded-xl"
            >
              <div className="border-4 border-green-500 px-6 py-2 rounded-lg transform -rotate-12 bg-white/80">
                <span className="text-green-500 text-3xl font-black uppercase tracking-widest">{t('flashcards.iKnow')}</span>
              </div>
            </motion.div>
          )}
          {swipeFeedback === 'left' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-red-500/20 backdrop-blur-[1px] flex items-center justify-center pointer-events-none rounded-xl"
            >
              <div className="border-4 border-red-500 px-6 py-2 rounded-lg transform rotate-12 bg-white/80">
                <span className="text-red-500 text-3xl font-black uppercase tracking-widest">{t('flashcards.learning')}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const Flashcards = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { unitId } = useParams<{ unitId: string }>();
  const { haptic } = useTelegram();

  const {
    trainingCards,
    currentCardIndex,
    isLoading,
    isSubmitting,
    error,
    warning,
    knownCount,
    unknownCount,
    isOfflineMode,
    fetchTraining,
    submitAnswer,
    nextCard,
    previousCard,
    resetProgress,
    resetSession,
    getCurrentCard,
    getProgress,
    isCompleted,
    clearWarning,
  } = useTrainingStore();

  const [swipeFeedback, setSwipeFeedback] = useState<'left' | 'right' | null>(null);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  // Free-tier daily new-words counter. Each unique card seen counts as one
  // new word; once the cap is hit the user can keep reviewing already-seen
  // cards but new ones get a paywall.
  const isPremium = useSubscriptionStore((s) => s.isPremium());
  const recordNewWord = useUsageStore((s) => s.recordNewWord);
  const recordRepetition = useUsageStore((s) => s.recordRepetition);
  const remainingNewWords = useUsageStore((s) => s.remainingNewWords());
  const seenWordIds = useUsageStore((s) => s.daily.newWordIds);

  // Fetch training data on mount
  useEffect(() => {
    if (unitId) {
      fetchTraining(parseInt(unitId, 10));
    }

    return () => {
      resetSession();
    };
  }, [unitId, fetchTraining, resetSession]);

  const currentTraining = getCurrentCard();
  const progress = getProgress();
  const completed = isCompleted();

  const handleSwipe = useCallback(async (direction: 'left' | 'right', cardId: number) => {
    if (isSubmitting) return;

    const known = direction === 'right';

    // Haptic feedback
    if (known) {
      haptic.notification('success');
    } else {
      haptic.impact('medium');
    }

    // Submit to API
    await submitAnswer(cardId, known);

    // Free-tier counters: each unique card = +1 new word, every swipe = +1 rep.
    if (!isPremium) {
      recordNewWord(String(cardId));
      recordRepetition();
    }

    // Move to next card
    nextCard();
    setSwipeFeedback(null);
  }, [isSubmitting, haptic, submitAnswer, nextCard, isPremium, recordNewWord, recordRepetition]);

  // Programmatic swipe from buttons
  const handleButtonSwipe = useCallback(async (direction: 'left' | 'right') => {
    if (isSubmitting || !currentTraining) return;

    setSwipeFeedback(direction);

    // Small delay for visual feedback then swipe
    setTimeout(async () => {
      await handleSwipe(direction, currentTraining.card.id);
    }, 150);
  }, [isSubmitting, currentTraining, handleSwipe]);

  const handleUndo = useCallback(() => {
    if (currentCardIndex > 0) {
      haptic.impact('light');
      previousCard();
    }
  }, [haptic, currentCardIndex, previousCard]);

  const handleRestart = useCallback(async () => {
    if (unitId) {
      haptic.impact('medium');
      setFlippedCards(new Set());
      await resetProgress(parseInt(unitId, 10));
    }
  }, [unitId, haptic, resetProgress]);

  const toggleFlip = useCallback((cardId: number) => {
    setFlippedCards(prev => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  }, []);

  // Loading state
  if (isLoading) {
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
            <p className="text-gray-500">{t('flashcards.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    const handleCopyDebug = () => {
      const debugInfo = `Error: ${error}\n\nModule ID: ${unitId || 'N/A'}\nCard Index: ${currentCardIndex}\nCards Loaded: ${trainingCards.length}\nOffline Mode: ${isOfflineMode}\n\nTimestamp: ${new Date().toISOString()}\nURL: ${window.location.href}\nUserAgent: ${navigator.userAgent}`;
      navigator.clipboard.writeText(debugInfo).then(() => {
        // Brief visual feedback handled by state below
      });
    };

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
            <p className="text-gray-900 dark:text-white font-bold mb-2">{t('common.failedToLoad')}</p>
            <p className="text-gray-500 text-sm mb-1">{error}</p>
            <p className="text-gray-400 text-xs mb-4 font-mono">Module: {unitId || 'N/A'}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => unitId && fetchTraining(parseInt(unitId, 10))}
                className="px-6 py-3 bg-primary text-white rounded-xl font-medium"
              >
                {t('common.tryAgain')}
              </button>
              <button
                onClick={handleCopyDebug}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">content_copy</span>
                {t('common.copyDebug')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No cards state
  if (trainingCards.length === 0) {
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
            <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">
              style
            </span>
            <p className="text-gray-900 dark:text-white font-bold mb-2">{t('flashcards.noFlashcards')}</p>
            <p className="text-gray-500 mb-4">{t('flashcards.noCardsInUnit')}</p>
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

  // Completion Screen
  if (completed || currentCardIndex >= trainingCards.length) {
    const totalReviewed = knownCount + unknownCount;
    const accuracy = totalReviewed > 0 ? Math.round((knownCount / totalReviewed) * 100) : 0;

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
            {t('flashcards.sessionComplete')}
          </h2>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mb-6"
          >
            <span className="material-symbols-outlined text-6xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              celebration
            </span>
          </motion.div>

          <h1 className="text-gray-900 dark:text-white text-2xl font-bold mb-2">{t('flashcards.greatJob')}</h1>
          <p className="text-gray-500 text-center mb-8">
            {t('flashcards.completedSession')}
          </p>

          <div className="w-full max-w-xs grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 text-center">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{knownCount}</p>
              <p className="text-sm text-green-600/70 dark:text-green-400/70">{t('flashcards.known')}</p>
            </div>
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-center">
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{unknownCount}</p>
              <p className="text-sm text-red-600/70 dark:text-red-400/70">{t('flashcards.toReview')}</p>
            </div>
          </div>

          <div className="w-full max-w-xs p-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-center mb-8">
            <p className="text-gray-500 text-sm mb-1">{t('flashcards.accuracy')}</p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white">{accuracy}%</p>
          </div>

          <div className="w-full max-w-xs space-y-3">
            <button
              onClick={handleRestart}
              disabled={isLoading}
              className="w-full py-4 rounded-xl bg-primary text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  {t('flashcards.resetting')}
                </>
              ) : (
                t('flashcards.practiceAgain')
              )}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full py-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold"
            >
              {t('flashcards.backToUnit')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Free-tier new-words paywall: if the next card hasn't been seen today
  // and the user has no allowance left, block the swipe screen entirely.
  if (
    !isPremium &&
    remainingNewWords <= 0 &&
    currentTraining &&
    !seenWordIds.includes(String(currentTraining.card.id))
  ) {
    return (
      <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto bg-white dark:bg-background-dark">
        <div className="flex items-center p-4">
          <button
            onClick={() => navigate(-1)}
            className="w-12 h-12 flex items-center justify-center text-gray-900 dark:text-white"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <PaywallBanner
            variant="dailyLimit"
            msRemaining={
              FREE_TIER_LIMITS.UNIT_COOLDOWN_HOURS * 60 * 60 * 1000
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full max-w-[430px] mx-auto flex-col bg-white dark:bg-background-dark">
      {/* Warning Banner */}
      <AnimatePresence>
        {warning && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-0 left-0 right-0 z-[100] bg-amber-500 text-white px-4 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-2 flex-1">
              <span className="material-symbols-outlined text-lg">info</span>
              <p className="text-sm font-medium">{warning}</p>
            </div>
            <button
              onClick={clearWarning}
              className="ml-2 p-1 hover:bg-amber-600 rounded"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline Mode Indicator */}
      {isOfflineMode && !warning && (
        <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-4 py-2 flex items-center justify-center gap-2 text-xs font-medium">
          <span className="material-symbols-outlined text-sm">cloud_off</span>
          {t('flashcards.practiceMode')}
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-background-dark/90 backdrop-blur-md">
        <div className="flex items-center p-4 pb-2 justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-12 h-12 flex items-center justify-center text-gray-900 dark:text-white"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <h2 className="text-gray-900 dark:text-white text-lg font-bold flex-1 text-center pr-12">
            {currentCardIndex + 1} / {trainingCards.length}
          </h2>
        </div>

        {/* Progress Bar */}
        <div className="flex flex-col gap-3 px-6 pb-3">
          <div className="rounded bg-gray-200 dark:bg-white/10 overflow-hidden">
            <div
              className="h-1.5 rounded bg-primary transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card Area */}
      <div className="relative flex items-center justify-center px-6 py-4" style={{ minHeight: '460px' }}>
        {/* Background card shadow for stack effect */}
        {currentCardIndex < trainingCards.length - 1 && (
          <div className="absolute left-10 right-10 top-10 bottom-10 transform scale-[0.92] opacity-30 rounded-xl bg-gray-200 dark:bg-gray-700 -z-10" />
        )}

        {/* Card Stack */}
        <AnimatePresence mode="wait">
          {currentTraining && (
            <SwipeCard
              key={currentTraining.card.id}
              training={currentTraining}
              onSwipe={handleSwipe}
              swipeFeedback={swipeFeedback}
              setSwipeFeedback={setSwipeFeedback}
              isSubmitting={isSubmitting}
              isFlipped={flippedCards.has(currentTraining.card.id)}
              onFlip={() => toggleFlip(currentTraining.card.id)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Swipe Hint */}
      <p className="text-center text-gray-400 text-xs px-6 pb-2">
        {t('flashcards.swipeHint')}
      </p>

      {/* Bottom Controls */}
      <div className="px-6 py-6">
        <div className="flex items-center justify-center gap-4">
          {/* Don't Know - Left */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => handleButtonSwipe('left')}
              disabled={isSubmitting}
              className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500 text-white shadow-lg active:scale-95 transition-transform disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>
            <span className="text-xs text-gray-500">{t('flashcards.dontKnow')}</span>
          </div>
          {/* Undo - Center */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleUndo}
              disabled={currentCardIndex === 0}
              className={`flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 transition-all ${
                currentCardIndex === 0 ? 'opacity-40' : 'active:scale-95'
              }`}
            >
              <span className="material-symbols-outlined text-3xl text-primary">undo</span>
            </button>
            <span className="text-xs text-gray-500">{t('flashcards.undo')}</span>
          </div>
          {/* Know - Right */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => handleButtonSwipe('right')}
              disabled={isSubmitting}
              className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500 text-white shadow-lg active:scale-95 transition-transform disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-3xl">check</span>
            </button>
            <span className="text-xs text-gray-500">{t('flashcards.know')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const FlashcardsWithGuard = () => (
  <LibraryGuard>
    <Flashcards />
  </LibraryGuard>
);

export default FlashcardsWithGuard;
