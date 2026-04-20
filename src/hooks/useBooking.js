import { useState } from 'react';
import { bookingService } from '../services/bookingService';

/**
 * Hook personalizado para gestionar reservas
 * @returns {object} { createBooking, loading, error, bookingData }
 */
export const useBooking = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookingData, setBookingData] = useState(null);

  /**
   * Crea una nueva reserva
   * @param {object} data - Datos de la reserva
   */
  const createBooking = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const result = await bookingService.createBooking(data);
      setBookingData(result);
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Error creating booking:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cancela una reserva
   * @param {string} bookingId - ID de la reserva
   */
  const cancelBooking = async (bookingId) => {
    try {
      setLoading(true);
      setError(null);
      const result = await bookingService.cancelBooking(bookingId);
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Error cancelling booking:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resetea el estado del booking
   */
  const resetBooking = () => {
    setBookingData(null);
    setError(null);
  };

  return {
    createBooking,
    cancelBooking,
    resetBooking,
    loading,
    error,
    bookingData
  };
};
