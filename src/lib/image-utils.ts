/**
 * Generates responsive image path with proper suffix
 * @param imagePath - Original image path (e.g., "/Памятники/Одиночные/800x800/О-1.webp")
 * @param width - Target width (256 or 512 or 800)
 * @returns Path with appropriate suffix
 */
export function getResponsiveImagePath(imagePath: string, width: 256 | 512 | 800): string {
  if (!imagePath) return imagePath;
  
  // For 800px, return original path
  if (width === 800) return imagePath;
  
  // Extract extension
  const ext = imagePath.split('.').pop() || 'webp';
  const pathWithoutExt = imagePath.substring(0, imagePath.lastIndexOf('.'));
  
  // Add width suffix (e.g., image-256w.webp or image-512w.webp)
  return `${pathWithoutExt}-${width}w.${ext}`;
}

/**
 * Generates srcSet attribute for responsive images
 * @param imagePath - Original image path
 * @returns srcSet string (e.g., "/path/image-256w.webp 256w, /path/image-512w.webp 512w, /path/image.webp 800w")
 */
export function generateImageSrcSet(imagePath: string): string {
  if (!imagePath) return '';
  
  const sizes = [256, 512, 800] as const;
  
  return sizes
    .map(width => `${getResponsiveImagePath(imagePath, width)} ${width}w`)
    .join(', ');
}

/**
 * Generates sizes attribute for responsive images in product cards
 * Container: 256x256 on all screen sizes based on PageSpeed report
 */
export function getProductCardImageSizes(): string {
  return '256px';
}
