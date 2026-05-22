import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTelegram } from '../../lib/telegram/index';
import { isAuthenticated } from '../../lib/api/client';
import { useTranslation } from '../../lib/i18n';
import { useSettingsStore, uiLanguages } from '../../lib/stores';
import CountryRegionSelector from '../../components/CountryRegionSelector';
import type { UILanguage } from '../../types';
import onboardingImage1 from '../../assets/onboarding-image-1.png';
import onboardingImage2 from '../../assets/onboarding-image-2.png';
import onboardingImage3 from '../../assets/onboarding-image-3.png';
import onboardingImage4 from '../../assets/onboarding-image-4.png';

const images = [onboardingImage1, onboardingImage2, onboardingImage3, onboardingImage4];

function usePreloadImages(srcs: string[]) {
  useEffect(() => {
    srcs.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [srcs]);
}

// Purple color matching the octopus mascot images
const OCTOPUS_PURPLE = '#9B7ED8';

const Onboarding = () => {
  const navigate = useNavigate();
  const { haptic, isTelegram, reAuthenticate } = useTelegram();
  const { t } = useTranslation();
  const setUILanguage = useSettingsStore((s) => s.setUILanguage);
  const setCountryAndRegion = useSettingsStore((s) => s.setCountryAndRegion);

  usePreloadImages(images);

  const [languageSelected, setLanguageSelected] = useState(() => {
    return localStorage.getItem('wordzen_language_selected') === 'true';
  });
  const [locationSelected, setLocationSelected] = useState(() => {
    return localStorage.getItem('wordzen_location_selected') === 'true';
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const slideKeys = [
    { titleKey: 'onboarding.slide1Title' as const, descKey: 'onboarding.slide1Desc' as const },
    { titleKey: 'onboarding.slide2Title' as const, descKey: 'onboarding.slide2Desc' as const },
    { titleKey: 'onboarding.slide3Title' as const, descKey: 'onboarding.slide3Desc' as const },
    { titleKey: 'onboarding.slide4Title' as const, descKey: 'onboarding.slide4Desc' as const },
  ];

  const handleSelectLanguage = (code: UILanguage) => {
    haptic.impact('light');
    setUILanguage(code);
    localStorage.setItem('wordzen_language_selected', 'true');
    setLanguageSelected(true);
  };

  const handleLocationComplete = (country: string, region: string) => {
    haptic.impact('light');
    setCountryAndRegion(country, region);
    localStorage.setItem('wordzen_location_selected', 'true');
    setLocationSelected(true);
  };

  const handleLocationSkip = () => {
    haptic.impact('light');
    localStorage.setItem('wordzen_location_selected', 'true');
    setLocationSelected(true);
  };

  const handleNext = () => {
    haptic.impact('light');
    if (currentSlide < slideKeys.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    haptic.impact('light');
    completeOnboarding();
  };

  const goToSlide = (index: number) => {
    haptic.selection();
    setCurrentSlide(index);
  };

  const completeOnboarding = async () => {
    localStorage.setItem('wordzen_onboarding_completed', 'true');
    haptic.notification('success');

    if (isAuthenticated()) {
      navigate('/', { replace: true });
      return;
    }

    if (isTelegram) {
      setIsAuthenticating(true);
      try {
        await reAuthenticate();
        if (isAuthenticated()) {
          navigate('/', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Re-authentication failed:', error);
        navigate('/login', { replace: true });
      } finally {
        setIsAuthenticating(false);
      }
    } else {
      navigate('/login', { replace: true });
    }
  };

  const isLastSlide = currentSlide === slideKeys.length - 1;

  // Language Selection Screen (Step 0)
  if (!languageSelected) {
    return (
      <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto overflow-x-hidden bg-background-light dark:bg-background-dark">
        <div className="flex-grow flex flex-col justify-center items-center px-6">
          {/* Multi-language title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-center mb-8"
          >
            <h1 className="text-gray-900 dark:text-white text-2xl font-bold mb-2">
              🌐 Choose Language
            </h1>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              Tilni tanlang · Выберите язык · Тілді таңдаңыз · Оберіть мову
            </p>
          </motion.div>

          {/* Language buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="w-full space-y-3"
          >
            {uiLanguages.map((lang) => (
              <motion.button
                key={lang.code}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSelectLanguage(lang.code)}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 active:border-purple-300 transition-colors shadow-sm"
              >
                <span className="text-3xl">{lang.flag}</span>
                <div className="text-left">
                  <p className="font-bold text-gray-900 dark:text-white">{lang.nativeName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{lang.name}</p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>
    );
  }

  // Location Selection Screen (Step 1)
  if (!locationSelected) {
    return (
      <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto overflow-x-hidden bg-background-light dark:bg-background-dark px-6 pt-6">
        <CountryRegionSelector
          mode="onboarding"
          onComplete={handleLocationComplete}
          onSkip={handleLocationSkip}
        />
      </div>
    );
  }

  // Onboarding Slides
  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto overflow-x-hidden bg-background-light dark:bg-background-dark">
      {/* Header with Skip Button */}
      <div className="flex items-center p-4 pb-2 justify-end">
        <button
          onClick={handleSkip}
          style={{ color: OCTOPUS_PURPLE }}
          className="text-base font-bold leading-normal tracking-[0.015em] shrink-0 active:opacity-70 transition-opacity"
        >
          {t('common.skip')}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col justify-center items-center">
        {/* Image */}
        <div className="w-full px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="w-full flex items-center justify-center"
            >
              <img
                src={images[currentSlide]}
                alt={t(slideKeys[currentSlide].titleKey)}
                className="w-[70%] max-h-[40vh] object-contain drop-shadow-xl"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Text Content */}
        <div className="px-4 mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h1 className="text-gray-900 dark:text-white tracking-tight text-[32px] font-bold leading-tight text-center pb-3">
                {t(slideKeys[currentSlide].titleKey)}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-relaxed text-center max-w-xs mx-auto">
                {t(slideKeys[currentSlide].descKey)}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col items-center gap-6 pb-12 px-4">
        {/* Pagination Dots */}
        <div className="flex w-full flex-row items-center justify-center gap-3 py-5">
          {slideKeys.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              style={index === currentSlide ? { backgroundColor: OCTOPUS_PURPLE } : undefined}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-6'
                  : 'w-2 bg-gray-300 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>

        {/* Action Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          disabled={isAuthenticating}
          style={{ backgroundColor: OCTOPUS_PURPLE, boxShadow: `0 10px 15px -3px ${OCTOPUS_PURPLE}33` }}
          className="w-full max-w-sm text-white text-lg font-bold py-4 rounded-xl active:scale-[0.98] transition-transform disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {isAuthenticating ? (
            <>
              <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
              {t('onboarding.authenticating')}
            </>
          ) : (
            isLastSlide ? t('onboarding.letsStart') : t('common.continue')
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default Onboarding;
