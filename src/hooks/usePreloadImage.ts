import { useEffect } from 'react';
import { buildSrcSet, optimizeCloudinaryUrl } from '../utils/imageUrl';

const preloaded = new Set<string>();

/**
 * Inject a <link rel="preload"> for a hero/LCP image once per URL.
 */
export function usePreloadImage(
  url: string | undefined,
  width: number,
  srcSetWidths: number[],
) {
  useEffect(() => {
    if (!url || preloaded.has(url)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = optimizeCloudinaryUrl(url, width);

    const srcSet = buildSrcSet(url, srcSetWidths);
    if (srcSet) {
      link.setAttribute('imagesrcset', srcSet);
      link.setAttribute('imagesizes', '(max-width: 768px) 100vw, 600px');
    }

    document.head.appendChild(link);
    preloaded.add(url);

    return () => {
      link.remove();
    };
  }, [url, width, srcSetWidths]);
}
