import { Component, useEffect, useState } from 'react';
import { useParams, useLocation, useSearchParams, Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import PaymentMethods from '../components/booking/PaymentMethods';

// Los error boundaries de React solo pueden ser class components. Aísla fallas inesperadas
// de la SDK de MercadoPago para que no dejen en blanco toda la página de confirmación
// (que también muestra el QR y el resumen de la reserva).
class PaymentErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error) { console.error('PaymentMethods crashed:', error); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          No se pudieron cargar los métodos de pago en línea. Puedes pagar directamente en el hotel al hacer check-in.
        </div>
      );
    }
    return this.props.children;
  }
}

const STATUS_LABELS = {
  PENDING:   { text: 'Pendiente de pago',    color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  CONFIRMED: { text: 'Confirmada',            color: 'text-green-700 bg-green-50 border-green-200'   },
  CANCELLED: { text: 'Cancelada',             color: 'text-red-700 bg-red-50 border-red-200'         },
  COMPLETED: { text: 'Completada',            color: 'text-blue-700 bg-blue-50 border-blue-200'      },
};

const fmt   = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
const money = (n) => n != null ? `S/. ${Number(n).toFixed(2)}` : '—';

export default function BookingConfirmation() {
  const { code }            = useParams();
  const { state }           = useLocation();
  const [searchParams]      = useSearchParams();
  const [booking, setBooking] = useState(state?.booking ?? null);
  const [paying, setPaying]   = useState(false);
  const [payError, setPayError] = useState('');
  const [polling, setPolling]   = useState(false);
  const [qrSrc, setQrSrc]       = useState(null);

  // Retorno de MercadoPago = recarga completa de página (window.location.href), no navegación
  // de React Router — el state con la reserva se pierde. Si no lo tenemos, lo recuperamos por código.
  useEffect(() => {
    const collectionStatus = searchParams.get('payment');   // nuestro custom: success|failure
    const mpStatus  = searchParams.get('collection_status');
    // El Wallet Brick solo agrega collection_id al volver (no payment_id/collection_status
    // como el redirect clásico de Checkout Pro) — probar ambos nombres.
    const mpPayment = searchParams.get('payment_id') ?? searchParams.get('collection_id');
    const shouldConfirm = collectionStatus === 'success' || mpStatus === 'approved';

    const runPoll = (bookingId) => {
      setPolling(true);
      bookingService.pollPaymentStatus(bookingId, mpStatus ?? 'approved', mpPayment)
        .then(res => setBooking(b => b ? { ...b, status: res.status } : b))
        .catch(() => {})
        .finally(() => setPolling(false));
    };

    if (booking?.id) {
      if (shouldConfirm) runPoll(booking.id);
      return;
    }

    if (!code) return;
    bookingService.getBookingByReferenceCode(code)
      .then(b => {
        setBooking(b);
        if (shouldConfirm && b?.id) runPoll(b.id);
      })
      .catch(() => {});
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const handlePay = async () => {
    if (!booking?.id) return;
    setPaying(true);
    setPayError('');
    try {
      const { initPoint } = await bookingService.createPaymentPreference(booking.id);
      window.location.href = initPoint;
    } catch (e) {
      setPayError(e?.message ?? 'Error al iniciar el pago. Intenta de nuevo.');
      setPaying(false);
    }
  };

  const statusInfo = STATUS_LABELS[booking?.status] ?? STATUS_LABELS.PENDING;
  const isConfirmed = booking?.status === 'CONFIRMED' || booking?.status === 'COMPLETED';

  // El endpoint QR requiere auth: se descarga como blob (un <img src> directo devolvía 401)
  useEffect(() => {
    if (!isConfirmed || !booking?.id) return;
    let url;
    bookingService.fetchQr(booking.id)
      .then(u => { url = u; setQrSrc(u); })
      .catch(() => {});
    return () => url && URL.revokeObjectURL(url);
  }, [isConfirmed, booking?.id]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-2xl">

        {/* Success banner */}
        <div className="text-center mb-10">
          <div className={`w-20 h-20 ${isConfirmed ? 'bg-green-100' : 'bg-yellow-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
            {isConfirmed
              ? <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              : <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            }
          </div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
            {isConfirmed ? '¡Reserva Confirmada!' : '¡Reserva Creada!'}
          </h1>
          <p className="text-gray-600">
            {isConfirmed ? 'Tu pago fue procesado. Aquí está tu código QR de check-in.' : 'Guarda tu código de referencia y completa el pago.'}
          </p>
        </div>

        {/* Reference code card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500 mb-1">Código de referencia</p>
            <p className="text-3xl font-mono font-bold text-primary tracking-widest">{code}</p>
            <span className={`inline-block mt-3 px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.color}`}>
              {statusInfo.text}
            </span>
            {polling && <p className="text-xs text-gray-400 mt-2">Verificando pago...</p>}
          </div>

          {booking && (
            <div className="divide-y divide-gray-100 text-sm">
              <Row label="Habitación"    value={`${booking.roomNumber ?? '—'} · ${booking.roomTypeName ?? '—'}`} />
              <Row label="Hotel"         value={booking.hotelName ?? '—'} />
              <Row label="Tipo"          value={booking.bookingType === 'NIGHTLY' ? 'Por noche' : 'Luxe Velocity (horas)'} />
              <Row label="Check-in"      value={fmt(booking.checkInDate)} />
              {booking.bookingType === 'NIGHTLY'
                ? <Row label="Check-out" value={fmt(booking.checkOutDate)} />
                : <Row label="Horario"   value={`${booking.checkInTime?.slice(0,5) ?? '—'} – ${booking.checkOutTime?.slice(0,5) ?? '—'}`} />
              }
              <Row label="Huéspedes"    value={`${booking.numGuests ?? 1}`} />
              <Row label="Base"         value={money(booking.baseAmount)} />
              <Row label="Fee servicio" value={money(booking.serviceFee)} />
              <Row label="IGV (18%)"    value={money(booking.taxes)} />
              <div className="flex justify-between py-3 font-bold text-base">
                <span>Total</span>
                <span className="text-primary">{money(booking.totalAmount)}</span>
              </div>
            </div>
          )}
        </div>

        {/* QR Code — solo si está confirmada */}
        {isConfirmed && qrSrc && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-center">
            <p className="text-sm font-semibold text-gray-700 mb-4">Código QR de check-in</p>
            <img
              src={qrSrc}
              alt="QR de check-in"
              className="mx-auto w-48 h-48 border rounded-xl"
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
            <a
              href={qrSrc}
              download={`qr-${code}.png`}
              className="inline-block mt-4 text-sm text-primary underline"
            >
              Descargar QR
            </a>
            <p className="text-xs text-gray-400 mt-2">Presenta este código al llegar al hotel.</p>
          </div>
        )}

        {/* Pago — solo si PENDING */}
        {booking?.status === 'PENDING' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-4 text-center">Completa tu pago para confirmar la reserva</p>

            <PaymentErrorBoundary>
              <PaymentMethods booking={booking} onApproved={setBooking} />
            </PaymentErrorBoundary>

            {/* El pago en línea no está disponible: panel informativo, no error */}
            {payError && (
              <div className="text-left bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4 text-sm text-amber-900 space-y-2">
                <p className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{payError}</span>
                </p>
                <p className="pl-6 text-amber-700">
                  Tu reserva ya está registrada con el código <strong className="font-mono">{code}</strong>.
                  Al llegar al hotel, paga en recepción y el gestor confirmará tu reserva.
                </p>
              </div>
            )}

            <button
              onClick={handlePay}
              disabled={paying}
              className="w-full mt-4 text-primary text-sm py-2 rounded-xl font-medium hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {paying && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {/* {paying ? 'Redirigiendo a MercadoPago...' : '¿Prefieres pagar en la página de MercadoPago?'} */}
            </button>
            <p className="text-xs text-gray-400 mt-1 text-center">
              También puedes pagar directamente en el hotel al hacer check-in.
            </p>
          </div>
        )}

        {/* Info box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8 text-sm text-blue-800 space-y-2">
          <p className="font-semibold">¿Qué sigue?</p>
          <p>• Recibirás una confirmación por email con los detalles de tu reserva.</p>
          <p>• Política de cancelación gratuita hasta 24 h antes del check-in.</p>
          <p>• Puedes gestionar tus reservas desde <strong>Mis Reservas</strong>.</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/my-bookings" className="flex-1 text-center bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors">
            Ver Mis Reservas
          </Link>
          <Link to="/rooms" className="flex-1 text-center border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
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
