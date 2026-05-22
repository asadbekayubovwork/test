import { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTelegram } from '../../lib/telegram/index';
import { useWriteStore } from '../../lib/stores/writeStore';
import { useCoursesStore } from '../../lib/stores';
import { getImageUrl } from '../../lib/api/courses';
import { AppImage } from '../../components/ui';
import LibraryGuard from '../../components/ui/LibraryGuard';
import { useTranslation } from '../../lib/i18n';

const Write = () => {
  const navigate = useNavigate();
  const { unitId } = useParams<{ unitId: string }>();
  const { haptic } = useTelegram();
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    questions,
    currentQuestionIndex,
    userInput,
    isAnswerSubmitted,
    isCorrect,
    showHint,
    isComplete,
    initializeGame,
    setUserInput,
    submitAnswer,
    skipQuestion,
    revealHint,
    nextQuestion,
    resetGame,
    resetSession,
    getCurrentQuestion,
    getProgress,
    getScore,
  } = useWriteStore();

  const {
    moduleCards: cards,
    isLoadingCards,
    cardsError,
    fetchModuleCards,
  } = useCoursesStore();

  // Fetch cards on mount and clean up on unmount
  useEffect(() => {
    if (unitId) {
      fetchModuleCards(parseInt(unitId, 10));
    }

    return () => {
      resetSession();
    };
  }, [unitId, fetchModuleCards, resetSession]);

  // Initialize game when cards are loaded
  useEffect(() => {
    if (cards.length > 0) {
      initializeGame(cards);
    }
  }, [cards, initializeGame]);

  // Focus input when question changes
  useEffect(() => {
    if (!isAnswerSubmitted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentQuestionIndex, isAnswerSubmitted]);

  const currentQuestion = getCurrentQuestion();
  const progress = getProgress();
  const score = getScore();

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isAnswerSubmitted) {
        setUserInput(e.target.value);
      }
    },
    [isAnswerSubmitted, setUserInput]
  );

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (isAnswerSubmitted) {
        nextQuestion();
        haptic.impact('light');
      } else if (userInput.trim()) {
        submitAnswer();
        if (isCorrect) {
          haptic.notification('success');
        } else {
          haptic.notification('error');
        }
      }
    },
    [isAnswerSubmitted, userInput, submitAnswer, nextQuestion, isCorrect, haptic]
  );

  const handleSkip = useCallback(() => {
    haptic.impact('light');
    skipQuestion();
  }, [haptic, skipQuestion]);

  const handleHint = useCallback(() => {
    haptic.selection();
    revealHint();
  }, [haptic, revealHint]);

  const handlePlayAgain = useCallback(() => {
    haptic.impact('medium');
    resetGame();
  }, [haptic, resetGame]);

  // Loading state
  if (isLoadingCards) {
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
            <p className="text-gray-500">{t('write.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (cardsError || cards.length < 1) {
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
            <p className="text-gray-900 dark:text-white font-bold mb-2">
              {cardsError || t('write.noCards')}
            </p>
            <p className="text-gray-500 mb-4">
              {t('write.needCards')}
            </p>
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

  // Complete Screen
  if (isComplete) {
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
            {t('write.practiceComplete')}
          </h2>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 ${
              score.passed
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-red-100 dark:bg-red-900/30'
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
            {score.passed ? t('write.greatJob') : t('write.keepPracticing')}
          </h1>
          <p className="text-gray-500 text-center mb-8">
            {score.passed
              ? t('write.didWell')
              : t('write.need70')}
          </p>

          {/* Stats */}
          <div className="w-full max-w-xs grid grid-cols-3 gap-3 mb-6">
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {score.correct}
              </p>
              <p className="text-xs text-green-600/70 dark:text-green-400/70">{t('write.correct')}</p>
            </div>
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-center">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {score.incorrect}
              </p>
              <p className="text-xs text-red-600/70 dark:text-red-400/70">{t('write.incorrect')}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {score.skipped}
              </p>
              <p className="text-xs text-gray-500">{t('write.skipped')}</p>
            </div>
          </div>

          <div className="w-full max-w-xs p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-center mb-8">
            <p className="text-gray-500 text-sm mb-1">{t('write.score')}</p>
            <p
              className={`text-4xl font-bold ${
                score.passed ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {score.percentage}%
            </p>
          </div>

          <div className="w-full max-w-xs space-y-3">
            <button
              onClick={handlePlayAgain}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 ${
                score.passed ? 'bg-purple-500 text-white' : 'bg-red-500 text-white'
              }`}
            >
              <span className="material-symbols-outlined">replay</span>
              {t('write.tryAgain')}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full py-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold"
            >
              {t('write.backToUnit')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No questions loaded yet
  if (!currentQuestion) {
    return null;
  }

  // Main Write Screen
  return (
    <div className="relative flex min-h-screen w-full max-w-[430px] mx-auto flex-col bg-white dark:bg-background-dark overflow-x-hidden">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-background-dark/90 backdrop-blur-md">
        <div className="flex items-center p-4 pb-2 justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-12 h-12 flex items-center justify-center text-gray-900 dark:text-white"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <h2 className="text-gray-900 dark:text-white text-lg font-bold flex-1 text-center">
            {t('write.writePractice')}
          </h2>
          <button
            onClick={handlePlayAgain}
            className="w-12 h-12 flex items-center justify-center text-gray-500"
          >
            <span className="material-symbols-outlined">replay</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex flex-col gap-3 px-4 pb-3">
          <div className="flex gap-6 justify-between">
            <p className="text-gray-900 dark:text-white text-base font-medium opacity-80">
              {t('write.progress')}
            </p>
            <p className="text-gray-900 dark:text-white text-sm font-normal">
              {progress.current}/{progress.total}
            </p>
          </div>
          <div className="rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <motion.div
              className="h-2 rounded-full bg-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress.percentage}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.2 }}
          className="flex-1 px-4 py-6"
        >
          {/* Card Image */}
          {currentQuestion.card?.image && (
            <div className="w-full rounded-xl overflow-hidden mb-4" style={{ height: '300px' }}>
              <AppImage
                src={getImageUrl(currentQuestion.card.image)}
                alt={currentQuestion.term}
                className="w-full h-full object-cover"
                fallbackIcon="image"
              />
            </div>
          )}

          {/* Term */}
          <div className="text-center mb-6">
            <p className="text-gray-500 text-sm mb-2">{t('write.translateWord')}</p>
            <h1 className="text-gray-900 dark:text-white text-3xl font-bold">
              {currentQuestion.term}
            </h1>
          </div>

          {/* Example Sentence */}
          {currentQuestion.card?.samples?.[0] && (
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 mb-6">
              <p className="text-gray-600 dark:text-gray-300 text-sm italic">
                "{currentQuestion.card.samples[0].value}"
              </p>
            </div>
          )}

          {/* Hint */}
          {showHint && !isAnswerSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 mb-4"
            >
              <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                <span className="material-symbols-outlined text-lg">lightbulb</span>
                <p className="text-sm font-medium">
                  {t('write.hint')}: <span className="font-bold">{currentQuestion.hint}</span>
                </p>
              </div>
            </motion.div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSubmit}>
            <div className="relative mb-4">
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={handleInputChange}
                placeholder={t('write.typePlaceholder')}
                disabled={isAnswerSubmitted}
                className={`w-full px-4 py-4 rounded-xl border-2 text-lg font-medium transition-colors ${
                  isAnswerSubmitted
                    ? isCorrect
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                } outline-none`}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck="false"
              />
              {isAnswerSubmitted && (
                <span
                  className={`absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-2xl ${
                    isCorrect ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {isCorrect ? 'check_circle' : 'cancel'}
                </span>
              )}
            </div>

            {/* Correct Answer (shown when wrong) */}
            {isAnswerSubmitted && !isCorrect && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 mb-4"
              >
                <p className="text-sm text-green-600 dark:text-green-400 mb-1">
                  {t('write.correctAnswerLabel')}
                </p>
                <p className="text-lg font-bold text-green-700 dark:text-green-300">
                  {currentQuestion.correctAnswer}
                </p>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {!isAnswerSubmitted && (
                <>
                  <button
                    type="button"
                    onClick={handleHint}
                    disabled={showHint}
                    className="flex-1 py-4 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-lg">lightbulb</span>
                    {t('write.hint')}
                  </button>
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="flex-1 py-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">skip_next</span>
                    {t('common.skip')}
                  </button>
                </>
              )}
            </div>
          </form>
        </motion.div>
      </AnimatePresence>

      {/* Bottom Action Button */}
      <div className="p-4 pb-24">
        <button
          onClick={handleSubmit}
          disabled={!isAnswerSubmitted && !userInput.trim()}
          className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${
            isAnswerSubmitted
              ? isCorrect
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
              : 'bg-purple-500 text-white'
          }`}
        >
          {isAnswerSubmitted ? (
            <>
              <span className="material-symbols-outlined">arrow_forward</span>
              {currentQuestionIndex >= questions.length - 1 ? t('write.seeResults') : t('common.continue')}
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">check</span>
              {t('write.checkAnswer')}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const WriteWithGuard = () => (
  <LibraryGuard>
    <Write />
  </LibraryGuard>
);

export default WriteWithGuard;
