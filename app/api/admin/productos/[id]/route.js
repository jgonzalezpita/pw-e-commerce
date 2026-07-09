import { requireAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { esPrecioValido, esStockValido } from '@/lib/validaciones';

export async function PATCH(request, { params }) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: 'No autorizado' }, { status: 403 });

  const { id } = await params;
  const body = await request.json();

  // Validar solo los campos presentes en la edición
  if ('precio' in body && !esPrecioValido(body.precio))
    return Response.json({ error: 'El precio debe ser un número mayor a 0' }, { status: 400 });
  if ('stock' in body && !esStockValido(body.stock))
    return Response.json({ error: 'El stock debe ser un entero mayor o igual a 0' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('productos').update(body).eq('id', id).select().single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function DELETE(request, { params }) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: 'No autorizado' }, { status: 403 });

  const { id } = await params;
  const { error } = await supabaseAdmin.from('productos').delete().eq('id', id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
