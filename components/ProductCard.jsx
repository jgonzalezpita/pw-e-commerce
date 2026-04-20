'use client';

import Image from 'next/image';

function getHoverSrc(src) {
  const dot = src.lastIndexOf('.');
  return src.slice(0, dot) + '-m' + src.slice(dot);
}

function toCardId(nombre) {
  return nombre.toLowerCase().replace(/\s+/g, '-');
}

export default function ProductCard({ producto, onProductoClick, onAgregar }) {
  const { nombre, precio, imagen, categoria } = producto;
  const hoverSrc = getHoverSrc(imagen);

  function formatPrecio(n) {
    return '$' + n.toLocaleString('es-AR');
  }

  return (
    <article
      id={toCardId(nombre)}
      className="card"
      data-categoria={categoria}
      onClick={() => onProductoClick(producto)}
      style={{ cursor: 'pointer' }}
    >
      <figure className="card__img-wrapper">
        <Image
          src={imagen}
          alt={nombre}
          fill
          className="card__img"
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <Image
          src={hoverSrc}
          alt={nombre}
          fill
          className="card__img-hover"
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, 33vw"
          onError={() => {}}
        />
      </figure>
      <div className="card__info">
        <h3 className="card__nombre">{nombre}</h3>
        <span className="card__precio">{formatPrecio(precio)}</span>
        <button
          className="card__agregar"
          onClick={e => {
            e.stopPropagation();
            onAgregar(producto);
          }}
        >
          Agregar al carrito
        </button>
      </div>
    </article>
  );
}
