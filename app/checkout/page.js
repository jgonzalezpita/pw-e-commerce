'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function formatPrecio(n) {
  return '$' + Number(n).toLocaleString('es-AR');
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ordenId = searchParams.get('orden');

  const [orden, setOrden] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ordenId) {
      router.push('/ordenes');
      return;
    }
    fetch('/api/ordenes')
      .then(r => r.json())
      .then(ordenes => {
        const found = ordenes.find(o => String(o.id) === String(ordenId));
        if (!found) {
          setError('Orden no encontrada');
        } else {
          setOrden(found);
        }
        setCargando(false);
      })
      .catch(() => {
        setError('Error al cargar la orden');
        setCargando(false);
      });
  }, [ordenId, router]);

  async function handlePagar() {
    setProcesando(true);
    setError(null);
    try {
      const res = await fetch('/api/pagos/crear-preferencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orden_id: ordenId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error al procesar pago');
      // Semana 13: redirigirá a Mercado Pago
      alert('Integración con Mercado Pago disponible en Semana 13. Orden lista para pagar.');
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  }

  if (cargando) {
    return (
      <div className="checkout-page">
        <div className="checkout-loading">Cargando orden...</div>
      </div>
    );
  }

  if (error && !orden) {
    return (
      <div className="checkout-page">
        <div className="checkout-error">{error}</div>
        <Link href="/ordenes" className="checkout-btn checkout-btn--secondary">
          Volver a mis órdenes
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1 className="checkout-titulo">Finalizar Compra</h1>

        <div className="checkout-resumen">
          <h2 className="checkout-seccion-titulo">Resumen de la Orden</h2>
          <div className="checkout-dato">
            <span className="checkout-dato__label">Número de orden</span>
            <span className="checkout-dato__valor">#{orden?.id}</span>
          </div>
          <div className="checkout-dato">
            <span className="checkout-dato__label">Estado</span>
            <span className={`orden-card__estado orden-card__estado--${orden?.estado}`}>
              {orden?.estado}
            </span>
          </div>
          <div className="checkout-dato checkout-dato--total">
            <span className="checkout-dato__label">Total a pagar</span>
            <span className="checkout-dato__valor checkout-dato__valor--grande">
              {formatPrecio(orden?.total)}
            </span>
          </div>
        </div>

        <div className="checkout-metodos">
          <h2 className="checkout-seccion-titulo">Método de Pago</h2>
          <div className="checkout-metodo checkout-metodo--activo">
            <div className="checkout-metodo__icono">💳</div>
            <div className="checkout-metodo__info">
              <span className="checkout-metodo__nombre">Mercado Pago</span>
              <span className="checkout-metodo__desc">Tarjeta, transferencia o efectivo</span>
            </div>
          </div>
          <div className="checkout-metodo checkout-metodo--proximamente">
            <div className="checkout-metodo__icono">🏦</div>
            <div className="checkout-metodo__info">
              <span className="checkout-metodo__nombre">Transferencia bancaria</span>
              <span className="checkout-metodo__desc">Próximamente</span>
            </div>
          </div>
        </div>

        <div className="checkout-seguridad">
          <span className="checkout-seguridad__icono">🔒</span>
          <span className="checkout-seguridad__texto">
            Pago encriptado con SSL. Tus datos están protegidos.
          </span>
        </div>

        {error && <p className="checkout-error-inline">{error}</p>}

        <div className="checkout-acciones">
          <button
            onClick={handlePagar}
            disabled={procesando || orden?.estado !== 'pendiente'}
            className="checkout-btn checkout-btn--primary"
          >
            {procesando ? 'Procesando...' : `Pagar ${formatPrecio(orden?.total)}`}
          </button>
          <Link href="/ordenes" className="checkout-btn checkout-btn--secondary">
            Volver a mis órdenes
          </Link>
        </div>
      </div>
    </div>
  );
}
