import { useState, useMemo, type ComponentType } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  MapPin,
  Globe,
  Languages,
  Bell,
  Volume2,
  LogOut,
  ChevronRight,
  Check,
  FileText,
  Shield,
} from 'lucide-react';
import { useSettingsStore, availableLanguages, uiLanguages } from '../../lib/stores';
import { Header, Card, Modal } from '../../components/ui';
import CountryRegionSelector from '../../components/CountryRegionSelector';
import { cn } from '../../lib/utils/cn';
import { useTranslation } from '../../lib/i18n';
import { getCountryByCode, getCountryName, getRegionName } from '../../lib/data';
import { openLink } from '../../lib/telegram';
import { LEGAL_URLS } from '../../lib/constants/legal';

type SettingItemProps = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  description: string;
  value?: string;
  onClick?: () => void;
  toggle?: boolean;
  isEnabled?: boolean;
  danger?: boolean;
};

function SettingItem({
  icon: Icon,
  label,
  description,
  value,
  onClick,
  toggle,
  isEnabled,
  danger,
}: SettingItemProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="w-full flex items-start gap-3 p-4 text-left"
    >
      <Icon
        className={cn(
          'w-5 h-5 mt-0.5',
          danger ? 'text-danger' : 'text-gray-400'
        )}
      />
      <div className="flex-1 min-w-0">
        <span
          className={cn(
            'font-medium block',
            danger ? 'text-danger' : 'text-gray-900'
          )}
        >
          {label}
        </span>
        <span className="text-sm text-gray-500 block mt-0.5">
          {description}
        </span>
        {value && (
          <span className="text-sm text-primary font-medium block mt-1">
            {value}
          </span>
        )}
      </div>
      {toggle ? (
        <div
          className={cn(
            'w-12 h-7 rounded-full p-1 transition-colors',
            isEnabled ? 'bg-primary' : 'bg-gray-200'
          )}
        >
          <motion.div
            className="w-5 h-5 bg-white rounded-full shadow"
            animate={{ x: isEnabled ? 20 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </div>
      ) : !danger ? (
        <ChevronRight className="w-5 h-5 text-gray-400 mt-0.5" />
      ) : null}
    </motion.button>
  );
}

const Settings = () => {
  const { t } = useTranslation();
  const {
    translationLanguage,
    notifications,
    soundEffects,
    country,
    region,
    uiLanguage,
    setTranslationLanguage,
    setNotifications,
    setSoundEffects,
    setCountryAndRegion,
    setUILanguage,
  } = useSettingsStore();

  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showUILanguageModal, setShowUILanguageModal] = useState(false);
  const [showRegionModal, setShowRegionModal] = useState(false);

  const currentUILang = uiLanguages.find((l) => l.code === uiLanguage);

  const displayRegionValue = useMemo(() => {
    if (!country) return region || t('settings.notSet');
    const countryData = getCountryByCode(country);
    if (!countryData) return region;
    const regionName = getRegionName(region, uiLanguage);
    const countryName = getCountryName(country, uiLanguage);
    return `${countryData.flag} ${regionName}, ${countryName}`;
  }, [country, region, uiLanguage, t]);

  return (
    <div className="flex-1 flex flex-col pb-20">
      <Header title={t('settings.title')} showBack />

      <div className="flex-1 px-4 py-4 overflow-y-auto">
        {/* Account Section */}
        <div className="mb-6">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 px-1">
            {t('settings.account')}
          </h2>
          <Card padding="none" className="divide-y divide-gray-100">
            <SettingItem
              icon={User}
              label={t('settings.nameAvatar')}
              description={t('settings.usedInRankings')}
              onClick={() => {}}
            />
            <SettingItem
              icon={MapPin}
              label={t('settings.region')}
              description={t('settings.affectsRankings')}
              value={displayRegionValue}
              onClick={() => setShowRegionModal(true)}
            />
          </Card>
        </div>

        {/* Learning Section */}
        <div className="mb-6">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 px-1">
            {t('settings.learning')}
          </h2>
          <Card padding="none" className="divide-y divide-gray-100">
            <SettingItem
              icon={Languages}
              label={t('settings.appLanguage')}
              description={t('settings.appLanguageDesc')}
              value={currentUILang ? `${currentUILang.flag} ${currentUILang.nativeName}` : 'English'}
              onClick={() => setShowUILanguageModal(true)}
            />
            <SettingItem
              icon={Globe}
              label={t('settings.translationLanguage')}
              description={t('settings.translationLanguageDesc')}
              value={translationLanguage}
              onClick={() => setShowLanguageModal(true)}
            />
          </Card>
        </div>

        {/* Preferences Section */}
        <div className="mb-6">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 px-1">
            {t('settings.preferences')}
          </h2>
          <Card padding="none" className="divide-y divide-gray-100">
            <SettingItem
              icon={Bell}
              label={t('settings.notifications')}
              description={t('settings.remindersAlerts')}
              toggle
              isEnabled={notifications}
              onClick={() => setNotifications(!notifications)}
            />
            <SettingItem
              icon={Volume2}
              label={t('settings.soundEffects')}
              description={t('settings.soundDesc')}
              toggle
              isEnabled={soundEffects}
              onClick={() => setSoundEffects(!soundEffects)}
            />
          </Card>
        </div>

        {/* Legal Section */}
        <div className="mb-6">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 px-1">
            {t('settings.legal')}
          </h2>
          <Card padding="none" className="divide-y divide-gray-100">
            <SettingItem
              icon={FileText}
              label={t('settings.publicOffer')}
              description={t('settings.publicOfferDesc')}
              onClick={() => openLink(LEGAL_URLS.PUBLIC_OFFER)}
            />
            <SettingItem
              icon={Shield}
              label={t('settings.privacyPolicy')}
              description={t('settings.privacyPolicyDesc')}
              onClick={() => openLink(LEGAL_URLS.PRIVACY_POLICY)}
            />
          </Card>
        </div>

        {/* Logout */}
        <Card padding="none">
          <SettingItem
            icon={LogOut}
            label={t('settings.logout')}
            description={t('settings.logoutDesc')}
            danger
            onClick={() => {}}
          />
        </Card>

        {/* Version */}
        <p className="text-center text-sm text-gray-400 mt-6">
          {t('settings.version')}
        </p>
      </div>

      {/* UI Language Selection Modal */}
      <Modal
        isOpen={showUILanguageModal}
        onClose={() => setShowUILanguageModal(false)}
        title={t('settings.appLanguage')}
        variant="bottom"
      >
        <div className="p-4 pb-24">
          <p className="text-sm text-gray-500 mb-4">
            {t('settings.appLanguageDesc')}
          </p>
          <div className="space-y-2">
            {uiLanguages.map((lang) => (
              <motion.button
                key={lang.code}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setUILanguage(lang.code);
                  setShowUILanguageModal(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl transition-colors',
                  uiLanguage === lang.code
                    ? 'bg-primary-50 border-2 border-primary'
                    : 'bg-gray-50 border-2 border-transparent'
                )}
              >
                <span className="text-2xl">{lang.flag}</span>
                <div className="text-left">
                  <span className="font-medium text-gray-900 block">{lang.nativeName}</span>
                  <span className="text-sm text-gray-500">{lang.name}</span>
                </div>
                {uiLanguage === lang.code && (
                  <Check className="w-5 h-5 text-primary ml-auto" />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Translation Language Selection Modal */}
      <Modal
        isOpen={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        title={t('settings.translationLanguage')}
        variant="bottom"
      >
        <div className="p-4 pb-24">
          <p className="text-sm text-gray-500 mb-4">
            {t('settings.translationLanguageModalDesc')}
          </p>
          <div className="space-y-2">
            {availableLanguages.map((lang) => (
              <motion.button
                key={lang.code}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setTranslationLanguage(lang.name);
                  setShowLanguageModal(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl transition-colors',
                  translationLanguage === lang.name
                    ? 'bg-primary-50 border-2 border-primary'
                    : 'bg-gray-50 border-2 border-transparent'
                )}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="font-medium text-gray-900">{lang.name}</span>
                {translationLanguage === lang.name && (
                  <Check className="w-5 h-5 text-primary ml-auto" />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Region Selection Modal */}
      <Modal
        isOpen={showRegionModal}
        onClose={() => setShowRegionModal(false)}
        title={t('settings.region')}
        variant="bottom"
      >
        <div className="p-4 pb-24 h-[70vh]">
          <p className="text-sm text-gray-500 mb-4">
            {t('settings.regionModalDesc')}
          </p>
          <CountryRegionSelector
            mode="settings"
            initialCountry={country}
            initialRegion={region}
            onComplete={(newCountry, newRegion) => {
              setCountryAndRegion(newCountry, newRegion);
              setShowRegionModal(false);
            }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
