import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTelegram } from '../../lib/telegram/index';
import { registerWithEmail } from '../../lib/api/auth';
import { useTranslation } from '../../lib/i18n';
import { openLink } from '../../lib/telegram';
import { LEGAL_URLS } from '../../lib/constants/legal';
import { isAuthenticated } from '../../lib/api/client';

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    haptic,
    isTelegram,
    webApp,
    isReady,
    isAuthenticating: tgAuthenticating,
    authError: tgAuthError,
    reAuthenticate,
  } = useTelegram();
  const [isRetrying, setIsRetrying] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRetryTelegramAuth = async () => {
    setIsRetrying(true);
    haptic.impact('light');
    try {
      await reAuthenticate();
    } finally {
      setIsRetrying(false);
    }
  };

  const handleCopyError = async () => {
    if (!tgAuthError) return;
    const report = [
      `Error: ${tgAuthError}`,
      `Platform: ${webApp?.platform ?? 'unknown'}`,
      `TG Version: ${webApp?.version ?? 'unknown'}`,
      `User ID: ${webApp?.initDataUnsafe?.user?.id ?? 'unknown'}`,
      `Auth date: ${webApp?.initDataUnsafe?.auth_date ?? 'unknown'}`,
      `Time: ${new Date().toISOString()}`,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      haptic.notification('success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      haptic.notification('error');
    }
  };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    if (!email.trim()) {
      setError(t('register.enterEmailError'));
      return false;
    }
    if (!password) {
      setError(t('register.enterPasswordError'));
      return false;
    }
    if (password.length < 6) {
      setError(t('register.passwordMinError'));
      return false;
    }
    if (password !== confirmPassword) {
      setError(t('register.passwordMismatch'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      haptic.notification('error');
      return;
    }

    setIsLoading(true);
    setError(null);
    haptic.impact('light');

    try {
      await registerWithEmail({
        email,
        password,
        withoutConfirmation: true,
      });
      haptic.notification('success');
      navigate('/onboarding', { replace: true });
    } catch (err) {
      haptic.notification('error');
      setError(err instanceof Error ? err.message : t('register.registerFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const hasTelegramInitData = Boolean(webApp?.initData?.trim());
  const telegramAutoLoginBusy =
    isTelegram &&
    hasTelegramInitData &&
    (!isReady || tgAuthenticating);

  if (telegramAutoLoginBusy || isRetrying) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-3xl animate-pulse">
              sync
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {t('login.authenticating')}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            {t('login.pleaseWait')}
          </p>
        </div>
      </div>
    );
  }

  if (isTelegram && hasTelegramInitData && tgAuthError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-background-light dark:bg-background-dark">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-red-500 text-3xl">
              error
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {t('login.telegramAuthFailed')}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 break-words">
            {tgAuthError}
          </p>
          <div className="flex flex-col gap-2 items-center">
            <button
              onClick={handleRetryTelegramAuth}
              className="px-6 py-3 bg-primary text-white rounded-xl font-medium flex items-center gap-2"
            >
              <span className="material-symbols-outlined">refresh</span>
              {t('login.retry')}
            </button>
            <button
              onClick={handleCopyError}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 rounded-xl flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">
                {copied ? 'check' : 'content_copy'}
              </span>
              {copied ? t('login.copied') : t('login.copyErrorDetails')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col max-w-[430px] mx-auto bg-background-light dark:bg-background-dark">
      {/* Header */}
      <div className="flex items-center p-4 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-10 h-10 text-gray-900 dark:text-white"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        {/* Logo & Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              person_add
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('register.createAccount')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t('register.joinWordZen')}
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
            >
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">error</span>
                {error}
              </p>
            </motion.div>
          )}

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t('register.email')}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-xl">
                mail
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('register.enterEmail')}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t('register.password')}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-xl">
                lock
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('register.createPassword')}
                className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <span className="material-symbols-outlined text-xl">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">{t('register.minChars')}</p>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t('register.confirmPassword')}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-xl">
                lock
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('register.confirmYourPassword')}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Terms */}
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {t('register.termsText')}{' '}
            <button
              type="button"
              onClick={() => openLink(LEGAL_URLS.PUBLIC_OFFER)}
              className="text-primary hover:underline"
            >
              {t('register.termsOfService')}
            </button>{' '}
            {t('register.and')}{' '}
            <button
              type="button"
              onClick={() => openLink(LEGAL_URLS.PRIVACY_POLICY)}
              className="text-primary hover:underline"
            >
              {t('register.privacyPolicy')}
            </button>
          </p>

          {/* Submit Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white text-lg font-bold py-4 rounded-xl shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                {t('register.creatingAccount')}
              </>
            ) : (
              t('register.createAccount')
            )}
          </motion.button>
        </motion.form>

        {/* Sign In Link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mt-6 text-gray-500 dark:text-gray-400"
        >
          {t('register.haveAccount')}{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            {t('register.signIn')}
          </Link>
        </motion.p>
      </div>
    </div>
  );
};

export default Register;
