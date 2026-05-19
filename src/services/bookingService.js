import { config } from '../config/config';
import { apiClient } from './api';

class BookingService {
  async createBooking(bookingData) {
    if (config.useMockData) {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            id: Date.now(),
            referenceCode: `LXS-MOCK${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
            status: 'PENDING',
            ...bookingData,
            createdAt: new Date().toISOString(),
          });
        }, 600);
      });
    }
    return apiClient.post(config.endpoints.booking, bookingData);
  }

  async getMyBookings(page = 0, size = 10) {
    if (config.useMockData) {
      return { content: [], totalElements: 0, totalPages: 0 };
    }
    return apiClient.get(config.endpoints.booking, { page, size, sort: 'createdAt,desc' });
  }

  async getBooking(bookingId) {
    if (config.useMockData) {
      return { id: bookingId, status: 'PENDING' };
    }
    return apiClient.get(`${config.endpoints.booking}/${bookingId}`);
  }

  async cancelBooking(bookingId) {
    if (config.useMockData) {
      return { status: 'CANCELLED' };
    }
    return apiClient.delete(`${config.endpoints.booking}/${bookingId}`);
  }
}

export const bookingService = new BookingService();
