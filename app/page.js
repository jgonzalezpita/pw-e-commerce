'use client';

import { useState, useEffect, useCallback } from 'react';
import { productos as productosFallback } from '@/data/productos';
import { supabase } from '@/lib/supabase';
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
  const [usuario, setUsuario] = useState(null);
  const [productos, setProductos] = useState(productosFallback);

  // ── Carrito ──────────────────────────────────────────────────────────────
  // Lazy initializer: lee localStorage en el primer render para no sobreescribirlo
  const [carrito, setCarrito] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('franchus-carrito');
      return saved ? JSON.parse(saved) : [];
    } catch (_) { return []; }
  });
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [checkoutAbierto, setCheckoutAbierto] = useState(false);

  // ── Inicialización ────────────────────────────────────────────────────────
  useEffect(() => {
    async function cargarProductos() {
      try {
        const { data } = await supabase.from('productos').select().eq('activo', true);
        if (data && data.length > 0) {
          setProductos(data.map(p => ({ ...p, imagen: p.imagen_url || p.imagen })));
        }
      } catch (_) {}
    }

    // Carga el carrito desde el servidor — el server lee las cookies correctamente
    // y evita cualquier problema de JWT en el cliente (ej. en refresh de página)
    async function cargarCarritoSupabase() {
      try {
        const res = await fetch('/api/carrito');
        if (!res.ok) return;
        const items = await res.json();
        setCarrito(items);
      } catch (_) {}
    }

    cargarProductos();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user ?? null;
        setUsuario(user);
        if (user) {
          // Al hacer login (o al recargar con sesión activa), fusionar carrito local con Supabase
          if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
            try {
              const saved = localStorage.getItem('franchus-carrito');
              const carritoLocal = saved ? JSON.parse(saved) : [];
              if (carritoLocal.length > 0) {
                for (const item of carritoLocal) {
                  const { data: existing } = await supabase
                    .from('carrito')
                    .select('cantidad')
                    .eq('usuario_id', user.id)
                    .eq('producto_id', item.id)
                    .single();
                  const nuevaCantidad = existing ? existing.cantidad + item.cantidad : item.cantidad;
                  await supabase.from('carrito').upsert(
                    { usuario_id: user.id, producto_id: item.id, cantidad: nuevaCantidad },
                    { onConflict: 'usuario_id,producto_id' }
                  );
                }
                localStorage.removeItem('franchus-carrito');
              }
            } catch (_) {}
          }
          await cargarCarritoSupabase();
        } else if (event === 'SIGNED_OUT') {
          // Solo limpiar al cerrar sesión explícitamente; INITIAL_SESSION sin user
          // ya tiene el carrito de localStorage via lazy initializer
          setCarrito([]);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── Persistir carrito (solo para usuarios no autenticados) ────────────────
  useEffect(() => {
    if (!usuario) {
      localStorage.setItem('franchus-carrito', JSON.stringify(carrito));
    }
  }, [carrito, usuario]);

  // ── Operaciones del carrito ───────────────────────────────────────────────
  const agregarAlCarrito = useCallback(async (producto) => {
    const existente = carrito.find(i => i.id === producto.id);
    const nuevaCantidad = existente ? existente.cantidad + 1 : 1;

    setCarrito(prev => {
      const existe = prev.find(i => i.id === producto.id);
      if (existe) {
        return prev.map(i => i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
    setCarritoAbierto(true);

    if (usuario) {
      const { error } = await supabase
        .from('carrito')
        .upsert(
          { usuario_id: usuario.id, producto_id: producto.id, cantidad: nuevaCantidad },
          { onConflict: 'usuario_id,producto_id' }
        );
      if (error) console.error('Carrito upsert error:', error.message);
    }
  }, [usuario, carrito]);

  const cambiarCantidad = useCallback(async (id, delta) => {
    const item = carrito.find(i => i.id === id);
    const nuevaCantidad = item ? item.cantidad + delta : 0;

    setCarrito(prev =>
      prev.map(i => i.id === id ? { ...i, cantidad: i.cantidad + delta } : i)
        .filter(i => i.cantidad > 0)
    );

    if (usuario) {
      if (nuevaCantidad <= 0) {
        await supabase.from('carrito')
          .delete()
          .eq('usuario_id', usuario.id)
          .eq('producto_id', id);
      } else {
        await supabase.from('carrito')
          .update({ cantidad: nuevaCantidad })
          .eq('usuario_id', usuario.id)
          .eq('producto_id', id);
      }
    }
  }, [usuario, carrito]);

  const eliminarItem = useCallback(async (id) => {
    setCarrito(prev => prev.filter(i => i.id !== id));
    if (usuario) {
      await supabase.from('carrito')
        .delete()
        .eq('usuario_id', usuario.id)
        .eq('producto_id', id);
    }
  }, [usuario]);

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

  const handleSugerenciaSeleccionada = useCallback((producto) => {
    setCatalogoAbierto(true);
    setCategoriaActiva(null);
    setTimeout(() => {
      const id = producto.nombre.toLowerCase().replace(/\s+/g, '-');
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('card--resaltada');
      setTimeout(() => el.classList.remove('card--resaltada'), 1500);
    }, 100);
  }, []);

  const filtrar = (cat) =>
    productos.filter(p => {
      if (!p.nombre || p.categoria !== cat) return false;
      const pasaCat = !categoriaActiva || p.categoria === categoriaActiva;
      const pasaQ   = !query || p.nombre.toLowerCase().includes(query.toLowerCase());
      return pasaCat && pasaQ;
    });

  const arosVisibles     = filtrar('aros');
  const collaresVisibles = filtrar('collares');
  const pulserasVisibles = filtrar('pulseras');
  const mostrarFavoritos = !catalogoAbierto && !categoriaActiva && !query;

  return (
    <>
      <Marquee />

      <Navbar
        categoriaActiva={categoriaActiva}
        onCategoria={handleCategoria}
        query={query}
        onQuery={handleQuery}
        onSugerenciaSeleccionada={handleSugerenciaSeleccionada}
        carritoCount={carrito.reduce((a, i) => a + i.cantidad, 0)}
        onAbrirCarrito={() => setCarritoAbierto(true)}
        usuario={usuario}
        productos={productos}
      />

      <CarritoPanel
        carrito={carrito}
        abierto={carritoAbierto}
        onCerrar={() => setCarritoAbierto(false)}
        onCambiarCantidad={cambiarCantidad}
        onEliminar={eliminarItem}
        onCheckout={() => {
          if (!usuario) {
            setCarritoAbierto(false);
            window.location.href = '/auth/login';
            return;
          }
          setCarritoAbierto(false);
          setCheckoutAbierto(true);
        }}
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
            &ldquo;Cada joya cuenta una historia.<br /><em>La tuya merece brillar.</em>&rdquo;
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
}
