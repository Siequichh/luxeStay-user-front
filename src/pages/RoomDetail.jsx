import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { getRoomById, rooms } from '../data/roomsData';
import RoomCard from '../components/room/RoomCard';
import MapLocation from '../components/map/MapLocation';
import OptimizedImage from '../components/common/OptimizedImage';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/bookingService';

const RoomDetail = () => {
  const { id } = useParams();
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, isLoggedIn } = useAuth();

  const [selectedImage, setSelectedImage] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [bookingType, setBookingType] = useState('night');
  const [timeSlot, setTimeSlot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const room = getRoomById(id) || rooms[0];

  const calculateNights = (checkInDate, checkOutDate) => {
    if (!checkInDate || !checkOutDate) return 0;
    const checkInObj = new Date(checkInDate);
    const checkOutObj = new Date(checkOutDate);
    return Math.ceil((checkOutObj - checkInObj) / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights(checkIn, checkOut);
  const totalPrice = useMemo(() => {
    if (bookingType === 'night' && nights > 0) {
      return room.price * nights;
    }
    return bookingType === 'night' ? room.price : room.pricePerHour;
  }, [bookingType, nights, room.price, room.pricePerHour]);

  // Si no hay habitación, mostrar mensaje
  if (!room) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Habitación no encontrada</h1>
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

    // Build guest detail from logged-in user
    const nameParts = (user.fullName || '').trim().split(' ');
    const firstName = nameParts[0] || user.email;
    const lastName  = nameParts.slice(1).join(' ') || nameParts[0] || '';

    // Build time fields for HOURLY booking
    let checkInTime  = null;
    let checkOutTime = null;
    if (bookingType === 'hours' && timeSlot) {
      const [start, end] = timeSlot.split('-');
      checkInTime  = `${start}:00`;
      checkOutTime = end === '00:00' ? '00:00:00' : `${end}:00`;
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
        firstName,
        lastName,
        email:         user.email,
        phone:         null,
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
                {room.category === 'standard' && 'Estándar'}
                {room.category === 'deluxe' && 'Deluxe'}
                {room.category === 'suite' && 'Suite'}
                {room.category === 'presidential' && 'Presidential'}
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
                <span>{room.location || 'Lima, Perú'}</span>
              </div>
            </div>

            <div className="mt-4 md:mt-0 md:ml-8">
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-6 rounded-2xl border border-primary/20">
                <span className="text-gray-600 text-sm">Desde</span>
                <div className="text-4xl font-bold text-primary mt-1">
                  S/. {room.price}
                  <span className="text-xl text-gray-600 font-normal">/noche</span>
                </div>
                <div className="text-sm text-gray-600 mt-2 flex items-center">
                  <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2"></span>
                  o S/. {room.pricePerHour} por 4 horas
                </div>
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
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <span>{room.size}</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>{room.bed}</span>
            </div>
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
            <div className="mb-10">
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-1 h-8 bg-primary rounded-full mr-4"></span>
                Amenidades
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pl-5">
                {(room.detailedAmenities || room.amenities.map(a => typeof a === 'string' ? { icon: '✓', name: a } : a)).map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center p-5 bg-white rounded-xl hover:shadow-lg transition-all border-2 border-gray-100 hover:border-primary/30 group"
                  >
                    <div className="text-4xl mr-4 flex-shrink-0 group-hover:scale-110 transition-transform">
                      {amenity.icon || '✓'}
                    </div>
                    <span className="text-gray-700 font-medium text-sm leading-tight">
                      {amenity.name || amenity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            {room.features && room.features.length > 0 && (
              <div className="mb-10">
                <h2 className="text-3xl font-serif font-bold text-gray-900 mb-6 flex items-center">
                  <span className="w-1 h-8 bg-primary rounded-full mr-4"></span>
                  Características Adicionales
                </h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-5">
                  {room.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-gray-700 bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                      <svg className="w-6 h-6 text-primary mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
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
                <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                  Disponible
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
                      className={`px-4 py-3 rounded-xl font-semibold transition-all shadow-sm ${
                        bookingType === 'night'
                          ? 'bg-primary text-white shadow-lg scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
                      }`}
                    >
                      🌙 Por Noche
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingType('hours')}
                      className={`px-4 py-3 rounded-xl font-semibold transition-all shadow-sm ${
                        bookingType === 'hours'
                          ? 'bg-primary text-white shadow-lg scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
                      }`}
                    >
                      ⚡ Por Horas
                    </button>
                  </div>
                </div>

                {bookingType === 'night' ? (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Check-in
                      </label>
                      <input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Check-out
                      </label>
                      <input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Fecha
                      </label>
                      <input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>

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

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-4 text-sm">
                      <div className="flex items-start">
                        <span className="text-2xl mr-2">⚡</span>
                        <div>
                          <strong className="text-blue-900 block mb-1">Luxe Velocity</strong>
                          <p className="text-blue-700">Paga solo por el tiempo que necesitas. Flexibilidad total.</p>
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
                    {[...Array(room.guests)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i + 1 === 1 ? 'Huésped' : 'Huéspedes'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="border-t-2 border-gray-200 pt-5 mt-2">
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-2 text-sm">
                      <span className="text-gray-600">
                        {bookingType === 'night'
                          ? `${nights > 0 ? nights : '1'} noche${nights > 1 ? 's' : ''}`
                          : 'Bloque de 4 horas'
                        }
                      </span>
                      <span className="font-semibold text-gray-900">
                        S/. {totalPrice}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-primary">
                        S/. {totalPrice}
                      </span>
                    </div>
                  </div>
                </div>

                {bookingError && (
                  <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {bookingError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-primary to-primary-600 text-white py-4 rounded-xl font-bold text-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {submitting
                    ? 'Procesando…'
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

        {/* Map Location */}
        <div className="mt-16">
          <MapLocation
            address={room.address || room.location}
            coordinates={room.coordinates}
            hotelName={room.name}
          />
        </div>

        {/* Similar Rooms */}
        <div className="mt-16">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8">
            Habitaciones Similares
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {rooms.filter(r => r.id !== Number(id) && r.category === room.category).slice(0, 3).map(similarRoom => (
              <RoomCard key={similarRoom.id} room={similarRoom} variant="compact" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetail;
