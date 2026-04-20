import { useState, useEffect } from 'react';
import { roomService } from '../services/roomService';

/**
 * Hook personalizado para gestionar habitaciones
 * @param {object} filters - Filtros opcionales
 * @returns {object} { rooms, loading, error, refetch }
 */
export const useRooms = (filters = {}) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await roomService.getAllRooms(filters);
      setRooms(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [JSON.stringify(filters)]); // Re-fetch cuando cambien los filtros

  return {
    rooms,
    loading,
    error,
    refetch: fetchRooms
  };
};

/**
 * Hook para obtener una habitación específica
 * @param {number|string} id - ID de la habitación
 * @returns {object} { room, loading, error }
 */
export const useRoom = (id) => {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoom = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await roomService.getRoomById(id);
        setRoom(data);
      } catch (err) {
        setError(err.message);
        console.error(`Error loading room ${id}:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id]);

  return { room, loading, error };
};

/**
 * Hook para obtener habitaciones similares
 * @param {number|string} roomId - ID de la habitación de referencia
 * @param {number} limit - Cantidad de habitaciones similares
 * @returns {object} { similarRooms, loading, error }
 */
export const useSimilarRooms = (roomId, limit = 3) => {
  const [similarRooms, setSimilarRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSimilarRooms = async () => {
      if (!roomId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await roomService.getSimilarRooms(roomId, limit);
        setSimilarRooms(data);
      } catch (err) {
        setError(err.message);
        console.error('Error loading similar rooms:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarRooms();
  }, [roomId, limit]);

  return { similarRooms, loading, error };
};
