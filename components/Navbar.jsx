'use client';

import { useState, useRef, useEffect } from 'react';
import { productos } from '@/data/productos';

export default function Navbar({ categoriaActiva, onCategoria, query, onQuery, carritoCount, onAbrirCarrito }) {
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSug, setMostrarSug] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setMostrarSug(false);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  function handleInput(e) {
    const q = e.target.value;
    onQuery(q);
    if (q.trim()) {
      const coincidencias = productos.filter(p =>
        p.nombre.toLowerCase().includes(q.toLowerCase())
      );
      setSugerencias(coincidencias);
      setMostrarSug(coincidencias.length > 0);
    } else {
      setSugerencias([]);
      setMostrarSug(false);
    }
  }

  function handleSugerencia(p) {
    onQuery(p.nombre);
    setSugerencias([]);
    setMostrarSug(false);
  }

  const cats = ['aros', 'collares', 'pulseras'];
  const catLabels = { aros: 'Aros', collares: 'Collares', pulseras: 'Pulseras' };

  return (
    <header className="navbar">
      <div className="navbar__container">
        <a href="#" className="navbar__logo" onClick={e => { e.preventDefault(); onQuery(''); onCategoria && onCategoria(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          Franchus
        </a>
        <div className="navbar__derecha">
          <div className="busqueda-wrapper" ref={wrapperRef}>
            <div className="busqueda">
              <svg className="busqueda__icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="22" y2="22" />
              </svg>
              <input
                className="busqueda__input"
                type="search"
                placeholder="BUSCAR"
                autoComplete="off"
                value={query}
                onChange={handleInput}
              />
            </div>
            {mostrarSug && (
              <ul className="sugerencias sugerencias--visible">
                {sugerencias.map(p => (
                  <li key={p.id} className="sugerencias__item" onClick={() => handleSugerencia(p)}>
                    {p.nombre}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <nav className="navbar__nav">
            <ul className="navbar__list">
              {cats.map(cat => (
                <li key={cat}>
                  <a
                    href={`#${cat}`}
                    className={`navbar__link${categoriaActiva === cat ? ' navbar__link--activo' : ''}`}
                    onClick={e => {
                      e.preventDefault();
                      onCategoria(cat);
                      setTimeout(() => {
                        const el = document.getElementById(cat);
                        if (el) {
                          const top = el.getBoundingClientRect().top + window.scrollY - 80;
                          window.scrollTo({ top, behavior: 'smooth' });
                        }
                      }, 50);
                    }}
                  >
                    {catLabels[cat]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <button className="carrito__btn" onClick={onAbrirCarrito} aria-label="Ver carrito">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <span className="carrito__badge">{carritoCount}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
