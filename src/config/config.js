// Configuración de la aplicación
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',

  useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true',

  appName: import.meta.env.VITE_APP_NAME || 'LuxeStay',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',

  endpoints: {
    rooms: '/rooms',
    roomDetail: '/rooms/:id',
    booking: '/bookings',
    auth: '/auth',
    search: '/rooms/search'
  }
};
