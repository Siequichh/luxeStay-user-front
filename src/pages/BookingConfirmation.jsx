import { useParams, useLocation, Link } from 'react-router-dom';

const STATUS_LABELS = {
  PENDING:   { text: 'Pendiente de confirmación', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  CONFIRMED: { text: 'Confirmada',                color: 'text-green-700 bg-green-50 border-green-200'   },
  CANCELLED: { text: 'Cancelada',                 color: 'text-red-700 bg-red-50 border-red-200'         },
  COMPLETED: { text: 'Completada',                color: 'text-blue-700 bg-blue-50 border-blue-200'      },
};

const fmt = (date) => date ? new Date(date + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
const money = (n) => n != null ? `S/. ${Number(n).toFixed(2)}` : '—';

export default function BookingConfirmation() {
  const { code }    = useParams();
  const { state }   = useLocation();
  const booking     = state?.booking;
  const statusInfo  = STATUS_LABELS[booking?.status] ?? STATUS_LABELS.PENDING;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-2xl">

        {/* Success banner */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">¡Reserva Creada!</h1>
          <p className="text-gray-600">Tu solicitud ha sido recibida. Guarda tu código de referencia.</p>
        </div>

        {/* Reference code card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500 mb-1">Código de referencia</p>
            <p className="text-3xl font-mono font-bold text-primary tracking-widest">{code}</p>
            <span className={`inline-block mt-3 px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.color}`}>
              {statusInfo.text}
            </span>
          </div>

          {booking && (
            <div className="divide-y divide-gray-100 text-sm">
              <Row label="Habitación"   value={`${booking.roomNumber ?? '—'} · ${booking.roomTypeName ?? '—'}`} />
              <Row label="Hotel"        value={booking.hotelName ?? '—'} />
              <Row label="Tipo"         value={booking.bookingType === 'NIGHTLY' ? 'Por noche' : 'Luxe Velocity (horas)'} />
              <Row label="Check-in"     value={fmt(booking.checkInDate)} />
              {booking.bookingType === 'NIGHTLY'
                ? <Row label="Check-out" value={fmt(booking.checkOutDate)} />
                : <Row label="Horario"   value={`${booking.checkInTime?.slice(0,5) ?? '—'} – ${booking.checkOutTime?.slice(0,5) ?? '—'}`} />
              }
              <Row label="Huéspedes"   value={`${booking.numGuests ?? 1}`} />
              <Row label="Base"        value={money(booking.baseAmount)} />
              <Row label="Fee servicio" value={money(booking.serviceFee)} />
              <Row label="IGV (18%)"   value={money(booking.taxes)} />
              <div className="flex justify-between py-3 font-bold text-base">
                <span>Total</span>
                <span className="text-primary">{money(booking.totalAmount)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Info box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8 text-sm text-blue-800 space-y-2">
          <p className="font-semibold">¿Qué sigue?</p>
          <p>• Recibirás una confirmación por email con tu código QR de check-in.</p>
          <p>• Política de cancelación gratuita hasta 24 h antes del check-in.</p>
          <p>• Puedes gestionar tus reservas desde <strong>Mis Reservas</strong>.</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/my-bookings"
            className="flex-1 text-center bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors"
          >
            Ver Mis Reservas
          </Link>
          <Link
            to="/rooms"
            className="flex-1 text-center border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Seguir explorando
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between py-3 text-gray-700">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
