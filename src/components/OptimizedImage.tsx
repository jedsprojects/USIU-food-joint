import { useState, type ImgHTMLAttributes } from 'react';
import { buildSrcSet, getPresetUrls, optimizeCloudinaryUrl, type ImagePreset } from '../utils/imageUrl';

const FALLBACK = '/food_b.png';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'sizes'> {
  src: string;
  alt: string;
  preset?: ImagePreset;
  width?: number;
  srcSetWidths?: number[];
  sizes?: string;
  priority?: boolean;
}

export default function OptimizedImage({
  src,
  alt,
  preset,
  width,
  srcSetWidths,
  sizes,
  priority = false,
  className,
  style,
  ...rest
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const resolved = preset
    ? getPresetUrls(src, preset)
    : {
        src: width ? optimizeCloudinaryUrl(src, width) : src,
        srcSet: width && srcSetWidths ? buildSrcSet(src, srcSetWidths) : '',
        sizes: sizes ?? '',
      };

  const displaySrc = failed ? FALLBACK : resolved.src;

  return (
    <img
      {...rest}
      src={displaySrc}
      srcSet={failed ? undefined : resolved.srcSet || undefined}
      sizes={failed ? undefined : (sizes ?? resolved.sizes) || undefined}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
      style={{
        ...style,
        opacity: loaded || failed ? 1 : 0,
        transition: 'opacity 0.25s ease',
      }}
    />
  );
}
