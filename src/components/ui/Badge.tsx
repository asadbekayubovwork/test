import { cn } from '../../lib/utils/cn';
import type { Difficulty, AccessType } from '../../types';

export interface BadgeProps {
  variant?: 'default' | 'difficulty' | 'access' | 'status';
  difficulty?: Difficulty;
  accessType?: AccessType;
  status?: 'online' | 'offline' | 'active' | 'completed';
  size?: 'sm' | 'md';
  children?: React.ReactNode;
  className?: string;
}

const Badge = ({
  variant = 'default',
  difficulty,
  accessType,
  status,
  size = 'md',
  children,
  className,
}: BadgeProps) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  const getDifficultyStyles = () => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-success-light text-green-700';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700';
      case 'advanced':
        return 'bg-danger-light text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getAccessStyles = () => {
    switch (accessType) {
      case 'purchased':
        return 'bg-success-light text-green-700';
      case 'subscription':
        return 'bg-purple-100 text-purple-700';
      case 'locked':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusStyles = () => {
    switch (status) {
      case 'online':
        return 'bg-success-light text-green-700';
      case 'offline':
        return 'bg-gray-100 text-gray-600';
      case 'active':
        return 'bg-primary-100 text-primary-700';
      case 'completed':
        return 'bg-success-light text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'difficulty':
        return getDifficultyStyles();
      case 'access':
        return getAccessStyles();
      case 'status':
        return getStatusStyles();
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getLabel = () => {
    if (children) return children;

    if (variant === 'difficulty' && difficulty) {
      return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    }

    if (variant === 'access' && accessType) {
      switch (accessType) {
        case 'purchased':
          return 'Purchased';
        case 'subscription':
          return 'Included';
        case 'locked':
          return 'Locked';
      }
    }

    if (variant === 'status' && status) {
      return status.charAt(0).toUpperCase() + status.slice(1);
    }

    return '';
  };

  return (
    <span
      className={cn(baseStyles, sizes[size], getVariantStyles(), className)}
    >
      {getLabel()}
    </span>
  );
};

export default Badge;
