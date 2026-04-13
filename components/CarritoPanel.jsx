'use client';

import CarritoItem from './CarritoItem';

function formatPrecio(n) {
  return '$' + n.toLocaleString('es-AR');
}

export default function CarritoPanel({ carrito, abierto, onCerrar, onCambiarCantidad, onEliminar, onCheckout }) {
  const total = carrito.reduce((a, i) => a + i.precio * i.cantidad, 0);

  return (
    <>
      <div className={`carrito-overlay${abierto ? ' visible' : ''}`} onClick={onCerrar}></div>
      <aside className={`carrito-panel${abierto ? ' abierto' : ''}`}>
        <div className="carrito-panel__header">
          <h2 className="carrito-panel__titulo">Tu carrito</h2>
          <button className="carrito-panel__cerrar" onClick={onCerrar} aria-label="Cerrar">&times;</button>
        </div>

        <div className="carrito-panel__items">
          {carrito.map(item => (
            <CarritoItem
              key={item.id}
              item={item}
              onCambiarCantidad={onCambiarCantidad}
              onEliminar={onEliminar}
            />
          ))}
        </div>

        {carrito.length === 0 ? (
          <div className="carrito-panel__vacio" style={{ display: 'flex' }}>
            <p>Tu carrito está vacío.</p>
          </div>
        ) : (
          <div className="carrito-panel__footer">
            <div className="carrito-panel__total">
              <span>Total</span>
              <span>{formatPrecio(total)}</span>
            </div>
            <button className="carrito-panel__checkout" onClick={onCheckout}>
              Finalizar compra
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
