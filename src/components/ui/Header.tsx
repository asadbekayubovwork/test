import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils/cn';

export interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  className?: string;
}

const Header = ({
  title,
  showBack = false,
  onBack,
  rightAction,
  className,
}: HeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100 safe-top',
        className
      )}
    >
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2 min-w-[60px]">
          {showBack && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleBack}
              className="p-1 -ml-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </motion.button>
          )}
        </div>

        <h1 className="text-lg font-semibold text-gray-900 absolute left-1/2 -translate-x-1/2">
          {title}
        </h1>

        <div className="min-w-[60px] flex justify-end">
          {rightAction}
        </div>
      </div>
    </header>
  );
};

export default Header;
