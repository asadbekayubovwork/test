import { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTelegram } from '../../lib/telegram/index';
import {
  useQuizStore,
  useSubscriptionStore,
  useUsageStore,
} from '../../lib/stores';
import { getImageUrl } from '../../lib/api/courses';
import { AppImage } from '../../components/ui';
import LibraryGuard from '../../components/ui/LibraryGuard';
import PaywallBanner from '../../components/PaywallBanner';
import { useTranslation } from '../../lib/i18n';
import { FREE_TIER_LIMITS } from '../../lib/constants/freeTierLimits';

const Tests = () => {
  const navigate = useNavigate();
  const { unitId } = useParams<{ unitId: string }>();
  const { haptic } = useTelegram();
  const { t } = useTranslation();

  const {
    questions,
    currentQuestionIndex,
    isLoading,
    isSubmitting,
    error,
    warning,
    selectedOptionId,
    answerResult,
    showResult,
    isOfflineMode,
    fetchQuiz,
    selectOption,
    submitAnswer,
    nextQuestion,
    resetQuiz,
    resetSession,
    getCurrentQuestion,
    getProgress,
    isCompleted,
    getScore,
    clearWarning,
  } = useQuizStore();

  // Fetch quiz data on mount
  useEffect(() => {
    if (unitId) {
      fetchQuiz(parseInt(unitId, 10));
    }

    return () => {
      resetSession();
    };
  }, [unitId, fetchQuiz, resetSession]);

  const currentQuestion = getCurrentQuestion();
  const progress = getProgress();
  const completed = isCompleted();
  const score = getScore();

  // Free-tier gating: cap repetitions/day; record on every submitted answer.
  const isPremium = useSubscriptionStore((s) => s.isPremium());
  const remainingReps = useUsageStore((s) => s.remainingRepetitions());
  const recordRepetition = useUsageStore((s) => s.recordRepetition);
  const recordUnitCompleted = useUsageStore((s) => s.recordUnitCompleted);
  const repsBlocked = !isPremium && remainingReps <= 0;
  // Record one completion event per visit when the quiz finishes.
  const completionRecordedRef = useRef(false);
  useEffect(() => {
    if (completed && unitId && !completionRecordedRef.current) {
      recordUnitCompleted(unitId);
      completionRecordedRef.current = true;
    }
  }, [completed, unitId, recordUnitCompleted]);

  const handleSelectOption = useCallback(
    (optionId: number) => {
      if (showResult || isSubmitting) return;
      haptic.selection();
      selectOption(optionId);
    },
    [showResult, isSubmitting, haptic, selectOption]
  );

  const handleSubmitAnswer = useCallback(async () => {
    if (selectedOptionId === null || isSubmitting) return;
    await submitAnswer();
    // Count this submission against the free-tier daily repetitions cap.
    if (!isPremium) recordRepetition();

    if (answerResult?.correct) {
      haptic.notification('success');
    } else {
      haptic.notification('error');
    }
  }, [
    selectedOptionId,
    isSubmitting,
    submitAnswer,
    answerResult,
    haptic,
    isPremium,
    recordRepetition,
  ]);

  const handleContinue = useCallback(() => {
    haptic.impact('light');
    nextQuestion();
  }, [haptic, nextQuestion]);

  const handleRestart = useCallback(async () => {
    if (unitId) {
      haptic.impact('medium');
      await resetQuiz(parseInt(unitId, 10));
    }
  }, [unitId, haptic, resetQuiz]);

  const optionLabels = ['A', 'B', 'C', 'D'];

  // Free-tier daily repetitions cap reached — block before showing the
  // quiz UI. Premium users skip this branch entirely.
  if (repsBlocked && !completed) {
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
            // Soft hint of "tomorrow"; the usageStore doesn't track the
            // exact reset moment for repetitions (it's local-day rollover).
            msRemaining={
              FREE_TIER_LIMITS.UNIT_COOLDOWN_HOURS * 60 * 60 * 1000
            }
          />
        </div>
      </div>
    );
  }

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
            <p className="text-gray-500">{t('tests.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
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
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => unitId && fetchQuiz(parseInt(unitId, 10))}
              className="px-6 py-3 bg-primary text-white rounded-xl font-medium"
            >
              {t('common.tryAgain')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No questions state
  if (questions.length === 0) {
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
              quiz
            </span>
            <p className="text-gray-900 dark:text-white font-bold mb-2">{t('tests.noQuestions')}</p>
            <p className="text-gray-500 mb-4">{t('tests.notEnoughCards')}</p>
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
  if (completed || currentQuestionIndex >= questions.length) {
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
            {t('tests.quizComplete')}
          </h2>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 ${
              score.passed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
            }`}
          >
            <span
              className={`material-symbols-outlined text-6xl ${
                score.passed ? 'text-green-500' : 'text-red-500'
              }`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {score.passed ? 'emoji_events' : 'sentiment_dissatisfied'}
            </span>
          </motion.div>

          <h1 className="text-gray-900 dark:text-white text-2xl font-bold mb-2">
            {score.passed ? t('tests.congratulations') : t('tests.keepPracticing')}
          </h1>
          <p className="text-gray-500 text-center mb-8">
            {score.passed
              ? t('tests.passedQuiz')
              : t('tests.need70')}
          </p>

          {isOfflineMode && (
            <div className="w-full max-w-xs mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-center">
              <p className="text-amber-700 dark:text-amber-400 text-sm">
                {t('tests.practiceMode')}
              </p>
            </div>
          )}

          <div className="w-full max-w-xs grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 text-center">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{score.correct}</p>
              <p className="text-sm text-green-600/70 dark:text-green-400/70">{t('tests.correct')}</p>
            </div>
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-center">
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{score.incorrect}</p>
              <p className="text-sm text-red-600/70 dark:text-red-400/70">{t('tests.incorrect')}</p>
            </div>
          </div>

          <div className="w-full max-w-xs p-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-center mb-8">
            <p className="text-gray-500 text-sm mb-1">{t('tests.score')}</p>
            <p className={`text-4xl font-bold ${score.passed ? 'text-green-500' : 'text-red-500'}`}>
              {score.percentage}%
            </p>
          </div>

          <div className="w-full max-w-xs space-y-3">
            <button
              onClick={handleRestart}
              disabled={isLoading}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 ${
                score.passed ? 'bg-primary text-white' : 'bg-red-500 text-white'
              } disabled:opacity-50`}
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  {t('tests.resetting')}
                </>
              ) : (
                score.passed ? t('common.tryAgain') : t('tests.retryQuiz')
              )}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full py-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold"
            >
              {t('tests.backToUnit')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Question Screen
  return (
    <div className="relative flex min-h-screen w-full max-w-[430px] mx-auto flex-col bg-white dark:bg-background-dark overflow-x-hidden">
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
            <button onClick={clearWarning} className="ml-2 p-1 hover:bg-amber-600 rounded">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline Mode Indicator */}
      {isOfflineMode && !warning && (
        <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-4 py-2 flex items-center justify-center gap-2 text-xs font-medium">
          <span className="material-symbols-outlined text-sm">cloud_off</span>
          {t('tests.practiceMode')}
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
            {t('tests.vocabularyQuiz')}
          </h2>
        </div>

        {/* Progress Bar */}
        <div className="flex flex-col gap-3 px-4 pb-3">
          <div className="flex gap-6 justify-between">
            <p className="text-gray-900 dark:text-white text-base font-medium opacity-80">
              {t('tests.questionProgress')}
            </p>
            <p className="text-gray-900 dark:text-white text-sm font-normal">
              {progress.current}/{progress.total}
            </p>
          </div>
          <div className="rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div
              className="h-2 rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Section */}
      {currentQuestion && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.2 }}
            className="py-6"
          >
            {/* Card Image (if available) */}
            {currentQuestion.card?.image && (
              <div className="mx-4 mb-4 rounded-xl overflow-hidden" style={{ height: '300px' }}>
                <AppImage
                  src={getImageUrl(currentQuestion.card.image)}
                  alt={currentQuestion.card.term}
                  className="w-full h-full object-cover"
                  fallbackIcon="image"
                />
              </div>
            )}

            <h3 className="text-gray-900 dark:text-white text-2xl font-bold leading-tight px-4 text-center">
              {currentQuestion.card?.term || t('tests.question')}
            </h3>

            <p className="text-gray-900 dark:text-white text-base font-medium pb-2 pt-4 px-4 text-center">
              {currentQuestion.question || t('tests.whatIsTranslation')}
            </p>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Answer Options */}
      <div className="flex flex-col gap-3 px-4 pb-48">
        {currentQuestion?.options.map((option, index) => {
          const isSelected = selectedOptionId === option.id;
          const isCorrectOption = showResult && option.isCorrect;
          const isWrong = showResult && isSelected && !option.isCorrect;

          let containerClass = 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700';
          let iconClass = 'text-gray-900 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';

          if (isCorrectOption) {
            containerClass = 'bg-green-50 dark:bg-green-900/30 border-2 border-green-500';
            iconClass = 'text-white bg-green-500';
          } else if (isWrong) {
            containerClass = 'bg-red-50 dark:bg-red-900/30 border-2 border-red-500';
            iconClass = 'text-white bg-red-500';
          } else if (isSelected && !showResult) {
            containerClass = 'bg-primary/10 border-2 border-primary';
            iconClass = 'text-white bg-primary';
          }

          return (
            <motion.button
              key={option.id}
              onClick={() => handleSelectOption(option.id)}
              disabled={showResult}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-4 ${containerClass} rounded-xl px-4 min-h-[72px] py-3 justify-between text-left ${
                !showResult ? 'active:scale-[0.98]' : ''
              } transition-transform`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex items-center justify-center rounded-lg shrink-0 w-12 h-12 ${iconClass}`}
                >
                  {isCorrectOption ? (
                    <span className="material-symbols-outlined">check_circle</span>
                  ) : isWrong ? (
                    <span className="material-symbols-outlined">cancel</span>
                  ) : (
                    <span className="text-lg font-bold">{optionLabels[index]}</span>
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  <p
                    className={`text-gray-900 dark:text-white text-base ${
                      isCorrectOption || isWrong ? 'font-semibold' : 'font-medium'
                    }`}
                  >
                    {option.value}
                  </p>
                  {isCorrectOption && (
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                      {t('tests.correctAnswer')}
                    </p>
                  )}
                  {isWrong && (
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                      {t('tests.yourSelection')}
                    </p>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Submit Button (when option selected but not submitted) */}
      <AnimatePresence>
        {selectedOptionId !== null && !showResult && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-16 left-0 right-0 max-w-[430px] mx-auto p-4 pb-6 bg-white dark:bg-background-dark border-t border-gray-100 dark:border-gray-800 z-50"
          >
            <button
              onClick={handleSubmitAnswer}
              disabled={isSubmitting}
              className="w-full font-bold py-4 rounded-xl bg-primary text-white transition-colors active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-lg">
                    progress_activity
                  </span>
                  {t('tests.checking')}
                </>
              ) : (
                t('tests.submitAnswer')
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback & Continue Footer */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className={`fixed bottom-16 left-0 right-0 max-w-[430px] mx-auto p-4 pb-6 border-t z-50 ${
              answerResult?.correct
                ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30'
                : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <span
                className={`material-symbols-outlined ${
                  answerResult?.correct
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {answerResult?.correct ? 'check_circle' : 'error'}
              </span>
              <p
                className={`font-bold text-lg ${
                  answerResult?.correct
                    ? 'text-green-800 dark:text-green-200'
                    : 'text-red-800 dark:text-red-200'
                }`}
              >
                {answerResult?.correct ? t('tests.greatJob') : t('tests.dontGiveUp')}
              </p>
            </div>

            {currentQuestion?.card?.samples?.[0] && (
              <p
                className={`text-sm mb-4 ${
                  answerResult?.correct
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-red-700 dark:text-red-300'
                }`}
              >
                {t('tests.example')}: "{currentQuestion.card.samples[0].value}"
              </p>
            )}

            <button
              onClick={handleContinue}
              className={`w-full font-bold py-4 rounded-xl transition-colors active:scale-[0.98] ${
                answerResult?.correct
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {currentQuestionIndex >= questions.length - 1 ? t('tests.seeResults') : t('common.continue')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TestsWithGuard = () => (
  <LibraryGuard>
    <Tests />
  </LibraryGuard>
);

export default TestsWithGuard;
