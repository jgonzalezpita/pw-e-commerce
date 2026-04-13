import ProductCard from './ProductCard';

export default function ProductSection({ id, titulo, alt, productos, onProductoClick, onAgregar }) {
  return (
    <section className={`productos${alt ? ' productos--alt' : ''}`} id={id}>
      <div className="productos__header">
        <h2 className="productos__titulo">{titulo}</h2>
        <span className="productos__linea"></span>
      </div>
      <div className="productos__grilla">
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
