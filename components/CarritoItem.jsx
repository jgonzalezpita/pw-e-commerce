import Image from 'next/image';

function formatPrecio(n) {
  return '$' + n.toLocaleString('es-AR');
}

export default function CarritoItem({ item, onCambiarCantidad, onEliminar }) {
  return (
    <div className="carrito-item">
      <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0, backgroundColor: 'var(--color-beige)' }}>
        <Image
          src={item.imagen}
          alt={item.nombre}
          fill
          style={{ objectFit: 'cover' }}
          sizes="72px"
        />
      </div>
      <div className="carrito-item__info">
        <p className="carrito-item__nombre">{item.nombre}</p>
        <p className="carrito-item__precio">{formatPrecio(item.precio)}</p>
        <div className="carrito-item__controles">
          <button className="carrito-item__cantidad-btn" onClick={() => onCambiarCantidad(item.id, -1)}>−</button>
          <span className="carrito-item__cantidad">{item.cantidad}</span>
          <button className="carrito-item__cantidad-btn" onClick={() => onCambiarCantidad(item.id, 1)}>+</button>
        </div>
      </div>
      <button className="carrito-item__eliminar" onClick={() => onEliminar(item.id)} aria-label="Eliminar">×</button>
    </div>
  );
}
