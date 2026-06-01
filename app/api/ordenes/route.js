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

  // Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'No autenticado' }, { status: 401 });

  // Obtener items del carrito con detalles de productos
  const { data: carritoItems, error: carritoError } = await supabase
    .from('carrito')
    .select('producto_id, cantidad, productos(id, nombre, precio, stock)')
    .eq('usuario_id', user.id);

  if (carritoError || !carritoItems?.length) {
    return Response.json({ error: 'Carrito vacío' }, { status: 400 });
  }

  // Verificar stock de cada item
  for (const item of carritoItems) {
    if (item.productos.stock < item.cantidad) {
      return Response.json(
        { error: `Stock insuficiente para ${item.productos.nombre}` },
        { status: 400 }
      );
    }
  }

  // Calcular total en el servidor (no confiar en el cliente)
  const total = carritoItems.reduce(
    (sum, item) => sum + item.productos.precio * item.cantidad,
    0
  );

  // Crear la orden
  const { data: orden, error: ordenError } = await supabase
    .from('ordenes')
    .insert({ usuario_id: user.id, total })
    .select()
    .single();

  if (ordenError) return Response.json({ error: ordenError.message }, { status: 500 });

  // Vaciar el carrito
  await supabase.from('carrito').delete().eq('usuario_id', user.id);

  return Response.json(orden, { status: 201 });
}
