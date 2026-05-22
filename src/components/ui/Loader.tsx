import { motion } from 'framer-motion';
import { cn } from '../../lib/utils/cn';

export interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
}

const Loader = ({ size = 'md', color = 'primary', className }: LoaderProps) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  const colors = {
    primary: 'border-primary border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-300 border-t-transparent',
  };

  return (
    <motion.div
      className={cn('rounded-full', sizes[size], colors[color], className)}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
};

export interface PageLoaderProps {
  message?: string;
}

export const PageLoader = ({ message }: PageLoaderProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-4">
      <Loader size="lg" />
      {message && <p className="text-sm text-gray-500">{message}</p>}
    </div>
  );
};

export default Loader;
