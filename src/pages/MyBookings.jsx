import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';

const STATUS = {
  PENDING:   { label: 'Pendiente',   cls: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { label: 'Confirmada',  cls: 'bg-green-100 text-green-700'   },
  CANCELLED: { label: 'Cancelada',   cls: 'bg-red-100 text-red-700'       },
  COMPLETED: { label: 'Completada',  cls: 'bg-blue-100 text-blue-700'     },
  NO_SHOW:   { label: 'No se presentó', cls: 'bg-gray-100 text-gray-600'  },
};

const fmt = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const money = (n) => n != null ? `S/. ${Number(n).toFixed(2)}` : '—';

export default function MyBookings() {
  const [bookings, setBookings]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [cancelling, setCancelling] = useState(null);
  const [page, setPage]             = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const load = useCallback(async (p = 0) => {
    setLoading(true);
    setError('');
    try {
      const data = await bookingService.getMyBookings(p, 8);
      setBookings(data?.content ?? []);
      setTotalPages(data?.totalPages ?? 0);
      setPage(p);
    } catch (err) {
      setError(err.message || 'Error al cargar las reservas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(0); }, [load]);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')) return;
    setCancelling(bookingId);
    try {
      const updated = await bookingService.cancelBooking(bookingId);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: updated?.status ?? 'CANCELLED' } : b));
    } catch (err) {
      alert(err.message || 'No se pudo cancelar la reserva.');
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">

        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-gray-900">Mis Reservas</h1>
          <p className="text-gray-600 mt-1">Historial y gestión de tus reservas en LuxeStay</p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Sin reservas todavía</h2>
            <p className="text-gray-500 mb-6">Aún no has realizado ninguna reserva.</p>
            <Link
              to="/rooms"
              className="inline-block bg-primary text-white px-6 py-2.5 rounded-full font-semibold hover:bg-primary-600 transition-colors"
            >
              Explorar habitaciones
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {bookings.map(b => {
                const st = STATUS[b.status] ?? { label: b.status, cls: 'bg-gray-100 text-gray-600' };
                const canCancel = b.status === 'PENDING' || b.status === 'CONFIRMED';
                return (
                  <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

                      {/* Left: booking info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-mono text-sm font-bold text-primary">{b.referenceCode}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${st.cls}`}>{st.label}</span>
                          <span className="text-xs text-gray-400">
                            {b.bookingType === 'NIGHTLY' ? '🌙 Por noche' : '⚡ Luxe Velocity'}
                          </span>
                        </div>

                        <p className="font-semibold text-gray-900 truncate">
                          {b.roomNumber ? `Hab. ${b.roomNumber} · ` : ''}{b.roomTypeName ?? '—'}
                        </p>
                        <p className="text-sm text-gray-500">{b.hotelName ?? ''}</p>

                        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
                          <span>Check-in: <strong>{fmt(b.checkInDate)}</strong></span>
                          {b.bookingType === 'NIGHTLY'
                            ? <span>Check-out: <strong>{fmt(b.checkOutDate)}</strong></span>
                            : <span>Horario: <strong>{b.checkInTime?.slice(0,5)} – {b.checkOutTime?.slice(0,5)}</strong></span>
                          }
                          <span>Huéspedes: <strong>{b.numGuests}</strong></span>
                        </div>
                      </div>

                      {/* Right: total + action */}
                      <div className="flex flex-col items-end gap-3 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Total</p>
                          <p className="text-xl font-bold text-primary">{money(b.totalAmount)}</p>
                        </div>
                        {canCancel && (
                          <button
                            onClick={() => handleCancel(b.id)}
                            disabled={cancelling === b.id}
                            className="text-sm text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {cancelling === b.id ? 'Cancelando…' : 'Cancelar reserva'}
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-8">
                <button
                  onClick={() => load(page - 1)}
                  disabled={page === 0}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  ← Anterior
                </button>
                <span className="text-sm text-gray-600">
                  Página {page + 1} de {totalPages}
                </span>
                <button
                  onClick={() => load(page + 1)}
                  disabled={page >= totalPages - 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
