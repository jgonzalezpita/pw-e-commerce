import ProductCard from './ProductCard';

export default function Favoritos({ productos, onProductoClick, onAgregar }) {
  return (
    <section className="favoritos" id="favoritos">
      <p className="favoritos__label">Nuestros Favoritos</p>
      <div className="favoritos__grilla">
        {productos.map(p => (
          <ProductCard
            key={p.id}
            producto={p}
            onProductoClick={onProductoClick}
            onAgregar={onAgregar}
          />
        ))}
      </div>
    </section>
  );
}
