import { cn } from '../../lib/utils/cn';

export interface AvatarProps {
  src: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  level?: number;
  showLevel?: boolean;
  isOnline?: boolean;
  className?: string;
}

const Avatar = ({
  src,
  alt = 'Avatar',
  size = 'md',
  level,
  showLevel = false,
  isOnline,
  className,
}: AvatarProps) => {
  const sizes = {
    xs: 'w-8 h-8',
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const badgeSizes = {
    xs: 'text-[8px] -bottom-0.5 -right-0.5 w-4 h-4',
    sm: 'text-[9px] -bottom-0.5 -right-0.5 w-4 h-4',
    md: 'text-[10px] -bottom-1 -right-1 w-5 h-5',
    lg: 'text-xs -bottom-1 -right-1 w-6 h-6',
    xl: 'text-sm -bottom-1 -right-1 w-8 h-8',
  };

  const onlineSizes = {
    xs: 'w-2 h-2 top-0 right-0',
    sm: 'w-2.5 h-2.5 top-0 right-0',
    md: 'w-3 h-3 top-0 right-0',
    lg: 'w-3.5 h-3.5 top-0.5 right-0.5',
    xl: 'w-4 h-4 top-1 right-1',
  };

  return (
    <div className={cn('relative inline-flex', className)}>
      <img
        src={src}
        alt={alt}
        className={cn(
          'rounded-full object-cover bg-gray-100',
          sizes[size]
        )}
      />

      {showLevel && level !== undefined && (
        <div
          className={cn(
            'absolute flex items-center justify-center rounded-full bg-primary text-white font-semibold border-2 border-white',
            badgeSizes[size]
          )}
        >
          {level}
        </div>
      )}

      {isOnline !== undefined && (
        <div
          className={cn(
            'absolute rounded-full border-2 border-white',
            isOnline ? 'bg-success' : 'bg-gray-300',
            onlineSizes[size]
          )}
        />
      )}
    </div>
  );
};

export default Avatar;
