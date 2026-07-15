import { useState, useEffect, useRef } from 'react';
import { loadMercadoPago } from '@mercadopago/sdk-js';
import { bookingService } from '../../services/bookingService';

/**
 * Pago vía MercadoPago (Wallet Brick) — permite pagar con saldo o con tarjetas guardadas
 * en la cuenta de MercadoPago del usuario, todo dentro de la misma página.
 *
 * ponytail: Tarjeta (CardForm) y Yape (Checkout API directo) se probaron a fondo pero
 * MercadoPago los rechaza sistemáticamente en este entorno de pruebas (ver historial de
 * commits) — el Wallet Brick es la única vía confirmada funcionando de punta a punta,
 * y ya permite pagar con tarjeta (el propio checkout de MP lista las tarjetas guardadas).
 * Si se retoma Tarjeta/Yape en el futuro, revisar esos commits para no repetir el trabajo.
 */
export default function PaymentMethods({ booking, onApproved }) {
  const publicKey = import.meta.env.VITE_MP_PUBLIC_KEY;

  const handleResult = (res) => {
    if (res.status === 'approved') {
      onApproved({ ...booking, status: res.bookingStatus ?? 'CONFIRMED' });
    }
    return res;
  };

  if (!publicKey) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        Los pagos en línea no están disponibles en este momento. Puedes pagar directamente en el hotel al hacer check-in.
      </div>
    );
  }

  return <WalletPanel publicKey={publicKey} booking={booking} onResult={handleResult} />;
}

/** Carga la SDK y crea la instancia de MercadoPago con la key dada. */
function useMercadoPago(publicKey) {
  const [mpReady, setMpReady] = useState(false);
  const mpRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    loadMercadoPago().then(() => {
      if (cancelled) return;
      mpRef.current = new window.MercadoPago(publicKey, { locale: 'es-PE' });
      setMpReady(true);
    });
    return () => { cancelled = true; };
  }, [publicKey]);

  return [mpRef, mpReady];
}

/* ── Pagar con MercadoPago (Wallet Brick) ────────────────────────────────── */
function WalletPanel({ publicKey, booking, onResult }) {
  const [mp, mpReady] = useMercadoPago(publicKey);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(true);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mpReady || mounted.current) return;
    mounted.current = true;

    bookingService.createPaymentPreference(booking.id)
      .then(({ preferenceId }) =>
        mp.current.bricks().create('wallet', 'wallet_container', {
          initialization: { preferenceId },
          callbacks: {
            onError: () => setError('No se pudo cargar el botón de pago.'),
          },
        })
      )
      .catch(() => setError('No se pudo iniciar el pago con MercadoPago.'))
      .finally(() => setLoading(false));
  }, [mpReady, mp, booking]);

  // El Wallet Brick confirma el pago del lado de MP; el estado real de la reserva
  // se ve reflejado al recargar o vía polling — aquí solo mostramos el widget.
  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-3">Pagar con MercadoPago</p>
      {loading && <p className="text-sm text-gray-400 mb-2">Cargando…</p>}
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
      <div id="wallet_container" />
      <p className="text-xs text-gray-400 mt-2">
        Puedes pagar con saldo disponible o con tus tarjetas guardadas en MercadoPago.
      </p>
    </div>
  );
}
