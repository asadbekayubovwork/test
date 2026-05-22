import { forwardRef } from 'react';
import { Search } from 'lucide-react';
import { cn } from '../../lib/utils/cn';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'search';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      leftIcon,
      rightIcon,
      variant = 'default',
      className,
      ...props
    },
    ref
  ) => {
    const isSearch = variant === 'search';

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {(leftIcon || isSearch) && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {isSearch ? <Search className="w-5 h-5" /> : leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full px-4 py-3 rounded-xl border bg-white text-gray-900 placeholder:text-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
              'transition-all duration-200',
              error
                ? 'border-danger focus:ring-danger'
                : 'border-gray-200',
              (leftIcon || isSearch) && 'pl-10',
              rightIcon && 'pr-10',
              isSearch && 'bg-gray-50 border-gray-200 focus:bg-white',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
