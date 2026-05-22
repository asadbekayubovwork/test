import { useState, useCallback } from 'react';

export interface AppImageProps {
  src: string | undefined;
  alt: string;
  className?: string;
  /** Material Symbols icon name for fallback (default: "image") */
  fallbackIcon?: string;
  /** Extra classes for the fallback container */
  fallbackClassName?: string;
  /** Disable drag on the image */
  draggable?: boolean;
}

/**
 * Robust image component with error handling and fallback.
 *
 * - Shows a placeholder icon when the image fails to load
 * - Logs the failing URL for debugging (helps diagnose media server issues)
 * - Gracefully handles undefined/null src
 */
const AppImage = ({
  src,
  alt,
  className = '',
  fallbackIcon = 'image',
  fallbackClassName,
  draggable,
}: AppImageProps) => {
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback(() => {
    if (src) {
      console.warn(`[AppImage] Failed to load: ${src}`);
    }
    setHasError(true);
  }, [src]);

  // No source or failed to load — show fallback
  if (!src || hasError) {
    return (
      <div
        className={
          fallbackClassName ||
          `${className} bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center`
        }
      >
        <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-3xl">
          {fallbackIcon}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleError}
      draggable={draggable}
    />
  );
};

export default AppImage;
