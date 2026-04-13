'use client';

import { useState, useEffect, useCallback } from 'react';
import { productos } from '@/data/productos';
import Marquee from '@/components/Marquee';
import Navbar from '@/components/Navbar';
import CarritoPanel from '@/components/CarritoPanel';
import ModalProducto from '@/components/ModalProducto';
import ModalCheckout from '@/components/ModalCheckout';
import Hero from '@/components/Hero';
import Favoritos from '@/components/Favoritos';
import ProductSection from '@/components/ProductSection';
import Footer from '@/components/Footer';

export default function Page() {
  // ── Carrito ──────────────────────────────────────────────────────────────
  const [carrito, setCarrito] = useState([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [checkoutAbierto, setCheckoutAbierto] = useState(false);

  useEffect(() => {
    try {
      const guardado = localStorage.getItem('franchus-carrito');
      if (guardado) setCarrito(JSON.parse(guardado));
    } catch (_) {}
  }, []);

  useEffect(() => {
    localStorage.setItem('franchus-carrito', JSON.stringify(carrito));
  }, [carrito]);

  const agregarAlCarrito = useCallback((producto) => {
    setCarrito(prev => {
      const existe = prev.find(i => i.id === producto.id);
      if (existe) {
        return prev.map(i => i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
    setCarritoAbierto(true);
  }, []);

  const cambiarCantidad = useCallback((id, delta) => {
    setCarrito(prev => {
      const nuevo = prev
        .map(i => i.id === id ? { ...i, cantidad: i.cantidad + delta } : i)
        .filter(i => i.cantidad > 0);
      return nuevo;
    });
  }, []);

  const eliminarItem = useCallback((id) => {
    setCarrito(prev => prev.filter(i => i.id !== id));
  }, []);

  // ── Modal de producto ─────────────────────────────────────────────────────
  const [productoModal, setProductoModal] = useState(null);

  // ── Catálogo / filtros ────────────────────────────────────────────────────
  const [catalogoAbierto, setCatalogoAbierto] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [query, setQuery] = useState('');

  const abrirCatalogo = useCallback(() => setCatalogoAbierto(true), []);
  const cerrarCatalogo = useCallback(() => {
    setCatalogoAbierto(false);
    setCategoriaActiva(null);
    setQuery('');
  }, []);

  const handleCategoria = useCallback((cat) => {
    setCategoriaActiva(cat);
    setQuery('');
    setCatalogoAbierto(true);
  }, []);

  const handleQuery = useCallback((q) => {
    setQuery(q);
    if (q) {
      setCategoriaActiva(null);
      setCatalogoAbierto(true);
    } else {
      setCatalogoAbierto(false);
    }
  }, []);

  // productos filtrados para cada sección
  const filtrar = (cat) =>
    productos.filter(p => {
      if (p.categoria !== cat) return false;
      const pasaCat = !categoriaActiva || p.categoria === categoriaActiva;
      const pasaQ   = !query || p.nombre.toLowerCase().includes(query.toLowerCase());
      return pasaCat && pasaQ;
    });

  const arosVisibles      = filtrar('aros');
  const collaresVisibles  = filtrar('collares');
  const pulserasVisibles  = filtrar('pulseras');
  const mostrarFavoritos  = !catalogoAbierto && !categoriaActiva && !query;

  return (
    <>
      <Marquee />

      <Navbar
        categoriaActiva={categoriaActiva}
        onCategoria={handleCategoria}
        query={query}
        onQuery={handleQuery}
        carritoCount={carrito.reduce((a, i) => a + i.cantidad, 0)}
        onAbrirCarrito={() => setCarritoAbierto(true)}
      />

      <CarritoPanel
        carrito={carrito}
        abierto={carritoAbierto}
        onCerrar={() => setCarritoAbierto(false)}
        onCambiarCantidad={cambiarCantidad}
        onEliminar={eliminarItem}
        onCheckout={() => { setCarritoAbierto(false); setCheckoutAbierto(true); }}
      />

      {productoModal && (
        <ModalProducto
          producto={productoModal}
          onCerrar={() => setProductoModal(null)}
          onAgregar={(p) => { agregarAlCarrito(p); setProductoModal(null); }}
        />
      )}

      {checkoutAbierto && (
        <ModalCheckout
          carrito={carrito}
          onCerrar={() => setCheckoutAbierto(false)}
          onConfirmar={() => {
            setCarrito([]);
            setCheckoutAbierto(false);
          }}
        />
      )}

      <main>
        <Hero
          catalogoAbierto={catalogoAbierto}
          onExplorar={() => {
            if (catalogoAbierto) {
              cerrarCatalogo();
            } else {
              abrirCatalogo();
            }
          }}
        />

        <section className="tagline">
          <p className="tagline__texto">Cada pieza está hecha en acero inoxidable bañado en oro — para que brilles sin preocuparte.</p>
        </section>

        {mostrarFavoritos && (
          <Favoritos
            productos={productos.filter(p => p.favorito)}
            onProductoClick={setProductoModal}
            onAgregar={agregarAlCarrito}
          />
        )}

        {catalogoAbierto && (
          <>
            {arosVisibles.length > 0 && (
              <ProductSection id="aros" titulo="Aros" alt={false} productos={arosVisibles} onProductoClick={setProductoModal} onAgregar={agregarAlCarrito} />
            )}
            {collaresVisibles.length > 0 && (
              <ProductSection id="collares" titulo="Collares" alt={true} productos={collaresVisibles} onProductoClick={setProductoModal} onAgregar={agregarAlCarrito} />
            )}
            {pulserasVisibles.length > 0 && (
              <ProductSection id="pulseras" titulo="Pulseras" alt={false} productos={pulserasVisibles} onProductoClick={setProductoModal} onAgregar={agregarAlCarrito} />
            )}
          </>
        )}

        <section className="banner">
          <p className="banner__quote">
            "Cada joya cuenta una historia.<br /><em>La tuya merece brillar.</em>"
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
}
