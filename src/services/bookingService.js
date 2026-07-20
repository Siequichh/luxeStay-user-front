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

  /** Recupera por código de referencia — usado cuando se pierde el router state (recarga completa tras redirect de MP). */
  async getBookingByReferenceCode(referenceCode) {
    if (config.useMockData) {
      return { id: Date.now(), referenceCode, status: 'PENDING' };
    }
    return apiClient.get(`${config.endpoints.booking}/ref/${referenceCode}`);
  }

  async cancelBooking(bookingId) {
    if (config.useMockData) {
      return { status: 'CANCELLED' };
    }
    return apiClient.delete(`${config.endpoints.booking}/${bookingId}`);
  }

  qrUrl(bookingId) {
    return `${config.apiUrl}${config.endpoints.booking}/${bookingId}/qr`;
  }

  /** El endpoint QR requiere auth — un <img src> no manda el token. Fetch → object URL. */
  async fetchQr(bookingId) {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(this.qrUrl(bookingId), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('QR no disponible');
    return URL.createObjectURL(await res.blob());
  }

  /** Deja una reseña (requiere reserva COMPLETED propia). */
  async createReview(bookingId, rating, comment) {
    return apiClient.post(config.endpoints.reviews, { bookingId, rating, comment });
  }

  async createPaymentPreference(bookingId) {
    if (config.useMockData) {
      return { preferenceId: 'mock', initPoint: '#' };
    }
    return apiClient.post(config.endpoints.payments + '/preference', { bookingId });
  }

  async pollPaymentStatus(bookingId, collection_status, payment_id) {
    const params = new URLSearchParams();
    if (collection_status) params.set('collection_status', collection_status);
    if (payment_id)        params.set('payment_id', payment_id);
    const qs = params.toString() ? '?' + params.toString() : '';
    return apiClient.get(`${config.endpoints.payments}/${bookingId}${qs}`);
  }

  /** Pago directo vía Checkout API (Tarjeta/CardForm o Yape) — sin redirect, respuesta inmediata. */
  async processPayment(bookingId, payload) {
    if (config.useMockData) {
      return { status: 'approved', bookingStatus: 'CONFIRMED' };
    }
    return apiClient.post(`${config.endpoints.payments}/process`, { bookingId, ...payload });
  }
}

export const bookingService = new BookingService();
