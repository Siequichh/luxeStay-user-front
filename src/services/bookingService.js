import { config } from '../config/config';
import { apiClient } from './api';

/**
 * Servicio para gestionar reservas
 */
class BookingService {
  /**
   * Crea una nueva reserva
   * @param {object} bookingData - Datos de la reserva
   * @returns {Promise<object>} Confirmación de la reserva
   */
  async createBooking(bookingData) {
    if (config.useMockData) {
      // Modo MOCK: Simula creación de reserva
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            success: true,
            bookingId: `MOCK-${Date.now()}`,
            qrCode: `QR-${Math.random().toString(36).substring(7).toUpperCase()}`,
            ...bookingData,
            status: 'confirmed',
            createdAt: new Date().toISOString()
          });
        }, 500);
      });
    } else {
      // Modo API: Envía al backend
      try {
        const response = await apiClient.post(config.endpoints.booking, bookingData);
        return response;
      } catch (error) {
        console.error('Error creating booking:', error);
        throw error;
      }
    }
  }

  /**
   * Obtiene detalles de una reserva
   * @param {string} bookingId - ID de la reserva
   * @returns {Promise<object>} Detalles de la reserva
   */
  async getBooking(bookingId) {
    if (config.useMockData) {
      // Modo MOCK
      return {
        bookingId,
        status: 'confirmed',
        message: 'Reserva encontrada (MOCK)'
      };
    } else {
      // Modo API
      try {
        const response = await apiClient.get(`${config.endpoints.booking}/${bookingId}`);
        return response;
      } catch (error) {
        console.error('Error fetching booking:', error);
        throw error;
      }
    }
  }

  /**
   * Cancela una reserva
   * @param {string} bookingId - ID de la reserva
   * @returns {Promise<object>} Confirmación de cancelación
   */
  async cancelBooking(bookingId) {
    if (config.useMockData) {
      // Modo MOCK
      return {
        success: true,
        message: 'Reserva cancelada (MOCK)'
      };
    } else {
      // Modo API
      try {
        const response = await apiClient.delete(`${config.endpoints.booking}/${bookingId}`);
        return response;
      } catch (error) {
        console.error('Error cancelling booking:', error);
        throw error;
      }
    }
  }
}

export const bookingService = new BookingService();
