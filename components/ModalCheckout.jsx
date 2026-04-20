'use client';

import { useState, useEffect, Fragment } from 'react';

function formatPrecio(n) {
  return '$' + n.toLocaleString('es-AR');
}

export default function ModalCheckout({ carrito, onCerrar, onConfirmar }) {
  const [paso, setPaso] = useState(1);
  const [metodoPago, setMetodoPago] = useState('transferencia');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', telefono: '',
    direccion: '', ciudad: '', provincia: '', cp: '',
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    function onKey(e) { if (e.key === 'Escape') onCerrar(); }
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [onCerrar]);

  const totalBase = carrito.reduce((a, i) => a + i.precio * i.cantidad, 0);
  const total = metodoPago === 'transferencia' ? Math.round(totalBase * 0.8) : totalBase;
  const totalLabel = metodoPago === 'transferencia' ? 'Total (con 20% OFF)' : 'Total';

  function handleInput(e) {
    setForm(prev => ({ ...prev, [e.target.id]: e.target.value }));
  }

  function pasoSiguiente() {
    if (!form.nombre.trim() || !form.email.trim() || !form.direccion.trim()) {
      setError('Por favor completá los campos obligatorios (*)');
      return;
    }
    setError('');
    setPaso(2);
  }

  const pasos = ['Envío', 'Pago', 'Confirmar'];

  return (
    <>
      <div className="checkout-overlay visible" onClick={onCerrar}></div>
      <div className="checkout-modal visible" role="dialog" aria-modal="true">
        <button className="checkout-modal__cerrar" onClick={onCerrar} aria-label="Cerrar">&times;</button>

        {/* Indicador de pasos */}
        <div className="checkout-pasos">
          {pasos.map((label, i) => {
            const num = i + 1;
            const cls = num === paso ? 'checkout-paso--activo' : num < paso ? 'checkout-paso--hecho' : '';
            return (
              <Fragment key={num}>
                <div className={`checkout-paso ${cls}`} data-paso={num}>
                  <span className="checkout-paso__num">{num}</span>
                  <span className="checkout-paso__label">{label}</span>
                </div>
                {i < pasos.length - 1 && <span className="checkout-paso__linea"></span>}
              </Fragment>
            );
          })}
        </div>

        {/* Paso 1: Envío */}
        {paso === 1 && (
          <div className="checkout-step activo">
            <h2 className="checkout-step__titulo">Datos de envío</h2>
            <div className="checkout-form__grid">
              {[
                { id: 'nombre',    label: 'Nombre *',   placeholder: 'Tu nombre',          req: true },
                { id: 'apellido',  label: 'Apellido',   placeholder: 'Tu apellido' },
                { id: 'email',     label: 'Email *',    placeholder: 'tu@email.com',        req: true, full: true },
                { id: 'telefono',  label: 'Teléfono',   placeholder: '+54 11 0000-0000',    full: true },
                { id: 'direccion', label: 'Dirección *',placeholder: 'Calle y número',      req: true, full: true },
                { id: 'ciudad',    label: 'Ciudad',     placeholder: 'Ciudad' },
                { id: 'provincia', label: 'Provincia',  placeholder: 'Provincia' },
                { id: 'cp',        label: 'Código Postal', placeholder: '0000',             full: true },
              ].map(f => (
                <div key={f.id} className={`checkout-field${f.full ? ' checkout-field--full' : ''}`}>
                  <label className="checkout-field__label" htmlFor={f.id}>{f.label}</label>
                  <input
                    className={`checkout-field__input${f.req && !form[f.id].trim() && error ? ' error' : ''}`}
                    id={f.id}
                    type={f.id === 'email' ? 'email' : 'text'}
                    placeholder={f.placeholder}
                    value={form[f.id]}
                    onChange={handleInput}
                  />
                </div>
              ))}
            </div>
            <p className="checkout-error">{error}</p>
            <button className="checkout-btn" onClick={pasoSiguiente}>Continuar al pago</button>
          </div>
        )}

        {/* Paso 2: Pago */}
        {paso === 2 && (
          <div className="checkout-step activo">
            <h2 className="checkout-step__titulo">Método de pago</h2>
            <div className="checkout-metodos">
              {[
                { value: 'transferencia', label: 'Transferencia bancaria', desc: 'Alias: franchus.joyas · CBU: 0000 1234 5678 9012', badge: '20% OFF' },
                { value: 'mercadopago',   label: 'MercadoPago',            desc: '3 cuotas sin interés con tarjeta seleccionada' },
                { value: 'efectivo',      label: 'Efectivo',               desc: 'Coordinar retiro o entrega personal en Vicente López' },
              ].map(m => (
                <label key={m.value} className="checkout-metodo" style={{ borderColor: metodoPago === m.value ? 'var(--color-oro)' : '', backgroundColor: metodoPago === m.value ? '#fefcf8' : '' }}>
                  <input type="radio" name="pago" value={m.value} checked={metodoPago === m.value} onChange={() => setMetodoPago(m.value)} />
                  <div className="checkout-metodo__contenido">
                    <div className="checkout-metodo__fila">
                      <span className="checkout-metodo__nombre">{m.label}</span>
                      {m.badge && <span className="checkout-metodo__badge">{m.badge}</span>}
                    </div>
                    <span className="checkout-metodo__desc">{m.desc}</span>
                  </div>
                </label>
              ))}
            </div>
            <div className="checkout-total-preview">
              <span id="checkout-total-label">{totalLabel}</span>
              <span id="checkout-total-val">{formatPrecio(total)}</span>
            </div>
            <div className="checkout-nav">
              <button className="checkout-btn checkout-btn--outline" onClick={() => setPaso(1)}>Volver</button>
              <button className="checkout-btn" onClick={() => setPaso(3)}>Confirmar pedido</button>
            </div>
          </div>
        )}

        {/* Paso 3: Confirmación */}
        {paso === 3 && (
          <div className="checkout-step activo">
            <div className="checkout-exito">
              <div className="checkout-exito__icono">✓</div>
              <h2 className="checkout-exito__titulo">¡Pedido confirmado!</h2>
              <p className="checkout-exito__subtitulo">
                Te enviamos los detalles a <strong>{form.email}</strong>
              </p>
              <div className="checkout-resumen">
                {carrito.map(item => (
                  <div key={item.id} className="checkout-resumen__item">
                    <span>{item.nombre} × {item.cantidad}</span>
                    <span>{formatPrecio(item.precio * item.cantidad)}</span>
                  </div>
                ))}
                <div className="checkout-resumen__item checkout-resumen__total">
                  <span>{totalLabel}</span>
                  <span>{formatPrecio(total)}</span>
                </div>
              </div>
              <button className="checkout-btn" onClick={onConfirmar}>Volver a la tienda</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
