import { cn } from '../../lib/utils/cn';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

const Skeleton = ({
  className,
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) => {
  const variants = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-card',
  };

  return (
    <div
      className={cn(
        'bg-gray-100 animate-pulse',
        variants[variant],
        className
      )}
      style={{ width, height }}
    />
  );
};

// Predefined skeleton components
export const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn('bg-white rounded-card shadow-card p-4', className)}>
    <div className="flex gap-3">
      <Skeleton variant="rectangular" className="w-20 h-20 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" className="w-3/4" />
        <Skeleton variant="text" className="w-1/2" />
        <Skeleton variant="text" className="w-full h-2 mt-3" />
      </div>
    </div>
  </div>
);

export const SkeletonAvatar = ({
  size = 'md',
}: {
  size?: 'sm' | 'md' | 'lg';
}) => {
  const sizes = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return <Skeleton variant="circular" className={sizes[size]} />;
};

export const SkeletonText = ({
  lines = 1,
  className,
}: {
  lines?: number;
  className?: string;
}) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        variant="text"
        className={i === lines - 1 ? 'w-3/4' : 'w-full'}
      />
    ))}
  </div>
);

export const SkeletonList = ({
  count = 3,
  className,
}: {
  count?: number;
  className?: string;
}) => (
  <div className={cn('space-y-3', className)}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default Skeleton;
