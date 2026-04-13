'use client';

import { useEffect } from 'react';
import Image from 'next/image';

function getHoverSrc(src) {
  const dot = src.lastIndexOf('.');
  return src.slice(0, dot) + '-m' + src.slice(dot);
}

function formatPrecio(n) {
  return '$' + n.toLocaleString('es-AR');
}

const catLabels = { aros: 'Aros', collares: 'Collares', pulseras: 'Pulseras' };

export default function ModalProducto({ producto, onCerrar, onAgregar }) {
  const hoverSrc = getHoverSrc(producto.imagen);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    function onKey(e) { if (e.key === 'Escape') onCerrar(); }
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [onCerrar]);

  return (
    <>
      <div className="modal-overlay visible" onClick={onCerrar}></div>
      <div className="modal-producto visible" role="dialog" aria-modal="true">
        <button className="modal-producto__cerrar" onClick={onCerrar} aria-label="Cerrar">&times;</button>
        <div className="modal-producto__cuerpo">
          <div className="modal-producto__galeria">
            <div className="modal-producto__img-wrapper">
              <Image src={producto.imagen} alt={producto.nombre} fill className="modal-producto__img" style={{ objectFit: 'cover' }} sizes="50vw" />
              <Image src={hoverSrc} alt={producto.nombre} fill className="modal-producto__img-hover" style={{ objectFit: 'cover' }} sizes="50vw" onError={() => {}} />
            </div>
          </div>
          <div className="modal-producto__info">
            <span className="modal-producto__categoria">{catLabels[producto.categoria] || producto.categoria}</span>
            <h2 className="modal-producto__nombre">{producto.nombre}</h2>
            <p className="modal-producto__descripcion">{producto.descripcion}</p>
            <p className="modal-producto__material">Acero inoxidable bañado en oro 18k</p>
            <div className="modal-producto__precio-fila">
              <span className="modal-producto__precio">{formatPrecio(producto.precio)}</span>
              <span className="modal-producto__cuotas">3 cuotas sin interés</span>
            </div>
            <button className="modal-producto__agregar" onClick={() => onAgregar(producto)}>
              Agregar al carrito
            </button>
            <div className="modal-producto__detalles">
              <p>✓ Envío gratis desde $80.000</p>
              <p>✓ 20% OFF pagando con transferencia</p>
              <p>✓ Devolución dentro de los 15 días</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
