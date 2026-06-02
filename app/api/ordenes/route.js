import { createSupabaseServer } from '@/lib/supabase-server';

export async function GET() {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'No autenticado' }, { status: 401 });

  const { data, error } = await supabase
    .from('ordenes')
    .select()
    .eq('usuario_id', user.id)
    .order('creado_en', { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST() {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'No autenticado' }, { status: 401 });

  // Obtener items del carrito con precios
  const { data: carritoItems, error: carritoError } = await supabase
    .from('carrito')
    .select('producto_id, cantidad, productos(id, nombre, precio, stock)')
    .eq('usuario_id', user.id);

  if (carritoError || !carritoItems?.length) {
    return Response.json({ error: 'Carrito vacío' }, { status: 400 });
  }

  // Calcular total en el servidor
  const total = carritoItems.reduce(
    (sum, item) => sum + item.productos.precio * item.cantidad,
    0
  );

  // Preparar items en formato JSON para el stored procedure
  const items = carritoItems.map(item => ({
    producto_id: item.producto_id,
    cantidad: item.cantidad,
  }));

  // Ejecutar transacción atómica via stored procedure
  const { data, error } = await supabase.rpc('crear_orden_completa', {
    p_usuario_id: user.id,
    p_items: items,
    p_total: total,
  });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const resultado = data?.[0];
  if (!resultado?.success) {
    return Response.json({ error: resultado?.error_msg ?? 'Error al crear la orden' }, { status: 400 });
  }

  return Response.json({ id: resultado.orden_id, total, estado: 'pendiente' }, { status: 201 });
}
