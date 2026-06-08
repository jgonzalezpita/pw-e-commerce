'use client';

import { useState, useEffect } from 'react';

const ESTADOS_ORDEN = ['pendiente', 'en preparación', 'enviado', 'entregado', 'cancelado'];
const CATEGORIAS    = ['aros', 'collares', 'pulseras'];

function formatPrecio(n) { return '$' + Number(n).toLocaleString('es-AR'); }
function formatFecha(f)  { return new Date(f).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }); }

// ── Panel principal ───────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [tab, setTab] = useState('ordenes');
  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-titulo">Panel de Administración</h1>
        <p className="admin-subtitulo">Franchus Jewelry</p>
      </div>
      <div className="admin-tabs">
        {[['ordenes','Órdenes'], ['productos','Productos'], ['nueva-orden','+ Nueva orden']].map(([key, label]) => (
          <button key={key} className={`admin-tab${tab === key ? ' admin-tab--activo' : ''}`} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>
      {tab === 'ordenes'     && <OrdenesTab />}
      {tab === 'productos'   && <ProductosTab />}
      {tab === 'nueva-orden' && <NuevaOrdenTab onCreada={() => setTab('ordenes')} />}
    </div>
  );
}

// ── Órdenes ───────────────────────────────────────────────────────────────────
function OrdenesTab() {
  const [ordenes, setOrdenes]           = useState([]);
  const [cargando, setCargando]         = useState(true);
  const [detalle, setDetalle]           = useState(null);

  useEffect(() => {
    fetch('/api/admin/ordenes')
      .then(r => r.json())
      .then(d => { setOrdenes(Array.isArray(d) ? d : []); setCargando(false); })
      .catch(() => setCargando(false));
  }, []);

  async function cambiarEstado(id, estado) {
    const res = await fetch(`/api/admin/ordenes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    });
    if (res.ok) setOrdenes(prev => prev.map(o => o.id === id ? { ...o, estado } : o));
  }

  async function verDetalle(id) {
    const res = await fetch(`/api/admin/ordenes/${id}`);
    setDetalle(await res.json());
  }

  const totalVentas = ordenes.reduce((s, o) => s + Number(o.total), 0);

  if (cargando) return <div className="admin-loading">Cargando órdenes…</div>;

  return (
    <div>
      <div className="admin-stats">
        <div className="admin-stat">
          <span className="admin-stat__numero">{ordenes.length}</span>
          <span className="admin-stat__label">Total órdenes</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat__numero">{formatPrecio(totalVentas)}</span>
          <span className="admin-stat__label">Facturación</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat__numero">{ordenes.filter(o => o.estado === 'pendiente').length}</span>
          <span className="admin-stat__label">Pendientes</span>
        </div>
      </div>

      <div className="admin-tabla-wrapper">
        <table className="admin-tabla">
          <thead>
            <tr><th>#</th><th>Comprador</th><th>Total</th><th>Estado</th><th>Fecha</th><th></th></tr>
          </thead>
          <tbody>
            {ordenes.map(o => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>
                  {o.usuario
                    ? (`${o.usuario.nombre || ''} ${o.usuario.apellido || ''}`.trim() || o.usuario.email)
                    : (o.nombre_comprador || o.email_comprador || '—')}
                </td>
                <td>{formatPrecio(o.total)}</td>
                <td>
                  <select
                    className="admin-select"
                    value={o.estado}
                    onChange={e => cambiarEstado(o.id, e.target.value)}
                  >
                    {ESTADOS_ORDEN.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </td>
                <td>{formatFecha(o.creado_en)}</td>
                <td>
                  <button className="admin-btn admin-btn--sm" onClick={() => verDetalle(o.id)}>
                    Detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detalle && <ModalDetalle orden={detalle} onCerrar={() => setDetalle(null)} />}
    </div>
  );
}

// ── Modal detalle orden ───────────────────────────────────────────────────────
function ModalDetalle({ orden, onCerrar }) {
  return (
    <div className="admin-overlay" onClick={onCerrar}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>
        <button className="admin-modal__cerrar" onClick={onCerrar}>×</button>
        <h2 className="admin-modal__titulo">Orden #{orden.id}</h2>

        <div className="admin-modal__seccion">
          <strong>Comprador</strong>
          <p>
            {orden.usuario
              ? `${orden.usuario.nombre || ''} ${orden.usuario.apellido || ''}`.trim() + ` — ${orden.usuario.email}`
              : orden.nombre_comprador
                ? `${orden.nombre_comprador} — ${orden.email_comprador || ''}`
                : 'Sin datos de comprador'}
          </p>
        </div>

        <div className="admin-modal__seccion">
          <strong>Productos</strong>
          {orden.items?.length > 0 ? (
            <table className="admin-tabla admin-tabla--sm">
              <thead><tr><th>Producto</th><th>Cant.</th><th>P. unit.</th><th>Subtotal</th></tr></thead>
              <tbody>
                {orden.items.map(item => (
                  <tr key={item.id}>
                    <td>{item.productos?.nombre ?? `#${item.producto_id}`}</td>
                    <td>{item.cantidad}</td>
                    <td>{formatPrecio(item.precio_unitario)}</td>
                    <td>{formatPrecio(item.precio_unitario * item.cantidad)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="admin-modal__vacio">Sin detalle (orden anterior a Clase 12)</p>
          )}
        </div>

        <div className="admin-modal__total">Total: <strong>{formatPrecio(orden.total)}</strong></div>
      </div>
    </div>
  );
}

// ── Productos ─────────────────────────────────────────────────────────────────
function ProductosTab() {
  const [productos, setProductos]   = useState([]);
  const [cargando, setCargando]     = useState(true);
  const [editando, setEditando]     = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    const res = await fetch('/api/admin/productos');
    const d   = await res.json();
    setProductos(Array.isArray(d) ? d : []);
    setCargando(false);
  }

  async function actualizar(id, campo, valor) {
    const res = await fetch(`/api/admin/productos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [campo]: valor }),
    });
    if (res.ok) {
      setProductos(prev => prev.map(p => p.id === id ? { ...p, [campo]: valor } : p));
    } else {
      const data = await res.json().catch(() => ({}));
      alert(`Error al actualizar: ${data.error ?? res.status}`);
    }
    setEditando(null);
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este producto definitivamente?')) return;
    const res = await fetch(`/api/admin/productos/${id}`, { method: 'DELETE' });
    if (res.ok) setProductos(prev => prev.filter(p => p.id !== id));
  }

  if (cargando) return <div className="admin-loading">Cargando productos…</div>;

  return (
    <div>
      <div className="admin-acciones-top">
        <button className="admin-btn admin-btn--primary" onClick={() => setMostrarForm(true)}>
          + Nuevo producto
        </button>
      </div>

      <div className="admin-tabla-wrapper">
        <table className="admin-tabla">
          <thead>
            <tr><th>Nombre</th><th>Precio</th><th>Stock</th><th>Categoría</th><th>Visible</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {productos.map(p => (
              <tr key={p.id} className={!p.activo ? 'admin-fila--inactiva' : ''}>
                <td>{p.nombre}</td>
                <td>
                  {editando?.id === p.id && editando?.campo === 'precio' ? (
                    <input className="admin-input-inline" type="number" defaultValue={p.precio} autoFocus
                      onBlur={e  => actualizar(p.id, 'precio', Number(e.target.value))}
                      onKeyDown={e => e.key === 'Enter' && actualizar(p.id, 'precio', Number(e.target.value))}
                    />
                  ) : (
                    <span className="admin-editable" onClick={() => setEditando({ id: p.id, campo: 'precio' })}>
                      {formatPrecio(p.precio)} <span className="admin-editable__icon">✏</span>
                    </span>
                  )}
                </td>
                <td>
                  {editando?.id === p.id && editando?.campo === 'stock' ? (
                    <input className="admin-input-inline" type="number" defaultValue={p.stock} autoFocus
                      onBlur={e  => actualizar(p.id, 'stock', Number(e.target.value))}
                      onKeyDown={e => e.key === 'Enter' && actualizar(p.id, 'stock', Number(e.target.value))}
                    />
                  ) : (
                    <span className="admin-editable" onClick={() => setEditando({ id: p.id, campo: 'stock' })}>
                      {p.stock} <span className="admin-editable__icon">✏</span>
                    </span>
                  )}
                </td>
                <td>{p.categoria}</td>
                <td>
                  <button
                    className={`admin-toggle${p.activo ? ' admin-toggle--on' : ' admin-toggle--off'}`}
                    onClick={() => actualizar(p.id, 'activo', !p.activo)}
                  >
                    {p.activo ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td>
                  <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => eliminar(p.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mostrarForm && (
        <FormProducto
          onCerrar={() => setMostrarForm(false)}
          onGuardado={prod => { setProductos(prev => [...prev, prod]); setMostrarForm(false); }}
        />
      )}
    </div>
  );
}

// ── Form nuevo producto ───────────────────────────────────────────────────────
function FormProducto({ onCerrar, onGuardado }) {
  const [form, setForm]       = useState({ nombre: '', descripcion: '', precio: '', stock: '0', imagen_url: '', categoria: 'aros', activo: true });
  const [guardando, setGuardando] = useState(false);
  const [error, setError]     = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    if (!form.nombre || !form.precio) { setError('Nombre y precio son obligatorios'); return; }
    setGuardando(true);
    const res = await fetch('/api/admin/productos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, precio: Number(form.precio), stock: Number(form.stock) }),
    });
    const data = await res.json();
    if (res.ok) { onGuardado(data); }
    else { setError(data.error || 'Error al crear'); setGuardando(false); }
  }

  return (
    <div className="admin-overlay" onClick={onCerrar}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>
        <button className="admin-modal__cerrar" onClick={onCerrar}>×</button>
        <h2 className="admin-modal__titulo">Nuevo producto</h2>
        <form className="admin-form" onSubmit={submit}>
          {[
            ['nombre',      'Nombre *',       'text'],
            ['descripcion', 'Descripción',    'text'],
            ['precio',      'Precio *',       'number'],
            ['stock',       'Stock inicial',  'number'],
            ['imagen_url',  'URL de imagen',  'text'],
          ].map(([k, label, type]) => (
            <div key={k} className="admin-form__field">
              <label>{label}</label>
              <input type={type} value={form[k]} onChange={e => set(k, e.target.value)} />
            </div>
          ))}
          <div className="admin-form__field">
            <label>Categoría</label>
            <select value={form.categoria} onChange={e => set('categoria', e.target.value)}>
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="admin-form__field admin-form__field--check">
            <label>
              <input type="checkbox" checked={form.activo} onChange={e => set('activo', e.target.checked)} />
              Visible en la tienda
            </label>
          </div>
          {error && <p className="admin-form__error">{error}</p>}
          <button type="submit" className="admin-btn admin-btn--primary" disabled={guardando}>
            {guardando ? 'Creando…' : 'Crear producto'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Nueva orden manual ────────────────────────────────────────────────────────
function NuevaOrdenTab({ onCreada }) {
  const [productos, setProductos] = useState([]);
  const [usuarios,  setUsuarios]  = useState([]);
  const [items,     setItems]     = useState([{ producto_id: '', cantidad: 1 }]);
  const [comprador, setComprador] = useState({ tipo: 'usuario', usuario_id: '', nombre: '', email: '' });
  const [creando,   setCreando]   = useState(false);
  const [error,     setError]     = useState('');

  useEffect(() => {
    fetch('/api/admin/productos').then(r => r.json()).then(d => setProductos(Array.isArray(d) ? d : []));
    fetch('/api/admin/usuarios').then(r => r.json()).then(d  => setUsuarios(Array.isArray(d) ? d : []));
  }, []);

  const setC = (k, v) => setComprador(p => ({ ...p, [k]: v }));
  const updItem = (i, k, v) => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [k]: v } : it));

  const total = items.reduce((s, it) => {
    const p = productos.find(p => p.id === Number(it.producto_id));
    return s + (p ? p.precio * it.cantidad : 0);
  }, 0);

  async function submit(e) {
    e.preventDefault();
    setError('');
    const validos = items.filter(i => i.producto_id && Number(i.cantidad) > 0);
    if (!validos.length) { setError('Agregá al menos un producto'); return; }
    setCreando(true);
    const res = await fetch('/api/admin/ordenes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: validos.map(i => ({ producto_id: Number(i.producto_id), cantidad: Number(i.cantidad) })),
        ...(comprador.tipo === 'usuario' && comprador.usuario_id ? { usuario_id: comprador.usuario_id } : {}),
        ...(comprador.tipo === 'manual'  ? { nombre_comprador: comprador.nombre, email_comprador: comprador.email } : {}),
      }),
    });
    const data = await res.json();
    if (res.ok) { onCreada(); }
    else { setError(data.error || 'Error al crear la orden'); setCreando(false); }
  }

  return (
    <div className="admin-nueva-orden">
      <h2 className="admin-subtitulo">Crear orden manual</h2>
      <form className="admin-form" onSubmit={submit}>
        <div className="admin-form__section">
          <h3>Comprador</h3>
          <div className="admin-form__field">
            <label>Tipo de comprador</label>
            <select value={comprador.tipo} onChange={e => setC('tipo', e.target.value)}>
              <option value="usuario">Usuario registrado</option>
              <option value="manual">Sin cuenta (manual)</option>
            </select>
          </div>
          {comprador.tipo === 'usuario' ? (
            <div className="admin-form__field">
              <label>Usuario</label>
              <select value={comprador.usuario_id} onChange={e => setC('usuario_id', e.target.value)}>
                <option value="">— Seleccioná un usuario —</option>
                {usuarios.map(u => (
                  <option key={u.id} value={u.id}>
                    {[u.nombre, u.apellido].filter(Boolean).join(' ') || u.email} ({u.email})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div className="admin-form__field">
                <label>Nombre</label>
                <input type="text" value={comprador.nombre} onChange={e => setC('nombre', e.target.value)} />
              </div>
              <div className="admin-form__field">
                <label>Email</label>
                <input type="email" value={comprador.email} onChange={e => setC('email', e.target.value)} />
              </div>
            </>
          )}
        </div>

        <div className="admin-form__section">
          <h3>Productos</h3>
          {items.map((item, i) => (
            <div key={i} className="admin-form__item-row">
              <select value={item.producto_id} onChange={e => updItem(i, 'producto_id', e.target.value)}>
                <option value="">— Producto —</option>
                {productos.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} ({formatPrecio(p.precio)})</option>
                ))}
              </select>
              <input
                type="number" min="1" value={item.cantidad}
                onChange={e => updItem(i, 'cantidad', e.target.value)}
                className="admin-input-cantidad"
              />
              {items.length > 1 && (
                <button type="button" className="admin-btn admin-btn--sm admin-btn--danger"
                  onClick={() => setItems(prev => prev.filter((_, idx) => idx !== i))}>✕</button>
              )}
            </div>
          ))}
          <button type="button" className="admin-btn admin-btn--sm"
            onClick={() => setItems(prev => [...prev, { producto_id: '', cantidad: 1 }])}>
            + Agregar producto
          </button>
        </div>

        {total > 0 && (
          <div className="admin-nueva-orden__total">
            Total: <strong>{formatPrecio(total)}</strong>
          </div>
        )}

        {error && <p className="admin-form__error">{error}</p>}
        <button type="submit" className="admin-btn admin-btn--primary" disabled={creando}>
          {creando ? 'Creando…' : 'Crear orden'}
        </button>
      </form>
    </div>
  );
}
