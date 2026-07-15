import { config } from '../config/config';
import { apiClient } from './api';
import { rooms } from '../data/roomsData';

/** Mapea RoomResponse del backend al formato que usan los componentes (mismo que mock). */
function normalizeRoom(r) {
  return {
    id:            r.roomId,
    name:          r.roomTypeName,
    category:      r.category?.toLowerCase(),
    categoryDisplay: r.categoryDisplay,
    description:   r.description,
    location:      r.hotelDistrict,
    address:       r.hotelAddress,
    hotelName:     r.hotelName,
    hotelId:       r.hotelId,
    coordinates:   (r.latitude != null && r.longitude != null)
                     ? { lat: Number(r.latitude), lng: Number(r.longitude) }
                     : null,
    price:         r.basePriceNight,
    pricePerHour:  r.basePriceHour,
    guests:        r.maxGuests,
    size:          r.areaSqm != null ? `${r.areaSqm}m²` : null,
    image:         r.thumbnailUrl,
    images:        r.images?.length ? r.images : (r.thumbnailUrl ? [r.thumbnailUrl] : []),
    amenities:     r.amenities || [],
    tags:          r.tags || [],
    starRating:    r.starRating,
    allowsVelocity: r.allowsVelocity,
    roomTypeId:    r.roomTypeId,
    roomNumber:    r.roomNumber,
    floor:         r.floor,
    status:        r.status,
  };
}

/** Mapea los filtros del frontend al formato de query params que espera el backend. */
function toApiParams(filters) {
  const params = {};

  // checkIn / checkOut requeridos por el backend — si no vienen, usar hoy/mañana
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const fmt = d => d.toISOString().split('T')[0];

  params.checkIn  = filters.checkIn  || fmt(today);
  params.checkOut = filters.checkOut || fmt(tomorrow);

  if (filters.guests)   params.guests = filters.guests;
  if (filters.category && filters.category !== 'all') params.category = filters.category.toUpperCase();
  if (filters.velocityOnly) params.velocityOnly = true;
  if (filters.location) params.location = filters.location;

  // priceRange → maxPriceNight
  if (filters.maxPriceNight) {
    params.maxPriceNight = filters.maxPriceNight;
  } else if (filters.priceRange === 'budget') {
    params.maxPriceNight = 200;
  } else if (filters.priceRange === 'mid') {
    params.maxPriceNight = 400;
  }

  // sortBy: frontend usa 'price-low'/'price-high', backend usa 'price_asc'/'price_desc'
  if (filters.sortBy === 'price-low')  params.sortBy = 'price_asc';
  else if (filters.sortBy === 'price-high') params.sortBy = 'price_desc';
  else if (filters.sortBy === 'rating')     params.sortBy = 'rating';

  return params;
}

// ponytail: sin fallback a mock cuando la API falla — los errores deben verse,
// no esconderse detrás de habitaciones fantasma. Mock solo si VITE_USE_MOCK_DATA=true.
class RoomService {
  async getAllRooms(filters = {}) {
    if (config.useMockData) {
      return this._filterMockRooms(rooms, filters);
    }
    const response = await apiClient.get(config.endpoints.rooms, toApiParams(filters));
    const list = Array.isArray(response) ? response : (response?.content || response?.data || []);
    return list.map(normalizeRoom);
  }

  async getRoomById(id) {
    if (config.useMockData) {
      return rooms.find(r => r.id === parseInt(id)) || null;
    }
    const response = await apiClient.get(`${config.endpoints.rooms}/${id}`);
    return normalizeRoom(response);
  }

  async searchRooms(searchParams) {
    return this.getAllRooms(searchParams);
  }

  /** Disponibilidad puntual para la habitación del detalle, según fechas/horario elegidos. */
  async checkAvailability(roomId, { checkIn, checkOut, bookingType, checkInTime, checkOutTime }) {
    if (config.useMockData) return { available: true };
    const params = { checkIn, bookingType: bookingType || 'NIGHTLY' };
    if (checkOut)     params.checkOut = checkOut;
    if (checkInTime)  params.checkInTime = checkInTime;
    if (checkOutTime) params.checkOutTime = checkOutTime;
    return apiClient.get(`${config.endpoints.rooms}/${roomId}/availability`, params);
  }

  async getSimilarRooms(roomId, limit = 3) {
    if (config.useMockData) {
      const room = rooms.find(r => r.id === parseInt(roomId));
      if (!room) return [];
      return rooms
        .filter(r => r.id !== parseInt(roomId) && r.category === room.category)
        .slice(0, limit);
    }
    try {
      const response = await apiClient.get(`${config.endpoints.rooms}/${roomId}/similar`, { limit });
      const list = Array.isArray(response) ? response : (response?.data || []);
      return list.map(normalizeRoom);
    } catch {
      // Similares es contenido secundario — si falla, lista vacía sin romper la página
      return [];
    }
  }

  _filterMockRooms(roomsList, filters) {
    let filtered = [...roomsList];
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(room => room.category === filters.category);
    }
    if (filters.priceRange === 'budget') {
      filtered = filtered.filter(room => room.price < 200);
    } else if (filters.priceRange === 'mid') {
      filtered = filtered.filter(room => room.price >= 200 && room.price < 400);
    } else if (filters.priceRange === 'luxury') {
      filtered = filtered.filter(room => room.price >= 400);
    }
    if (filters.sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    }
    return new Promise(resolve => setTimeout(() => resolve(filtered), 100));
  }
}

export const roomService = new RoomService();
