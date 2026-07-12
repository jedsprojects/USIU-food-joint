const CLOUDINARY_HOST = 'res.cloudinary.com';
const UPLOAD_SEGMENT = '/image/upload/';

const TRANSFORM_BASE = 'f_auto,q_auto,c_fill';

export const IMAGE_PRESETS = {
  hero: { width: 800, srcSet: [400, 600, 800], sizes: '(max-width: 768px) 100vw, 600px' },
  productCard: { width: 400, srcSet: [200, 400], sizes: '(max-width: 480px) 45vw, 200px' },
  dropCard: { width: 440, srcSet: [220, 440], sizes: '220px' },
  detail: { width: 480, srcSet: [240, 480], sizes: '240px' },
  cart: { width: 160, srcSet: [80, 160], sizes: '72px' },
  avatar: { width: 80, srcSet: [80], sizes: '40px' },
  managerThumb: { width: 112, srcSet: [112], sizes: '56px' },
} as const;

export type ImagePreset = keyof typeof IMAGE_PRESETS;

function isCloudinaryUrl(url: string): boolean {
  return url.includes(CLOUDINARY_HOST) && url.includes(UPLOAD_SEGMENT);
}

function isLocalUrl(url: string): boolean {
  return url.startsWith('/') || url.startsWith('blob:') || url.startsWith('data:');
}

function buildTransform(width: number): string {
  return `${TRANSFORM_BASE},w_${width}`;
}

/**
 * Inject Cloudinary delivery transforms into an existing upload URL.
 * Passes through local paths and non-Cloudinary URLs unchanged.
 */
export function optimizeCloudinaryUrl(url: string, width: number): string {
  if (!url || isLocalUrl(url) || !isCloudinaryUrl(url)) return url;

  const uploadIdx = url.indexOf(UPLOAD_SEGMENT);
  const afterUpload = url.slice(uploadIdx + UPLOAD_SEGMENT.length);

  // Skip if transforms are already present (not version/folder path)
  if (/^v\d+\//.test(afterUpload) === false && /^[^/]+,/.test(afterUpload)) {
    return url;
  }

  const transform = buildTransform(width);
  return `${url.slice(0, uploadIdx + UPLOAD_SEGMENT.length)}${transform}/${afterUpload}`;
}

export function buildSrcSet(url: string, widths: number[]): string {
  if (!url || isLocalUrl(url) || !isCloudinaryUrl(url) || widths.length === 0) return '';

  return widths
    .map(w => `${optimizeCloudinaryUrl(url, w)} ${w}w`)
    .join(', ');
}

export function getPresetUrls(url: string, preset: ImagePreset) {
  const { width, srcSet, sizes } = IMAGE_PRESETS[preset];
  return {
    src: optimizeCloudinaryUrl(url, width),
    srcSet: buildSrcSet(url, [...srcSet]),
    sizes,
  };
}
