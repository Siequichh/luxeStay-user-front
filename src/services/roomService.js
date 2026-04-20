import { config } from '../config/config';
import { apiClient } from './api';
import { rooms } from '../data/roomsData';

/**
 * Servicio para gestionar habitaciones
 * Soporta modo MOCK y modo API real
 */
class RoomService {
  /**
   * Obtiene todas las habitaciones
   * @param {object} filters - Filtros opcionales (category, priceRange, sortBy)
   * @returns {Promise<Array>} Lista de habitaciones
   */
  async getAllRooms(filters = {}) {
    if (config.useMockData) {
      // Modo MOCK: Devuelve datos locales
      return this._filterMockRooms(rooms, filters);
    } else {
      // Modo API: Consulta al backend
      try {
        const response = await apiClient.get(config.endpoints.rooms, filters);
        return response.data || response;
      } catch (error) {
        console.error('Error fetching rooms:', error);
        // Fallback a datos mock en caso de error
        return this._filterMockRooms(rooms, filters);
      }
    }
  }

  /**
   * Obtiene una habitación por ID
   * @param {number|string} id - ID de la habitación
   * @returns {Promise<object>} Datos de la habitación
   */
  async getRoomById(id) {
    if (config.useMockData) {
      // Modo MOCK: Busca en datos locales
      const room = rooms.find(r => r.id === parseInt(id));
      return room || null;
    } else {
      // Modo API: Consulta al backend
      try {
        const endpoint = config.endpoints.roomDetail.replace(':id', id);
        const response = await apiClient.get(endpoint);
        return response.data || response;
      } catch (error) {
        console.error(`Error fetching room ${id}:`, error);
        // Fallback a datos mock
        return rooms.find(r => r.id === parseInt(id)) || null;
      }
    }
  }

  /**
   * Busca habitaciones según criterios
   * @param {object} searchParams - Parámetros de búsqueda
   * @returns {Promise<Array>} Habitaciones que coinciden
   */
  async searchRooms(searchParams) {
    if (config.useMockData) {
      // Modo MOCK: Filtra datos locales
      return this._filterMockRooms(rooms, searchParams);
    } else {
      // Modo API: Consulta al backend
      try {
        const response = await apiClient.get(config.endpoints.search, searchParams);
        return response.data || response;
      } catch (error) {
        console.error('Error searching rooms:', error);
        return this._filterMockRooms(rooms, searchParams);
      }
    }
  }

  /**
   * Filtra habitaciones mock según criterios
   * @private
   */
  _filterMockRooms(roomsList, filters) {
    let filtered = [...roomsList];

    // Filtrar por categoría
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(room => room.category === filters.category);
    }

    // Filtrar por rango de precio
    if (filters.priceRange) {
      if (filters.priceRange === 'budget') {
        filtered = filtered.filter(room => room.price < 200);
      } else if (filters.priceRange === 'mid') {
        filtered = filtered.filter(room => room.price >= 200 && room.price < 400);
      } else if (filters.priceRange === 'luxury') {
        filtered = filtered.filter(room => room.price >= 400);
      }
    }

    // Ordenar
    if (filters.sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    }

    // Simular delay de red (opcional, para testing)
    return new Promise(resolve => {
      setTimeout(() => resolve(filtered), 100);
    });
  }

  /**
   * Obtiene habitaciones similares
   * @param {number|string} roomId - ID de la habitación de referencia
   * @param {number} limit - Cantidad de habitaciones a devolver
   * @returns {Promise<Array>} Habitaciones similares
   */
  async getSimilarRooms(roomId, limit = 3) {
    const room = await this.getRoomById(roomId);
    if (!room) return [];

    if (config.useMockData) {
      // Modo MOCK: Filtra por misma categoría
      return rooms
        .filter(r => r.id !== parseInt(roomId) && r.category === room.category)
        .slice(0, limit);
    } else {
      // Modo API: Consulta al backend
      try {
        const response = await apiClient.get(`${config.endpoints.rooms}/${roomId}/similar`, {
          limit
        });
        return response.data || response;
      } catch (error) {
        console.error('Error fetching similar rooms:', error);
        return rooms
          .filter(r => r.id !== parseInt(roomId) && r.category === room.category)
          .slice(0, limit);
      }
    }
  }
}

// Exportar instancia única del servicio
export const roomService = new RoomService();
