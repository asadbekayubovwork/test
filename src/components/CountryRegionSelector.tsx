import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, MapPin } from 'lucide-react';
import { Input } from './ui';
import { useTranslation } from '../lib/i18n';
import {
  getPinnedCountries,
  getNonPinnedCountries,
  getRegionsForCountry,
  getCountryByCode,
  searchCountries,
  getCountryName,
  getRegionName,
} from '../lib/data';
import type { Country, Region } from '../lib/data';

interface CountryRegionSelectorProps {
  mode: 'onboarding' | 'settings';
  onComplete: (country: string, region: string) => void;
  onSkip?: () => void;
  initialCountry?: string;
  initialRegion?: string;
}

const OCTOPUS_PURPLE = '#9B7ED8';

const CountryRegionSelector = ({
  mode,
  onComplete,
  onSkip,
  initialCountry,
  initialRegion,
}: CountryRegionSelectorProps) => {
  const { t, language } = useTranslation();
  const [step, setStep] = useState<'country' | 'region'>(
    initialCountry ? 'region' : 'country'
  );
  const [selectedCountry, setSelectedCountry] = useState<string>(
    initialCountry || ''
  );
  const [countrySearch, setCountrySearch] = useState('');
  const [regionSearch, setRegionSearch] = useState('');

  const pinnedCountries = useMemo(() => getPinnedCountries(), []);
  const nonPinnedCountries = useMemo(() => getNonPinnedCountries(), []);

  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return null; // show sections when no search
    return searchCountries(countrySearch, language);
  }, [countrySearch, language]);

  const regions = useMemo(
    () => getRegionsForCountry(selectedCountry),
    [selectedCountry]
  );

  const filteredRegions = useMemo(() => {
    if (!regionSearch.trim()) return regions;
    const q = regionSearch.toLowerCase().trim();
    return regions.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        getRegionName(r.code, language).toLowerCase().includes(q)
    );
  }, [regions, regionSearch, language]);

  const selectedCountryData = useMemo(
    () => getCountryByCode(selectedCountry),
    [selectedCountry]
  );

  const handleSelectCountry = (country: Country) => {
    setSelectedCountry(country.code);
    setRegionSearch('');

    // Auto-complete for single-region countries (Tier 3)
    if (country.regions.length === 1) {
      onComplete(country.code, country.regions[0].code);
      return;
    }

    setStep('region');
  };

  const handleSelectRegion = (region: Region) => {
    onComplete(selectedCountry, region.code);
  };

  const handleBack = () => {
    setStep('country');
    setSelectedCountry('');
    setRegionSearch('');
  };

  const CountryItem = ({ country }: { country: Country }) => (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={() => handleSelectCountry(country)}
      className="w-full flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-colors"
    >
      <span className="text-2xl">{country.flag}</span>
      <span className="font-medium text-gray-900 dark:text-white flex-1 text-left">
        {getCountryName(country.code, language)}
      </span>
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </motion.button>
  );

  const RegionItem = ({
    region,
    isSelected,
  }: {
    region: Region;
    isSelected: boolean;
  }) => (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={() => handleSelectRegion(region)}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
        isSelected
          ? 'bg-primary-50 border-2 border-primary'
          : 'bg-white dark:bg-gray-800 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-600'
      }`}
    >
      <span className="font-medium text-gray-900 dark:text-white flex-1 text-left">
        {getRegionName(region.code, language)}
      </span>
      {isSelected && <Check className="w-5 h-5 text-primary" />}
    </motion.button>
  );

  // ─── Country Selection Step ───────────────────────────────────────────

  const countryStep = (
    <motion.div
      key="country"
      initial={{ opacity: 0, x: mode === 'settings' ? 0 : 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: mode === 'settings' ? 0 : -50 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full"
    >
      {mode === 'onboarding' && (
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4">
            <MapPin className="w-8 h-8" style={{ color: OCTOPUS_PURPLE }} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('location.whereAreYou')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {t('location.whereAreYouDesc')}
          </p>
        </div>
      )}

      <div className="mb-4">
        <Input
          variant="search"
          placeholder={t('location.searchCountry')}
          value={countrySearch}
          onChange={(e) => setCountrySearch(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 pb-4">
        {filteredCountries ? (
          // Search results mode
          filteredCountries.length > 0 ? (
            filteredCountries.map((country) => (
              <CountryItem key={country.code} country={country} />
            ))
          ) : (
            <p className="text-center text-gray-400 py-8">
              {t('location.noResults')}
            </p>
          )
        ) : (
          // Sectioned mode (no search)
          <>
            <div className="mb-3">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 px-1">
                {t('location.pinnedCountries')}
              </h3>
              <div className="space-y-1">
                {pinnedCountries.map((country) => (
                  <CountryItem key={country.code} country={country} />
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 px-1">
                {t('location.allCountries')}
              </h3>
              <div className="space-y-1">
                {nonPinnedCountries.map((country) => (
                  <CountryItem key={country.code} country={country} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {mode === 'onboarding' && (
        <div className="pt-2 pb-4">
          <p className="text-center text-xs text-gray-400 mb-3">
            {t('location.changeAnytime')}
          </p>
          {onSkip && (
            <button
              onClick={onSkip}
              style={{ color: OCTOPUS_PURPLE }}
              className="w-full text-center text-base font-bold py-3 active:opacity-70 transition-opacity"
            >
              {t('common.skip')}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );

  // ─── Region Selection Step ────────────────────────────────────────────

  const regionStep = (
    <motion.div
      key="region"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full"
    >
      {/* Header with back button */}
      <div className="flex items-center gap-3 mb-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleBack}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </motion.button>
        {selectedCountryData && (
          <div className="flex items-center gap-2">
            <span className="text-xl">{selectedCountryData.flag}</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {getCountryName(selectedCountryData.code, language)}
            </span>
          </div>
        )}
      </div>

      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
        {t('location.selectRegion')}
      </h2>

      {regions.length > 10 && (
        <div className="mb-4">
          <Input
            variant="search"
            placeholder={t('location.searchRegion')}
            value={regionSearch}
            onChange={(e) => setRegionSearch(e.target.value)}
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-1 pb-4">
        {filteredRegions.length > 0 ? (
          filteredRegions.map((region) => (
            <RegionItem
              key={region.code}
              region={region}
              isSelected={region.code === initialRegion}
            />
          ))
        ) : (
          <p className="text-center text-gray-400 py-8">
            {t('location.noRegionResults')}
          </p>
        )}
      </div>
    </motion.div>
  );

  return (
    <AnimatePresence mode="wait">
      {step === 'country' ? countryStep : regionStep}
    </AnimatePresence>
  );
};

export default CountryRegionSelector;
