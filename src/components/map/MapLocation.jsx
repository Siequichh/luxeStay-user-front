import { useState } from 'react';

const MapLocation = ({ address, coordinates, hotelName }) => {
  const [mapType, setMapType] = useState('roadmap'); // roadmap, satellite

  // Construir URL para Google Maps Embed
  // En producción se usaría una API key, por ahora usamos el modo básico
  const getMapUrl = () => {
    if (coordinates) {
      return `https://maps.google.com/maps?q=${coordinates.lat},${coordinates.lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }
    // Fallback usando dirección
    return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  };

  // URL para abrir en Google Maps
  const openInGoogleMaps = () => {
    const url = coordinates
      ? `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden border-2 border-gray-100 shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-600 text-white p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>
              <h3 className="text-xl font-bold">Ubicación</h3>
              <p className="text-sm text-white/90">{hotelName}</p>
            </div>
          </div>
          <button
            onClick={openInGoogleMaps}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Ver en Maps
          </button>
        </div>
      </div>

      {/* Address */}
      <div className="p-5 bg-gray-50 border-b border-gray-200">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <div>
            <p className="font-semibold text-gray-900">{address}</p>
            {coordinates && (
              <p className="text-xs text-gray-500 mt-1">
                Coordenadas: {coordinates.lat}, {coordinates.lng}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Map Embed */}
      <div className="relative w-full h-80 bg-gray-200">
        <iframe
          src={getMapUrl()}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Mapa de ${hotelName}`}
          className="w-full h-full"
        ></iframe>
      </div>

      {/* Footer with actions */}
      <div className="p-4 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Haz clic en "Ver en Maps" para direcciones</span>
        </div>
        <button
          onClick={openInGoogleMaps}
          className="text-primary hover:text-primary-700 font-semibold text-sm flex items-center"
        >
          Cómo llegar
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MapLocation;
