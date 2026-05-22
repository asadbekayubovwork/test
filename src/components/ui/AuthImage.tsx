import { useState, useEffect } from 'react';
import { getAccessToken } from '../../lib/api/client';

interface AuthImageProps {
  src: string | undefined;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
}

const API_BASE_URL = 'https://api-wordzen.stnapps.com';

/**
 * Image component that fetches images with authentication header
 * Use this for images that require Bearer token authentication
 */
const AuthImage = ({ src, alt, className, fallback }: AuthImageProps) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src) {
      setImageSrc(null);
      setIsLoading(false);
      setHasError(true);
      return;
    }

    let objectUrl: string | null = null;
    let cancelled = false;

    const fetchImage = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        const token = getAccessToken();

        // Build full URL if relative path
        const fullUrl = src.startsWith('http') ? src : `${API_BASE_URL}${src}`;

        const response = await fetch(fullUrl, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        objectUrl = url;

        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }

        setImageSrc(url);
      } catch (error) {
        console.error('[AuthImage] Failed to load image:', error);
        if (!cancelled) {
          setHasError(true);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchImage();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src]);

  if (isLoading) {
    return (
      <div className={`${className} bg-gray-200 dark:bg-gray-700 animate-pulse`} />
    );
  }

  if (hasError || !imageSrc) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className={`${className} bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center`}>
        <span className="material-symbols-outlined text-primary text-3xl">
          image
        </span>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
    />
  );
};

export default AuthImage;
