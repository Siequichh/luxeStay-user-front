import { useState, useEffect, useRef } from 'react';

/**
 * Componente de imagen optimizada con lazy loading, WebP, y placeholders
 * Aprovecha los parámetros de Unsplash para optimización automática
 */
const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false, // Para imágenes above-the-fold
  objectFit = 'contain',
  quality = 80,
  blur = true, // Mostrar placeholder blur
  onLoad,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef(null);

  // Optimizar URL de Unsplash con parámetros
  const optimizeImageUrl = (url) => {
    if (!url) return '';

    // Si es de Unsplash, añadir parámetros de optimización
    if (url.includes('unsplash.com')) {
      const separator = url.includes('?') ? '&' : '?';
      const params = [
        'fm=webp', // Formato WebP (mucho más liviano)
        `q=${quality}`, // Calidad
        'fit=crop', // Recorte inteligente
        width ? `w=${width}` : 'w=800', // Ancho
        height ? `h=${height}` : '', // Alto
        'auto=format', // Auto-formato según navegador
        'auto=compress', // Compresión automática
      ].filter(Boolean).join('&');

      return `${url}${separator}${params}`;
    }

    return url;
  };

  const optimizedSrc = optimizeImageUrl(src);

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Comenzar a cargar 50px antes de entrar en viewport
        threshold: 0.01,
      }
    );

    observer.observe(imgRef.current);

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [priority]);

  // Generar placeholder blur (versión tiny)
  const getPlaceholderUrl = (url) => {
    if (!url || !url.includes('unsplash.com')) return '';
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}w=20&q=10&blur=50&fm=webp`;
  };

  const placeholderSrc = blur ? getPlaceholderUrl(src) : '';

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden bg-gray-200 ${className}`}
      style={{
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : '100%'
      }}
    >
      {/* Placeholder blur */}
      {blur && placeholderSrc && !isLoaded && (
        <img
          src={placeholderSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-md scale-110"
          aria-hidden="true"
        />
      )}

      {/* Loading skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      )}

      {/* Imagen principal */}
      {isInView && (
        <img
          src={optimizedSrc}
          alt={alt}
          className={`w-full h-full transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ objectFit }}
          onLoad={handleLoad}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}
    </div>
  );
};

export default OptimizedImage;
