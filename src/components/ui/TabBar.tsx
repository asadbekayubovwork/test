import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils/cn';
import { useTranslation } from '../../lib/i18n';
import type { TranslationKey } from '../../lib/i18n';

interface TabItem {
  id: string;
  labelKey: TranslationKey;
  path: string;
  icon: string;
}

const tabs: TabItem[] = [
  { id: 'home', labelKey: 'tabBar.home', path: '/home', icon: 'home' },
  { id: 'courses', labelKey: 'tabBar.courses', path: '/courses', icon: 'menu_book' },
  { id: 'friends', labelKey: 'tabBar.friends', path: '/friends', icon: 'group' },
  { id: 'rating', labelKey: 'tabBar.rating', path: '/rankings', icon: 'star' },
  { id: 'profile', labelKey: 'tabBar.profile', path: '/profile', icon: 'person' },
];

const TabBar = () => {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-background-dark/95 backdrop-blur-md safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-[430px] mx-auto px-2">
        {tabs.map((tab) => {
          const isActive =
            tab.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(tab.path);

          return (
            <NavLink
              key={tab.id}
              to={tab.path}
              className="flex flex-col items-center justify-center flex-1 h-full relative"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center gap-1"
              >
                <span
                  className={cn(
                    'material-symbols-outlined text-2xl transition-colors',
                    isActive ? 'text-primary fill-1' : 'text-[#686189] dark:text-gray-400'
                  )}
                  style={isActive ? {
                    fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
                  } : undefined}
                >
                  {tab.icon}
                </span>
                <span
                  className={cn(
                    'text-[10px] font-bold transition-colors',
                    isActive ? 'text-primary' : 'text-[#686189] dark:text-gray-400'
                  )}
                >
                  {t(tab.labelKey)}
                </span>
              </motion.div>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default TabBar;
