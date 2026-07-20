import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import RoomCard from '../components/room/RoomCard';
import MapLocation from '../components/map/MapLocation';
import OptimizedImage from '../components/common/OptimizedImage';
import { useAuth } from '../context/AuthContext';
import { useRoom, useSimilarRooms } from '../hooks/useRooms';
import { bookingService } from '../services/bookingService';
import { profileService } from '../services/profileService';
import { roomService } from '../services/roomService';
import { config } from '../config/config';
import { apiClient } from '../services/api';

const todayIso = () => new Date().toISOString().split('T')[0];
const addDaysIso = (iso, days) => {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const RoomDetail = () => {
  const { id } = useParams();
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, isLoggedIn } = useAuth();

  const { room, loading, error } = useRoom(id);
  const { similarRooms } = useSimilarRooms(id, 3);

  const [selectedImage, setSelectedImage] = useState(0);
  const [checkIn, setCheckIn] = useState(todayIso());
  const [checkOut, setCheckOut] = useState(addDaysIso(todayIso(), 1));
  const [guests, setGuests] = useState(1);
  const [bookingType, setBookingType] = useState('night');
  const [timeSlot, setTimeSlot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Disponibilidad real de ESTA habitación para las fechas/horario elegidos —
  // sin esto, la habitación siempre se mostraba como "Disponible" sin verificar.
  const [availability, setAvailability] = useState('checking'); // 'checking' | 'available' | 'unavailable' | 'idle'

  // Datos del huésped — precargados desde el perfil del usuario logueado
  const [guest, setGuest] = useState({ firstName: '', lastName: '', email: '', phone: '' });

  useEffect(() => {
    if (!isLoggedIn || !user) return;
    const nameParts = (user.fullName || '').trim().split(' ');
    setGuest(g => ({
      ...g,
      firstName: g.firstName || nameParts[0] || '',
      lastName:  g.lastName  || nameParts.slice(1).join(' ') || '',
      email:     g.email     || user.email || '',
    }));
    // El teléfono vive en el perfil, no en la sesión — cargarlo si existe
    profileService.getProfile()
      .then(p => { if (p?.phone) setGuest(g => ({ ...g, phone: g.phone || p.phone })); })
      .catch(() => {});
  }, [isLoggedIn, user]);

  // Al cambiar check-in, garantizar que check-out sea posterior
  const handleCheckInChange = (value) => {
    setCheckIn(value);
    if (checkOut <= value) setCheckOut(addDaysIso(value, 1));
  };

  const calculateNights = (checkInDate, checkOutDate) => {
    if (!checkInDate || !checkOutDate) return 0;
    return Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights(checkIn, checkOut);
  const totalPrice = useMemo(() => {
    if (!room) return 0;
    if (bookingType === 'night' && nights > 0) return room.price * nights;
    return bookingType === 'night' ? room.price : (room.pricePerHour ?? 0);
  }, [bookingType, nights, room]);

  // Desglose de precio — mismo cálculo que el backend (base → +5% fee → +18% IGV)
  const priceFee   = Math.round(totalPrice * 0.05 * 100) / 100;
  const priceIgv   = Math.round((totalPrice + priceFee) * 0.18 * 100) / 100;
  const priceTotal = Math.round((totalPrice + priceFee + priceIgv) * 100) / 100;

  // Re-consulta disponibilidad puntual cada vez que cambian fecha/horario — antes esta
  // habitación se mostraba "Disponible" sin verificar nada contra reservas existentes.
  useEffect(() => {
    if (!room) return;
    if (bookingType === 'night' && (!checkIn || !checkOut || checkOut <= checkIn)) return;
    // Aún no se elige el bloque horario: estado neutro, NO "no disponible" (no está reservada).
    if (bookingType === 'hours' && !timeSlot) { setAvailability('idle'); return; }

    setAvailability('checking');
    const params = bookingType === 'night'
      ? { checkIn, checkOut, bookingType: 'NIGHTLY' }
      : (() => {
          const [start, end] = timeSlot.split('-');
          return {
            checkIn,
            bookingType: 'HOURLY',
            checkInTime: `${start}:00`,
            checkOutTime: end === '00:00' ? '23:59:00' : `${end}:00`,
          };
        })();

    const timer = setTimeout(() => {
      roomService.checkAvailability(id, params)
        .then(res => setAvailability(res.available ? 'available' : 'unavailable'))
        // Fail-closed: si la verificación falla (red, backend caído, etc.) mejor bloquear
        // temporalmente que arriesgar un doble-booking silencioso. La creación de la reserva
        // igual la valida en el backend, pero esta pre-check no debe fingir disponibilidad.
        .catch(() => setAvailability('unavailable'));
    }, 300);

    return () => clearTimeout(timer);
  }, [id, room, bookingType, checkIn, checkOut, timeSlot]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando habitación…</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Habitación no encontrada</h1>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <Link to="/rooms" className="text-primary hover:underline">
            Ver todas las habitaciones
          </Link>
        </div>
      </div>
    );
  }

  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingError('');

    if (!isLoggedIn) {
      navigate('/login', { state: { from: { pathname: location.pathname } } });
      return;
    }

    if (!guest.phone.trim()) {
      setBookingError('El teléfono es requerido para la reserva.');
      return;
    }

    if (availability === 'unavailable') {
      setBookingError('Esta habitación ya no está disponible para las fechas/horario seleccionados.');
      return;
    }

    // Horarios para reserva HOURLY (Luxe Velocity)
    let checkInTime  = null;
    let checkOutTime = null;
    if (bookingType === 'hours' && timeSlot) {
      const [start, end] = timeSlot.split('-');
      checkInTime  = `${start}:00`;
      // El backend valida endTime > startTime — medianoche se envía como 23:59
      checkOutTime = end === '00:00' ? '23:59:00' : `${end}:00`;
    }

    const payload = {
      roomId:      Number(id),
      bookingType: bookingType === 'night' ? 'NIGHTLY' : 'HOURLY',
      checkInDate:  checkIn,
      checkOutDate: bookingType === 'night' ? checkOut : null,
      checkInTime,
      checkOutTime,
      numGuests:   guests,
      numChildren: 0,
      guestDetail: {
        firstName:     guest.firstName.trim(),
        lastName:      guest.lastName.trim(),
        email:         guest.email.trim(),
        phone:         guest.phone.trim(),
        saveForFuture: false,
      },
    };

    setSubmitting(true);
    try {
      const booking = await bookingService.createBooking(payload);
      navigate(`/booking/confirmation/${booking.referenceCode}`, { state: { booking } });
    } catch (err) {
      setBookingError(err.message || 'Error al crear la reserva. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-gray-600">
            <Link to="/" className="hover:text-primary">Inicio</Link>
            <span className="mx-2">/</span>
            <Link to="/rooms" className="hover:text-primary">Habitaciones</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{room.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Room Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
            <div className="flex-1">
              <span className="inline-block bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-semibold mb-3 uppercase tracking-wide">
                {room.categoryDisplay || room.category}
              </span>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
                {room.name}
              </h1>

              {/* Location */}
              <div className="flex items-center text-gray-600 mb-4">
                <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{room.hotelName ? `${room.hotelName} · ` : ''}{room.location || 'Lima, Perú'}</span>
              </div>
            </div>

            <div className="mt-4 md:mt-0 md:ml-8">
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-6 rounded-2xl border border-primary/20">
                <span className="text-gray-600 text-sm">Desde</span>
                <div className="text-4xl font-bold text-primary mt-1">
                  S/. {room.price}
                  <span className="text-xl text-gray-600 font-normal">/noche</span>
                </div>
                {room.pricePerHour != null && (
                  <div className="text-sm text-gray-600 mt-2 flex items-center">
                    <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2"></span>
                    o S/. {room.pricePerHour} por 4 horas
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 text-gray-700 bg-gray-50 p-4 rounded-xl">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Hasta {room.guests} huéspedes</span>
            </div>
            {room.size && (
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                <span>{room.size}</span>
              </div>
            )}
            {room.roomNumber && (
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Hab. {room.roomNumber}{room.floor != null ? ` · Piso ${room.floor}` : ''}</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="mb-10">
              <div className="relative w-full aspect-video sm:aspect-auto sm:h-96 md:h-[500px] rounded-2xl overflow-hidden mb-4 bg-gray-200 group shadow-xl">
                <OptimizedImage
                  src={(room.images && room.images[selectedImage]) || room.image}
                  alt={`${room.name} - Vista ${selectedImage + 1}`}
                  width={1200}
                  height={500}
                  quality={85}
                  priority={selectedImage === 0}
                  className="w-full h-full object-cover"
                  blur={true}
                />
                {room.images && room.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage(prev => (prev === 0 ? room.images.length - 1 : prev - 1))}
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-2 sm:p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110 z-10"
                      aria-label="Imagen anterior"
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setSelectedImage(prev => (prev === room.images.length - 1 ? 0 : prev + 1))}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-2 sm:p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110 z-10"
                      aria-label="Siguiente imagen"
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-black/70 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium backdrop-blur-sm">
                      {selectedImage + 1} / {room.images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnail Gallery - Responsive */}
              {room.images && room.images.length > 1 && (
                <div className="space-y-2 sm:space-y-3">
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
                    {room.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`relative aspect-square rounded-lg overflow-hidden transition-all flex-shrink-0 ${
                          selectedImage === index
                            ? 'ring-3 sm:ring-4 ring-primary shadow-lg scale-105'
                            : 'opacity-60 hover:opacity-100 hover:scale-105'
                        }`}
                        title={`Imagen ${index + 1}`}
                      >
                        <OptimizedImage
                          src={image}
                          alt={`Miniatura ${index + 1}`}
                          width={150}
                          quality={75}
                          objectFit="cover"
                          className="w-full h-full object-cover"
                          blur={false}
                        />
                        {selectedImage === index && (
                          <div className="absolute inset-0 bg-primary/20 border-2 border-primary rounded-lg"></div>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    {room.images.length} imágenes
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-10">
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-1 h-8 bg-primary rounded-full mr-4"></span>
                Descripción
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed pl-5">
                {room.description}
              </p>
            </div>

            {/* Amenities */}
            {room.amenities && room.amenities.length > 0 && (
              <div className="mb-10">
                <h2 className="text-3xl font-serif font-bold text-gray-900 mb-6 flex items-center">
                  <span className="w-1 h-8 bg-primary rounded-full mr-4"></span>
                  Amenidades
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pl-5">
                  {room.amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center p-5 bg-white rounded-xl hover:shadow-lg transition-all border-2 border-gray-100 hover:border-primary/30 group"
                    >
                      <div className="text-4xl mr-4 flex-shrink-0 group-hover:scale-110 transition-transform">
                        {typeof amenity === 'object' ? (amenity.icon || '✓') : '✓'}
                      </div>
                      <span className="text-gray-700 font-medium text-sm leading-tight">
                        {typeof amenity === 'object' ? amenity.name : amenity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cancellation Policy */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 mb-10">
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4 flex items-center">
                <svg className="w-7 h-7 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Política de Cancelación
              </h3>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2"></span>
                  <p><strong>Reserva por noche:</strong> Cancelación gratuita hasta 24 horas antes del check-in</p>
                </div>
                <div className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2"></span>
                  <p><strong>Luxe Velocity (por horas):</strong> Cancelación gratuita hasta 2 horas antes del bloque reservado</p>
                </div>
                <div className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2"></span>
                  <p>Reembolso completo si cancelas dentro del periodo permitido</p>
                </div>
                <div className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2"></span>
                  <p>Confirmación y código QR enviados instantáneamente por correo</p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-2xl p-7 sticky top-24 border-2 border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Reservar
                </h3>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  availability === 'unavailable' ? 'bg-red-100 text-red-700'
                    : availability === 'checking' ? 'bg-gray-100 text-gray-500'
                    : availability === 'idle' ? 'bg-gray-100 text-gray-500'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {availability === 'unavailable' ? 'No disponible'
                    : availability === 'checking' ? 'Verificando…'
                    : availability === 'idle' ? 'Elige un horario'
                    : 'Disponible'}
                </span>
              </div>

              <form onSubmit={handleBooking} className="space-y-5">
                {/* Tipo de Reserva */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Tipo de Reserva
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setBookingType('night')}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all shadow-sm ${
                        bookingType === 'night'
                          ? 'bg-primary text-white shadow-lg scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      Por Noche
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingType('hours')}
                      disabled={!room.allowsVelocity && room.pricePerHour == null}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed ${
                        bookingType === 'hours'
                          ? 'bg-primary text-white shadow-lg scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Por Horas
                    </button>
                  </div>
                </div>

                {bookingType === 'night' ? (
                  <>
                    <DatePicker
                      label={<>Check-in <span className="font-normal text-gray-400">(día de llegada)</span></>}
                      value={checkIn}
                      min={todayIso()}
                      onChange={handleCheckInChange}
                    />
                    <DatePicker
                      label={<>Check-out <span className="font-normal text-gray-400">(día de salida)</span></>}
                      value={checkOut}
                      min={addDaysIso(checkIn, 1)}
                      onChange={setCheckOut}
                      hint={nights > 0
                        ? `${nights} noche${nights > 1 ? 's' : ''} de estadía`
                        : 'La salida debe ser posterior a la llegada'}
                    />
                  </>
                ) : (
                  <>
                    <DatePicker
                      label="Fecha"
                      value={checkIn}
                      min={todayIso()}
                      onChange={setCheckIn}
                    />

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Bloque de 4 Horas
                      </label>
                      <select
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      >
                        <option value="">Selecciona horario</option>
                        <option value="08:00-12:00">08:00 - 12:00</option>
                        <option value="12:00-16:00">12:00 - 16:00</option>
                        <option value="16:00-20:00">16:00 - 20:00</option>
                        <option value="20:00-00:00">20:00 - 00:00</option>
                      </select>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm">
                      <div className="flex items-start gap-3">
                        <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </span>
                        <div>
                          <strong className="text-gray-900 block mb-0.5">Luxe Velocity</strong>
                          <p className="text-gray-600">Paga solo por el tiempo que necesitas. Flexibilidad total.</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Huéspedes
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {[...Array(room.guests || 1)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i + 1 === 1 ? 'Huésped' : 'Huéspedes'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Datos del huésped */}
                {isLoggedIn && (
                  <div className="border-t-2 border-gray-200 pt-5 space-y-4">
                    <h4 className="text-sm font-bold text-gray-700">Datos del huésped</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre *</label>
                        <input
                          type="text"
                          value={guest.firstName}
                          onChange={(e) => setGuest(g => ({ ...g, firstName: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Apellido *</label>
                        <input
                          type="text"
                          value={guest.lastName}
                          onChange={(e) => setGuest(g => ({ ...g, lastName: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Email *</label>
                      <input
                        type="email"
                        value={guest.email}
                        onChange={(e) => setGuest(g => ({ ...g, email: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Teléfono *</label>
                      <input
                        type="tel"
                        value={guest.phone}
                        onChange={(e) => setGuest(g => ({ ...g, phone: e.target.value }))}
                        placeholder="Ej: 987654321"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="border-t-2 border-gray-200 pt-5 mt-2">
                  <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>
                        {bookingType === 'night'
                          ? `${nights > 0 ? nights : 1} noche${nights !== 1 ? 's' : ''} × S/. ${room.price}`
                          : 'Bloque de 4 horas'}
                      </span>
                      <span>S/. {totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        Fee de servicio
                        <span className="text-xs bg-gray-200 text-gray-500 px-1.5 rounded">5%</span>
                      </span>
                      <span>S/. {priceFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        IGV
                        <span className="text-xs bg-gray-200 text-gray-500 px-1.5 rounded">18%</span>
                      </span>
                      <span>S/. {priceIgv.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="font-bold text-gray-900">Total a pagar</span>
                      <span className="text-xl font-bold text-primary">S/. {priceTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {availability === 'unavailable' && (
                  <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    Esta habitación ya está reservada para las fechas/horario seleccionados. Prueba con otra fecha u otro bloque horario.
                  </div>
                )}

                {bookingError && (
                  <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {bookingError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || availability === 'unavailable' || availability === 'checking' || availability === 'idle'}
                  className="w-full bg-gradient-to-r from-primary to-primary-600 text-white py-4 rounded-xl font-bold text-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {submitting
                    ? 'Procesando…'
                    : availability === 'idle'
                      ? 'Selecciona un horario'
                      : availability === 'unavailable'
                        ? 'No disponible'
                        : availability === 'checking'
                          ? 'Verificando disponibilidad…'
                          : isLoggedIn
                            ? 'Confirmar Reserva'
                            : 'Iniciar sesión para reservar'}
                </button>
              </form>

              <div className="mt-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 space-y-3 border border-gray-200">
                <h4 className="font-bold text-gray-900 text-sm mb-3 flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Tu reserva incluye:
                </h4>
                <div className="flex items-start text-sm text-gray-700">
                  <span className="text-green-600 mr-2 mt-0.5">✓</span>
                  <span>{bookingType === 'night' ? 'Cancelación gratuita hasta 24h antes' : 'Cancelación gratuita hasta 2h antes'}</span>
                </div>
                <div className="flex items-start text-sm text-gray-700">
                  <span className="text-green-600 mr-2 mt-0.5">✓</span>
                  <span>Check-in con código QR (sin colas)</span>
                </div>
                <div className="flex items-start text-sm text-gray-700">
                  <span className="text-green-600 mr-2 mt-0.5">✓</span>
                  <span>Confirmación instantánea por email</span>
                </div>
                <div className="flex items-start text-sm text-gray-700">
                  <span className="text-green-600 mr-2 mt-0.5">✓</span>
                  <span>Pago 100% seguro</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <ReviewsSection roomTypeId={room.roomTypeId || id} />

        {/* Map Location — solo si el gestor registró coordenadas o hay dirección */}
        {(room.coordinates || room.address) && (
          <div className="mt-16">
            <MapLocation
              address={room.address || room.location}
              coordinates={room.coordinates}
              hotelName={room.hotelName || room.name}
            />
          </div>
        )}

        {/* Similar Rooms */}
        {similarRooms.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8">
              Habitaciones Similares
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarRooms.map(similarRoom => (
                <RoomCard key={similarRoom.id} room={similarRoom} variant="compact" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAYS_ES   = ['Do','Lu','Ma','Mi','Ju','Vi','Sa'];

function DatePicker({ value, onChange, min, label, hint }) {
  const [open, setOpen]         = useState(false);
  const [viewYear, setViewYear] = useState(() => {
    const d = value ? new Date(value + 'T00:00:00') : new Date();
    return d.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    const d = value ? new Date(value + 'T00:00:00') : new Date();
    return d.getMonth();
  });
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const minDate  = min ? new Date(min + 'T00:00:00') : null;
  const selected = value ? new Date(value + 'T00:00:00') : null;
  const today    = new Date(); today.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();

  const prevMonth = () => viewMonth === 0 ? (setViewMonth(11), setViewYear(y => y - 1)) : setViewMonth(m => m - 1);
  const nextMonth = () => viewMonth === 11 ? (setViewMonth(0), setViewYear(y => y + 1)) : setViewMonth(m => m + 1);

  const select = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    if (minDate && d < minDate) return;
    onChange(d.toISOString().split('T')[0]);
    setOpen(false);
  };

  const displayValue = selected
    ? selected.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })
    : 'Selecciona fecha';

  return (
    <div ref={wrapperRef} className="relative">
      {label && <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full px-4 py-3 rounded-lg border text-left flex items-center justify-between bg-white transition-colors
          ${open ? 'border-primary ring-2 ring-primary/20' : 'border-gray-300 hover:border-primary/50'}`}
      >
        <span className={selected ? 'text-gray-900 text-sm' : 'text-gray-400 text-sm'}>{displayValue}</span>
        <svg className={`w-4 h-4 transition-colors ${open ? 'text-primary' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}

      {open && (
        <div className="absolute z-50 top-full mt-2 left-0 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-72">
          {/* Header mes/año */}
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span className="font-semibold text-gray-900 text-sm">{MONTHS_ES[viewMonth]} {viewYear}</span>
            <button type="button" onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          {/* Cabeceras días */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS_ES.map(d => <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>)}
          </div>

          {/* Grilla de días */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {[...Array(firstDay)].map((_, i) => <div key={`e${i}`} />)}
            {[...Array(daysInMonth)].map((_, i) => {
              const day     = i + 1;
              const date    = new Date(viewYear, viewMonth, day);
              const isPast  = minDate && date < minDate;
              const isSel   = selected && date.toDateString() === selected.toDateString();
              const isToday = date.toDateString() === today.toDateString();
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => select(day)}
                  disabled={isPast}
                  className={`text-sm rounded-lg py-1.5 mx-0.5 transition-colors font-medium leading-none
                    ${isSel  ? 'bg-primary text-white shadow-sm' : ''}
                    ${isToday && !isSel ? 'text-primary font-bold ring-1 ring-primary/30' : ''}
                    ${isPast ? 'text-gray-300 cursor-not-allowed' : isSel ? '' : 'text-gray-700 hover:bg-primary/10 hover:text-primary'}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Leyenda */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-primary inline-block" /> Seleccionado</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full border border-primary inline-block" /> Hoy</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewsSection({ roomTypeId }) {
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (config.useMockData) { setReviews([]); return; }
    setLoading(true);
    apiClient.get(`/reviews?roomTypeId=${roomTypeId}&size=5`)
      .then(page => setReviews(page.content ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [roomTypeId]);

  if (loading) return null;
  if (reviews.length === 0) return null;

  const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div className="mt-16">
      <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2 flex items-center gap-3">
        Reseñas
        <span className="text-lg font-normal text-yellow-500">★ {avg}</span>
        <span className="text-base font-normal text-gray-400">({reviews.length})</span>
      </h2>
      <div className="space-y-4 mt-6">
        {reviews.map(r => (
          <div key={r.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-gray-800 text-sm">{r.reviewerName}</span>
              <span className="text-yellow-400 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
            </div>
            {r.comment && <p className="text-gray-600 text-sm">{r.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default RoomDetail;
