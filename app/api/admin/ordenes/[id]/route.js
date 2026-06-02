import { requireAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

const ESTADOS = ['pendiente', 'en preparación', 'enviado', 'entregado', 'cancelado'];

export async function GET(request, { params }) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: 'No autorizado' }, { status: 403 });

  const { id } = await params;

  const { data: orden, error } = await supabaseAdmin
    .from('ordenes').select('*').eq('id', id).single();
  if (error || !orden) return Response.json({ error: 'Orden no encontrada' }, { status: 404 });

  const { data: items } = await supabaseAdmin
    .from('orden_items')
    .select('*, productos(nombre, precio, imagen_url)')
    .eq('orden_id', id);

  let usuario = null;
  if (orden.usuario_id) {
    const { data } = await supabaseAdmin
      .from('usuarios').select('id, email, nombre, apellido').eq('id', orden.usuario_id).single();
    usuario = data;
  }

  return Response.json({ ...orden, items: items ?? [], usuario });
}

export async function PATCH(request, { params }) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: 'No autorizado' }, { status: 403 });

  const { id } = await params;
  const { estado } = await request.json();

  if (!ESTADOS.includes(estado))
    return Response.json({ error: 'Estado inválido' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('ordenes').update({ estado }).eq('id', id).select().single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}
