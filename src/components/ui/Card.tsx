import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils/cn';

export interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'pressable' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', className, children, ...props }, ref) => {
    const baseStyles = 'bg-white rounded-card';

    const variants = {
      default: 'shadow-card',
      pressable: 'shadow-card cursor-pointer',
      flat: 'border border-gray-100',
    };

    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    if (variant === 'pressable') {
      return (
        <motion.div
          ref={ref}
          whileTap={{ scale: 0.99 }}
          whileHover={{ boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)' }}
          transition={{ duration: 0.2 }}
          className={cn(baseStyles, variants[variant], paddings[padding], className)}
          {...props}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <motion.div
        ref={ref}
        className={cn(baseStyles, variants[variant], paddings[padding], className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
