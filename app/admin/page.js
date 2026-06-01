import { createSupabaseServer } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { redirect } from 'next/navigation';

function formatFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

function formatPrecio(n) {
  return '$' + Number(n).toLocaleString('es-AR');
}

export default async function AdminPage() {
  const supabase = await createSupabaseServer();

  // Verificar que el usuario esté autenticado
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  // Verificar que sea admin
  if (user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) redirect('/');

  // Obtener todas las órdenes con datos de usuario (usando service role)
  const { data: ordenes } = await supabaseAdmin
    .from('ordenes')
    .select('*, usuarios(email, nombre, apellido)')
    .order('creado_en', { ascending: false });

  const totalVentas = ordenes?.reduce((sum, o) => sum + Number(o.total), 0) ?? 0;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-titulo">Panel de Administración</h1>
        <p className="admin-subtitulo">Reporte de ventas — Franchus Jewelry</p>
      </div>

      <div className="admin-stats">
        <div className="admin-stat">
          <span className="admin-stat__numero">{ordenes?.length ?? 0}</span>
          <span className="admin-stat__label">Órdenes totales</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat__numero">{formatPrecio(totalVentas)}</span>
          <span className="admin-stat__label">Facturación total</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat__numero">
            {ordenes?.filter(o => o.estado === 'pendiente').length ?? 0}
          </span>
          <span className="admin-stat__label">Pendientes</span>
        </div>
      </div>

      <div className="admin-tabla-wrapper">
        <table className="admin-tabla">
          <thead>
            <tr>
              <th>#</th>
              <th>Cliente</th>
              <th>Email</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {ordenes?.map(orden => (
              <tr key={orden.id}>
                <td>{orden.id}</td>
                <td>
                  {orden.usuarios?.nombre
                    ? `${orden.usuarios.nombre} ${orden.usuarios.apellido ?? ''}`
                    : '—'}
                </td>
                <td>{orden.usuarios?.email ?? '—'}</td>
                <td>{formatPrecio(orden.total)}</td>
                <td>
                  <span className={`orden-card__estado orden-card__estado--${orden.estado}`}>
                    {orden.estado}
                  </span>
                </td>
                <td>{formatFecha(orden.creado_en)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
