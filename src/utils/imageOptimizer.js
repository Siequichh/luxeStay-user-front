/**
 * Utilidades para optimización de imágenes
 * Técnicas WPO: WebP, lazy loading, responsive images, compression
 */

/**
 * Optimiza URLs de Unsplash con parámetros de rendimiento
 * @param {string} url - URL original de la imagen
 * @param {object} options - Opciones de optimización
 * @returns {string} - URL optimizada
 */
export const optimizeUnsplashUrl = (url, options = {}) => {
  if (!url || !url.includes('unsplash.com')) return url;

  const {
    width = 800,
    height = null,
    quality = 80,
    format = 'webp',
    fit = 'crop',
    dpr = 1, // Device Pixel Ratio
  } = options;

  const separator = url.includes('?') ? '&' : '?';

  const params = [
    `fm=${format}`, // WebP es ~30% más liviano que JPEG
    `q=${quality}`, // Calidad de compresión
    `fit=${fit}`, // Crop inteligente
    `w=${Math.round(width)}`, // Ancho
    height ? `h=${Math.round(height)}` : null,
    dpr > 1 ? `dpr=${dpr}` : null, // Para pantallas retina
    'auto=format', // Auto-selección de formato según navegador
    'auto=compress', // Compresión automática óptima
  ].filter(Boolean).join('&');

  return `${url}${separator}${params}`;
};

/**
 * Genera srcset para imágenes responsive
 * @param {string} url - URL base
 * @param {array} sizes - Array de anchos [400, 800, 1200]
 * @returns {string} - String srcset
 */
export const generateSrcSet = (url, sizes = [400, 800, 1200, 1600]) => {
  if (!url || !url.includes('unsplash.com')) return '';

  return sizes
    .map(size => {
      const optimized = optimizeUnsplashUrl(url, { width: size });
      return `${optimized} ${size}w`;
    })
    .join(', ');
};

/**
 * Genera URL de placeholder blur ultra-pequeña
 * @param {string} url - URL original
 * @returns {string} - URL del placeholder
 */
export const getBlurPlaceholder = (url) => {
  if (!url || !url.includes('unsplash.com')) return '';

  return optimizeUnsplashUrl(url, {
    width: 20,
    quality: 10,
    format: 'webp',
  }) + '&blur=50';
};

/**
 * Configuraciones preestablecidas para diferentes tipos de imágenes
 */
export const IMAGE_PRESETS = {
  thumbnail: { width: 300, quality: 75 },
  card: { width: 600, quality: 80 },
  hero: { width: 1920, quality: 85 },
  gallery: { width: 1200, quality: 85 },
  avatar: { width: 150, quality: 80 },
};

/**
 * Obtiene el preset adecuado según el tipo de imagen
 * @param {string} url - URL de imagen
 * @param {string} preset - Nombre del preset
 * @returns {string} - URL optimizada
 */
export const getOptimizedUrl = (url, preset = 'card') => {
  const config = IMAGE_PRESETS[preset] || IMAGE_PRESETS.card;
  return optimizeUnsplashUrl(url, config);
};

/**
 * Calcula el tamaño óptimo de imagen según viewport
 * @param {number} containerWidth - Ancho del contenedor
 * @returns {number} - Ancho óptimo de imagen
 */
export const getOptimalImageWidth = (containerWidth) => {
  const dpr = window.devicePixelRatio || 1;
  const baseWidth = containerWidth * dpr;

  // Redondear al siguiente múltiplo de 100 para mejor caching
  return Math.ceil(baseWidth / 100) * 100;
};

/**
 * Preload de imagen crítica (above-the-fold)
 * @param {string} url - URL de la imagen
 * @param {string} preset - Preset a usar
 */
export const preloadImage = (url, preset = 'hero') => {
  if (!url) return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = getOptimizedUrl(url, preset);
  link.type = 'image/webp';

  document.head.appendChild(link);
};

/**
 * Lazy load de imágenes usando Intersection Observer
 * @param {HTMLElement} element - Elemento a observar
 * @param {function} callback - Callback cuando es visible
 */
export const lazyLoadObserver = (element, callback) => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: '50px', // Comenzar a cargar antes de ser visible
      threshold: 0.01,
    }
  );

  observer.observe(element);
  return observer;
};
