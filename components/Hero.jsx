'use client';

export default function Hero({ catalogoAbierto, onExplorar }) {
  return (
    <section className="hero">
      <div className="hero__overlay"></div>
      <div className="hero__content">
        <p className="hero__subtitle">Nueva Colección 2026</p>
        <h1 className="hero__title">
          El detalle que<br /><em>te enamora</em>
        </h1>
        <a
          href="#"
          className="hero__btn"
          onClick={e => { e.preventDefault(); onExplorar(); }}
        >
          {catalogoAbierto ? 'Volver a la página principal' : 'Explorar colección'}
        </a>
      </div>
    </section>
  );
}
