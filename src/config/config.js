// Configuración de la aplicación
export const config = {
  // URL base de la API
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',

  // Indica si se debe usar datos mock (true) o API real (false)
  useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true',

  // Información de la aplicación
  appName: import.meta.env.VITE_APP_NAME || 'LuxeStay',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',

  // Endpoints de la API
  endpoints: {
    rooms: '/rooms',
    roomDetail: '/rooms/:id',
    booking: '/bookings',
    auth: '/auth',
    search: '/rooms/search'
  }
};
