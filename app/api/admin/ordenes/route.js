import { requireAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: 'No autorizado' }, { status: 403 });

  const { data: ordenes, error } = await supabaseAdmin
    .from('ordenes')
    .select('*')
    .order('creado_en', { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const userIds = [...new Set(ordenes.filter(o => o.usuario_id).map(o => o.usuario_id))];
  let usuariosMap = {};

  if (userIds.length > 0) {
    const { data: usuarios } = await supabaseAdmin
      .from('usuarios')
      .select('id, email, nombre, apellido')
      .in('id', userIds);
    if (usuarios) usuariosMap = Object.fromEntries(usuarios.map(u => [u.id, u]));
  }

  return Response.json(
    ordenes.map(o => ({ ...o, usuario: o.usuario_id ? (usuariosMap[o.usuario_id] ?? null) : null }))
  );
}

export async function POST(request) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: 'No autorizado' }, { status: 403 });

  const { items, nombre_comprador, email_comprador, usuario_id } = await request.json();
  if (!items?.length) return Response.json({ error: 'Sin productos' }, { status: 400 });

  const { data: prods } = await supabaseAdmin
    .from('productos')
    .select('id, precio, stock, nombre')
    .in('id', items.map(i => i.producto_id));

  if (!prods) return Response.json({ error: 'Error obteniendo productos' }, { status: 500 });

  let total = 0;
  for (const item of items) {
    const prod = prods.find(p => p.id === item.producto_id);
    if (!prod) return Response.json({ error: `Producto no encontrado` }, { status: 400 });
    if (prod.stock < item.cantidad) return Response.json({ error: `Stock insuficiente: ${prod.nombre}` }, { status: 400 });
    total += prod.precio * item.cantidad;
  }

  const { data: orden, error } = await supabaseAdmin
    .from('ordenes')
    .insert({
      total,
      estado: 'pendiente',
      ...(usuario_id ? { usuario_id } : {}),
      ...(nombre_comprador ? { nombre_comprador } : {}),
      ...(email_comprador ? { email_comprador } : {}),
    })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  for (const item of items) {
    const prod = prods.find(p => p.id === item.producto_id);
    await supabaseAdmin.from('orden_items').insert({
      orden_id: orden.id,
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      precio_unitario: prod.precio,
    });
    await supabaseAdmin.from('productos')
      .update({ stock: prod.stock - item.cantidad })
      .eq('id', item.producto_id);
  }

  return Response.json(orden, { status: 201 });
}
