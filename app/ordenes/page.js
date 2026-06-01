import { createSupabaseServer } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

function formatFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

function formatPrecio(n) {
  return '$' + Number(n).toLocaleString('es-AR');
}

export default async function OrdenesPage() {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: ordenes } = await supabase
    .from('ordenes')
    .select()
    .eq('usuario_id', user.id)
    .order('creado_en', { ascending: false });

  return (
    <div className="ordenes-page">
      <div className="ordenes-header">
        <Link href="/" className="ordenes-back">← Volver a la tienda</Link>
        <h1 className="ordenes-titulo">Mis órdenes</h1>
      </div>

      {!ordenes?.length ? (
        <div className="ordenes-vacio">
          <p>Todavía no realizaste ninguna compra.</p>
          <Link href="/" className="ordenes-btn">Explorar productos</Link>
        </div>
      ) : (
        <div className="ordenes-lista">
          {ordenes.map(orden => (
            <div key={orden.id} className="orden-card">
              <div className="orden-card__info">
                <span className="orden-card__id">Orden #{orden.id}</span>
                <span className="orden-card__fecha">{formatFecha(orden.creado_en)}</span>
              </div>
              <div className="orden-card__derecha">
                <span className={`orden-card__estado orden-card__estado--${orden.estado}`}>
                  {orden.estado}
                </span>
                <span className="orden-card__total">{formatPrecio(orden.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
